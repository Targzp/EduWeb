/*
 * @Author: 'Targzp' 'huchenming0302@foxmail.com'
 * @Date: 2025-07-14 21:58:42
 * @LastEditors: 'Targzp' 'huchenming0302@foxmail.com'
 * @LastEditTime: 2025-08-11 14:44:53
 * @FilePath: \edu_sys\apps\web\src\router\routes\modules\sysManage.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:settings',
      order: 6,
      title: '系统管理',
      authority: ['super'],
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
