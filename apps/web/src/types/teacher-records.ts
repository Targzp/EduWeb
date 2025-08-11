import type { PageQueryParams } from './common';

/**
 * 学生课堂签到记录信息
 */
interface StudentCheckInfo {
  studentId: number;
  studentName: string;
  isCheckIn: boolean;
  missCheckInReason: string;
}

/**
 * 教师上课记录列表项
 */
interface TeacherRecordItem {
  id: number;
  startDate: string;
  endDate: string;
  courseId: number;
  courseName: string;
  courseType: string;
  teacherId: number;
  teacherName: string;
  isVerified: boolean;
  students: StudentCheckInfo[];
}

/**
 * 教师上课记录列表查询参数
 */
interface TeacherRecordQueryParams extends PageQueryParams {
  teacherIds: number[];
  courseIds: number[];
  startDate: null | string;
  endDate: null | string;
}

interface TeacherRecordDetailInfo {
  id: number;
  date: string;
  range: string;
  course: string;
  stuCount: number;
  students: StudentCheckInfo[];
  stuCheckInCount: number;
  checkInStudents: StudentCheckInfo[];
  isVerified: boolean;
}

export type {
  StudentCheckInfo,
  TeacherRecordDetailInfo,
  TeacherRecordItem,
  TeacherRecordQueryParams,
};
