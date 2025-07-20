import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:layout-dashboard',
      order: 5,
      title: '教学管理',
    },
    name: 'TeachingManage',
    path: '/teachingManage',
    children: [
      {
        name: 'ClassRecords',
        path: '/classRecords',
        component: () =>
          import('#/views/teachingManage/classRecords/index.vue'),
        meta: {
          title: '上课记录',
        },
      },
      {
        name: 'StuTransferApplication',
        path: '/stuTransferApplication',
        component: () =>
          import('#/views/teachingManage/stuTransferApplication/index.vue'),
        meta: {
          title: '学生调课申请',
        },
      },
    ],
  },
];

export default routes;
