import type { StuItemInfo } from './stu-list';
import type { TeacherItemInfo } from './teacher-list';

enum ClearModeType {
  ALL = 'all',
  MONTH = 'month',
  STUDENT = 'student',
  TEACHER = 'teacher',
}

/**
 * 排课信息查询参数
 */
interface CourseScheduleQueryInfo {
  startDate: string;
  endDate: string;
  courseIds: number[];
  teacherIds: number[];
  studentIds: number[];
}

/**
 * 排课信息列表项
 */
interface CourseScheduleItem {
  id: number;
  startDate: string;
  endDate: string;
  courseId: number;
  courseName: string;
  courseType: string;
  teacherId: number;
  teacherName: string;
  students: {
    studentId: number;
    studentName: string;
  }[];
}

/**
 * 排课表单内课程项
 */
interface ScheduleCourseItem {
  timeRange: [Date?, Date?];
  courseId?: number;
  courseName?: string;
  courseType?: string;
  teacherId?: number;
  teacherName?: string;
  studentIds: number[];
  studentNames?: string[];
  teacherList: TeacherItemInfo[];
  studentList: StuItemInfo[];
  isEdit?: boolean;
  isNew?: boolean;
}

/**
 * 排课表单类型
 */
interface ScheduleDialogFormData {
  date: string;
  dates: string[];
  courses: ScheduleCourseItem[];
}

/**
 * 创建/更新排课信息参数
 */
interface ScheduleCreateOrUpdateCourseParams {
  startDate: string;
  endDate: string;
  courseId: number;
  teacherId: number;
  studentIds: number[];
}

/**
 * 批量创建排课日期参数
 */
interface ScheduleBatchCreateCourseParams {
  dates: string[];
  courseSchedules: ScheduleCreateOrUpdateCourseParams[];
}

/**
 * 根据模板批量创建排课参数
 */
interface ScheduleBatchCreateCourseByTemplateParams {
  startDate: string;
  endDate: string;
  templateId: number;
  studentIds: number[];
}

/**
 * 根据特定条件删除排课信息参数
 */
interface DeleteCourseScheduleByConditionParams {
  startDate?: null | string;
  endDate?: null | string;
  courseIds?: null | number[];
  teacherIds?: null | number[];
  studentIds?: null | number[];
}

export type {
  CourseScheduleItem,
  CourseScheduleQueryInfo,
  DeleteCourseScheduleByConditionParams,
  ScheduleBatchCreateCourseByTemplateParams,
  ScheduleBatchCreateCourseParams,
  ScheduleCourseItem,
  ScheduleCreateOrUpdateCourseParams,
  ScheduleDialogFormData,
};

export { ClearModeType };
