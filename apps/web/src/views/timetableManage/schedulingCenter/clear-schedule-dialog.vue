<script lang="ts" setup>
import { computed, ref, useTemplateRef } from 'vue';

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
  ElSwitch,
} from 'element-plus';

import { deleteCourseScheduleByConditionApi } from '#/api';
import { CourseItemInfo, StuItemInfo, TeacherItemInfo } from '#/types';
import { ClearModeType } from '#/types/scheduling-center';

const props = defineProps<{
  courseList: CourseItemInfo[];
  studentList: StuItemInfo[];
  teacherList: TeacherItemInfo[];
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

const initFormData = () => ({
  mode: ClearModeType.ALL,
  month: '',
  teacherId: undefined,
  studentId: undefined,
  isCourse: false,
  courseId: undefined,
});
const formData = ref(initFormData());

const rules = {
  mode: [{ required: true, message: '请选择清除模式', trigger: ['change'] }],
  month: [{ required: true, message: '请选择月份', trigger: ['change'] }],
  teacherId: [{ required: true, message: '请选择教师', trigger: ['change'] }],
  studentId: [{ required: true, message: '请选择学生', trigger: ['change'] }],
  courseId: [{ required: true, message: '请选择课程', trigger: ['change'] }],
};

const disabledDate = (time: Date) => {
  return dayjs(time).month() < dayjs().month();
};

const formRef = useTemplateRef('formRef');
const loading = ref(false);

const modeList = [
  {
    label: '全部',
    value: ClearModeType.ALL,
  },
  {
    label: '按月份',
    value: ClearModeType.MONTH,
  },
  {
    label: '按教师',
    value: ClearModeType.TEACHER,
  },
  {
    label: '按学生',
    value: ClearModeType.STUDENT,
  },
];

const handleChangeMode = (val: ClearModeType) => {
  if (val) {
    formData.value = {
      ...initFormData(),
      mode: val,
    };
    formRef.value?.resetFields();
  }
};

const handleChangeIsCourse = (val: boolean | number | string) => {
  if (!val) {
    formData.value.courseId = undefined;
  }
};

const modeParamsObj = {
  [ClearModeType.ALL]: () => ({
    startDate: null,
    endDate: null,
    courseIds: null,
    teacherIds: null,
    studentIds: null,
  }),
  [ClearModeType.MONTH]: () => ({
    startDate: dayjs(formData.value.month)
      .startOf('month')
      .format('YYYY-MM-DDTHH:mm'),
    endDate: dayjs(formData.value.month)
      .add(1, 'month')
      .startOf('month')
      .format('YYYY-MM-DDTHH:mm'),
    courseIds: [],
    teacherIds: [],
    studentIds: [],
  }),
  [ClearModeType.TEACHER]: () => ({
    startDate: null,
    endDate: null,
    teacherIds: [formData.value.teacherId!],
    courseIds: [],
    studentIds: [],
  }),
  [ClearModeType.STUDENT]: () => ({
    startDate: null,
    endDate: null,
    studentIds: [formData.value.studentId!],
    courseIds: [],
    teacherIds: [],
  }),
};

const handleConfirm = () => {
  formRef.value?.validate((valid) => {
    if (!valid) {
      return;
    }
    ElMessageBox.confirm('确认清除所选条件下的所有排课？', '注意', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(async () => {
      try {
        loading.value = true;
        const params = modeParamsObj[formData.value.mode]();
        if (formData.value.isCourse) {
          params.courseIds = [formData.value.courseId!];
        }
        const res = await deleteCourseScheduleByConditionApi(params);
        if (res) {
          ElMessage.success('清除成功');
          dialogVisible.value = false;
          emit('submitSuccess');
        }
      } catch (error) {
        console.error('清除排课失败:', error);
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
</script>

<template>
  <ElDialog
    v-model="dialogVisible"
    width="600"
    title="一键清除"
    :show-close="false"
    :draggable="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <div class="px-[50px] pt-4">
      <ElForm ref="formRef" :model="formData" label-width="100" :rules="rules">
        <ElFormItem prop="mode" label="清除模式">
          <ElSelect
            v-model="formData.mode"
            placeholder="请选择清除模式"
            @change="handleChangeMode"
          >
            <ElOption
              v-for="item in modeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem prop="isCourse" label="是否指定课程">
          <ElSwitch
            v-model="formData.isCourse"
            active-text="是"
            inactive-text="否"
            @change="handleChangeIsCourse"
          />
        </ElFormItem>
        <ElFormItem v-if="formData.isCourse" prop="courseId" label="课程名称">
          <ElSelect
            v-model="formData.courseId"
            clearable
            placeholder="请选择课程"
          >
            <ElOption
              v-for="item in courseList"
              :key="item.id"
              :label="`${item.name}/${item.type}`"
              :value="item.id"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem
          v-if="formData.mode === ClearModeType.MONTH"
          prop="month"
          label="选择月份"
        >
          <ElDatePicker
            v-model="formData.month"
            class="!w-full"
            type="month"
            :disabled-date="disabledDate"
            clearable
            placeholder="请选择月份"
          />
        </ElFormItem>
        <ElFormItem
          v-if="formData.mode === ClearModeType.TEACHER"
          prop="teacherId"
          label="教师名称"
        >
          <ElSelect
            v-model="formData.teacherId"
            clearable
            placeholder="请选择教师"
          >
            <ElOption
              v-for="item in teacherList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem
          v-if="formData.mode === ClearModeType.STUDENT"
          prop="studentId"
          label="学生名称"
        >
          <ElSelect
            v-model="formData.studentId"
            clearable
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
