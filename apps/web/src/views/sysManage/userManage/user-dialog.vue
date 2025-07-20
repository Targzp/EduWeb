<script lang="tsx" setup>
import type { RoleId, UserItemCeParams, UserItemInfo } from '#/types';

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

import { createUserApi, updateUserApi } from '#/api';

const props = defineProps<{
  editData?: UserItemInfo;
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
  account: '',
  phone: '',
  mail: '',
  roleId: undefined as RoleId | undefined,
  password: '',
});
const formData = ref(initFormData());

watch(dialogVisible, (val) => {
  if (val && props.editFlag) {
    formData.value = {
      account: props.editData?.account || '',
      phone: props.editData?.phone || '',
      mail: props.editData?.mail || '',
      roleId: props.editData?.roleId,
      password: (props.editData?.password as string) || '',
    };
  }
});

const rules = {
  account: [
    {
      required: true,
      message: '请输入用户姓名',
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
      validator: (_rule: any, value: string, callback: any) => {
        const reg =
          /^(?:13\d|14[014-9]|15[0-35-9]|16[2567]|17[0-8]|18\d|19[0-35-9])\d{8}$/;
        if (reg.test(value)) {
          callback();
        } else {
          callback(new Error('请输入正确的手机号码'));
        }
      },
      trigger: 'blur',
    },
  ],
  mail: [
    {
      required: true,
      message: '请输入用户邮箱',
      trigger: 'blur',
    },
    {
      validator: (_rule: any, value: string, callback: any) => {
        const reg = /^\w+(?:[-+.']\w+)*@\w+(?:[-.]\w+)*\.\w+(?:[-.]\w+)*$/;
        if (reg.test(value)) {
          callback();
        } else {
          callback(new Error('请输入正确的邮箱格式'));
        }
      },
      trigger: 'blur',
    },
  ],
  roleId: [
    {
      required: true,
      message: '请选择用户角色',
      trigger: 'change',
    },
  ],
  password: [
    {
      required: true,
      message: '请输入用户密码',
      trigger: 'blur',
    },
    {
      validator: (_rule: any, value: string, callback: any) => {
        const reg = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        if (reg.test(value)) {
          callback();
        } else {
          callback(new Error('密码长度不能小于8位且需包含大小写字母和数字'));
        }
      },
      trigger: 'blur',
    },
  ],
};

const formRef = useTemplateRef('formRef');
const loading = ref(false);

const handleConfirm = () => {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true;
        const params = {
          ...formData.value,
        } as unknown as UserItemCeParams;
        if (props.editFlag) {
          params.id = props.editData?.id;
          const res = await updateUserApi(params);
          if (res) {
            ElMessage({
              message: '编辑成功',
              type: 'success',
            });
            dialogVisible.value = false;
            emit('submitSuccess');
          }
        } else {
          const res = await createUserApi(params);
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
        console.error('创建/编辑用户失败:', error);
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
    :title="editFlag ? '编辑用户' : '创建用户'"
    :show-close="false"
    :draggable="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <div class="px-5 pt-4">
      <ElForm ref="formRef" :model="formData" :rules="rules">
        <ElFormItem prop="account" label="用户名称">
          <ElInput
            v-model="formData.account"
            clearable
            placeholder="请输入用户名称"
          />
        </ElFormItem>
        <ElFormItem prop="phone" label="手机号码">
          <ElInput
            v-model="formData.phone"
            clearable
            placeholder="请输入手机号码"
          />
        </ElFormItem>
        <ElFormItem prop="mail" label="用户邮箱">
          <ElInput
            v-model="formData.mail"
            clearable
            placeholder="请输入用户邮箱"
          />
        </ElFormItem>
        <ElFormItem prop="roleId" label="用户角色">
          <ElSelect
            v-model="formData.roleId"
            class="w-full"
            placeholder="请选择用户角色"
          >
            <ElOption label="超级管理员" :value="1" />
            <ElOption label="管理员" :value="2" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem prop="password" label="用户密码">
          <ElInput
            v-model="formData.password"
            type="password"
            show-password
            clearable
            placeholder="请输入用户密码"
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
