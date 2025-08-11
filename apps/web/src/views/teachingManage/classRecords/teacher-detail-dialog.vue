<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import {
  ElButton,
  ElDescriptions,
  ElDescriptionsItem,
  ElDialog,
  ElMessage,
  ElTooltip,
} from 'element-plus';

import { verifyRecordApi } from '#/api';
import { TeacherRecordDetailInfo, TeacherRecordItem } from '#/types';
import { formatDate } from '#/utils';

const props = defineProps<{
  teacherRecordData?: TeacherRecordItem;
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

const teacherRecordDetail = ref<TeacherRecordDetailInfo>();

watch(dialogVisible, (val) => {
  if (val && props.teacherRecordData) {
    const recordData = props.teacherRecordData;
    teacherRecordDetail.value = {
      id: recordData.id,
      date: formatDate(recordData.startDate, 'YYYY-MM-DD'),
      range: `${formatDate(recordData.startDate, 'HH:mm')} - ${formatDate(recordData.endDate, 'HH:mm')}`,
      course: `${recordData.courseName}/${recordData.courseType}`,
      stuCount: recordData.students.length,
      students: recordData.students,
      stuCheckInCount: recordData.students.map((stu) => stu.isCheckIn).length,
      checkInStudents: recordData.students.filter((stu) => stu.isCheckIn),
      isVerified: recordData.isVerified,
    };
  }
});

const checkLoading = ref(false);

const handleVerify = async () => {
  try {
    checkLoading.value = true;
    const res = await verifyRecordApi(teacherRecordDetail.value!.id);
    if (res) {
      ElMessage.success('核对成功');
      dialogVisible.value = false;
      emit('submitSuccess');
    }
  } catch (error) {
    console.error('核对上课记录失败:', error);
  } finally {
    checkLoading.value = false;
  }
};

const handleClose = () => {
  teacherRecordDetail.value = undefined;
};
</script>

<template>
  <ElDialog
    v-model="dialogVisible"
    width="800"
    title="上课记录详情"
    :show-close="false"
    :draggable="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <div class="px-5">
      <ElDescriptions :column="1" border label-width="150">
        <ElDescriptionsItem label="日期" label-align="right">
          {{ teacherRecordDetail?.date ?? '--' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="时间段" label-align="right">
          {{ teacherRecordDetail?.range ?? '--' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="课程" label-align="right">
          {{ teacherRecordDetail?.course ?? '--' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="应到学生数" label-align="right">
          {{ teacherRecordDetail?.stuCount ?? '--' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="应到学生" label-align="right">
          <template
            v-for="item in teacherRecordDetail?.students"
            :key="item.studentId"
          >
            <span v-if="item.isCheckIn">
              {{ `${item.studentName} ` }}
            </span>
            <ElTooltip
              v-else-if="!item.isCheckIn && item.missCheckInReason"
              placement="top"
              :content="item.missCheckInReason"
            >
              <span class="text-[hsl(var(--warning))]">{{
                `${item.studentName} `
              }}</span>
            </ElTooltip>
            <span v-else class="text-[hsl(var(--destructive))]">
              {{ `${item.studentName} ` }}
            </span>
          </template>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="实到学生数" label-align="right">
          {{ teacherRecordDetail?.stuCheckInCount ?? '--' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="实到学生" label-align="right">
          <div v-if="teacherRecordDetail?.checkInStudents.length">
            <template
              v-for="item in teacherRecordDetail?.checkInStudents"
              :key="item.studentId"
            >
              <span>
                {{ `${item.studentName} ` }}
              </span>
            </template>
          </div>
          <span v-else>-</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="是否已核对" label-align="right">
          {{ teacherRecordDetail?.isVerified ? '是' : '否' }}
        </ElDescriptionsItem>
      </ElDescriptions>
      <div class="mt-4 text-[hsl(var(--info-foreground))]">
        注：标黄学生可查看未到课原因，标红学生为旷课
      </div>
    </div>

    <template #footer>
      <ElButton @click="dialogVisible = false">返回</ElButton>
      <ElButton
        v-if="!teacherRecordData?.isVerified"
        v-access:code="'REC-001'"
        type="primary"
        :loading="checkLoading"
        @click="handleVerify"
      >
        核对
      </ElButton>
    </template>
  </ElDialog>
</template>
