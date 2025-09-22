<script lang="ts" setup>
import { computed, ref, useTemplateRef, watch } from 'vue';

import { cloneDeep, isEqual } from '@vben/utils';

import dayjs from 'dayjs';
import {
  ElAlert,
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInputNumber,
  ElMessage,
  ElMessageBox,
  ElTable,
  ElTableColumn,
  ElTag,
  ElTour,
  ElTourStep,
} from 'element-plus';

import {
  deleteCourseOrderApi,
  deleteStudentCourseApi,
  finishStudentCourseApi,
  updateCourseOrderApi,
} from '#/api';
import { VerticalTab } from '#/components';
import {
  CourseItemInfo,
  CourseOrderInfo,
  StudentCourseItemInfo,
  StuItemInfo,
} from '#/types';
import { formatDate } from '#/utils';

import ChargeDialog from './charge-dialog.vue';
import ClassHourDialog from './class-hour-dialog.vue';
import StuDialog from './stu-dialog.vue';

interface StudentCourseItemWithEdit extends StudentCourseItemInfo {
  isEdit?: boolean;
}

const props = defineProps<{
  courseList: CourseItemInfo[];
  stuInfo?: StuItemInfo;
  visible: boolean;
}>();

const emit = defineEmits(['update:visible', 'cancel']);

const dialogVisible = computed({
  get() {
    return props.visible;
  },
  set(val: boolean) {
    emit('update:visible', val);
  },
});

const stuItemInfo = ref<StuItemInfo>();

watch(dialogVisible, (val) => {
  if (val && props.stuInfo) {
    stuItemInfo.value = cloneDeep(props.stuInfo);
    if (props.stuInfo.courseOrders && props.stuInfo.courseOrders.length > 0) {
      courseOrderActiveTab.value =
        stuItemInfo.value.courseOrders[
          stuItemInfo.value.courseOrders.length - 1
        ]!.id;
    }
  }
});

const courseOrderTabs = computed(() => {
  if (stuItemInfo.value && stuItemInfo.value.courseOrders) {
    return stuItemInfo.value.courseOrders.map((item) => {
      return {
        ...item,
        key: item.id,
        name: dayjs(item.createDate).format('YYYY-MM-DD'),
      };
    });
  }
  return [];
});

const courseOrderActiveTab = ref<number>();
const showTabDeleteIconKey = ref<number | string>(0);

/**
 * 计算报课单的总课时和剩余课时
 */
const handleCalClassHourData = (courseOrder: StudentCourseItemInfo[]) => {
  let totalClassHour = 0;
  let totalRemainClassHour = 0;
  courseOrder.forEach((item) => {
    totalClassHour += item.classHour;
    totalRemainClassHour += item.isFinish
      ? 0
      : item.classHour - item.finishClassHour;
  });
  chargeFormData.value.totalClassHour = totalClassHour;
  chargeFormData.value.totalRemainClassHour = totalRemainClassHour;
};

watch(courseOrderActiveTab, (val) => {
  if (val) {
    const courseOrder = stuItemInfo.value!.courseOrders.find(
      (item) => item.id === val,
    );
    if (courseOrder) {
      courseTableData.value = cloneDeep(courseOrder.studentCourses);
      handleCalClassHourData(courseTableData.value);
      chargeFormData.value.charge = courseOrder.charge;
    }
  } else {
    courseTableData.value = [];
    chargeFormData.value = initChargeFormData();
  }
});

const isCurDateCourseOrder = computed(() => {
  const curCourseOrder = courseOrderTabs.value.find(
    (item) => item.key === courseOrderActiveTab.value,
  );
  if (curCourseOrder) {
    return dayjs().isSame(dayjs(curCourseOrder.createDate), 'day');
  }
  return false;
});

const hasNoCurDateCourse = computed(() => {
  if (!stuItemInfo.value) {
    return false;
  }
  return stuItemInfo.value.courseOrders.length > 0
    ? stuItemInfo.value.courseOrders.every((item) => {
        return !dayjs().isSame(dayjs(item.createDate), 'day');
      })
    : true;
});

const courseTableData = ref<StudentCourseItemWithEdit[]>([]);

let prevRowData: null | StudentCourseItemWithEdit = null;
const handleEditCourse = (row: StudentCourseItemWithEdit) => {
  const prevEditDataIndex = courseTableData.value.findIndex(
    (item) => item.isEdit,
  );
  if (prevEditDataIndex !== -1) {
    if (isEqual(courseTableData.value[prevEditDataIndex], prevRowData)) {
      handleCancelEdit(prevEditDataIndex);
    } else {
      ElMessage.warning('请先保存上一条编辑过的行数据');
      return;
    }
  }
  row.isEdit = true;
  prevRowData = cloneDeep(row);
};

const handleSubmitEditCourse = async (
  row: StudentCourseItemWithEdit,
  index: number,
) => {
  if (isEqual(row, prevRowData)) {
    handleCancelEdit(index);
    return;
  }
  try {
    const params = {
      id: courseOrderActiveTab.value!,
      charge: chargeFormData.value.charge,
      courses: [
        {
          id: row.id,
          courseId: row.courseId,
          classHour: row.classHour,
        },
      ],
    };
    const res = await updateCourseOrderApi(params);
    if (res) {
      ElMessage({
        message: '更新报读课程成功',
        type: 'success',
      });
      const curCourseOrder = stuItemInfo.value!.courseOrders.find(
        (item) => item.id === courseOrderActiveTab.value,
      );
      if (curCourseOrder) {
        courseTableData.value[index]!.isEdit = false;
        curCourseOrder.studentCourses = res.studentCourses;
        handleCalClassHourData(courseTableData.value);
        handleReCalCharge();
      }
    }
  } catch (error) {
    console.error('编辑报读课程失败:', error);
  }
};

const handleCancelEdit = (index: number) => {
  courseTableData.value[index] = {
    ...prevRowData!,
    isEdit: false,
  };
};

const handleFinishCourse = async (row: StudentCourseItemInfo) => {
  try {
    const params = {
      id: row.id,
      isFinish: true,
    };
    const res = await finishStudentCourseApi(params);
    if (res) {
      ElMessage({
        message: '结课成功',
        type: 'success',
      });
      row.isFinish = true;
      row.finishDate = dayjs().format('YYYY-MM-DD');
      const curCourseOrder = stuItemInfo.value!.courseOrders.find(
        (item) => item.id === courseOrderActiveTab.value,
      );
      if (curCourseOrder) {
        const curCourse = curCourseOrder.studentCourses.find(
          (item) => item.id === row.id,
        );
        if (curCourse) {
          curCourse.isFinish = true;
          curCourse.finishDate = dayjs().format('YYYY-MM-DD');
          handleCalClassHourData(courseTableData.value);
          handleReCalCharge();
        }
      }
    }
  } catch (error) {
    console.error('手动结课失败:', error);
  }
};

const handleConfirmFinishCourse = async (row: StudentCourseItemInfo) => {
  if (row.classHour - row.finishClassHour === 0) {
    handleFinishCourse(row);
  } else {
    ElMessageBox.confirm(
      '选择的报读课程中还有剩余课时未上完，请确认是否进行结课？',
      '注意',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    ).then(() => {
      handleFinishCourse(row);
    });
  }
};

const initChargeFormData = () => ({
  charge: 0, // 收费金额
  totalClassHour: 0, // 总课时
  totalRemainClassHour: 0, // 剩余课时
});
let prevCharge = 0;
const chargeFormData = ref(initChargeFormData());
const chargeFormRef = useTemplateRef('chargeFormRef');
const isEditCharge = ref(false);
const chargeFormItemRef = useTemplateRef('chargeFormItemRef');
const chargeTipModelOpen = ref(false);

const rules = {
  charge: [
    {
      required: true,
      trigger: ['blur'],
    },
  ],
};

const handleEditCharge = () => {
  prevCharge = chargeFormData.value.charge;
  isEditCharge.value = true;
};

const handleCancelEditCharge = () => {
  chargeFormData.value.charge = prevCharge;
  chargeTipModelOpen.value = false;
  isEditCharge.value = false;
};

const handleSubmitNewCharge = async () => {
  chargeFormRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        const params = {
          id: courseOrderActiveTab.value!,
          charge: chargeFormData.value.charge,
          courses: [],
        };
        const res = await updateCourseOrderApi(params);
        if (res) {
          ElMessage({
            message: '更新收费金额成功',
            type: 'success',
          });
          const curCourseOrder = stuItemInfo.value!.courseOrders.find(
            (item) => item.id === courseOrderActiveTab.value,
          );
          if (curCourseOrder) {
            curCourseOrder.charge = chargeFormData.value.charge;
          }
          isEditCharge.value = false;
          chargeTipModelOpen.value = false;
          prevCharge = 0;
        }
      } catch (error) {
        console.error('更新收费金额失败:', error);
      }
    }
  });
};

const handleReCalCharge = () => {
  isEditCharge.value = true;
  prevCharge = chargeFormData.value.charge;
  chargeTipModelOpen.value = true;
};

const stuDialogVisible = ref(false);
const stuDialogMode = ref<'addCourseOrder' | 'appendCourse'>('addCourseOrder');
const stuDialogPrevCharge = ref(0);

const handleAppendCourse = () => {
  stuDialogMode.value = 'appendCourse';
  stuDialogPrevCharge.value = chargeFormData.value.charge;
  stuDialogVisible.value = true;
};

const handleAddNewCourseOrder = () => {
  stuDialogMode.value = 'addCourseOrder';
  stuDialogVisible.value = true;
};

/**
 * 添加报课单及增加报读课程成功后
 */
const handleSubmitSuccess = (courseOrderData?: CourseOrderInfo) => {
  if (courseOrderData) {
    if (stuDialogMode.value === 'addCourseOrder') {
      stuItemInfo.value!.courseOrders.push(courseOrderData);
      courseOrderActiveTab.value =
        stuItemInfo.value!.courseOrders[
          stuItemInfo.value!.courseOrders.length - 1
        ]!.id;
    } else if (stuDialogMode.value === 'appendCourse') {
      const curCourseOrder = stuItemInfo.value!.courseOrders.find(
        (item) => item.id === courseOrderActiveTab.value,
      );
      if (curCourseOrder) {
        curCourseOrder.charge = courseOrderData.charge;
        chargeFormData.value.charge = courseOrderData.charge;
        curCourseOrder.studentCourses = courseOrderData.studentCourses;
        courseTableData.value = cloneDeep(curCourseOrder.studentCourses);
        handleCalClassHourData(courseTableData.value);
      }
    }
  }
};

const handleDeleteCourseOrder = (id: number) => {
  ElMessageBox.confirm('确定删除该该报课时间下所有报读课程？', '注意', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      const ids = [id];
      const res = await deleteCourseOrderApi(ids);
      if (res) {
        ElMessage({
          message: '删除成功',
          type: 'success',
        });
        stuItemInfo.value!.courseOrders =
          stuItemInfo.value!.courseOrders.filter((item) => item.id !== id);
        courseOrderActiveTab.value =
          stuItemInfo.value!.courseOrders.length > 0
            ? stuItemInfo.value!.courseOrders[
                stuItemInfo.value!.courseOrders.length - 1
              ]!.id
            : undefined;
      }
    } catch (error) {
      console.error('删除报课单失败:', error);
    }
  });
};

const handleDeleteCourse = (id: number) => {
  ElMessageBox.confirm('确定删除该报读课程？', '注意', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      const ids = [id];
      const res = await deleteStudentCourseApi(ids);
      if (res) {
        ElMessage({
          message: '删除成功',
          type: 'success',
        });
        const curCourseOrder = stuItemInfo.value!.courseOrders.find(
          (item) => item.id === courseOrderActiveTab.value,
        );
        if (curCourseOrder) {
          curCourseOrder.studentCourses = curCourseOrder.studentCourses.filter(
            (item) => item.id !== id,
          );
          courseTableData.value = cloneDeep(curCourseOrder.studentCourses);
          handleCalClassHourData(courseTableData.value);
          handleReCalCharge();
        }
      }
    } catch (error) {
      console.error('删除报读课程失败:', error);
    }
  });
};

const handleCourseValid = (courseId: number, id?: number) => {
  if (
    stuItemInfo.value &&
    stuItemInfo.value.courseOrders &&
    stuItemInfo.value.courseOrders.length > 0
  ) {
    let result = false;
    for (const item of stuItemInfo.value.courseOrders) {
      const sameCourse = item.studentCourses.find((course) => {
        if (course.id === id) return false;
        return course.courseId === courseId;
      });
      result = sameCourse ? !!sameCourse.isFinish : true;
      if (!result) break;
    }
    return {
      result,
      message: result ? '' : '所选课程已报读, 请重新选择',
    };
  }
  return {
    result: true,
    message: '',
  };
};

const classHourDialogVisible = ref(false);
const chargeDialogVisible = ref(false);

const handleClassHourCal = () => {
  classHourDialogVisible.value = true;
};

const handleChargeCal = () => {
  chargeDialogVisible.value = true;
};

const handleClose = () => {
  courseOrderActiveTab.value = undefined;
  courseTableData.value = [];
  chargeFormData.value = initChargeFormData();
  emit('cancel');
};
</script>

<template>
  <ElDialog
    v-model="dialogVisible"
    width="1200px"
    title="报课管理"
    :show-close="false"
    :draggable="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <div class="flex h-[550px]">
      <div
        class="mr-2 h-full w-[20%] rounded-[4px] border border-[hsl(var(--border))]"
      >
        <VerticalTab
          v-model:active="courseOrderActiveTab"
          :tabs="courseOrderTabs"
          title="报课时间"
        >
          <template #tab="{ data }">
            <div
              class="flex items-center justify-between"
              @mouseenter="showTabDeleteIconKey = data.key"
              @mouseleave="showTabDeleteIconKey = 0"
            >
              <span>{{ data.name }}</span>
              <span
                v-if="showTabDeleteIconKey === data.key"
                class="icon-[ant-design--close-circle-filled] mr-2 h-4 w-4 cursor-pointer !bg-[hsl(var(--destructive))]"
                @click.self="handleDeleteCourseOrder(data.key as number)"
              ></span>
            </div>
          </template>
        </VerticalTab>
      </div>
      <div
        class="border-[hsl(var(--border)) flex h-full flex-1 flex-col rounded-[4px] border p-2"
      >
        <div class="mb-2 flex justify-end">
          <ElButton
            v-if="isCurDateCourseOrder"
            type="primary"
            @click="handleAppendCourse"
          >
            新增报课
          </ElButton>
        </div>
        <ElTable
          :data="courseTableData"
          height="100%"
          border
          header-cell-class-name="tableHeader"
        >
          <ElTableColumn prop="courseName" label="报读课程" width="200">
            <template #default="{ row }">
              {{ `${row.courseName}/${row.courseType}` }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="classHour" label="课程课时" width="120">
            <template #default="{ row }">
              <span v-if="!row.isEdit">{{ row.classHour }}</span>
              <ElInputNumber
                v-else
                v-model="row.classHour"
                :min="1"
                class="!w-full"
                controls-position="right"
                placeholder="请输入课程课时"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn prop="finishClassHour" label="已上课时" />
          <ElTableColumn prop="remainClassHour" label="剩余课时">
            <template #default="{ row }">
              {{ !row.isFinish ? row.classHour - row.finishClassHour : 0 }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="isFinish" label="课时状态">
            <template #default="{ row }">
              <ElTag :type="row.isFinish ? 'info' : 'success'">
                {{ row.isFinish ? '已结课' : '未结课' }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="finishDate" label="结课时间" width="100">
            <template #default="{ row }">
              {{
                row.finishDate ? formatDate(row.finishDate, 'YYYY-MM-DD') : '-'
              }}
            </template>
          </ElTableColumn>
          <ElTableColumn
            prop="action"
            label="操作栏"
            align="center"
            width="170"
          >
            <template #default="{ row, $index }">
              <template v-if="!row.isEdit">
                <ElButton
                  type="primary"
                  :disabled="row.isFinish"
                  link
                  @click="handleEditCourse(row)"
                >
                  编辑
                </ElButton>
                <ElButton
                  type="danger"
                  :disabled="row.isFinish || row.finishClassHour > 0"
                  link
                  @click="handleDeleteCourse(row.id)"
                >
                  删除
                </ElButton>
                <ElButton
                  type="success"
                  :disabled="row.isFinish || row.finishClassHour === 0"
                  link
                  @click="handleConfirmFinishCourse(row)"
                >
                  结课
                </ElButton>
              </template>
              <template v-else>
                <div class="flex justify-evenly">
                  <span
                    class="icon-[ep--select] h-5 w-5 cursor-pointer !bg-[hsl(var(--success))]"
                    @click="handleSubmitEditCourse(row, $index)"
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
        <div class="mt-2">
          <ElForm
            ref="chargeFormRef"
            :model="chargeFormData"
            inline
            :rules="rules"
          >
            <div class="flex justify-between">
              <ElFormItem
                ref="chargeFormItemRef"
                class="!mb-0 !w-[300px]"
                label="收费金额: "
                prop="charge"
                :show-message="false"
              >
                <div v-if="isEditCharge" class="flex items-center">
                  <ElInputNumber
                    v-model="chargeFormData.charge"
                    class="mr-3 !w-full"
                    :min="0"
                    controls-position="right"
                    placeholder="请输入收费金额"
                  />
                  <span
                    class="icon-[ep--select] mr-3 h-5 w-5 cursor-pointer !bg-[hsl(var(--success))]"
                    @click="handleSubmitNewCharge"
                  ></span>
                  <span
                    class="icon-[lucide--undo-2] h-5 w-5 cursor-pointer !bg-[hsl(var(--warning))]"
                    @click="handleCancelEditCharge"
                  ></span>
                </div>
                <div v-else class="flex items-center">
                  <span class="mr-2">{{ chargeFormData.charge }}</span>
                  <span
                    class="icon-[ep--edit-pen] h-4 w-4 cursor-pointer !bg-[hsl(var(--primary))]"
                    @click="handleEditCharge"
                  ></span>
                </div>
              </ElFormItem>
              <div>
                <ElFormItem class="!mb-0" label="总课时: ">
                  <span>{{ chargeFormData.totalClassHour }}</span>
                </ElFormItem>
                <ElFormItem class="!mb-0" label="剩余课时: ">
                  <span>{{ chargeFormData.totalRemainClassHour }}</span>
                </ElFormItem>
              </div>
            </div>
          </ElForm>
        </div>
      </div>
    </div>

    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" @click="handleClassHourCal"> 课时汇算 </ElButton>
      <ElButton type="primary" @click="handleChargeCal"> 收费汇算 </ElButton>
      <ElButton
        v-if="hasNoCurDateCourse"
        type="primary"
        @click="handleAddNewCourseOrder"
      >
        新增报课
      </ElButton>
    </template>
  </ElDialog>

  <ElTour
    v-model="chargeTipModelOpen"
    :z-index="10000"
    :show-close="false"
    close-icon=""
    :close-on-press-escape="false"
    :content-style="{
      width: '300px',
      padding: '4px',
    }"
  >
    <ElTourStep
      :target="() => chargeFormItemRef?.$el"
      :next-button-props="{ style: { display: 'none' } }"
    >
      <ElAlert
        title="请重新计算收费金额"
        type="warning"
        :closable="false"
        show-icon
      />
    </ElTourStep>
    <template #indicators></template>
  </ElTour>

  <StuDialog
    v-model:visible="stuDialogVisible"
    :dialog-mode="stuDialogMode"
    :student-id="stuInfo?.id"
    :course-list="courseList"
    :course-valid-func="handleCourseValid"
    :course-order-id="courseOrderActiveTab"
    :prev-charge="stuDialogPrevCharge"
    @submit-success="handleSubmitSuccess"
  />

  <ClassHourDialog
    v-model:visible="classHourDialogVisible"
    :course-orders="stuItemInfo?.courseOrders"
  />

  <ChargeDialog
    v-model:visible="chargeDialogVisible"
    :course-orders="stuItemInfo?.courseOrders"
  />
</template>
