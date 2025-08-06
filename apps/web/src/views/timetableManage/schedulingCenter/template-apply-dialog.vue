<script lang="ts" setup>
import { computed, onMounted, ref, useTemplateRef } from 'vue';

import dayjs from 'dayjs';
import {
  ElButton,
  ElDatePicker,
  ElDialog,
  ElForm,
  ElFormItem,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElSelect,
} from 'element-plus';

import {
  batchCreateCourseScheduleByTemplateApi,
  getStudentListByCourseApi,
  getTimetableTemplateListApi,
} from '#/api';
import { StuItemInfo, TimetableTemplateItem } from '#/types';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits(['update:visible', 'submitSuccess']);

const dialogVisible = computed({
  get() {
    return props.visible;
  },
  set(val: boolean) {
    emit('update:visible', val);
  },
});

const disabledDate = (time: Date) => {
  return time.getTime() < Date.now();
};

const timetableTemplateList = ref<TimetableTemplateItem[]>([]);
const studentList = ref<StuItemInfo[]>([]);

const getTimetableTemplateList = async () => {
  try {
    timetableTemplateList.value = [];
    const res = await getTimetableTemplateListApi();
    if (res) {
      timetableTemplateList.value = res;
    }
  } catch (error) {
    console.error('获取课表模板失败:', error);
  }
};

const getStudentListByCourse = async (courseIds: number[]) => {
  try {
    studentList.value = [];
    const res = await getStudentListByCourseApi(courseIds);
    studentList.value = res;
  } catch (error) {
    console.error('获取学生列表失败:', error);
  }
};

const initFormData = () => ({
  templateId: undefined,
  range: '',
  studentIds: [],
});
const formData = ref(initFormData());

const rules = {
  templateId: [
    { required: true, message: '请选择课表模板', trigger: ['change'] },
  ],
  range: [
    { required: true, message: '请选择应用日期范围', trigger: ['change'] },
  ],
  studentIds: [{ required: true, message: '请选择学生', trigger: ['change'] }],
};

const formRef = useTemplateRef('formRef');
const loading = ref(false);

const handleChangeTemplate = (val: number) => {
  if (val) {
    formData.value.range = '';
    formData.value.studentIds = [];
    const selectTemplate = timetableTemplateList.value.find(
      (item) => item.id === val,
    );
    if (selectTemplate) {
      const courseIds = selectTemplate.sches.map((sche) => sche.courseId);
      getStudentListByCourse(courseIds);
    }
  }
};

const handleConfirm = () => {
  formRef.value?.validate((valid) => {
    if (!valid) {
      return;
    }
    ElMessageBox.confirm(
      '应用模板后会覆盖现有排课信息，请确认是否继续？',
      '注意',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    ).then(async () => {
      try {
        loading.value = true;
        const params = {
          startDate: dayjs(formData.value.range[0])
            .startOf('day')
            .format('YYYY-MM-DDTHH:mm'),
          endDate: dayjs(formData.value.range[1])
            .endOf('day')
            .format('YYYY-MM-DDTHH:mm'),
          templateId: formData.value.templateId!,
          studentIds: formData.value.studentIds,
        };
        const res = await batchCreateCourseScheduleByTemplateApi(params);
        if (res) {
          ElMessage.success('应用模板成功');
          emit('submitSuccess');
          dialogVisible.value = false;
        }
      } catch (error) {
        console.error('应用模板失败:', error);
      } finally {
        loading.value = false;
      }
    });
  });
};

const handleClose = () => {
  formData.value = initFormData();
  formRef.value?.resetFields();
};

onMounted(() => {
  getTimetableTemplateList();
});
</script>

<template>
  <ElDialog
    v-model="dialogVisible"
    width="600"
    title="应用模板"
    :show-close="false"
    :draggable="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <div class="pl-[30px] pr-[50px] pt-4">
      <ElForm ref="formRef" :model="formData" label-width="120" :rules="rules">
        <ElFormItem prop="templateId" label="应用模板">
          <ElSelect
            v-model="formData.templateId"
            placeholder="请选择应用模板"
            @change="handleChangeTemplate"
          >
            <ElOption
              v-for="item in timetableTemplateList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem prop="range" label="应用日期范围">
          <ElDatePicker
            v-model="formData.range"
            class="!w-full"
            type="daterange"
            :disabled-date="disabledDate"
            clearable
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </ElFormItem>
        <ElFormItem prop="studentIds" label="学生名称">
          <ElSelect
            v-model="formData.studentIds"
            clearable
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择学生"
          >
            <ElOption
              v-for="item in studentList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </ElSelect>
        </ElFormItem>
      </ElForm>
    </div>

    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="loading" @click="handleConfirm">
        确认
      </ElButton>
    </template>
  </ElDialog>
</template>
