<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { cloneDeep } from '@vben/utils';

import {
  ElButton,
  ElMessage,
  ElMessageBox,
  ElTable,
  ElTableColumn,
} from 'element-plus';

import { deleteTimetableTemplateApi, getTimetableTemplateListApi } from '#/api';
import { TimetableTemplateItem } from '#/types';
import { formatDate, tableIndexMethod } from '#/utils';

import TemplateDialog from './template-dialog.vue';

const tableData = ref<TimetableTemplateItem[]>([]);

const tableLoading = ref(false);

const getTableData = async () => {
  try {
    tableLoading.value = true;
    tableData.value = [];
    const res = await getTimetableTemplateListApi();
    if (res) {
      tableData.value = res;
    }
  } catch (error) {
    console.error('获取课表模板失败:', error);
  } finally {
    tableLoading.value = false;
  }
};

const templateDialogVisible = ref(false);
const templateDialogEditFlag = ref(false);
const templateDialogEditData = ref<TimetableTemplateItem>();

const handleAddTimetableTemplate = () => {
  templateDialogVisible.value = true;
  templateDialogEditFlag.value = false;
};

const handleEditTimetableTemplate = (row: TimetableTemplateItem) => {
  templateDialogVisible.value = true;
  templateDialogEditFlag.value = true;
  templateDialogEditData.value = cloneDeep(row);
};

const handleDeleteTimetableTemplate = (id: number) => {
  ElMessageBox.confirm('是否删除该课表模板？', '删除课表模板', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      const res = await deleteTimetableTemplateApi(id);
      if (res) {
        ElMessage({
          message: '删除成功',
          type: 'success',
        });
        getTableData();
      }
    } catch (error) {
      console.error('删除课表模板失败:', error);
    }
  });
};

onMounted(() => {
  getTableData();
});
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden p-4">
    <div class="flex justify-end">
      <ElButton
        type="primary"
        class="!h-10 w-24"
        @click="handleAddTimetableTemplate"
      >
        创建模板
      </ElButton>
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
        <ElTableColumn prop="name" label="模板名称" />
        <ElTableColumn prop="notes" label="模板描述">
          <template #default="{ row }">
            {{ row.notes || '-' }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createDate" label="创建时间">
          <template #default="{ row }">
            {{ formatDate(row.createDate, 'YYYY-MM-DD') }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="action" label="操作栏" align="center" width="120">
          <template #default="{ row }">
            <ElButton
              type="primary"
              link
              @click="handleEditTimetableTemplate(row)"
            >
              编辑
            </ElButton>
            <ElButton
              type="danger"
              link
              @click="handleDeleteTimetableTemplate(row.id)"
            >
              删除
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>

    <TemplateDialog
      v-model:visible="templateDialogVisible"
      :edit-flag="templateDialogEditFlag"
      :edit-data="templateDialogEditData"
      @submit-success="getTableData"
    />
  </div>
</template>
