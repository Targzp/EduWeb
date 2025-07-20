import type { PageQueryParams } from './common';
import type { CourseItemInfo } from './course-list';

/**
 * 教师列表项
 */
interface TeacherItemInfo {
  id: number;
  name: string;
  phone: string;
  createDate: string;
  courses: CourseItemInfo[];
}

/**
 * 教师列表查询参数
 */
interface TeacherQueryParams extends PageQueryParams {
  name: string;
  phone: string;
  courseIds: number[];
}

/**
 * 创建及编辑教师参数
 */
interface TeacherItemCeParams {
  id?: number;
  name: string;
  phone: string;
  courseIds: number[];
}

export type { TeacherItemCeParams, TeacherItemInfo, TeacherQueryParams };
