import type { MenuAccessRole } from '#/types';

/**
 * 系统功能权限集合
 */
export const SysRoleCodes: MenuAccessRole[] = [
  {
    id: '1',
    menuName: '学生管理',
    accessCodes: [],
    children: [
      {
        id: '1-1',
        menuName: '学生列表',
        accessCodes: [
          {
            actionName: '创建',
            actionCode: 'STU-001',
          },
          {
            actionName: '编辑',
            actionCode: 'STU-002',
          },
          {
            actionName: '归档',
            actionCode: 'STU-003',
          },
          {
            actionName: '注销',
            actionCode: 'STU-004',
          },
          {
            actionName: '报课管理',
            actionCode: 'STU-005',
          },
        ],
      },
    ],
  },
];
