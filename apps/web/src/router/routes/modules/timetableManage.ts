import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:layout-dashboard',
      order: 3,
      title: '课表管理',
    },
    name: 'TimeTableManage',
    path: '/timetableManage',
    children: [
      {
        name: 'SchedulingCenter',
        path: '/schedulingCenter',
        component: () =>
          import('#/views/timetableManage/schedulingCenter/index.vue'),
        meta: {
          title: '排课中心',
        },
      },
      {
        name: 'TimeTableTemplate',
        path: '/timeTableTemplate',
        component: () =>
          import('#/views/timetableManage/timetableTemplate/index.vue'),
        meta: {
          title: '课表模板',
        },
      },
    ],
  },
];

export default routes;
