<script lang="ts" setup>
import { computed } from 'vue';

import { ElScrollbar } from 'element-plus';

import { Tab } from './types';

const props = defineProps<{
  active?: number | string;
  tabs: Tab[];
  title: string;
}>();

const emit = defineEmits(['update:active']);

const activeTab = computed({
  get() {
    return props.active;
  },
  set(value) {
    emit('update:active', value);
  },
});
</script>

<template>
  <div class="flex h-full w-full flex-col p-3">
    <div class="mb-3 flex items-end">
      <div
        class="mr-[4px] h-4 w-1 rounded-[2px] bg-[hsl(var(--primary))]"
      ></div>
      <div class="font-bold">{{ props.title }}</div>
    </div>
    <div>
      <template v-if="tabs && tabs.length > 0">
        <ElScrollbar>
          <div
            v-for="item in tabs"
            :key="item.key"
            class="cursor-pointer rounded-[4px] py-[8px] pl-[20px] text-[#aeaeb2] transition-all duration-150 ease-in-out hover:bg-[#e8ecff48]"
            :class="[
              activeTab === item.key
                ? 'bg-[#e8ecff] font-bold text-[hsl(var(--primary))]'
                : '',
            ]"
            @click="activeTab = item.key"
          >
            <slot name="tab" :data="item">{{ item.name }}</slot>
          </div>
        </ElScrollbar>
      </template>
      <div
        v-else
        class="flex h-full flex-col items-center justify-center text-[#aeaeb2]"
      >
        暂无数据
      </div>
    </div>
  </div>
</template>
