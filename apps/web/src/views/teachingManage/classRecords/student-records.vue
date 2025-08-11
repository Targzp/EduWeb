<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import dayjs from 'dayjs';
import {
  ElButton,
  ElDatePicker,
  ElForm,
  ElFormItem,
  ElOption,
  ElPagination,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';
import { sort } from 'radash';

import {
  getAllStudentListApi,
  getCourseListApi,
  getStudentRecordListApi,
} from '#/api';
import { usePagination } from '#/hooks';
import { CourseItemInfo, StudentRecordItem, StuItemInfo } from '#/types';
import { formatDate, formatTableCell, tableIndexMethod } from '#/utils';

const studentList = ref<StuItemInfo[]>([]);
const courseList = ref<CourseItemInfo[]>([]);

const getAllStudentList = async () => {
  try {
    const res = await getAllStudentListApi();
    studentList.value = res;
  } catch (error) {
    console.error('获取学生列表失败:', error);
  }
};

const getCourseList = async () => {
  try {
    const res = await getCourseListApi();
    courseList.value = sort(res, (item) => item.sortOrder);
  } catch (error) {
    console.error('获取课程列表失败:', error);
  }
};

const initFormData = () => ({
  studentId: undefined,
  dateRange: [],
  courseIds: [] as number[],
});
const formData = ref(initFormData());

const handleReset = () => {
  formData.value = initFormData();
  pageNo.value = 1;
  getTableData();
};

const handleSearch = () => {
  pageNo.value = 1;
  getTableData();
};

const tableData = ref<StudentRecordItem[]>([]);
const tableLoading = ref(false);

const getTableData = async () => {
  try {
    tableLoading.value = true;
    tableData.value = [];
    const params = {
      pageNumber: pageNo.value,
      pageSize: pageSize.value,
      startDate:
        formData.value.dateRange && formData.value.dateRange[0]
          ? dayjs(formData.value.dateRange[0]).format('YYYY-MM-DDTHH:mm')
          : null,
      endDate:
        formData.value.dateRange && formData.value.dateRange[1]
          ? dayjs(formData.value.dateRange[1]).format('YYYY-MM-DDTHH:mm')
          : null,
      studentIds: formData.value.studentId ? [formData.value.studentId] : [],
      courseIds: formData.value.courseIds,
    };
    const res = await getStudentRecordListApi(params);
    total.value = res.totalCount;
    tableData.value = res.data;
  } catch (error) {
    console.error('获取学生上课记录列表失败:', error);
  } finally {
    tableLoading.value = false;
  }
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
  getAllStudentList();
  getCourseList();
  getTableData();
});
</script>

<template>
  <div
    class="mt-2 h-[56px] w-full rounded-[4px] bg-[hsl(var(--background))] p-2"
  >
    <ElForm :model="formData" class="mt-[4px]" inline>
      <div class="flex w-full justify-between">
        <div>
          <ElFormItem class="!mb-0" prop="studentId" label="学生姓名">
            <ElSelect
              v-model="formData.studentId"
              clearable
              filterable
              class="!w-[181px]"
              placeholder="请选择学生姓名"
            >
              <ElOption
                v-for="item in studentList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem class="!mb-0" prop="dateRange" label="日期时间范围">
            <ElDatePicker
              v-model="formData.dateRange"
              class="!w-[300px]"
              type="datetimerange"
              value-format="YYYY-MM-DD HH:mm"
              time-format="HH:mm"
              range-separator="-"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
            />
          </ElFormItem>
          <ElFormItem class="!mb-0" prop="courseIds" label="课程名称">
            <ElSelect
              v-model="formData.courseIds"
              class="!w-[250px]"
              multiple
              clearable
              filterable
              collapse-tags
              collapse-tags-tooltip
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
      <ElTableColumn prop="studentName" label="学生" width="120" />
      <ElTableColumn prop="startDate" label="日期">
        <template #default="{ row }">
          {{ formatDate(row.startDate, 'YYYY-MM-DD') }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="startDate" label="时间段">
        <template #default="{ row }">
          {{ formatDate(row.startDate, 'HH:mm') }}-{{
            formatDate(row.endDate, 'HH:mm')
          }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="courseName" label="课程">
        <template #default="{ row }">
          {{ `${row.courseName}/${row.courseType}` }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="isCheckIn" label="是否到课" width="100">
        <template #default="{ row }">
          <ElTag :type="row.isCheckIn ? 'success' : 'danger'">
            {{ row.isCheckIn ? '是' : '否' }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="missCheckInReason"
        label="未到课原因"
        :formatter="formatTableCell"
      />
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
</template>
