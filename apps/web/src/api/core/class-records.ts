import type {
  PageListType,
  StudentRecordItem,
  StudentRecordQueryParams,
  TeacherRecordItem,
  TeacherRecordQueryParams,
} from '#/types';

import { requestClient } from '#/api/request';

/**
 * 获取教师上课记录列表
 */
export async function getTeacherRecordListApi(
  paramsData: TeacherRecordQueryParams,
) {
  return requestClient.post<PageListType<TeacherRecordItem[]>>(
    '/courseschedule/queryteacherhistory',
    paramsData,
  );
}

/**
 * 获取学生上课记录列表
 */
export async function getStudentRecordListApi(
  paramsData: StudentRecordQueryParams,
) {
  return requestClient.post<PageListType<StudentRecordItem[]>>(
    '/courseschedule/querystudenthistory',
    paramsData,
  );
}

/**
 * 手动核对上课记录
 */
export async function verifyRecordApi(id: number) {
  return requestClient.post<boolean>(
    `/courseschedule/verifyteacherhistory?courseScheduleId=${id}`,
  );
}
