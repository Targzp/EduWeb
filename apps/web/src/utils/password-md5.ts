import { Md5 } from 'ts-md5';

/**
 * 密码md5加密
 */
export const handlePasswordMd5 = (password: string) => {
  return Md5.hashStr(password);
};
