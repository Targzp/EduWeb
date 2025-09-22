interface NotificationItem {
  date: string;
  isRead?: boolean;
  message: string;
  title: string;
  type: 'Transfer'; // 通知类型
}

export type { NotificationItem };
