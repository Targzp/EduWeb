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
  {
    id: '2',
    menuName: '教师管理',
    accessCodes: [],
    children: [
      {
        id: '2-1',
        menuName: '教师列表',
        accessCodes: [
          {
            actionName: '创建',
            actionCode: 'TEA-001',
          },
          {
            actionName: '编辑',
            actionCode: 'TEA-002',
          },
          {
            actionName: '注销',
            actionCode: 'TEA-003',
          },
        ],
      },
    ],
  },
  {
    id: '3',
    menuName: '课表管理',
    accessCodes: [],
    children: [
      {
        id: '3-1',
        menuName: '排课中心',
        accessCodes: [
          {
            actionName: '创建',
            actionCode: 'SCH-001',
          },
          {
            actionName: '编辑',
            actionCode: 'SCH-002',
          },
          {
            actionName: '删除',
            actionCode: 'SCH-003',
          },
          {
            actionName: '一键清除',
            actionCode: 'SCH-004',
          },
          {
            actionName: '批量排课',
            actionCode: 'SCH-005',
          },
          {
            actionName: '应用模板',
            actionCode: 'SCH-006',
          },
        ],
      },
      {
        id: '3-2',
        menuName: '课表模板',
        accessCodes: [
          {
            actionName: '创建',
            actionCode: 'TPL-001',
          },
          {
            actionName: '编辑',
            actionCode: 'TPL-002',
          },
          {
            actionName: '删除',
            actionCode: 'TPL-003',
          },
        ],
      },
    ],
  },
  {
    id: '4',
    menuName: '课程管理',
    accessCodes: [],
    children: [
      {
        id: '4-1',
        menuName: '课程列表',
        accessCodes: [
          {
            actionName: '创建',
            actionCode: 'COU-001',
          },
          {
            actionName: '编辑',
            actionCode: 'COU-002',
          },
          {
            actionName: '删除',
            actionCode: 'COU-003',
          },
          {
            actionName: '移动',
            actionCode: 'COU-004',
          },
        ],
      },
    ],
  },
  {
    id: '5',
    menuName: '教学管理',
    accessCodes: [],
    children: [
      {
        id: '5-1',
        menuName: '上课记录',
        accessCodes: [
          {
            actionName: '核对',
            actionCode: 'REC-001',
          },
        ],
      },
      {
        id: '5-2',
        menuName: '学生调课申请',
        accessCodes: [
          {
            actionName: '审批',
            actionCode: 'APP-001',
          },
          {
            actionName: '删除',
            actionCode: 'APP-002',
          },
        ],
      },
    ],
  },
];
