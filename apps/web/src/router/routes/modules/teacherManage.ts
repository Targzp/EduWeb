import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:layout-dashboard',
      order: 2,
      title: '教师管理',
    },
    name: 'TeacherManage',
    path: '/teacherManage',
    children: [
      {
        name: 'TeacherList',
        path: '/teacherList',
        component: () => import('#/views/teacherManage/teacherList/index.vue'),
        meta: {
          title: '教师列表',
        },
      },
    ],
  },
];

export default routes;
