<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import dayjs from 'dayjs';
import {
  ElButton,
  ElDescriptions,
  ElDescriptionsItem,
  ElDialog,
  ElMessage,
  ElMessageBox,
  ElTable,
  ElTableColumn,
} from 'element-plus';

import { approveTransferApplicationApi, getCourseScheduleListApi } from '#/api';
import {
  CourseScheduleItem,
  TransferApplicationApprovalItem,
  TransferApplicationItem,
} from '#/types';
import { formatDate, formatRangeTimeWithWeek, sortByDate } from '#/utils';

const props = defineProps<{
  applicationData?: TransferApplicationItem;
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

const transferApplicationApprovalData = ref<TransferApplicationApprovalItem>();

watch(dialogVisible, (val) => {
  if (val && props.applicationData) {
    getApplicationDateScheduleData();
    const applicationData = props.applicationData;
    transferApplicationApprovalData.value = {
      id: applicationData.id,
      stuName: applicationData.stuName,
      createDate: formatDate(applicationData.createDate),
      course: `${applicationData.originSchedule.courseName}/${applicationData.originSchedule.courseType}`,
      originDate: formatRangeTimeWithWeek(
        dayjs(applicationData.originSchedule.startDate).toDate(),
        dayjs(applicationData.originSchedule.endDate).toDate(),
      ),
      transferDate: formatRangeTimeWithWeek(
        dayjs(applicationData.toStartTime).toDate(),
        dayjs(applicationData.toStartTime)
          .add(
            dayjs(applicationData.originSchedule.endDate).valueOf() -
              dayjs(applicationData.originSchedule.startDate).valueOf(),
            'millisecond',
          )
          .toDate(),
      ),
      approvalReason: applicationData.approvalReason,
    };
  }
});

const applicationDateScheduleData = ref<CourseScheduleItem[]>([]);
const tableLoading = ref(false);

const getApplicationDateScheduleData = async () => {
  try {
    tableLoading.value = true;
    applicationDateScheduleData.value = [];
    const params = {
      startDate: dayjs(props.applicationData!.toStartTime)
        .startOf('day')
        .format('YYYY-MM-DDTHH:mm'),
      endDate: dayjs(props.applicationData!.toStartTime)
        .endOf('day')
        .format('YYYY-MM-DDTHH:mm'),
      courseIds: [],
      teacherIds: [],
      studentIds: [],
    };
    const res = await getCourseScheduleListApi(params);
    if (res) {
      applicationDateScheduleData.value = sortByDate(res, 'startDate').map(
        (item) => {
          return {
            ...item,
            studentNames: item.students.map((stu) => stu.studentName),
          };
        },
      );
    }
  } catch (error) {
    console.error('获取申请调课日期排课表失败', error);
  } finally {
    tableLoading.value = false;
  }
};

const agreeLoading = ref(false);
const handleAgree = async () => {
  try {
    agreeLoading.value = true;
    const params = {
      approvalId: transferApplicationApprovalData.value!.id,
      isGrant: true,
      rejectResaon: '',
    };
    const res = await approveTransferApplicationApi(params);
    if (res) {
      ElMessage.success('审批成功');
      dialogVisible.value = false;
      emit('submitSuccess');
    }
  } catch (error) {
    console.error('同意申请失败:', error);
  } finally {
    agreeLoading.value = false;
  }
};

const handleReject = () => {
  ElMessageBox.prompt('请输入拒绝理由', '拒绝申请', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValidator: (value: string) => {
      return !!value;
    },
    inputErrorMessage: '请输入拒绝理由',
  }).then(async ({ value }) => {
    try {
      const params = {
        approvalId: transferApplicationApprovalData.value!.id,
        isGrant: false,
        rejectResaon: value,
      };
      const res = await approveTransferApplicationApi(params);
      if (res) {
        ElMessage.success('审批成功');
        dialogVisible.value = false;
        emit('submitSuccess');
      }
    } catch (error) {
      console.error('拒绝申请失败:', error);
    }
  });
};

const handleClose = () => {
  applicationDateScheduleData.value = [];
  transferApplicationApprovalData.value = undefined;
};
</script>

<template>
  <ElDialog
    v-model="dialogVisible"
    width="800"
    title="申请审批"
    :show-close="false"
    :draggable="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <div class="px-5">
      <ElDescriptions :column="1" border label-width="150" w>
        <ElDescriptionsItem label="申请学生" label-align="right">
          {{ transferApplicationApprovalData?.stuName ?? '--' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="申请日期" label-align="right">
          {{ transferApplicationApprovalData?.createDate ?? '--' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="申请课程" label-align="right">
          {{ transferApplicationApprovalData?.course ?? '--' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="原课程时间" label-align="right">
          {{ transferApplicationApprovalData?.originDate ?? '--' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="申请调课时间" label-align="right">
          {{ transferApplicationApprovalData?.transferDate ?? '--' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="申请理由" label-align="right">
          {{ transferApplicationApprovalData?.approvalReason ?? '--' }}
        </ElDescriptionsItem>
      </ElDescriptions>
      <div class="my-4">
        <span>申请调课日期 </span>
        <span class="font-bold">
          {{
            `${applicationData ? dayjs(applicationData?.toStartTime).format('YYYY-MM-DD ddd') : ''}`
          }}
        </span>
        <span> 的排课表如下:</span>
      </div>
      <ElTable
        :data="applicationDateScheduleData"
        height="250px"
        border
        header-cell-class-name="tableHeader"
        v-loading="tableLoading"
      >
        <ElTableColumn prop="time" label="时间段">
          <template #default="{ row }">
            <span>
              {{ dayjs(row.startDate).format('HH:mm') }} -
              {{ dayjs(row.endDate).format('HH:mm') }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="courseId" label="课程" width="220">
          <template #default="{ row }">
            <span>
              {{ `${row.courseName}/${row.courseType}` }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="teacherId" label="教师">
          <template #default="{ row }">
            <span>
              {{ row.teacherName || '-' }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="studentIds" label="学生" width="280">
          <template #default="{ row }">
            <span>{{ row.studentNames.join(',') }}</span>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>

    <template #footer>
      <ElButton @click="dialogVisible = false">返回</ElButton>
      <ElButton type="primary" @click="handleAgree" :loading="agreeLoading">
        同意
      </ElButton>
      <ElButton type="danger" @click="handleReject"> 拒绝 </ElButton>
    </template>
  </ElDialog>
</template>
