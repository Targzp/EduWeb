import type { PageQueryParams, PartialByKey } from './common';

enum EmergencyPersonType {
  FATHER = 'father',
  MOTHER = 'mother',
  OTHER = 'other',
}

/**
 * 学生列表查询参数
 */
interface StudentQueryParams extends PageQueryParams {
  name: string;
  phone: string;
  courseIds: number[];
  canShedule: boolean;
}

/**
 * 报课单下报读课程列表项
 */
interface StudentCourseItemInfo {
  id: number;
  classHour: number;
  finishClassHour: number;
  isFinish: boolean;
  finishDate: string;
  courseName: string;
  courseType: string;
  courseId: number;
}

/**
 * 报课单（根据报课时间分类）列表项
 */
interface CourseOrderInfo {
  id: number;
  charge: number;
  createDate: string;
  studentCourses: StudentCourseItemInfo[];
}

/**
 * 学生列表项
 */
interface StuItemInfo {
  id: number;
  name: string;
  birthDay: string;
  phone: string;
  emergencyContact: string;
  canShedule: boolean;
  createDate: string;
  courseOrders: CourseOrderInfo[];
  totalClassHour: number;
  remainClassHour: number;
}

/**
 * 新增/编辑报读课程参数
 */
interface CourseCeParams {
  id?: number;
  courseId?: number;
  classHour: number;
}

/**
 * 注册学生参数
 */
interface StudentRegisterParams {
  name: string;
  birthDay: string;
  phone: string;
  emergencyContact: string;
  courses: CourseCeParams[];
  charge: number;
}

/**
 * 修改学生参数
 */
interface StudentUpdateParams {
  id: number;
  name: string;
  birthDay: string;
  phone: string;
  emergencyContact: string;
}

/**
 * 新增报课单参数
 */
interface CourseOrderCreateParams {
  studentId: number;
  charge: number;
  courses: CourseCeParams[];
}

/**
 * 修改报课单参数
 */
interface CourseOrderUpdateParams {
  id: number;
  charge: number;
  courses: CourseCeParams[];
}

/**
 * 归档/取消归档学生参数
 */
interface StudentArchiveParams {
  studentIds: number[];
  canSchedule: boolean;
}

/**
 * 报读课程手动结课参数
 */
interface StudentFinishCourseParams {
  id: number;
  isFinish: boolean;
}

/**
 * 课时/收费汇算表格行类型
 */
type CourseOrderTableType<
  T extends number | string | symbol,
  K extends keyof CourseOrderInfo,
> = Omit<StudentCourseItemInfo, T> & PartialByKey<CourseOrderInfo, K>;

export type {
  CourseCeParams,
  CourseOrderCreateParams,
  CourseOrderInfo,
  CourseOrderTableType,
  CourseOrderUpdateParams,
  StudentArchiveParams,
  StudentCourseItemInfo,
  StudentFinishCourseParams,
  StudentQueryParams,
  StudentRegisterParams,
  StudentUpdateParams,
  StuItemInfo,
};

export { EmergencyPersonType };
