/**
 * 手机号验证
 */
export const phoneValidator = (_rule: any, value: string, callback: any) => {
  const reg =
    /^(?:13\d|14[014-9]|15[0-35-9]|16[2567]|17[0-8]|18\d|19[0-35-9])\d{8}$/;
  if (reg.test(value)) {
    callback();
  } else {
    callback(new Error('请输入正确的手机号码'));
  }
};
