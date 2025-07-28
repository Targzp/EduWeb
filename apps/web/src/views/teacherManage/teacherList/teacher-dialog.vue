<script lang="ts" setup>
import type {
  CourseItemInfo,
  TeacherItemCeParams,
  TeacherItemInfo,
} from '#/types';

import { computed, ref, useTemplateRef, watch } from 'vue';

import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElSelect,
} from 'element-plus';

import { createTeacherApi, updateTeacherApi } from '#/api/core/teacher-list';
import { phoneValidator } from '#/utils';

const props = defineProps<{
  courseList: CourseItemInfo[];
  editData?: TeacherItemInfo;
  editFlag: boolean;
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

watch(dialogVisible, (val) => {
  if (val && props.editFlag) {
    formData.value = {
      name: props.editData?.name || '',
      phone: props.editData?.phone || '',
      courseIds: props.editData?.courses.map((item) => item.id) || [],
    };
  }
});

const initFormData = () =>
  ({
    name: '',
    phone: '',
    courseIds: [],
  }) as TeacherItemCeParams;
const formData = ref(initFormData());

const formRef = useTemplateRef('formRef');
const loading = ref(false);

const rules = {
  name: [
    {
      required: true,
      message: '请输入教师姓名',
      trigger: 'blur',
    },
  ],
  phone: [
    {
      required: true,
      message: '请输入手机号码',
      trigger: 'blur',
    },
    {
      validator: phoneValidator,
      trigger: 'blur',
    },
  ],
  courseIds: [
    {
      required: true,
      message: '请选择教学课程',
      trigger: 'change',
    },
  ],
};

const handleConfirm = () => {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true;
        const params = {
          ...formData.value,
        } as TeacherItemCeParams;
        if (props.editFlag) {
          // TODO 若教师有更改前的课程排课，点击保存时进行二次确认
          params.id = props.editData?.id;
          const res = await updateTeacherApi(params);
          if (res) {
            ElMessage({
              message: '编辑成功',
              type: 'success',
            });
            dialogVisible.value = false;
            emit('submitSuccess');
          }
        } else {
          const res = await createTeacherApi(params);
          if (res) {
            ElMessage({
              message: '注册成功',
              type: 'success',
            });
            dialogVisible.value = false;
            emit('submitSuccess');
          }
        }
      } catch (error) {
        console.error('注册/编辑教师失败:', error);
      } finally {
        loading.value = false;
      }
    }
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
    width="500"
    :title="editFlag ? '编辑教师' : '注册教师'"
    :show-close="false"
    :draggable="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <div class="px-5 pt-4">
      <ElForm ref="formRef" :model="formData" :rules="rules">
        <ElFormItem prop="name" label="教师姓名">
          <ElInput
            v-model="formData.name"
            clearable
            placeholder="请输入教师姓名"
          />
        </ElFormItem>
        <ElFormItem prop="phone" label="手机号码">
          <ElInput
            v-model="formData.phone"
            clearable
            placeholder="请输入手机号码"
          />
        </ElFormItem>
        <ElFormItem prop="courseIds" label="教学课程">
          <ElSelect
            v-model="formData.courseIds"
            class="w-full"
            multiple
            clearable
            placeholder="请选择教学课程"
          >
            <ElOption
              v-for="item in courseList"
              :key="item.id"
              :label="`${item.name}/${item.type}`"
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
