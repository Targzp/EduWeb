import type { PageQueryParams } from './common';

/**
 * 学生上课记录列表项
 */
interface StudentRecordItem {
  studentId: number;
  studentName: string;
  teacherName: string;
  startDate: string;
  endDate: string;
  courseScheduleId: number;
  courseName: string;
  courseType: string;
  teacherId: number;
  isCheckIn: boolean;
  missCheckInReason: string;
}

/**
 * 学生上课记录列表查询参数
 */
interface StudentRecordQueryParams extends PageQueryParams {
  studentIds: number[];
  courseIds: number[];
  startDate: null | string;
  endDate: null | string;
}

export type { StudentRecordItem, StudentRecordQueryParams };
