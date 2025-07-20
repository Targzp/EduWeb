<script lang="ts" setup>
import type { CourseItemCeParams, CourseItemInfo } from '#/types/course-list';

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

import { createCourseApi, updateCourseApi } from '#/api';

import { CourseTypes } from './course-types';

const props = defineProps<{
  editData?: CourseItemInfo;
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

const initFormData = () => ({
  name: '',
  type: '',
  notes: '',
});
const formData = ref(initFormData());
const formRef = useTemplateRef('formRef');

watch(dialogVisible, (val) => {
  if (val && props.editFlag) {
    formData.value = {
      name: props.editData?.name || '',
      type: props.editData?.type!,
      notes: props.editData?.notes || '',
    };
  }
});

const rules = {
  name: [
    {
      required: true,
      message: '请输入课程名称',
      trigger: 'blur',
    },
  ],
  type: [
    {
      required: true,
      message: '请选择课程形式',
      trigger: 'change',
    },
  ],
};

const loading = ref(false);

const handleConfirm = () => {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true;
        const params: CourseItemCeParams = {
          ...formData.value,
        };
        if (props.editFlag) {
          params.id = props.editData?.id;
          const res = await updateCourseApi(params);
          if (res) {
            ElMessage({
              message: '编辑成功',
              type: 'success',
            });
            dialogVisible.value = false;
            emit('submitSuccess');
          }
        } else {
          const res = await createCourseApi(params);
          if (res) {
            ElMessage({
              message: '创建成功',
              type: 'success',
            });
            dialogVisible.value = false;
            emit('submitSuccess');
          }
        }
      } catch (error) {
        console.error('创建/编辑课程失败:', error);
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
    :title="editFlag ? '编辑课程' : '创建课程'"
    :show-close="false"
    :draggable="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <div class="px-5 pt-4">
      <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80">
        <ElFormItem prop="name" label="课程名称">
          <ElInput
            v-model="formData.name"
            clearable
            maxlength="200"
            :disabled="editFlag"
            placeholder="请输入课程名称"
          />
        </ElFormItem>
        <ElFormItem prop="type" label="课程形式">
          <ElSelect
            v-model="formData.type"
            class="w-full"
            :disabled="editFlag"
            placeholder="请选择课程形式"
          >
            <ElOption
              v-for="item in CourseTypes"
              :key="item"
              :label="item"
              :value="item"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem prop="notes" label="课程描述">
          <ElInput
            v-model="formData.notes"
            type="textarea"
            :rows="2"
            maxlength="2000"
            placeholder="请输入课程描述"
          />
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
