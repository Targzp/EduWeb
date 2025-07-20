<script lang="ts" setup>
import type { CourseItemInfo, TeacherItemInfo } from '#/types';

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
import { sort } from 'radash';

import { getCourseListApi } from '#/api';
import { deleteTeacherApi, getTeacherListApi } from '#/api/core/teacher-list';
import { usePagination } from '#/hooks';
import { formatDate } from '#/utils';

import TeacherDialog from './teacher-dialog.vue';

const initFormData = () => ({
  name: '',
  phone: '',
  courseIds: [],
});
const formData = ref(initFormData());

const courseList = ref<CourseItemInfo[]>([]);

const getCourseList = async () => {
  try {
    const res = await getCourseListApi();
    courseList.value = sort(res, (item) => item.sortOrder);
  } catch (error) {
    console.error('获取课程列表失败:', error);
  }
};

const tableData = ref<TeacherItemInfo[]>([]);

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
    const res = await getTeacherListApi(params);
    total.value = res.totalCount;
    tableData.value = res.data;
  } catch (error) {
    console.error('获取教师列表失败:', error);
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

const multipleTeacherData = ref<TeacherItemInfo[]>([]);
const handleSelectionChange = (val: TeacherItemInfo[]) => {
  multipleTeacherData.value = val;
};

const {
  total,
  pageSize,
  pageSizes,
  pageNo,
  handleSizeChange,
  handleCurrentChange,
} = usePagination(20, getTableData);

const teacherDialogVisible = ref(false);
const teacherDialogEditFlag = ref(false);
const teacherDialogEditData = ref<TeacherItemInfo>();

const handleCreateTeacher = () => {
  teacherDialogVisible.value = true;
  teacherDialogEditFlag.value = false;
};

const handleEditTeacher = (row: TeacherItemInfo) => {
  teacherDialogVisible.value = true;
  teacherDialogEditFlag.value = true;
  teacherDialogEditData.value = row;
};

const handleBatchDeleteTeacher = () => {
  ElMessageBox.confirm(
    '注销后教师所有信息将会被清除，请确认是否注销？',
    '注销教师',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    },
  ).then(async () => {
    try {
      const ids = multipleTeacherData.value.map((item) => item.id);
      const res = await deleteTeacherApi(ids);
      if (res) {
        ElMessage({
          message: '注销成功',
          type: 'success',
        });
        getTableData();
      }
    } catch (error) {
      console.error('注销教师失败:', error);
    }
  });
};

onMounted(() => {
  getCourseList();
  getTableData();
});
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden p-4">
    <div class="flex justify-end">
      <ElButton type="primary" class="!h-10 w-24" @click="handleCreateTeacher">
        注册教师
      </ElButton>
      <ElButton
        type="primary"
        plain
        :disabled="multipleTeacherData.length === 0"
        class="!h-10 w-20"
        @click="handleBatchDeleteTeacher"
      >
        注销
      </ElButton>
    </div>
    <div
      class="mt-2 h-[56px] w-full rounded-[4px] bg-[hsl(var(--background))] p-2"
    >
      <ElForm :model="formData" class="mt-[4px]" inline>
        <div class="flex w-full justify-between">
          <div>
            <ElFormItem class="!mb-0" prop="name" label="教师姓名">
              <ElInput
                v-model="formData.name"
                clearable
                placeholder="请输入教师姓名"
              />
            </ElFormItem>
            <ElFormItem class="!mb-0" prop="phone" label="手机号码">
              <ElInput
                v-model="formData.phone"
                clearable
                placeholder="请输入手机号码"
              />
            </ElFormItem>
            <ElFormItem class="!mb-0" prop="courseIds" label="教学课程">
              <ElSelect
                v-model="formData.courseIds"
                multiple
                collapse-tags
                collapse-tags-tooltip
                clearable
                class="!w-[181px]"
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
        @selection-change="handleSelectionChange"
      >
        <ElTableColumn type="selection" width="55" align="center" />
        <ElTableColumn prop="name" label="教师姓名" />
        <ElTableColumn prop="phone" label="手机号码" />
        <ElTableColumn prop="courses" label="教学课程" width="500">
          <template #default="{ row }">
            {{
              row.courses.length > 0
                ? row.courses
                    .map((item: CourseItemInfo) => `${item.name}/${item.type}`)
                    .join(',')
                : '-'
            }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createDate" label="注册时间">
          <template #default="{ row }">
            {{ formatDate(row.createDate) }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="action"
          label="操作栏"
          align="center"
          width="120"
          height="100%"
        >
          <template #default="{ row }">
            <ElButton type="primary" link @click="handleEditTeacher(row)">
              编辑
            </ElButton>
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

    <TeacherDialog
      v-model:visible="teacherDialogVisible"
      :edit-flag="teacherDialogEditFlag"
      :edit-data="teacherDialogEditData"
      :course-list="courseList"
      @submit-success="getTableData"
    />
  </div>
</template>
