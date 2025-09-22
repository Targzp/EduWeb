/*
 * @Author: 'Targzp' 'huchenming0302@foxmail.com'
 * @Date: 2025-06-23 13:46:36
 * @LastEditors: 'Targzp' 'huchenming0302@foxmail.com'
 * @LastEditTime: 2025-08-11 13:13:39
 * @FilePath: \edu_sys\apps\web\src\preferences.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineOverridesPreferences } from '@vben/preferences';

/**
 * @description 项目配置文件
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 * !!! 更改配置后请清空缓存，否则可能不生效
 */
export const overridesPreferences = defineOverridesPreferences({
  app: {
    name: import.meta.env.VITE_APP_TITLE,
    authPageLayout: 'panel-center',
    defaultHomePath: '/stuList',
  },
  copyright: {
    companyName: '教务系统',
    companySiteLink: '',
    date: '2025',
    enable: true,
    icp: '',
    icpLink: '',
    settingShow: false,
  },
  theme: {
    builtinType: 'default',
    colorDestructive: 'hsl(348 100% 61%)',
    colorPrimary: 'hsl(212 100% 45%)',
    colorSuccess: 'hsl(144 57% 58%)',
    colorWarning: 'hsl(42 84% 61%)',
    mode: 'light',
    radius: '0.5',
    semiDarkHeader: false,
    semiDarkSidebar: false,
  },
  widget: {
    fullscreen: false,
    languageToggle: false,
  },
  sidebar: {
    width: 250,
  },
  logo: {
    enable: true,
    source: '/static/edu.png',
  },
});
