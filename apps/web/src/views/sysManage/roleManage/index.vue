<script lang="ts" setup>
import type { RoleId, RoleItem } from '#/types';

import { onMounted, ref } from 'vue';

import { ElButton, ElTable, ElTableColumn } from 'element-plus';

import { getRoleListApi } from '#/api/core/roles';
import { formatTableCell, tableIndexMethod } from '#/utils';

import RoleAccessDialog from './role-access-dialog.vue';
import RoleDialog from './role-dialog.vue';

const tableData = ref<RoleItem[]>([]);
const tableLoading = ref(false);

const getTableData = async () => {
  try {
    tableLoading.value = true;
    tableData.value = [];
    const res = await getRoleListApi();
    tableData.value = res;
  } catch (error) {
    console.error('获取用户列表信息失败:', error);
  } finally {
    tableLoading.value = false;
  }
};

const roleDialogVisible = ref(false);
const roleEditData = ref<RoleItem>();
const roleAccessDialogVisible = ref(false);
const roleAccessId = ref<RoleId>();

const handleEditRole = (row: RoleItem) => {
  roleDialogVisible.value = true;
  roleEditData.value = row;
};

const handleEditRoleAccess = (id: RoleId) => {
  roleAccessDialogVisible.value = true;
  roleAccessId.value = id;
};

onMounted(() => {
  getTableData();
});
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden p-4">
    <div
      class="flex h-full flex-1 flex-col rounded-[4px] bg-[hsl(var(--background))] p-4"
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
        <ElTableColumn prop="name" label="角色名称">
          <template #default="{ row }">
            {{ row.name === 'Super' ? '超级管理员' : '管理员' }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="notes"
          label="角色描述"
          :formatter="formatTableCell"
        />
        <ElTableColumn prop="action" label="操作栏" align="center" width="150">
          <template #default="{ row }">
            <template v-if="row.name !== 'Super'">
              <ElButton type="primary" link @click="handleEditRole(row)">
                编辑
              </ElButton>
              <ElButton
                type="success"
                link
                @click="handleEditRoleAccess(row.id)"
              >
                功能权限
              </ElButton>
            </template>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>

    <RoleDialog
      v-model:visible="roleDialogVisible"
      :edit-data="roleEditData"
      @submit-success="getTableData"
    />
    <RoleAccessDialog
      v-model:visible="roleAccessDialogVisible"
      :role-id="roleAccessId"
      @submit-success="getTableData"
    />
  </div>
</template>
