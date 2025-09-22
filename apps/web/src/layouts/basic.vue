<script lang="ts" setup>
import type { NotificationItem } from '@vben/layouts';

import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { AuthenticationLoginExpiredModal } from '@vben/common-ui';
import { useTabs, useWatermark } from '@vben/hooks';
import {
  BasicLayout,
  LockScreen,
  Notification,
  UserDropdown,
} from '@vben/layouts';
import { preferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';

import { useWebSocket } from '@vueuse/core';
import dayjs from 'dayjs';

import { useAuthStore } from '#/store';
import { TransferApplicationItem, WebSocketData } from '#/types';
import { WebSocketTypeCode } from '#/types/common';
import LoginForm from '#/views/_core/authentication/login.vue';

const route = useRoute();
const router = useRouter();

const { refreshTab } = useTabs();

const notifications = ref<NotificationItem[]>([]);

const userStore = useUserStore();
const authStore = useAuthStore();
const accessStore = useAccessStore();
const { destroyWatermark, updateWatermark } = useWatermark();
const showDot = computed(() =>
  notifications.value.some((item) => !item.isRead),
);

const avatar = computed(() => {
  return userStore.userInfo?.avatar ?? preferences.app.defaultAvatar;
});

async function handleLogout() {
  await authStore.logout(false);
}

function handleNoticeClear() {
  notifications.value = [];
}

function handleMakeAll() {
  notifications.value.forEach((item) => (item.isRead = true));
}

function handleRead(item: NotificationItem) {
  item.isRead = true;
  if (item.type === 'Transfer') {
    if (route.name === 'StuTransferApplication') {
      refreshTab();
    } else {
      router.push({
        name: 'StuTransferApplication',
      });
    }
  }
}

const { data, close } = useWebSocket(
  `${import.meta.env.VITE_WEBSOCKET_URL}?userId=${userStore.userInfo?.id}`,
  // 配置选项
  {
    autoReconnect: false,
  },
);

watch(data, (data) => {
  const wsData = JSON.parse(data) as WebSocketData;
  if (wsData && wsData.code === WebSocketTypeCode.TransferApply) {
    const applyData = wsData.data as TransferApplicationItem;
    notifications.value.push({
      date: dayjs().format('YYYY-MM-DD HH:mm'),
      isRead: false,
      message: '',
      title: `收到了来自${applyData.stuName}的调课申请`,
      type: 'Transfer',
    });
  }
});

watch(
  () => preferences.app.watermark,
  async (enable) => {
    if (enable) {
      await updateWatermark({
        content: `${userStore.userInfo?.username} - ${userStore.userInfo?.realName}`,
      });
    } else {
      destroyWatermark();
    }
  },
  {
    immediate: true,
  },
);

onBeforeUnmount(() => {
  close();
});
</script>

<template>
  <BasicLayout @clear-preferences-and-logout="handleLogout">
    <template #user-dropdown>
      <UserDropdown
        :avatar
        :text="userStore.userInfo?.account"
        :description="userStore.userInfo?.mail"
        :tag-text="userStore.userInfo?.roleId === 1 ? '超级管理员' : '管理员'"
        @logout="handleLogout"
      />
    </template>
    <template #notification>
      <Notification
        :dot="showDot"
        :notifications="notifications"
        @clear="handleNoticeClear"
        @make-all="handleMakeAll"
        @read="handleRead"
      />
    </template>
    <template #extra>
      <AuthenticationLoginExpiredModal
        v-model:open="accessStore.loginExpired"
        :avatar
      >
        <LoginForm />
      </AuthenticationLoginExpiredModal>
    </template>
    <template #lock-screen>
      <LockScreen :avatar @to-login="handleLogout" />
    </template>
  </BasicLayout>
</template>
