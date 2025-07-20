import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:layout-dashboard',
      order: 6,
      title: '系统管理',
    },
    name: 'SysManage',
    path: '/sysManage',
    children: [
      {
        name: 'UserManage',
        path: '/userManage',
        component: () => import('#/views/sysManage/userManage/index.vue'),
        meta: {
          title: '用户管理',
        },
      },
      {
        name: 'RoleManage',
        path: '/roleManage',
        component: () => import('#/views/sysManage/roleManage/index.vue'),
        meta: {
          title: '角色权限',
        },
      },
    ],
  },
];

export default routes;
