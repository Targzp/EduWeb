import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:layout-dashboard',
      order: 1,
      title: '学生管理',
    },
    name: 'StuManage',
    path: '/stuManage',
    children: [
      {
        name: 'StuList',
        path: '/stuList',
        component: () => import('#/views/stuManage/stuList/index.vue'),
        meta: {
          title: '学生列表',
        },
      },
    ],
  },
];

export default routes;
