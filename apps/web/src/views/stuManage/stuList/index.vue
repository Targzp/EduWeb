<script lang="ts" setup>
import type { CourseItemInfo, CourseOrderInfo, StuItemInfo } from '#/types';

import { onMounted, ref } from 'vue';

import {
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElPagination,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';
import { sort } from 'radash';

import {
  archiveStudentApi,
  deleteStudentApi,
  getCourseListApi,
  getStudentListApi,
} from '#/api';
import { usePagination } from '#/hooks';
import { EmergencyPersonType } from '#/types/stu-list';
import { formatDate } from '#/utils';

import StuCourseDialog from './stu-course-dialog.vue';
import StuDialog from './stu-dialog.vue';

const initFormData = () => ({
  name: '',
  phone: '',
  courseIds: [],
  canShedule: true,
});
const formData = ref(initFormData());

const courseList = ref<CourseItemInfo[]>([]);

const getCourseList = async () => {
  try {
    const res = await getCourseListApi();
    courseList.value = sort(res, (item) => item.sortOrder);
  } catch (error) {
    console.error('获取课程列表失败:', error);
  }
};

const tableData = ref<StuItemInfo[]>([]);

const getTableData = async () => {
  try {
    tableLoading.value = true;
    tableData.value = [];
    const params = {
      pageNumber: pageNo.value,
      pageSize: pageSize.value,
      ...formData.value,
    };
    const res = await getStudentListApi(params);
    total.value = res.totalCount;
    tableData.value = res.data;
  } catch (error) {
    console.error('获取学生列表失败:', error);
  } finally {
    tableLoading.value = false;
  }
};

const tableLoading = ref(false);

const formatCourseList = (courseOrders: CourseOrderInfo[]) => {
  const courseList: string[] = [];
  courseOrders.forEach((item) => {
    if (item.studentCourses.length > 0) {
      const stuCourses = item.studentCourses
        .filter((stuCourse) => {
          return !stuCourse.isFinish;
        })
        .map((stuCourse) => {
          return `${stuCourse.courseName}/${stuCourse.courseType}`;
        });
      courseList.push(...stuCourses);
    }
  });
  if (courseList.length > 0) {
    return courseList.join(',');
  }
  return '-';
};

const handleReset = () => {
  formData.value = initFormData();
  pageNo.value = 1;
  getTableData();
};

const handleSearch = () => {
  pageNo.value = 1;
  getTableData();
};

const multipleStudentData = ref<StuItemInfo[]>([]);
const handleSelectionChange = (val: StuItemInfo[]) => {
  multipleStudentData.value = val;
};

const formatEmergencyPerson = (personFlag: EmergencyPersonType) => {
  switch (personFlag) {
    case EmergencyPersonType.FATHER: {
      return '父亲';
    }
    case EmergencyPersonType.MOTHER: {
      return '母亲';
    }
    case EmergencyPersonType.OTHER: {
      return '其他';
    }
  }
};

const selectable = (row: StuItemInfo) => {
  return row.canShedule;
};

const {
  total,
  pageSize,
  pageSizes,
  pageNo,
  handleSizeChange,
  handleCurrentChange,
} = usePagination(20, getTableData);

const stuDialogVisible = ref(false);
const stuDialogMode = ref<
  'addCourseOrder' | 'appendCourse' | 'edit' | 'register'
>('register');
const stuDialogEditData = ref<StuItemInfo>();

const handleRegisterStudent = () => {
  stuDialogVisible.value = true;
  stuDialogMode.value = 'register';
};

const handleEditStudent = (row: StuItemInfo) => {
  stuDialogVisible.value = true;
  stuDialogMode.value = 'edit';
  stuDialogEditData.value = row;
};

const stuCourseDialogVisible = ref(false);
const stuCourseDialogData = ref<StuItemInfo>();

const handleStuCourse = (row: StuItemInfo) => {
  stuCourseDialogVisible.value = true;
  stuCourseDialogData.value = row;
};

const handleBatchArchiveStudent = () => {
  ElMessageBox.confirm(
    '归档后，学生所有信息将会保留，但是不可进行排课，请确认是否将所选择的学生归档？',
    '归档学生',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    },
  ).then(async () => {
    try {
      const params = {
        studentIds: multipleStudentData.value.map((item) => item.id),
        canSchedule: false,
      };
      const res = await archiveStudentApi(params);
      if (res) {
        ElMessage({
          message: '归档成功',
          type: 'success',
        });
        getTableData();
      }
    } catch (error) {
      console.error('归档学生失败:', error);
    }
  });
};

const handleCancelArchive = async (row: StuItemInfo) => {
  try {
    const params = {
      studentIds: [row.id],
      canSchedule: true,
    };
    const res = await archiveStudentApi(params);
    if (res) {
      ElMessage({
        message: '取消归档成功',
        type: 'success',
      });
      getTableData();
    }
  } catch (error) {
    console.error('取消归档学生失败:', error);
  }
};

const handleBatchDeleteStudent = () => {
  ElMessageBox.confirm(
    '注销后学生所有信息将会被清除，请确认是否注销？',
    '注销学生',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    },
  ).then(async () => {
    try {
      const ids = multipleStudentData.value.map((item) => item.id);
      const res = await deleteStudentApi(ids);
      if (res) {
        ElMessage({
          message: '注销成功',
          type: 'success',
        });
        getTableData();
      }
    } catch (error) {
      console.error('注销学生失败:', error);
    }
  });
};

onMounted(() => {
  getCourseList();
  getTableData();
});
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden p-4">
    <div class="flex justify-end">
      <ElButton
        type="primary"
        class="!h-10 w-24"
        @click="handleRegisterStudent"
      >
        注册学生
      </ElButton>
      <ElButton
        type="primary"
        :disabled="multipleStudentData.length === 0"
        plain
        class="!h-10 w-20"
        @click="handleBatchArchiveStudent"
      >
        归档
      </ElButton>
      <ElButton
        type="primary"
        :disabled="multipleStudentData.length === 0"
        plain
        class="!h-10 w-20"
        @click="handleBatchDeleteStudent"
      >
        注销
      </ElButton>
    </div>
    <div
      class="mt-2 h-[56px] w-full rounded-[4px] bg-[hsl(var(--background))] p-2"
    >
      <ElForm :model="formData" class="mt-[4px]" inline>
        <div class="flex w-full justify-between">
          <div>
            <ElFormItem class="!mb-0" prop="name" label="学生姓名">
              <ElInput
                v-model="formData.name"
                clearable
                placeholder="请输入学生姓名"
              />
            </ElFormItem>
            <ElFormItem class="!mb-0" prop="phone" label="手机号码">
              <ElInput
                v-model="formData.phone"
                clearable
                placeholder="请输入手机号码"
              />
            </ElFormItem>
            <ElFormItem class="!mb-0" prop="courseIds" label="报读课程">
              <ElSelect
                v-model="formData.courseIds"
                multiple
                collapse-tags
                collapse-tags-tooltip
                clearable
                class="!w-[181px]"
                placeholder="请选择报读课程"
              >
                <ElOption
                  v-for="item in courseList"
                  :key="item.id"
                  :label="`${item.name}/${item.type}`"
                  :value="item.id"
                />
              </ElSelect>
            </ElFormItem>
            <ElFormItem class="!mb-0" prop="canShedule" label="学生状态">
              <ElSelect
                v-model="formData.canShedule"
                clearable
                class="!w-[181px]"
                placeholder="请选择学生状态"
              >
                <ElOption label="正常" :value="true" />
                <ElOption label="归档" :value="false" />
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
        @selection-change="handleSelectionChange"
      >
        <ElTableColumn
          type="selection"
          :selectable="selectable"
          width="55"
          align="center"
        />
        <ElTableColumn prop="name" label="学生姓名" width="120" />
        <ElTableColumn prop="birthDay" label="出生日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.birthDay, 'YYYY-MM-DD') }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="phone" label="手机号码" width="150" />
        <ElTableColumn prop="emergencyContact" label="紧急联系人" width="180">
          <template #default="{ row }">
            {{
              `${formatEmergencyPerson(row.emergencyContact.split('/')[0])}/${row.emergencyContact.split('/')[1]}`
            }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="courseOrders"
          label="报读课程(未结课的)"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            {{ formatCourseList(row.courseOrders) }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="totalClassHour" label="总课时" width="80" />
        <ElTableColumn prop="remainClassHour" label="剩余课时" width="90" />
        <ElTableColumn prop="canShedule" label="学生状态" width="90">
          <template #default="{ row }">
            <ElTag :type="row.canShedule ? 'success' : 'info'">
              {{ row.canShedule ? '正常' : '归档' }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createDate" label="注册时间" width="150">
          <template #default="{ row }">
            {{ formatDate(row.createDate) }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="action" label="操作栏" align="center" width="210">
          <template #default="{ row }">
            <ElButton type="primary" link @click="handleEditStudent(row)">
              编辑
            </ElButton>
            <ElButton
              v-if="!row.canShedule"
              type="warning"
              link
              @click="handleCancelArchive(row)"
            >
              取消归档
            </ElButton>
            <ElButton type="success" link @click="handleStuCourse(row)">
              报课管理
            </ElButton>
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

    <StuDialog
      v-model:visible="stuDialogVisible"
      :dialog-mode="stuDialogMode"
      :edit-data="stuDialogEditData"
      :course-list="courseList"
      @submit-success="getTableData"
    />

    <StuCourseDialog
      v-model:visible="stuCourseDialogVisible"
      :stu-info="stuCourseDialogData"
      :course-list="courseList"
      @cancel="getTableData"
    />
  </div>
</template>
