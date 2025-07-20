import type { RoleId } from '@vben/types';

import type { RoleAccessParams, RoleItem } from '#/types';

import { requestClient } from '#/api/request';

/**
 * 获取角色列表
 */
export async function getRoleListApi() {
  return requestClient.get<RoleItem[]>('/role/getAll');
}

/**
 * 获取角色已设置的功能权限
 */
export async function getRoleAccessListApi(roleId: RoleId) {
  return requestClient.get<string[]>(`/role/accesscodes?roleId=${roleId}`);
}

/**
 * 修改角色信息
 */
export async function updateRoleInfoApi(paramsData: RoleItem) {
  return requestClient.post<RoleItem>('/role/update', paramsData);
}

/**
 * 修改角色功能权限
 */
export async function updateRoleAccessApi(paramsData: RoleAccessParams) {
  return requestClient.post<boolean>('/role/setAccesscodes', paramsData);
}
