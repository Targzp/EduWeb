<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import dayjs from 'dayjs';
import {
  ElButton,
  ElDatePicker,
  ElForm,
  ElFormItem,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElPagination,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import {
  deleteTransferApplicationApi,
  getAllStudentListApi,
  getTransferApplicationListApi,
} from '#/api';
import { usePagination } from '#/hooks';
import { StuItemInfo, TransferApplicationItem } from '#/types';
import { ApprovalStatus } from '#/types/stu-transfer-application';
import { formatDate, formatRangeTimeWithWeek, tableIndexMethod } from '#/utils';

import ApplicationApprovalDialog from './application-approval-dialog.vue';

const studentList = ref<StuItemInfo[]>([]);

const getAllStudentList = async () => {
  try {
    const res = await getAllStudentListApi();
    studentList.value = res;
  } catch (error) {
    console.error('获取学生列表失败:', error);
  }
};

const approvalStatusList = [
  {
    value: ApprovalStatus.Approved,
    label: '通过',
  },
  {
    value: ApprovalStatus.Pending,
    label: '未审批',
  },
  {
    value: ApprovalStatus.Rejected,
    label: '未通过',
  },
];

const initFormData = () => ({
  stuIds: [] as number[],
  dateRange: [],
  approvalStatus: undefined,
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

const tableData = ref<TransferApplicationItem[]>([]);
const tableLoading = ref(false);

const getTableData = async () => {
  try {
    tableLoading.value = true;
    tableData.value = [];
    const params = {
      pageNumber: pageNo.value,
      pageSize: pageSize.value,
      startDate: formData.value.dateRange[0]
        ? dayjs(formData.value.dateRange[0])
            .startOf('day')
            .format('YYYY-MM-DDTHH:mm')
        : null,
      endDate: formData.value.dateRange[1]
        ? dayjs(formData.value.dateRange[1])
            .endOf('day')
            .format('YYYY-MM-DDTHH:mm')
        : null,
      stuIds: formData.value.stuIds,
      approvalStatus: formData.value.approvalStatus,
    };
    const res = await getTransferApplicationListApi(params);
    total.value = res.totalCount;
    tableData.value = res.data;
  } catch (error) {
    console.error('获取调课申请列表失败:', error);
  } finally {
    tableLoading.value = false;
  }
};

const formatApprovalStatus = (
  approvalStatus: ApprovalStatus,
  row: TransferApplicationItem,
) => {
  const statusLabel = approvalStatusList.find(
    (item) => item.value === approvalStatus,
  )!.label;
  if (approvalStatus === ApprovalStatus.Rejected) {
    return `${statusLabel}(${row.rejectReason})`;
  }
  return statusLabel;
};

const getTagType = (approvalStatus: ApprovalStatus) => {
  if (approvalStatus === ApprovalStatus.Approved) {
    return 'success';
  }
  if (approvalStatus === ApprovalStatus.Pending) {
    return 'info';
  }
  return 'danger';
};

const approvalDialogVisible = ref(false);
const approvalDialogData = ref<TransferApplicationItem>();

const handleApproval = (row: TransferApplicationItem) => {
  approvalDialogVisible.value = true;
  approvalDialogData.value = row;
};

const handleDelete = (row: TransferApplicationItem) => {
  ElMessageBox.confirm('确定将该调课申请单删除？', '注意', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      const res = await deleteTransferApplicationApi(row.id);
      if (res) {
        ElMessage({
          message: '删除成功',
          type: 'success',
        });
        getTableData();
      }
    } catch (error) {
      console.error('删除调课申请失败:', error);
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
  getAllStudentList();
  getTableData();
});
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden p-4">
    <div
      class="mt-2 h-[56px] w-full rounded-[4px] bg-[hsl(var(--background))] p-2"
    >
      <ElForm :model="formData" class="mt-[4px]" inline>
        <div class="flex w-full justify-between">
          <div>
            <ElFormItem class="!mb-0" prop="stuIds" label="学生姓名">
              <ElSelect
                v-model="formData.stuIds"
                multiple
                collapse-tags
                collapse-tags-tooltip
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
            <ElFormItem class="!mb-0" prop="dateRange" label="日期范围">
              <ElDatePicker
                v-model="formData.dateRange"
                class="!w-[250px]"
                type="daterange"
                value-format="YYYY-MM-DD"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              />
            </ElFormItem>
            <ElFormItem class="!mb-0" prop="approvalStatus" label="申请状态">
              <ElSelect
                v-model="formData.approvalStatus"
                clearable
                class="!w-[181px]"
                placeholder="请选择申请状态"
              >
                <ElOption
                  v-for="item in approvalStatusList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
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
        <ElTableColumn prop="stuName" label="申请学生" width="120" />
        <ElTableColumn prop="createDate" label="申请日期" width="150">
          <template #default="{ row }">
            {{ formatDate(row.createDate) }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="originSchedule" label="申请课程">
          <template #default="{ row }">
            {{
              `${row.originSchedule.courseName}/${row.originSchedule.courseType}`
            }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="originSchedule" label="原课程时间">
          <template #default="{ row }">
            {{
              formatRangeTimeWithWeek(
                row.originSchedule.startDate,
                row.originSchedule.endDate,
              )
            }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="originSchedule" label="申请调课时间">
          <template #default="{ row }">
            {{
              formatRangeTimeWithWeek(
                row.toStartTime,
                dayjs(row.toStartTime)
                  .add(
                    dayjs(row.originSchedule.endDate).valueOf() -
                      dayjs(row.originSchedule.startDate).valueOf(),
                    'millisecond',
                  )
                  .toDate(),
              )
            }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="approvalStatus" label="申请结果" width="280">
          <template #default="{ row }">
            <ElTag :type="getTagType(row.approvalStatus)" class="!text-[13px]">
              {{ formatApprovalStatus(row.approvalStatus, row) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="action" label="操作栏" align="center" width="120">
          <template #default="{ row }">
            <template v-if="row.approvalStatus !== 2">
              <ElButton
                v-if="row.approvalStatus === 0"
                type="primary"
                link
                @click="handleApproval(row)"
              >
                审批
              </ElButton>
              <ElButton type="danger" link @click="handleDelete(row)">
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

    <ApplicationApprovalDialog
      v-model:visible="approvalDialogVisible"
      :application-data="approvalDialogData"
      @submit-success="getTableData"
    />
  </div>
</template>
