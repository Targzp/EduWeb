<script lang="tsx" setup>
import type { RoleItem } from '#/types';

import { computed, ref, watch } from 'vue';

import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
} from 'element-plus';

import { updateRoleInfoApi } from '#/api/core/roles';

const props = defineProps<{
  editData?: RoleItem;
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

const formatName = (name: string) => {
  return name === 'Super' ? '超级管理员' : '管理员';
};

watch(dialogVisible, (val) => {
  if (val) {
    formData.value = {
      name: props.editData?.name ? formatName(props.editData.name) : '',
      notes: props.editData?.notes || '',
    };
  }
});

const initFormData = () => ({
  name: '',
  notes: '',
});
const formData = ref(initFormData());

const loading = ref(false);

const handleConfirm = async () => {
  try {
    loading.value = true;
    const params = {
      id: props.editData!.id,
      ...formData.value,
    };
    const res = await updateRoleInfoApi(params);
    if (res) {
      ElMessage({
        message: '编辑成功',
        type: 'success',
      });
      dialogVisible.value = false;
      emit('submitSuccess');
    }
  } catch (error) {
    console.error('更新角色信息失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  formData.value = initFormData();
};
</script>

<template>
  <ElDialog
    v-model="dialogVisible"
    width="500"
    title="编辑角色"
    :show-close="false"
    :draggable="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <div class="px-5 pt-2">
      <ElForm :model="formData">
        <ElFormItem prop="name" label="角色名称">
          <ElInput
            v-model="formData.name"
            disabled
            placeholder="请输入角色名称"
          />
        </ElFormItem>
        <ElFormItem prop="notes" label="角色描述">
          <ElInput
            v-model="formData.notes"
            type="textarea"
            :rows="2"
            placeholder="请输入角色描述"
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
