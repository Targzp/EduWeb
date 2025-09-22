<script lang="ts" setup>
import { ref } from 'vue';

import { ElSegmented } from 'element-plus';

import StudentRecords from './student-records.vue';
import TeacherReacords from './teacher-reacords.vue';

const segmentedValue = ref('teacher');

const segmentedOptions = [
  {
    label: '教师',
    value: 'teacher',
  },
  {
    label: '学生',
    value: 'student',
  },
];
</script>

<template>
  <div class="flex h-full flex-col p-4">
    <div class="flex">
      <div class="custom-segmented">
        <ElSegmented
          v-model="segmentedValue"
          size="large"
          :options="segmentedOptions"
        />
      </div>
    </div>
    <component
      :is="segmentedValue === 'teacher' ? TeacherReacords : StudentRecords"
    />
  </div>
</template>
