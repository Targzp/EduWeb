<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import {
  ElButton,
  ElDialog,
  ElTable,
  ElTableColumn,
  ElTag,
  TableColumnCtx,
} from 'element-plus';

import { CourseOrderInfo, CourseOrderTableType } from '#/types';
import { formatDate } from '#/utils';

type TableType = CourseOrderTableType<'id', 'createDate' | 'studentCourses'>;

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
const totalClassHour = ref(0);
const totalRemainClassHour = ref(0);

watch(dialogVisible, (val) => {
  if (val && props.courseOrders) {
    const tableData = getCourseOrderTableData(props.courseOrders);
    courseOrderTableData.value = tableData;
    handleCalClassHourData(tableData);
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
          finishClassHour: course.finishClassHour,
          isFinish: course.isFinish,
          finishDate: course.finishDate,
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

const handleCalClassHourData = (data: TableType[]) => {
  let classHour = 0;
  let remainClassHour = 0;
  data.forEach((item) => {
    classHour += item.classHour;
    remainClassHour += item.isFinish
      ? 0
      : item.classHour - item.finishClassHour;
  });
  totalClassHour.value = classHour;
  totalRemainClassHour.value = remainClassHour;
};

const objectSpanMethod = ({ row, columnIndex }: SpanMethodProps) => {
  if (columnIndex === 0) {
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
    title="课时汇算"
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
        <ElTableColumn prop="courseName" label="报读课程" width="200">
          <template #default="{ row }">
            {{ `${row.courseName}/${row.courseType}` }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="classHour" label="课程课时" />
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
      </ElTable>
      <div class="mt-4">
        <span class="mr-4 font-bold"> 总课时: {{ totalClassHour }} </span>
        <span class="font-bold"> 剩余总课时: {{ totalRemainClassHour }} </span>
      </div>
    </div>
    <template #footer>
      <ElButton @click="dialogVisible = false">关闭</ElButton>
    </template>
  </ElDialog>
</template>
