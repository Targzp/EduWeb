import type {
  PageListType,
  UserItemCeParams,
  UserItemInfo,
  UserQueryParams,
} from '#/types';

import { requestClient } from '#/api/request';

/**
 * 获取用户列表
 */
export async function getUserListApi(paramsData: UserQueryParams) {
  return requestClient.post<PageListType<UserItemInfo[]>>(
    '/user/query',
    paramsData,
  );
}

/**
 * 创建用户
 */
export async function createUserApi(paramsData: UserItemCeParams) {
  return requestClient.post<UserItemInfo>('/user/create', paramsData);
}

/**
 * 修改用户
 */
export async function updateUserApi(paramsData: UserItemCeParams) {
  return requestClient.post<UserItemInfo>('/user/update', paramsData);
}

/**
 * 删除用户
 */
export async function deleteUserApi(id: string) {
  return requestClient.delete(`/user/delete?id=${id}`);
}
