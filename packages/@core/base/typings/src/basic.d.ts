interface BasicOption {
  label: string;
  value: string;
}

type SelectOption = BasicOption;

type TabOption = BasicOption;

type RoleId = 0 | 1;

interface BasicUserInfo {
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

type ClassType = Array<object | string> | object | string;

export type {
  BasicOption,
  BasicUserInfo,
  ClassType,
  RoleId,
  SelectOption,
  TabOption,
};
