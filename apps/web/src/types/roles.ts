import type { RoleId } from '@vben/types';

/**
 * 角色列表项
 */
interface RoleItem {
  id: number;
  name: string;
  notes: string;
}

/**
 * 功能权限列表
 */
interface MenuAccessRole {
  id: string;
  menuName: string;
  accessCodes: {
    actionCode: string;
    actionName: string;
    check?: boolean;
  }[];
  children?: MenuAccessRole[];
}

/**
 * 修改角色功能角色参数
 */
interface RoleAccessParams {
  roleId: RoleId;
  codes: string[];
}

export type { MenuAccessRole, RoleAccessParams, RoleItem };
