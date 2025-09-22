<script lang="ts" setup>
import type {
  CourseCeParams,
  CourseItemInfo,
  CourseOrderCreateParams,
  CourseOrderInfo,
  CourseOrderUpdateParams,
  StudentRegisterParams,
  StudentUpdateParams,
  StuItemInfo,
} from '#/types';

import { computed, nextTick, ref, useTemplateRef, watch } from 'vue';

import dayjs from 'dayjs';
import {
  ElButton,
  ElDatePicker,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElOption,
  ElSelect,
  ElTable,
  ElTableColumn,
} from 'element-plus';

import {
  createCourseOrderApi,
  createStudentApi,
  updateCourseOrderApi,
  updateStudentApi,
} from '#/api';
import { EmergencyPersonType } from '#/types/stu-list';
import { phoneValidator } from '#/utils';

const props = defineProps<{
  courseList: CourseItemInfo[];
  courseOrderId?: number;
  courseValidFunc?: (courseId: number) => {
    message: string;
    result: boolean;
  };
  dialogMode: 'addCourseOrder' | 'appendCourse' | 'edit' | 'register';
  editData?: StuItemInfo;
  prevCharge?: number;
  studentId?: number;
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'submitSuccess', data?: CourseOrderInfo): void;
  (e: 'update:visible', val: boolean): void;
}>();

const dialogVisible = computed({
  get() {
    return props.visible;
  },
  set(val: boolean) {
    emit('update:visible', val);
  },
});

const formatDialogTitle = (mode: typeof props.dialogMode) => {
  switch (mode) {
    case 'addCourseOrder':
    case 'appendCourse': {
      return '新增报读课程';
    }
    case 'edit': {
      return '编辑学生';
    }
    case 'register': {
      return '注册学生';
    }
  }
};

const initFormData = () => ({
  name: '',
  birthDay: '',
  phone: '',
  emergencyPerson: '',
  emergencyPhone: '',
  courses: [
    {
      courseId: undefined,
      classHour: 0,
    },
  ] as CourseCeParams[],
  prevCharge: 0,
  charge: 0,
});
const formData = ref(initFormData());

watch(dialogVisible, (val) => {
  if (val) {
    if (props.dialogMode === 'edit') {
      formData.value = {
        name: props.editData!.name,
        birthDay: dayjs(props.editData!.birthDay).format('YYYY-MM-DD'),
        phone: props.editData!.phone,
        emergencyPerson: props.editData!.emergencyContact.split('/')[0]!,
        emergencyPhone: props.editData!.emergencyContact.split('/')[1]!,
        courses: [],
        prevCharge: 0,
        charge: 0,
      };
    } else if (props.dialogMode === 'appendCourse') {
      formData.value.prevCharge = props.prevCharge!;
      formData.value.charge = undefined!;
    }
  }
});

const formRef = useTemplateRef('formRef');
const loading = ref(false);

const totalClassHour = computed(() => {
  return formData.value.courses.reduce((acc, cur) => {
    return acc + cur.classHour;
  }, 0);
});

const rules = {
  name: [
    {
      required: true,
      message: '请输入学生姓名',
      trigger: 'blur',
    },
  ],
  birthDay: [
    {
      required: true,
      message: '请选择出生日期',
      trigger: 'blur',
    },
  ],
  phone: [
    {
      required: true,
      message: '请输入手机号码',
      trigger: 'blur',
    },
    {
      validator: phoneValidator,
      trigger: 'blur',
    },
  ],
  emergencyPerson: [
    {
      required: true,
      message: '请选择紧急联系人',
      trigger: 'change',
    },
  ],
  emergencyPhone: [
    {
      required: true,
      message: '请输入紧急联系人手机号码',
      trigger: 'blur',
    },
    {
      validator: phoneValidator,
      trigger: 'blur',
    },
  ],
  courseId: [
    {
      required: true,
      trigger: 'blur',
    },
  ],
  classHour: [
    {
      required: true,
      trigger: 'blur',
    },
  ],
  charge: [
    {
      required: true,
      message: '请输入收费金额',
      trigger: 'blur',
    },
  ],
};

const handleAddCourse = () => {
  formData.value.courses.push({
    courseId: undefined,
    classHour: 0,
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

const handleChangeCourse = (val: number, index: number) => {
  const isRepeat = formData.value.courses.some((item, idx) => {
    if (idx === index) {
      return false;
    }
    return item.courseId === val;
  });

  if (isRepeat) {
    ElMessage({
      message: '已选择过该课程, 不可重复选择!',
      type: 'warning',
    });
    formData.value.courses[index]!.courseId = undefined;
    return;
  }
  if (props.courseValidFunc) {
    const { result, message } = props.courseValidFunc(val);
    if (!result) {
      ElMessage({
        message,
        type: 'warning',
      });
      formData.value.courses[index]!.courseId = undefined;
    }
  }
};

const handleDeleteCourse = (index: number) => {
  formData.value.courses.splice(index, 1);
};

const getRegisterParams = () => {
  return {
    name: formData.value.name,
    birthDay: dayjs(formData.value.birthDay).format('YYYY-MM-DD'),
    phone: formData.value.phone,
    emergencyContact: `${formData.value.emergencyPerson}/${formData.value.emergencyPhone}`,
    courses: formData.value.courses,
    charge: formData.value.charge,
  };
};

const getEditParams = () => {
  return {
    id: props.editData!.id,
    name: formData.value.name,
    birthDay: dayjs(formData.value.birthDay).format('YYYY-MM-DD'),
    phone: formData.value.phone,
    emergencyContact: `${formData.value.emergencyPerson}/${formData.value.emergencyPhone}`,
  };
};

const getAddCourseParams = () => {
  return {
    studentId: props.studentId,
    charge: formData.value.charge,
    courses: formData.value.courses,
  };
};

const getAppendCourseParams = () => {
  return {
    id: props.courseOrderId,
    charge: formData.value.charge,
    courses: formData.value.courses.map((item) => {
      return {
        ...item,
        id: 0,
      };
    }),
  };
};

const getParamsStrategy = {
  register: getRegisterParams,
  edit: getEditParams,
  addCourseOrder: getAddCourseParams,
  appendCourse: getAppendCourseParams,
};

const handleConfirm = () => {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      const tipTitle = formatDialogTitle(props.dialogMode);
      try {
        loading.value = true;
        const params = getParamsStrategy[props.dialogMode]();
        let res: any = null;
        switch (props.dialogMode) {
          case 'addCourseOrder': {
            res = await createCourseOrderApi(params as CourseOrderCreateParams);
            break;
          }
          case 'appendCourse': {
            res = await updateCourseOrderApi(params as CourseOrderUpdateParams);
            break;
          }
          case 'edit': {
            res = await updateStudentApi(params as StudentUpdateParams);
            break;
          }
          case 'register': {
            res = await createStudentApi(params as StudentRegisterParams);
            break;
          }
          // No default
        }
        if (res) {
          ElMessage({
            message: `${tipTitle}成功`,
            type: 'success',
          });
          dialogVisible.value = false;
          emit('submitSuccess', res);
        }
      } catch (error) {
        console.error(`${tipTitle}失败:`, error);
      } finally {
        loading.value = false;
      }
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
    :width="dialogMode === 'edit' ? '500px' : '800px'"
    :title="formatDialogTitle(dialogMode)"
    :show-close="false"
    :draggable="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <div
      class="px-5"
      :class="
        dialogMode !== 'addCourseOrder' && dialogMode !== 'appendCourse'
          ? 'pt-4'
          : ''
      "
    >
      <ElForm ref="formRef" :model="formData" label-width="100" :rules="rules">
        <div
          v-if="
            dialogMode !== 'addCourseOrder' && dialogMode !== 'appendCourse'
          "
          :class="dialogMode === 'register' ? 'w-[60%]' : 'w-full'"
        >
          <ElFormItem prop="name" label="学生姓名">
            <ElInput
              v-model="formData.name"
              clearable
              placeholder="请输入学生姓名"
            />
          </ElFormItem>
          <ElFormItem prop="birthDay" label="出生日期">
            <ElDatePicker
              v-model="formData.birthDay"
              class="!w-full"
              type="date"
              clearable
              placeholder="请选择出生日期"
            />
          </ElFormItem>
          <ElFormItem prop="phone" label="手机号码">
            <ElInput
              v-model="formData.phone"
              clearable
              placeholder="请输入手机号码"
            />
          </ElFormItem>
          <ElFormItem prop="emergencyPerson" label="紧急联系人">
            <div class="flex w-full">
              <ElSelect
                v-model="formData.emergencyPerson"
                class="mr-2 !w-[35%]"
                clearable
                placeholder="紧急联系人"
              >
                <ElOption label="父亲" :value="EmergencyPersonType.FATHER" />
                <ElOption label="母亲" :value="EmergencyPersonType.MOTHER" />
                <ElOption label="其他" :value="EmergencyPersonType.OTHER" />
              </ElSelect>
              <ElFormItem class="flex-1" prop="emergencyPhone">
                <ElInput
                  v-model="formData.emergencyPhone"
                  clearable
                  placeholder="手机号码"
                />
              </ElFormItem>
            </div>
          </ElFormItem>
        </div>
        <div v-if="dialogMode !== 'edit'">
          <div class="mb-2 flex justify-end">
            <ElButton type="primary" @click="handleAddCourse">
              新增报读课程
            </ElButton>
          </div>
          <ElTable
            id="courseTable"
            :data="formData.courses"
            border
            height="250px"
            header-cell-class-name="tableHeader"
          >
            <ElTableColumn prop="courseId" label="报读课程">
              <template #default="{ row, $index }">
                <ElFormItem
                  class="!mb-0 !ml-[-100px]"
                  :prop="`courses[${$index}].courseId`"
                  :rules="rules.courseId"
                  :show-message="false"
                >
                  <ElSelect
                    v-model="row.courseId"
                    clearable
                    placeholder="请选择报读课程"
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
              </template>
            </ElTableColumn>
            <ElTableColumn prop="classHour" label="课程课时">
              <template #default="{ row, $index }">
                <ElFormItem
                  class="!mb-0 !ml-[-100px]"
                  :prop="`courses[${$index}].classHour`"
                  :rules="rules.classHour"
                  :show-message="false"
                >
                  <ElInputNumber
                    v-model="row.classHour"
                    :min="1"
                    controls-position="right"
                    class="!w-full"
                    placeholder="请输入课程课时"
                  />
                </ElFormItem>
              </template>
            </ElTableColumn>
            <ElTableColumn
              prop="action"
              label="操作栏"
              align="center"
              width="100"
            >
              <template #default="{ $index }">
                <ElButton
                  type="danger"
                  link
                  @click="handleDeleteCourse($index)"
                >
                  删除
                </ElButton>
              </template>
            </ElTableColumn>
          </ElTable>
          <div class="w-[60%]">
            <ElFormItem class="mt-4" label="总课时">
              <ElInput
                :model-value="totalClassHour"
                disabled
                placeholder="请输入总课时"
              />
            </ElFormItem>
            <ElFormItem
              v-if="dialogMode === 'appendCourse'"
              prop="prevCharge"
              label="原收费金额"
            >
              <ElInputNumber
                v-model="formData.prevCharge"
                class="!w-full"
                disabled
                controls-position="right"
              />
            </ElFormItem>
            <ElFormItem
              prop="charge"
              :label="dialogMode === 'appendCourse' ? '新收费金额' : '收费金额'"
            >
              <ElInputNumber
                v-model="formData.charge"
                class="!w-full"
                :min="0"
                controls-position="right"
                placeholder="请输入收费金额"
              />
            </ElFormItem>
          </div>
        </div>
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
