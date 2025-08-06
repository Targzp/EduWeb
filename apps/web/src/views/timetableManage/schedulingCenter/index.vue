<script lang="ts" setup>
import { nextTick, onMounted, reactive, ref, useTemplateRef, watch } from 'vue';

import { EllipsisText } from '@vben/common-ui';

import { CalendarApi, CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/vue3';
import dayjs from 'dayjs';
import {
  ElButton,
  ElButtonGroup,
  ElDatePicker,
  ElForm,
  ElFormItem,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElScrollbar,
  ElSelect,
  ElTooltip,
} from 'element-plus';
import { sort } from 'radash';

import {
  deleteCourseScheduleApi,
  getAllStudentListApi,
  getAllTeacherListApi,
  getCourseListApi,
  getCourseScheduleListApi,
} from '#/api';
import {
  CourseItemInfo,
  CourseScheduleItem,
  StuItemInfo,
  TeacherItemInfo,
} from '#/types';
import { sortByDate } from '#/utils';

import ClearScheduleDialog from './clear-schedule-dialog.vue';
import ScheduleDialog from './schedule-dialog.vue';
import TemplateApplyDialog from './template-apply-dialog.vue';

const weekObj: Record<number, string> = {
  0: '周日',
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六',
};

const courseList = ref<CourseItemInfo[]>([]);
const teacherList = ref<TeacherItemInfo[]>([]);
const studentList = ref<StuItemInfo[]>([]);

const getAllStudentList = async () => {
  try {
    const res = await getAllStudentListApi();
    studentList.value = res;
  } catch (error) {
    console.error('获取学生列表失败:', error);
  }
};

const getAllTeacherList = async () => {
  try {
    const res = await getAllTeacherListApi();
    teacherList.value = res;
  } catch (error) {
    console.error('获取教师列表失败:', error);
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

const isQueryMode = ref(false);

const initFormData = () => ({
  studentIds: [],
  teacherIds: [],
  courseIds: [],
});
const formData = ref(initFormData());

const handleReset = () => {
  formData.value = initFormData();
  getCourseScheduleData(monthPicker.value);
};

const handleChangeMode = () => {
  isQueryMode.value = !isQueryMode.value;

  if (!isQueryMode.value) {
    formData.value = initFormData();
  }
};

const calendarContainer = useTemplateRef('calendarContainer');
const calendarRef = useTemplateRef('calendarRef');
const calendarApi = ref<CalendarApi>();

const calendarTitle = ref('');
const monthPicker = ref(dayjs().toDate());

const handleUpdateCalendarTitle = () => {
  calendarTitle.value = dayjs(calendarApi.value?.getDate()).format('YYYY年M月');
};

const handleJumpMonth = (flag: 'cur' | 'next' | 'prev') => {
  switch (flag) {
    case 'cur': {
      calendarApi.value?.today();
      break;
    }
    case 'next': {
      calendarApi.value?.next();
      break;
    }
    case 'prev': {
      calendarApi.value?.prev();
      break;
    }
    // No default
  }
  handleUpdateCalendarTitle();
  monthPicker.value = dayjs(calendarApi.value!.getDate()).toDate();
  getCourseScheduleData(calendarApi.value!.getDate());
};

const handleMonthChange = (date: Date) => {
  if (!date) return;
  calendarApi.value?.gotoDate(dayjs(date).format('YYYY-MM-DD'));
  handleUpdateCalendarTitle();
  getCourseScheduleData(date);
};

const scheduleDialogVisible = ref(false);
const scheduleDialogDate = ref<Date>(dayjs().toDate());
const scheduleDialogMode = ref<'batch' | 'date' | 'view'>('date');
const scheduleDialogEditFlag = ref(false);
const scheduleDialogEditData = ref<CourseScheduleItem[]>([]);

const handleClickOtherMonthDate = (date: Date) => {
  const curDate = calendarApi.value?.getDate();
  if (dayjs(curDate).month() !== dayjs(date).month()) {
    calendarApi.value?.gotoDate(dayjs(date).format('YYYY-MM-DD'));
    handleUpdateCalendarTitle();
    getCourseScheduleData(date);
    return true;
  }
};

const handlaDateClick = (date: Date) => {
  const isOther = handleClickOtherMonthDate(date);
  if (isOther) return;
  if (courseScheduleData.value[dayjs(date).format('YYYY-MM-DD')]) {
    if (isQueryMode.value) {
      scheduleDialogMode.value = 'view';
      scheduleDialogEditFlag.value = false;
    } else {
      scheduleDialogMode.value = 'date';
      scheduleDialogEditFlag.value = true;
    }
    scheduleDialogDate.value = date;
    scheduleDialogEditData.value =
      courseScheduleData.value[dayjs(date).format('YYYY-MM-DD')]!;
    scheduleDialogVisible.value = true;
  } else {
    if (dayjs(date).isBefore(dayjs().startOf('day'))) return;
    if (isQueryMode.value) return;
    scheduleDialogDate.value = date;
    scheduleDialogMode.value = 'date';
    scheduleDialogEditFlag.value = false;
    scheduleDialogVisible.value = true;
  }
};

const handleBatchCourseSchedule = () => {
  scheduleDialogDate.value = monthPicker.value;
  scheduleDialogMode.value = 'batch';
  scheduleDialogEditFlag.value = false;
  scheduleDialogVisible.value = true;
};

const handleDateCellEnter = (date: Date) => {
  const curDate = calendarApi.value?.getDate();
  if (
    dayjs(curDate).month() === dayjs(date).month() &&
    !dayjs(date).isBefore(dayjs().endOf('day')) &&
    !isQueryMode.value
  ) {
    showScheduleDeleteFlag.value = dayjs(date).format('YYYY-MM-DD');
  }
};

const clearScheduleDialogVisible = ref(false);
const templateApplyDialogVisible = ref(false);

const loading = ref(false);
const courseScheduleData = ref<Record<string, CourseScheduleItem[]>>({});
const showScheduleDeleteFlag = ref('');

const getCourseScheduleData = async (date: Date) => {
  try {
    courseScheduleData.value = {};
    loading.value = true;
    const params = {
      startDate: dayjs(date)
        .subtract(1, 'month')
        .startOf('month')
        .format('YYYY-MM-DDTHH:mm'),
      endDate: dayjs(date)
        .add(1, 'month')
        .endOf('month')
        .format('YYYY-MM-DDTHH:mm'),
      courseIds: formData.value.courseIds,
      teacherIds: formData.value.teacherIds,
      studentIds: formData.value.studentIds,
    };
    const res = await getCourseScheduleListApi(params);
    if (res) {
      sortByDate(res, 'startDate').forEach((item) => {
        const date = dayjs(item.startDate).format('YYYY-MM-DD');
        if (courseScheduleData.value[date]) {
          courseScheduleData.value[date].push(item);
        } else {
          courseScheduleData.value[date] = [item];
        }
      });
    }
  } catch (error) {
    console.error('获取排课信息失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleDeleteDateSchedule = (date: Date) => {
  ElMessageBox.confirm('确认清除当前日期下的所有排课？', '注意', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      const dateScheduleData =
        courseScheduleData.value[dayjs(date).format('YYYY-MM-DD')];
      const scheduleIds = dateScheduleData!.map((item) => item.id);
      const res = await deleteCourseScheduleApi(scheduleIds);
      if (res) {
        ElMessage.success('删除成功');
        getCourseScheduleData(monthPicker.value);
      }
    } catch (error) {
      console.error('删除排课信息失败:', error);
    }
  });
};

const calendarOptions = reactive<CalendarOptions>({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  initialDate: new Date(),
  headerToolbar: false,
  selectable: true,
  dayHeaderContent(arg: any) {
    return {
      html: `<div class="bg-[var(--el-fill-color-light)] w-full h-full py-2">${weekObj[arg.dow as number]}</div>`,
    };
  },
  firstDay: 1,
  aspectRatio: 1.5,
  handleWindowResize: true,
  dateClick: (arg: any) => {
    const curDate = calendarApi.value?.getDate();
    if (dayjs(curDate).month() !== dayjs(arg.date).month()) {
      handlaDateClick(arg.date);
    }
  },
});

watch(
  () => calendarOptions.aspectRatio,
  (newVal) => {
    if (calendarRef.value && newVal) {
      calendarApi.value?.setOption('aspectRatio', newVal);
      nextTick(() => {
        calendarApi.value?.updateSize();
      });
    }
  },
);

const handleCalendarAspectRatio = () => {
  if (calendarContainer.value) {
    calendarOptions.aspectRatio =
      calendarContainer.value?.clientWidth /
      calendarContainer.value?.clientHeight;
  }
};

window.addEventListener('resize', () => handleCalendarAspectRatio());
window.removeEventListener('resize', handleCalendarAspectRatio);

onMounted(() => {
  getCourseList();
  getAllStudentList();
  getAllTeacherList();
  handleCalendarAspectRatio();
  calendarApi.value = Object.getOwnPropertyDescriptor(
    calendarRef.value,
    'getApi',
  )?.value();
  handleUpdateCalendarTitle();
  getCourseScheduleData(monthPicker.value);
});
</script>

<template>
  <div class="flex h-full flex-col p-4">
    <div
      class="flex h-[56px] w-full items-center justify-between rounded-[4px] bg-[hsl(var(--background))] p-2"
    >
      <ElForm
        v-if="isQueryMode"
        :model="formData"
        class="mt-[4px] w-full"
        inline
      >
        <div class="flex w-full items-center justify-between">
          <div class="flex items-center">
            <ElFormItem prop="studentIds" class="!mb-0" label="学生名称">
              <ElSelect
                v-model="formData.studentIds"
                class="!w-[250px]"
                multiple
                clearable
                collapse-tags
                collapse-tags-tooltip
                placeholder="请选择学生"
              >
                <ElOption
                  v-for="item in studentList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </ElSelect>
            </ElFormItem>
            <ElFormItem prop="teacherIds" class="!mb-0" label="教师名称">
              <ElSelect
                v-model="formData.teacherIds"
                class="!w-[250px]"
                multiple
                clearable
                collapse-tags
                collapse-tags-tooltip
                placeholder="请选择教师"
              >
                <ElOption
                  v-for="item in teacherList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </ElSelect>
            </ElFormItem>
            <ElFormItem prop="courseIds" class="!mb-0" label="课程名称">
              <ElSelect
                v-model="formData.courseIds"
                class="!w-[250px]"
                multiple
                clearable
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
            <ElButton
              type="primary"
              @click="getCourseScheduleData(monthPicker)"
            >
              查询
            </ElButton>
          </div>
        </div>
      </ElForm>
      <div v-else class="flex w-full items-center justify-end">
        <ElButton
          type="primary"
          class="!h-10 w-24"
          @click="clearScheduleDialogVisible = true"
        >
          一键清除
        </ElButton>
        <ElButton
          type="primary"
          class="!h-10 w-24"
          @click="handleBatchCourseSchedule"
        >
          批量排课
        </ElButton>
        <ElButton
          type="primary"
          class="!h-10 w-24"
          @click="templateApplyDialogVisible = true"
        >
          应用模板
        </ElButton>
      </div>
      <ElTooltip content="切换模式" placement="top">
        <span
          class="icon-[ep--switch] ml-4 mr-2 h-6 w-6 cursor-pointer bg-[hsl(var(--primary))]"
          @click="handleChangeMode"
        ></span>
      </ElTooltip>
    </div>
    <div
      class="mt-2 flex-1 overflow-hidden rounded-[4px] bg-[hsl(var(--background))]"
    >
      <div class="flex h-full flex-col px-4 pb-4">
        <div class="flex items-center justify-end py-4">
          <span class="mr-4 text-[18px] font-bold">{{ calendarTitle }}</span>
          <ElButtonGroup class="mr-4">
            <ElButton @click="handleJumpMonth('prev')">上一月</ElButton>
            <ElButton @click="handleJumpMonth('cur')">本月</ElButton>
            <ElButton @click="handleJumpMonth('next')">下一月</ElButton>
          </ElButtonGroup>
          <ElDatePicker
            v-model="monthPicker"
            type="month"
            class="!w-[120px]"
            :clearable="false"
            @change="handleMonthChange"
          />
        </div>
        <div
          v-loading="loading"
          ref="calendarContainer"
          class="flex-1 basis-0 overflow-hidden"
        >
          <FullCalendar ref="calendarRef" :options="calendarOptions">
            <template #dayCellContent="arg">
              <div
                class="flex h-[150px] w-full flex-col"
                @mouseenter="handleDateCellEnter(arg.date)"
                @mouseleave="showScheduleDeleteFlag = ''"
                @click="handlaDateClick(arg.date)"
              >
                <span class="mb-4 flex justify-end">{{
                  dayjs(arg.date).format('MM-DD')
                }}</span>
                <template
                  v-if="
                    courseScheduleData[dayjs(arg.date).format('YYYY-MM-DD')]
                  "
                >
                  <span
                    v-if="
                      showScheduleDeleteFlag ===
                      dayjs(arg.date).format('YYYY-MM-DD')
                    "
                    class="z-10000 icon-[ep--delete] absolute top-3 h-[18px] w-[18px] cursor-pointer bg-[hsl(var(--destructive))]"
                    @click.stop="handleDeleteDateSchedule(arg.date)"
                  ></span>
                  <ElScrollbar height="100%" :always="true">
                    <div
                      v-for="item in courseScheduleData[
                        dayjs(arg.date).format('YYYY-MM-DD')
                      ]"
                      :key="item.id"
                      class="flex w-full justify-start px-[2px] pb-2 text-[13px]"
                    >
                      <EllipsisText
                        class="w-full"
                        placement="right"
                        :tooltip-when-ellipsis="true"
                        :ellipsis-threshold="0"
                        :tooltip-max-width="350"
                      >
                        <span
                          class="mr-1 inline-block h-1 w-1 rounded-full bg-[hsl(var(--success))] align-middle"
                        ></span>
                        <span class="mr-2">{{
                          `${dayjs(item.startDate).format('HH:mm')}-${dayjs(item.endDate).format('HH:mm')}`
                        }}</span>
                        <span class="mr-2">{{
                          `${item.courseName}/${item.courseType}`
                        }}</span>
                        <span>{{ item.teacherName || '-' }}</span>
                      </EllipsisText>
                    </div>
                  </ElScrollbar>
                </template>
              </div>
            </template>
          </FullCalendar>
        </div>
      </div>
    </div>

    <ScheduleDialog
      v-model:visible="scheduleDialogVisible"
      :date="scheduleDialogDate"
      :schedule-mode="scheduleDialogMode"
      :edit-flag="scheduleDialogEditFlag"
      :edit-data="scheduleDialogEditData"
      :course-list="courseList"
      @submit-success="getCourseScheduleData"
    />

    <ClearScheduleDialog
      v-model:visible="clearScheduleDialogVisible"
      :course-list="courseList"
      :student-list="studentList"
      :teacher-list="teacherList"
      @submit-success="() => getCourseScheduleData(monthPicker)"
    />

    <TemplateApplyDialog v-model:visible="templateApplyDialogVisible" />
  </div>
</template>
