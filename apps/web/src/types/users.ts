import type { BasicUserInfo } from '@vben/types';

import type { PageQueryParams } from './common';

type RoleId = 0 | 1;

/**
 * 用户管理列表查询参数
 */
interface UserQueryParams extends PageQueryParams {
  account: string;
  phone: string;
  mail: string;
  roleId: RoleId;
}

/**
 * 用户列表项
 */
interface UserItemInfo extends BasicUserInfo {
  createDate: string;
  password: string;
}

/**
 * 创建及编辑用户参数
 */
interface UserItemCeParams {
  id?: number;
  account: string;
  password: string;
  phone: string;
  mail: string;
  roleId: RoleId;
}

export type { RoleId, UserItemCeParams, UserItemInfo, UserQueryParams };
