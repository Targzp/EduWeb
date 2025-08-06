<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue';

import { cloneDeep, isEqual } from '@vben/utils';

import dayjs from 'dayjs';
import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTimePicker,
} from 'element-plus';
import { sort } from 'radash';

import {
  createTimetableTemplateApi,
  getCourseListApi,
  getTeacherListByCourseApi,
  updateTimetableTemplateApi,
} from '#/api';
import {
  CourseItemInfo,
  TimetableTemplateCourseItem,
  TimetableTemplateFormData,
  TimetableTemplateItem,
} from '#/types';
import {
  UpdateTimetableTemplateParams,
  WeekType,
} from '#/types/timetable-template';
import {
  hasOverlapWithoutAdjacent,
  makeTimeRange,
  makeUnifiedDate,
} from '#/utils';
import { CourseType } from '#/views/courseManage/courseList/course-types';

const props = defineProps<{
  editData?: TimetableTemplateItem;
  editFlag: boolean;
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

const weekOptions = [
  {
    label: '周一',
    value: WeekType.MONDAY,
  },
  {
    label: '周二',
    value: WeekType.TUESDAY,
  },
  {
    label: '周三',
    value: WeekType.WEDNESDAY,
  },
  {
    label: '周四',
    value: WeekType.THURSDAY,
  },
  {
    label: '周五',
    value: WeekType.FRIDAY,
  },
  {
    label: '周六',
    value: WeekType.SATURDAY,
  },
  {
    label: '周日',
    value: WeekType.SUNDAY,
  },
];

const courseList = ref<CourseItemInfo[]>([]);

const getCourseList = async () => {
  try {
    const res = await getCourseListApi();
    courseList.value = sort(res, (item) => item.sortOrder);
  } catch (error) {
    console.error('获取课程列表失败:', error);
  }
};

const initFormData = (): TimetableTemplateFormData => ({
  name: '',
  weeks: [],
  notes: '',
  courses: [],
});
const formData = ref(initFormData());

const disabledHours = () => {
  return makeTimeRange(0, 5);
};

const rules = {
  name: [
    {
      required: true,
      message: '请输入模板名称',
      trigger: 'change',
    },
  ],
  weeks: [
    {
      required: true,
      message: '请选择每周的',
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
};

const getWeeksValue = (editData: TimetableTemplateItem) => {
  const weeks: WeekType[] = [];
  Object.keys(editData).forEach((key) => {
    if (
      weekOptions.some((option) => option.value === key) &&
      editData[key as WeekType]
    ) {
      weeks.push(key as WeekType);
    }
  });
  return weeks;
};

watch(dialogVisible, (val) => {
  if (val && props.editFlag) {
    const editData = props.editData!;
    formData.value = {
      name: editData.name,
      weeks: getWeeksValue(editData),
      notes: editData.notes,
      courses: editData.sches.map((sche) => {
        return {
          id: sche.id,
          timeRange: [
            dayjs(sche.startTime).toDate(),
            dayjs(sche.endTime).toDate(),
          ],
          courseId: sche.courseId,
          courseName: sche.courseName,
          courseType: sche.courseType,
          teacherId: sche.teacherId,
          teacherName: sche.teacherName,
          teacherList: [],
          isEdit: false,
          isNew: false,
        };
      }),
    };
  }
});

const formRef = useTemplateRef('formRef');
const loading = ref(false);

const getTeacherListByCourse = async (courseId: number, index: number) => {
  try {
    formData.value.courses[index]!.teacherList = [];
    const res = await getTeacherListByCourseApi(courseId);
    formData.value.courses[index]!.teacherList = res;
  } catch (error) {
    console.error('获取教师列表失败:', error);
  }
};

const handleAddCourseScheduleItem = () => {
  formData.value.courses.push({
    timeRange: [],
    courseId: undefined,
    courseName: '',
    courseType: '',
    teacherList: [],
    teacherId: undefined,
    teacherName: '',
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

let prevRowData: null | TimetableTemplateCourseItem = null;
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

const handleChangeCourse = (val: number, index: number) => {
  formData.value.courses[index]!.teacherId = undefined;
  formData.value.courses[index]!.teacherName = '';
  if (val) {
    const selectCourse = courseList.value.find((item) => item.id === val)!;
    formData.value.courses[index]!.courseName = selectCourse.name;
    formData.value.courses[index]!.courseType = selectCourse.type;
    if (selectCourse.type !== CourseType.NURSERY) {
      getTeacherListByCourse(val, index);
    }
  }
};

const handleChangeTime = (range: [Date, Date], index: number) => {
  if (dayjs(range[0]).isSame(range[1])) {
    ElMessage.error('开始时间不能等于结束时间');
    formData.value.courses[index]!.timeRange = [];
    return;
  }
  const curCourseItem = formData.value.courses[index]!;
  for (let i = 0; i < formData.value.courses.length; i++) {
    if (i === index) continue;
    if (
      curCourseItem.teacherId === formData.value.courses[i]!.teacherId &&
      hasOverlapWithoutAdjacent(
        makeUnifiedDate(dayjs().toDate(), range[0]),
        makeUnifiedDate(dayjs().toDate(), range[1]),
        makeUnifiedDate(
          dayjs().toDate(),
          formData.value.courses[i]!.timeRange[0]!,
        ),
        makeUnifiedDate(
          dayjs().toDate(),
          formData.value.courses[i]!.timeRange[1]!,
        ),
      )
    ) {
      ElMessage({
        type: 'error',
        message: '有其他教师与选择的课程时间冲突，请检查',
        duration: 5000,
      });
      formData.value.courses[index]!.timeRange = [];
      return;
    }
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
          dayjs().toDate(),
          formData.value.courses[index]!.timeRange[0]!,
        ),
        makeUnifiedDate(
          dayjs().toDate(),
          formData.value.courses[index]!.timeRange[1]!,
        ),
        makeUnifiedDate(
          dayjs().toDate(),
          formData.value.courses[i]!.timeRange[0]!,
        ),
        makeUnifiedDate(
          dayjs().toDate(),
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

const getTimetableTemplateParam = () => {
  return {
    name: formData.value.name,
    notes: formData.value.notes,
    sun: formData.value.weeks.includes(WeekType.SUNDAY),
    mon: formData.value.weeks.includes(WeekType.MONDAY),
    tue: formData.value.weeks.includes(WeekType.TUESDAY),
    wed: formData.value.weeks.includes(WeekType.WEDNESDAY),
    thu: formData.value.weeks.includes(WeekType.THURSDAY),
    fri: formData.value.weeks.includes(WeekType.FRIDAY),
    sat: formData.value.weeks.includes(WeekType.SATURDAY),
    sches: formData.value.courses.map((item) => ({
      startTime: dayjs(item.timeRange[0]).format('YYYY-MM-DDTHH:mm'),
      endTime: dayjs(item.timeRange[1]).format('YYYY-MM-DDTHH:mm'),
      courseId: item.courseId!,
      teacherId: item.teacherId!,
    })),
  };
};

const handleConfirm = () => {
  formRef.value?.validate(async (valid) => {
    if (!valid) {
      return;
    }
    if (formData.value.courses.length === 0) {
      ElMessage.error('请添加排课');
      return;
    }
    try {
      loading.value = true;
      const params = getTimetableTemplateParam();
      let res: null | TimetableTemplateItem = null;
      if (props.editFlag) {
        const updateParams = params as UpdateTimetableTemplateParams;
        updateParams.id = props.editData!.id;
        updateParams.sches = formData.value.courses.map((item) => ({
          id: item.id!,
          startTime: dayjs(item.timeRange[0]).format('YYYY-MM-DDTHH:mm'),
          endTime: dayjs(item.timeRange[1]).format('YYYY-MM-DDTHH:mm'),
          courseId: item.courseId!,
          teacherId: item.teacherId!,
        }));
        res = await updateTimetableTemplateApi(updateParams);
        if (res) {
          ElMessage.success('更新课表模板成功');
        }
      } else {
        res = await createTimetableTemplateApi(params);
        if (res) {
          ElMessage.success('创建课表模板成功');
        }
      }
      dialogVisible.value = false;
      emit('submitSuccess');
    } catch (error) {
      console.error('创建/更新课表模板失败:', error);
    } finally {
      loading.value = false;
    }
  });
};

const handleClose = () => {
  formData.value = initFormData();
  formRef.value?.resetFields();
};

onMounted(() => {
  getCourseList();
});
</script>

<template>
  <ElDialog
    v-model="dialogVisible"
    width="800"
    title="创建模板"
    :show-close="false"
    :draggable="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <div class="px-5 pt-4">
      <ElForm ref="formRef" :model="formData" :rules="rules">
        <ElFormItem prop="name" label="模板名称" label-width="80">
          <ElInput
            class="!w-[300px]"
            v-model="formData.name"
            clearable
            placeholder="请输入模板名称"
          />
        </ElFormItem>
        <ElFormItem prop="weeks" label="每周的" label-width="80">
          <ElSelect
            v-model="formData.weeks"
            class="!w-[300px]"
            clearable
            multiple
            placeholder="请选择每周的"
          >
            <ElOption
              v-for="item in weekOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem prop="notes" label="模板描述" label-width="80">
          <ElInput
            class="!w-[300px]"
            type="textarea"
            :rows="2"
            v-model="formData.notes"
            clearable
            placeholder="请输入模板描述"
          />
        </ElFormItem>
        <div class="mb-2 flex justify-end">
          <ElButton type="primary" @click="handleAddCourseScheduleItem">
            新增时间段
          </ElButton>
        </div>
        <ElTable
          id="courseTable"
          :data="formData.courses"
          border
          height="300px"
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
          <ElTableColumn
            prop="action"
            label="操作栏"
            align="center"
            :width="editFlag ? '120px' : '100px'"
          >
            <template #default="{ row, $index }">
              <template v-if="!row.isEdit">
                <ElButton
                  v-if="editFlag && !row.isNew"
                  type="primary"
                  link
                  @click="handleEditCourseScheduleItem($index)"
                >
                  编辑
                </ElButton>
                <ElButton
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
      <ElButton type="primary" :loading="loading" @click="handleConfirm">
        确认
      </ElButton>
    </template>
  </ElDialog>
</template>
