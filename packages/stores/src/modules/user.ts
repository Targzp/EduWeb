import type { RoleId } from '@vben-core/typings';

import { acceptHMRUpdate, defineStore } from 'pinia';

interface BasicUserInfo {
  [key: string]: any;
  /**
   * 用户名称
   */
  account: string;
  /**
   * 用户id
   */
  id: number;
  /**
   * 邮箱
   */
  mail: string;
  /**
   * 手机号
   */
  phone: string;
  /**
   * 用户角色
   */
  role: string;
  /**
   * 用户角色id
   */
  roleId: RoleId;
}

interface AccessState {
  /**
   * 用户信息
   */
  userInfo: BasicUserInfo | null;
  /**
   * 用户角色
   */
  userRole: string;
}

/**
 * @zh_CN 用户信息相关
 */
export const useUserStore = defineStore('core-user', {
  actions: {
    setUserInfo(userInfo: BasicUserInfo | null) {
      // 设置用户信息
      this.userInfo = userInfo;
      // 设置角色信息
      const role = userInfo?.role ?? '';
      this.setUserRoles(role);
    },
    setUserRoles(role: string) {
      this.userRole = role;
    },
  },
  state: (): AccessState => ({
    userInfo: null,
    userRole: '',
  }),
});

// 解决热更新问题
const hot = import.meta.hot;
if (hot) {
  hot.accept(acceptHMRUpdate(useUserStore, hot));
}
