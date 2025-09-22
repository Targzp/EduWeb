<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import {
  ElButton,
  ElDialog,
  ElTable,
  ElTableColumn,
  TableColumnCtx,
} from 'element-plus';

import { CourseOrderInfo, CourseOrderTableType } from '#/types';
import { formatDate } from '#/utils';

type TableType = CourseOrderTableType<
  'finishClassHour' | 'finishDate' | 'id' | 'isFinish',
  'createDate' | 'studentCourses'
>;

interface SpanMethodProps {
  row: TableType;
  column: TableColumnCtx<TableType>;
  rowIndex: number;
  columnIndex: number;
}

const props = defineProps<{
  courseOrders?: CourseOrderInfo[];
  visible: boolean;
}>();

const emit = defineEmits(['update:visible']);

const dialogVisible = computed({
  get() {
    return props.visible;
  },
  set(val: boolean) {
    emit('update:visible', val);
  },
});

const courseOrderTableData = ref<TableType[]>([]);
const totalCharge = ref(0);

watch(dialogVisible, (val) => {
  if (val && props.courseOrders) {
    const tableData = getCourseOrderTableData(props.courseOrders);
    courseOrderTableData.value = tableData;
    handleCalTotalCharge(props.courseOrders);
  }
});

const getCourseOrderTableData = (courseOrders: CourseOrderInfo[]) => {
  const tableData: TableType[] = [];
  courseOrders.forEach((order) => {
    if (order.studentCourses) {
      order.studentCourses.forEach((course, courseIndex) => {
        const courseInfo = {
          courseId: course.courseId,
          courseName: course.courseName,
          courseType: course.courseType,
          classHour: course.classHour,
        };
        if (courseIndex === 0) {
          tableData.push({
            ...order,
            ...courseInfo,
          });
        } else {
          tableData.push({
            id: order.id,
            charge: order.charge,
            ...courseInfo,
          });
        }
      });
    }
  });
  return tableData;
};

const handleCalTotalCharge = (courseOrders: CourseOrderInfo[]) => {
  let tCharge = 0;
  courseOrders.forEach((item) => {
    tCharge += item.charge;
  });
  totalCharge.value = tCharge;
};

const objectSpanMethod = ({ row, columnIndex }: SpanMethodProps) => {
  if (columnIndex === 0 || columnIndex === 3) {
    return row?.studentCourses && row?.studentCourses.length > 0
      ? {
          rowspan: row.studentCourses.length,
          colspan: 1,
        }
      : {
          rowspan: 0,
          colspan: 0,
        };
  }
};

const handleClose = () => {
  courseOrderTableData.value = [];
};
</script>

<template>
  <ElDialog
    v-model="dialogVisible"
    width="800px"
    title="收费汇算"
    :show-close="false"
    :draggable="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <div class="px-5">
      <ElTable
        :data="courseOrderTableData"
        height="450"
        border
        header-cell-class-name="tableHeader"
        :span-method="objectSpanMethod"
      >
        <ElTableColumn prop="createDate" label="报课时间" width="100">
          <template #default="{ row }">
            {{ formatDate(row.createDate, 'YYYY-MM-DD') }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="courseName" label="报读课程" width="250">
          <template #default="{ row }">
            {{ `${row.courseName}/${row.courseType}` }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="classHour" label="课程课时" />
        <ElTableColumn prop="charge" label="收费金额" />
      </ElTable>
      <div class="mt-4 font-bold">总收费金额: {{ totalCharge }}</div>
    </div>
    <template #footer>
      <ElButton @click="dialogVisible = false">关闭</ElButton>
    </template>
  </ElDialog>
</template>
