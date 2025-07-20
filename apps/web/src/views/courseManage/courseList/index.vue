<script lang="ts" setup>
import type { CourseItemInfo } from '#/types/course-list';

import { onMounted, ref } from 'vue';

import {
  ElButton,
  ElMessage,
  ElMessageBox,
  ElTable,
  ElTableColumn,
} from 'element-plus';
import { sort } from 'radash';

import {
  deleteCourseApi,
  exchangeCourseApi,
  getCourseListApi,
} from '#/api/core/course-list';
import { formatTableCell, tableIndexMethod } from '#/utils';

import CourseDialog from './course-dialog.vue';

const tableData = ref<CourseItemInfo[]>([]);

const tableLoading = ref(false);

const getTableData = async () => {
  try {
    tableLoading.value = true;
    tableData.value = [];
    const res = await getCourseListApi();
    tableData.value = sort(res, (item) => item.sortOrder);
  } catch (error) {
    console.error('获取课程列表失败:', error);
  } finally {
    tableLoading.value = false;
  }
};

const courseDialogVisible = ref(false);
const courseDialogEditFlag = ref(false);
const courseDialogEditData = ref<CourseItemInfo>();

const handleCreateCourse = () => {
  courseDialogEditFlag.value = false;
  courseDialogVisible.value = true;
};

const handleEditCourse = (row: CourseItemInfo) => {
  courseDialogEditFlag.value = true;
  courseDialogEditData.value = row;
  courseDialogVisible.value = true;
};

const handleDelete = async (id: string) => {
  // TODO 此处需进行课程是否已排课判断
  ElMessageBox.confirm('确定删除该课程吗？', '删除课程', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      const res = await deleteCourseApi(id);
      if (res) {
        ElMessage({
          message: '删除成功',
          type: 'success',
        });
        getTableData();
      }
    } catch (error) {
      console.error('删除课程失败:', error);
    }
  });
};

/**
 * 移动课程
 */
const handleMoveCourse = async (index: number, direction: 'down' | 'up') => {
  try {
    tableLoading.value = true;
    let res = false;
    if (direction === 'up') {
      const params = {
        id1: tableData.value[index]!.id,
        id2: tableData.value[index - 1]!.id,
      };
      res = await exchangeCourseApi(params);
    } else {
      const params = {
        id1: tableData.value[index]!.id,
        id2: tableData.value[index + 1]!.id,
      };
      res = await exchangeCourseApi(params);
    }
    if (res) {
      ElMessage({
        message: '移动成功',
        type: 'success',
      });
      getTableData();
    }
  } catch (error) {
    console.error('移动课程失败:', error);
  } finally {
    tableLoading.value = false;
  }
};

onMounted(() => {
  getTableData();
});
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden p-4">
    <div class="flex justify-end">
      <ElButton type="primary" class="!h-10 w-24" @click="handleCreateCourse">
        创建课程
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
        <ElTableColumn prop="name" label="课程名称" />
        <ElTableColumn prop="type" label="课程形式" />
        <ElTableColumn
          prop="notes"
          label="课程描述"
          :formatter="formatTableCell"
        />
        <ElTableColumn prop="action" label="操作栏" align="center" width="200">
          <template #default="{ row, $index }">
            <ElButton type="primary" link @click="handleEditCourse(row)">
              编辑
            </ElButton>
            <ElButton type="danger" link @click="handleDelete(row.id)">
              删除
            </ElButton>
            <ElButton
              v-if="$index !== 0"
              type="success"
              link
              @click="handleMoveCourse($index, 'up')"
            >
              上移
            </ElButton>
            <ElButton
              v-if="$index !== tableData.length - 1"
              type="success"
              link
              @click="handleMoveCourse($index, 'down')"
            >
              下移
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>

    <CourseDialog
      v-model:visible="courseDialogVisible"
      :edit-flag="courseDialogEditFlag"
      :edit-data="courseDialogEditData"
      @submit-success="getTableData"
    />
  </div>
</template>
