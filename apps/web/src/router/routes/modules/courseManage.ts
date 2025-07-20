import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:layout-dashboard',
      order: 4,
      title: '课程管理',
    },
    name: 'CourseManage',
    path: '/courseManage',
    children: [
      {
        name: 'CourseList',
        path: '/courseList',
        component: () => import('#/views/courseManage/courseList/index.vue'),
        meta: {
          title: '课程列表',
        },
      },
    ],
  },
];

export default routes;
