<script lang="ts" setup>
import type { RoleId, UserItemInfo } from '#/types';

import { onMounted, ref } from 'vue';

import {
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElPagination,
  ElSelect,
  ElTable,
  ElTableColumn,
} from 'element-plus';

import { deleteUserApi, getUserListApi } from '#/api';
import { usePagination } from '#/hooks';
import { formatDate, tableIndexMethod } from '#/utils';

import UserDialog from './user-dialog.vue';

const initFormData = () => ({
  account: '',
  phone: '',
  mail: '',
  roleId: 0 as RoleId,
});
const formData = ref(initFormData());

const tableData = ref<UserItemInfo[]>([]);

const tableLoading = ref(false);
const getTableData = async () => {
  try {
    tableLoading.value = true;
    tableData.value = [];
    const params = {
      pageNumber: pageNo.value,
      pageSize: pageSize.value,
      ...formData.value,
    };
    const res = await getUserListApi(params);
    total.value = res.totalCount;
    tableData.value = res.data;
  } catch (error) {
    console.error('获取用户列表信息失败:', error);
  } finally {
    tableLoading.value = false;
  }
};

const handleReset = () => {
  formData.value = initFormData();
  pageNo.value = 1;
  getTableData();
};

const handleSearch = () => {
  pageNo.value = 1;
  getTableData();
};

const userDialogVisible = ref(false);
const userEditFlag = ref(false);
const userEditData = ref<UserItemInfo>();

const handleCreateUser = () => {
  userEditFlag.value = false;
  userDialogVisible.value = true;
};

const handleEditUser = (rowData: UserItemInfo) => {
  userEditFlag.value = true;
  userEditData.value = rowData;
  userDialogVisible.value = true;
};

const handleDelete = async (id: string) => {
  ElMessageBox.confirm('确定删除该用户吗？', '删除用户', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      const res = await deleteUserApi(id);
      if (res) {
        ElMessage({
          message: '删除成功',
          type: 'success',
        });
        getTableData();
      }
    } catch (error) {
      console.error('删除用户失败:', error);
    }
  });
};

const {
  total,
  pageSize,
  pageSizes,
  pageNo,
  handleSizeChange,
  handleCurrentChange,
} = usePagination(20, getTableData);

onMounted(() => {
  getTableData();
});
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden p-4">
    <div class="flex justify-end">
      <ElButton type="primary" class="!h-10 w-24" @click="handleCreateUser">
        创建用户
      </ElButton>
    </div>
    <div
      class="mt-2 h-[56px] w-full rounded-[4px] bg-[hsl(var(--background))] p-2"
    >
      <ElForm :model="formData" class="mt-[4px]" inline>
        <div class="flex w-full justify-between">
          <div>
            <ElFormItem class="!mb-0" prop="account" label="用户名称">
              <ElInput
                v-model="formData.account"
                clearable
                placeholder="请输入用户名称"
              />
            </ElFormItem>
            <ElFormItem class="!mb-0" prop="phone" label="手机号码">
              <ElInput
                v-model="formData.phone"
                clearable
                placeholder="请输入手机号码"
              />
            </ElFormItem>
            <ElFormItem class="!mb-0" prop="mail" label="用户邮箱">
              <ElInput
                v-model="formData.mail"
                clearable
                placeholder="请输入用户邮箱"
              />
            </ElFormItem>
            <ElFormItem class="!mb-0" prop="roleId" label="用户角色">
              <ElSelect
                v-model="formData.roleId"
                class="!w-[181px]"
                placeholder="请选择用户角色"
              >
                <ElOption label="全部" :value="0" />
                <ElOption label="超级管理员" :value="1" />
                <ElOption label="管理员" :value="2" />
              </ElSelect>
            </ElFormItem>
          </div>
          <div>
            <ElButton type="primary" plain @click="handleReset">重置</ElButton>
            <ElButton type="primary" @click="handleSearch">查询</ElButton>
          </div>
        </div>
      </ElForm>
    </div>
    <div
      class="mt-2 flex h-full flex-1 flex-col rounded-[4px] bg-[hsl(var(--background))] p-4"
    >
      <ElTable
        :data="tableData"
        border
        class="flex-1"
        header-cell-class-name="tableHeader"
        v-loading="tableLoading"
      >
        <ElTableColumn
          type="index"
          label="序号"
          width="60"
          align="center"
          :index="tableIndexMethod"
        />
        <ElTableColumn prop="account" label="用户名称" />
        <ElTableColumn prop="phone" label="手机号码" />
        <ElTableColumn prop="mail" label="用户邮箱" />
        <ElTableColumn prop="roleId" label="用户角色">
          <template #default="{ row }">
            {{ row.roleId === 1 ? '超级管理员' : '管理员' }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createDate" label="创建时间">
          <template #default="{ row }">
            {{ formatDate(row.createDate) }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="action" label="操作栏" align="center" width="120">
          <template #default="{ row }">
            <template v-if="row.account !== 'Admin'">
              <ElButton type="primary" link @click="handleEditUser(row)">
                编辑
              </ElButton>
              <ElButton type="danger" link @click="handleDelete(row.id)">
                删除
              </ElButton>
            </template>
          </template>
        </ElTableColumn>
      </ElTable>
      <div class="mt-4 flex justify-end">
        <ElPagination
          v-model:current-page="pageNo"
          v-model:page-size="pageSize"
          :page-sizes="pageSizes"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <UserDialog
      v-model:visible="userDialogVisible"
      :edit-flag="userEditFlag"
      :edit-data="userEditData"
      @submit-success="getTableData"
    />
  </div>
</template>
