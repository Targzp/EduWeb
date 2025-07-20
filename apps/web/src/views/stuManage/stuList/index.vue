<script lang="ts" setup>
import { ElButton } from 'element-plus';

// const multipleTeacherData = ref<TeacherItemInfo[]>([]);
// const handleSelectionChange = (val: TeacherItemInfo[]) => {
//   multipleTeacherData.value = val;
// };
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden p-4">
    <div class="flex justify-end">
      <ElButton type="primary" class="!h-10 w-24"> 注册学生 </ElButton>
      <ElButton type="primary" plain class="!h-10 w-20"> 注销 </ElButton>
      <ElButton type="primary" plain class="!h-10 w-20"> 归档 </ElButton>
    </div>
    <div
      class="mt-2 h-[56px] w-full rounded-[4px] bg-[hsl(var(--background))] p-2"
    ></div>
    <div
      class="mt-2 flex h-full flex-1 flex-col rounded-[4px] bg-[hsl(var(--background))] p-4"
    ></div>
  </div>
</template>

<style lang="scss" scoped></style>
