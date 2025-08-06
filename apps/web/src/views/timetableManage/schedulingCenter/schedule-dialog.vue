<script lang="ts" setup>
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue';

import { cloneDeep, isEqual } from '@vben/utils';

import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import {
  ElButton,
  ElDatePicker,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTimePicker,
} from 'element-plus';
import { intersects } from 'radash';

import {
  batchCreateCourseScheduleApi,
  createOrUpdateCourseScheduleApi,
  getStudentListByCourseApi,
} from '#/api';
import { getTeacherListByCourseApi } from '#/api/core/teacher-list';
import {
  CourseItemInfo,
  CourseScheduleItem,
  ScheduleCourseItem,
  ScheduleCreateOrUpdateCourseParams,
  ScheduleDialogFormData,
} from '#/types';
import {
  hasOverlapWithoutAdjacent,
  makeTimeRange,
  makeUnifiedDate,
} from '#/utils';
import { CourseType } from '#/views/courseManage/courseList/course-types';

const props = defineProps<{
  courseList: CourseItemInfo[];
  date: Date; // 所需排课的日期，在批量排课中只需传月份
  editData?: CourseScheduleItem[];
  editFlag?: boolean;
  scheduleMode: 'batch' | 'date' | 'view';
  visible: boolean;
}>();

const emit = defineEmits(['update:visible', 'submitSuccess']);

dayjs.extend(isToday);

const dialogVisible = computed({
  get() {
    return props.visible;
  },
  set(val: boolean) {
    emit('update:visible', val);
  },
});

const isViewMode = computed(() => {
  return props.scheduleMode === 'view';
});

const initFormData = (): ScheduleDialogFormData => ({
  date: '',
  dates: [],
  courses: [],
});
const formData = ref(initFormData());

const disabledHours = () => {
  if (dayjs(props.date).isToday()) {
    return makeTimeRange(0, dayjs().hour() - 1);
  }
  return makeTimeRange(0, 5);
};

const disabledDate = (time: Date) => {
  return time.getTime() < Date.now();
};

const isPastDate = computed(() => {
  if (props.scheduleMode !== 'batch') {
    return dayjs(props.date).isBefore(dayjs().startOf('day'));
  }
  return false;
});

watch(dialogVisible, (val) => {
  if (val && (props.scheduleMode === 'date' || isViewMode.value)) {
    formData.value.date = dayjs(props.date).format('YYYY-MM-DD');
    if (props.editFlag || isViewMode.value) {
      formData.value.courses = props.editData!.map((item) => {
        return {
          timeRange: [
            dayjs(item.startDate).toDate(),
            dayjs(item.endDate).toDate(),
          ],
          courseId: item.courseId,
          courseName: item.courseName,
          courseType: item.courseType,
          teacherId: item.teacherId,
          teacherName: item.teacherName,
          studentIds: item.students.map((stu) => stu.studentId),
          studentNames: item.students.map((stu) => stu.studentName),
          studentList: [],
          teacherList: [],
          isEdit: false,
          isNew: false,
        };
      });
    }
  }
});

const formRef = useTemplateRef('formRef');
const loading = ref(false);

const rules = {
  dates: [
    {
      required: true,
      message: '请选择排课日期',
      trigger: 'change',
    },
  ],
  timeRange: [
    {
      required: true,
      message: '请输入课程时间',
      trigger: 'change',
    },
  ],
  courseId: [
    {
      required: true,
      message: '请选择课程',
      trigger: 'change',
    },
  ],
  teacherId: [
    {
      required: true,
      message: '请选择教师',
      trigger: 'change',
    },
  ],
  studentIds: [
    {
      required: true,
      message: '请选择学生',
      trigger: 'change',
    },
  ],
};

const getTeacherListByCourse = async (courseId: number, index: number) => {
  try {
    formData.value.courses[index]!.teacherList = [];
    const res = await getTeacherListByCourseApi(courseId);
    formData.value.courses[index]!.teacherList = res;
  } catch (error) {
    console.error('获取教师列表失败:', error);
  }
};

const getStudentListByCourse = async (courseId: number, index: number) => {
  try {
    formData.value.courses[index]!.studentList = [];
    const res = await getStudentListByCourseApi([courseId]);
    formData.value.courses[index]!.studentList = res;
  } catch (error) {
    console.error('获取学生列表失败:', error);
  }
};

const handleIsPastCourse = (row: ScheduleCourseItem) => {
  if (
    props.scheduleMode === 'date' &&
    dayjs(props.date).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD') &&
    dayjs(row.timeRange[0]).isBefore(dayjs())
  ) {
    return false;
  }
  return true;
};

const handleChangeTime = (range: [Date, Date], index: number) => {
  if (dayjs(range[0]).isSame(range[1])) {
    ElMessage.error('开始时间不能等于结束时间');
    formData.value.courses[index]!.timeRange = [];
    return;
  }
  if (
    props.scheduleMode === 'date' &&
    dayjs(range[0]).format('YYYY-MM-DD') ===
      dayjs(props.date).format('YYYY-MM-DD') &&
    (dayjs(range[0]).isBefore(dayjs(props.date)) ||
      dayjs(range[0]).valueOf() - dayjs().valueOf() <= 15 * 60 * 1000)
  ) {
    ElMessage.error('请选择大于当前时间15分钟已上的开始时间');
    formData.value.courses[index]!.timeRange = [];
    return;
  }
  const curCourseItem = formData.value.courses[index]!;
  for (let i = 0; i < formData.value.courses.length; i++) {
    if (i === index) continue;
    if (
      (curCourseItem.teacherId === formData.value.courses[i]!.teacherId ||
        intersects(
          formData.value.courses[i]!.studentIds,
          curCourseItem.studentIds,
        )) &&
      hasOverlapWithoutAdjacent(
        makeUnifiedDate(dayjs(formData.value.date).toDate(), range[0]),
        makeUnifiedDate(dayjs(formData.value.date).toDate(), range[1]),
        makeUnifiedDate(
          dayjs(formData.value.date).toDate(),
          formData.value.courses[i]!.timeRange[0]!,
        ),
        makeUnifiedDate(
          dayjs(formData.value.date).toDate(),
          formData.value.courses[i]!.timeRange[1]!,
        ),
      )
    ) {
      ElMessage({
        type: 'error',
        message: '有其他教师或学生与选择的课程时间冲突，请检查',
        duration: 5000,
      });
      formData.value.courses[index]!.timeRange = [];
      return;
    }
  }
};

const handleChangeCourse = (val: number, index: number) => {
  formData.value.courses[index]!.teacherId = undefined;
  formData.value.courses[index]!.teacherName = '';
  formData.value.courses[index]!.studentIds = [];
  formData.value.courses[index]!.studentNames = [];
  if (val) {
    const selectCourse = props.courseList.find((item) => item.id === val)!;
    formData.value.courses[index]!.courseName = selectCourse.name;
    formData.value.courses[index]!.courseType = selectCourse.type;
    if (selectCourse.type !== CourseType.NURSERY) {
      getTeacherListByCourse(val, index);
    }
    getStudentListByCourse(val, index);
  }
};

const handleChangeTeacher = (val: number, index: number) => {
  if (!val) return;
  for (let i = 0; i < formData.value.courses.length; i++) {
    if (i === index) continue;
    if (
      val === formData.value.courses[i]!.teacherId &&
      hasOverlapWithoutAdjacent(
        makeUnifiedDate(
          dayjs(formData.value.date).toDate(),
          formData.value.courses[index]!.timeRange[0]!,
        ),
        makeUnifiedDate(
          dayjs(formData.value.date).toDate(),
          formData.value.courses[index]!.timeRange[1]!,
        ),
        makeUnifiedDate(
          dayjs(formData.value.date).toDate(),
          formData.value.courses[i]!.timeRange[0]!,
        ),
        makeUnifiedDate(
          dayjs(formData.value.date).toDate(),
          formData.value.courses[i]!.timeRange[1]!,
        ),
      )
    ) {
      ElMessage.error('教师时间冲突');
      formData.value.courses[index]!.teacherId = undefined;
      formData.value.courses[index]!.teacherName = '';
      return;
    }
  }
  formData.value.courses[index]!.teacherName = formData.value.courses[
    index
  ]!.teacherList.find((item) => item.id === val)!.name;
};

const handleChangeStudent = (val: number[], index: number) => {
  if (!val) return;
  const curCourseId = formData.value.courses[index]!.courseId;
  const curCourse = props.courseList.find((item) => item.id === curCourseId)!;
  if (curCourse.type === CourseType.ONETOONE && val.length > 1) {
    ElMessage.error('一对一课程只能选择一个学生');
    formData.value.courses[index]!.studentIds = val.slice(0, 1);
    return;
  }
  for (let i = 0; i < formData.value.courses.length; i++) {
    if (i === index) continue;
    if (
      formData.value.courses[i]!.studentIds.includes(val[val.length - 1]!) &&
      hasOverlapWithoutAdjacent(
        makeUnifiedDate(
          dayjs(formData.value.date).toDate(),
          formData.value.courses[index]!.timeRange[0]!,
        ),
        makeUnifiedDate(
          dayjs(formData.value.date).toDate(),
          formData.value.courses[index]!.timeRange[1]!,
        ),
        makeUnifiedDate(
          dayjs(formData.value.date).toDate(),
          formData.value.courses[i]!.timeRange[0]!,
        ),
        makeUnifiedDate(
          dayjs(formData.value.date).toDate(),
          formData.value.courses[i]!.timeRange[1]!,
        ),
      )
    ) {
      ElMessage.error('学生时间冲突');
      formData.value.courses[index]!.studentIds = val.slice(0, -1);
      break;
    }
  }
  formData.value.courses[index]!.studentNames = formData.value.courses[
    index
  ]!.studentList.filter((item) =>
    formData.value.courses[index]!.studentIds.includes(item.id),
  ).map((item) => item.name);
};

const handleAddCourseScheduleItem = () => {
  formData.value.courses.push({
    timeRange: [],
    courseId: undefined,
    courseName: '',
    courseType: '',
    teacherList: [],
    studentList: [],
    teacherId: undefined,
    teacherName: '',
    studentIds: [],
    studentNames: [],
    isEdit: false,
    isNew: true,
  });

  nextTick(() => {
    document
      .querySelector(`#courseTable .el-table__row:last-child`)!
      .scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
        behavior: 'smooth',
      });
  });
};

let prevRowData: null | ScheduleCourseItem = null;
const handleEditCourseScheduleItem = async (index: number) => {
  const prevEditDataIndex = formData.value.courses.findIndex(
    (item) => item.isEdit,
  );
  if (prevEditDataIndex !== -1) {
    if (isEqual(formData.value.courses[prevEditDataIndex], prevRowData)) {
      handleCancelEdit(prevEditDataIndex);
    } else {
      ElMessage.warning('请先保存上一条编辑过的行数据');
      return;
    }
  }
  await getTeacherListByCourse(formData.value.courses[index]!.courseId!, index);
  await getStudentListByCourse(formData.value.courses[index]!.courseId!, index);
  formData.value.courses[index]!.isEdit = true;
  prevRowData = cloneDeep(formData.value.courses[index]!);
};

const handleSaveEdit = (index: number) => {
  formData.value.courses[index]!.isEdit = false;
};

const handleCancelEdit = (index: number) => {
  formData.value.courses[index] = {
    ...prevRowData!,
    isEdit: false,
  };
};

const handleDeleteCourseScheduleItem = (index: number) => {
  formData.value.courses.splice(index, 1);
};

const getCourseScheduleParams = () => {
  return formData.value.courses.map((courseItem) => {
    return {
      courseId: courseItem.courseId,
      teacherId: courseItem.teacherId,
      studentIds: courseItem.studentIds,
      startDate: dayjs(formData.value.date)
        .hour(dayjs(courseItem.timeRange[0]).hour())
        .minute(dayjs(courseItem.timeRange[0]).minute())
        .format('YYYY-MM-DDTHH:mm'),
      endDate: dayjs(formData.value.date)
        .hour(dayjs(courseItem.timeRange[1]).hour())
        .minute(dayjs(courseItem.timeRange[1]).minute())
        .format('YYYY-MM-DDTHH:mm'),
    };
  }) as unknown as ScheduleCreateOrUpdateCourseParams[];
};

const getBatchCourseScheduleParams = () => {
  return {
    dates: formData.value.dates.map((date) =>
      dayjs(date).format('YYYY-MM-DDTHH:mm'),
    ),
    courseSchedules: formData.value.courses.map((courseItem) => {
      return {
        courseId: courseItem.courseId,
        teacherId: courseItem.teacherId,
        studentIds: courseItem.studentIds,
        startDate: dayjs(courseItem.timeRange[0]).format('YYYY-MM-DDTHH:mm'),
        endDate: dayjs(courseItem.timeRange[1]).format('YYYY-MM-DDTHH:mm'),
      };
    }) as unknown as ScheduleCreateOrUpdateCourseParams[],
  };
};

const handleConfirm = () => {
  formRef.value?.validate(async (val) => {
    if (!val) {
      return;
    }
    if (formData.value.courses.length === 0) {
      ElMessage.error('请添加排课');
      return;
    }
    try {
      loading.value = true;
      if (props.scheduleMode === 'date') {
        const params = getCourseScheduleParams();
        const res = await createOrUpdateCourseScheduleApi(params);
        if (res) {
          ElMessage.success(`${props.editFlag ? '更新' : '新增'}排课信息成功`);
          dialogVisible.value = false;
          emit('submitSuccess', props.date);
        }
      } else {
        await ElMessageBox.confirm(
          '批量排课后会覆盖现有排课信息，请确认是否继续？',
          '注意',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          },
        ).then(async () => {
          const params = getBatchCourseScheduleParams();
          const res = await batchCreateCourseScheduleApi(params);
          if (res) {
            ElMessage.success(`批量排课成功`);
            dialogVisible.value = false;
            emit('submitSuccess', props.date);
          }
        });
      }
    } catch (error) {
      console.error('创建/更新排课信息失败:', error);
    } finally {
      loading.value = false;
    }
  });
};

const handleClose = () => {
  formData.value = initFormData();
  formRef.value?.resetFields();
};
</script>

<template>
  <ElDialog
    v-model="dialogVisible"
    width="1100"
    :title="scheduleMode === 'date' ? '日期排课' : '批量排课'"
    :show-close="false"
    :draggable="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <div class="px-5">
      <ElForm ref="formRef" :model="formData" :rules="rules">
        <ElFormItem
          :prop="scheduleMode === 'date' || isViewMode ? 'date' : 'dates'"
          label="排课日期"
        >
          <ElInput
            v-if="scheduleMode === 'date' || isViewMode"
            class="!w-[300px]"
            v-model="formData.date"
            disabled
          />
          <ElDatePicker
            v-else
            class="!w-full"
            v-model="formData.dates"
            type="dates"
            :disabled-date="disabledDate"
            placeholder="请选择排课日期"
          />
        </ElFormItem>

        <div class="mb-2 flex justify-end">
          <ElButton
            v-if="!isPastDate && !isViewMode"
            type="primary"
            @click="handleAddCourseScheduleItem"
          >
            新增时间段
          </ElButton>
        </div>
        <ElTable
          id="courseTable"
          :data="formData.courses"
          border
          height="400px"
          header-cell-class-name="tableHeader"
        >
          <ElTableColumn prop="time" label="时间段" width="220">
            <template #default="{ row, $index }">
              <ElFormItem
                v-if="row.isEdit || row.isNew"
                class="!mb-0 !w-full"
                :prop="`courses[${$index}].timeRange`"
                :rules="rules.timeRange"
                :show-message="false"
              >
                <ElTimePicker
                  v-model="row.timeRange"
                  is-range
                  range-separator="-"
                  :disabled-hours="disabledHours"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  format="HH:mm"
                  @change="(val: [Date, Date]) => handleChangeTime(val, $index)"
                />
              </ElFormItem>
              <span v-else>
                {{ dayjs(row.timeRange[0]).format('HH:mm') }} -
                {{ dayjs(row.timeRange[1]).format('HH:mm') }}
              </span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="courseId" label="课程" width="220">
            <template #default="{ row, $index }">
              <ElFormItem
                v-if="row.isEdit || row.isNew"
                class="!mb-0"
                :prop="`courses[${$index}].courseId`"
                :rules="rules.courseId"
                :show-message="false"
              >
                <ElSelect
                  v-model="row.courseId"
                  clearable
                  placeholder="请选择课程"
                  @change="(val) => handleChangeCourse(val, $index)"
                >
                  <ElOption
                    v-for="item in courseList"
                    :key="item.id"
                    :label="`${item.name}/${item.type}`"
                    :value="item.id"
                  />
                </ElSelect>
              </ElFormItem>
              <span v-else>
                {{ `${row.courseName}/${row.courseType}` }}
              </span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="teacherId" label="教师">
            <template #default="{ row, $index }">
              <ElFormItem
                v-if="
                  (row.isEdit || row.isNew) &&
                  row.courseType !== CourseType.NURSERY
                "
                class="!mb-0"
                :prop="`courses[${$index}].teacherId`"
                :rules="rules.teacherId"
                :show-message="false"
              >
                <ElSelect
                  v-model="row.teacherId"
                  clearable
                  placeholder="请选择教师"
                  @change="(val) => handleChangeTeacher(val, $index)"
                >
                  <ElOption
                    v-for="item in row.teacherList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </ElSelect>
              </ElFormItem>
              <span v-else>
                {{ row.teacherName || '-' }}
              </span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="studentIds" label="学生" width="280">
            <template #default="{ row, $index }">
              <ElFormItem
                v-if="row.isEdit || row.isNew"
                class="!mb-0"
                :prop="`courses[${$index}].studentIds`"
                :rules="rules.studentIds"
                :show-message="false"
              >
                <ElSelect
                  v-model="row.studentIds"
                  multiple
                  clearable
                  placeholder="请选择学生"
                  @change="(val) => handleChangeStudent(val, $index)"
                >
                  <ElOption
                    v-for="item in row.studentList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </ElSelect>
              </ElFormItem>
              <span v-else>{{ row.studentNames.join(',') }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn
            v-if="!isPastDate && !isViewMode"
            prop="action"
            label="操作栏"
            align="center"
            :width="editFlag ? '120px' : '100px'"
          >
            <template #default="{ row, $index }">
              <template v-if="!row.isEdit">
                <ElButton
                  v-if="editFlag && !row.isNew && handleIsPastCourse(row)"
                  type="primary"
                  link
                  @click="handleEditCourseScheduleItem($index)"
                >
                  编辑
                </ElButton>
                <ElButton
                  v-if="handleIsPastCourse(row)"
                  type="danger"
                  link
                  @click="handleDeleteCourseScheduleItem($index)"
                >
                  删除
                </ElButton>
              </template>
              <template v-else>
                <div class="flex justify-evenly">
                  <span
                    class="icon-[ep--select] h-5 w-5 cursor-pointer !bg-[hsl(var(--success))]"
                    @click="handleSaveEdit($index)"
                  ></span>
                  <span
                    class="icon-[lucide--undo-2] h-5 w-5 cursor-pointer !bg-[hsl(var(--warning))]"
                    @click="handleCancelEdit($index)"
                  ></span>
                </div>
              </template>
            </template>
          </ElTableColumn>
        </ElTable>
      </ElForm>
    </div>

    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton
        v-if="!isPastDate"
        type="primary"
        :loading="loading"
        @click="handleConfirm"
      >
        确认
      </ElButton>
    </template>
  </ElDialog>
</template>
