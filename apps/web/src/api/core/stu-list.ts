import type {
  CourseOrderCreateParams,
  CourseOrderInfo,
  CourseOrderUpdateParams,
  PageListType,
  StudentArchiveParams,
  StudentFinishCourseParams,
  StudentQueryParams,
  StudentRegisterParams,
  StudentUpdateParams,
  StuItemInfo,
} from '#/types';

import { requestClient } from '#/api/request';

/**
 * 获取学生列表
 */
export async function getStudentListApi(paramsData: StudentQueryParams) {
  return requestClient.post<PageListType<StuItemInfo[]>>(
    '/student/query',
    paramsData,
  );
}

/**
 * 获取全部学生
 */
export async function getAllStudentListApi() {
  return requestClient.get<StuItemInfo[]>(`/student/getall`);
}

/**
 * 根据课程Id获取学生列表
 */
export async function getStudentListByCourseApi(courseIds: number[]) {
  return requestClient.post<StuItemInfo[]>(`/student/querybycourse`, courseIds);
}

/**
 * 注册学生
 */
export async function createStudentApi(paramsData: StudentRegisterParams) {
  return requestClient.post<StuItemInfo>('/student/create', paramsData);
}

/**
 * 修改学生
 */
export async function updateStudentApi(paramsData: StudentUpdateParams) {
  return requestClient.post<StuItemInfo>('/student/update', paramsData);
}

/**
 * 新增报课单
 */
export async function createCourseOrderApi(
  paramsData: CourseOrderCreateParams,
) {
  return requestClient.post<CourseOrderInfo>(
    '/student/createcourseorder',
    paramsData,
  );
}

/**
 * 修改报课单（其中包括增加报课单内课程）
 */
export async function updateCourseOrderApi(params: CourseOrderUpdateParams) {
  return requestClient.post<CourseOrderInfo>(
    '/student/updatecourseorder',
    params,
  );
}

/**
 * 删除报课单
 */
export async function deleteCourseOrderApi(ids: number[]) {
  return requestClient.post<boolean>(`/student/deletecourseorder`, ids);
}

/**
 * 删除报课单下报读课程
 */
export async function deleteStudentCourseApi(ids: number[]) {
  return requestClient.delete<boolean>(`/student/deletecourse`, ids);
}

/**
 * 报读课程手动结课
 */
export async function finishStudentCourseApi(
  params: StudentFinishCourseParams,
) {
  return requestClient.post<boolean>(`/student/finishcourse`, params);
}

/**
 * 归档/取消归档学生
 */
export async function archiveStudentApi(params: StudentArchiveParams) {
  return requestClient.post<boolean>(`/student/setschedulable`, params);
}

/**
 * 注销学生
 */
export async function deleteStudentApi(ids: number[]) {
  return requestClient.delete<boolean>(`/student/delete`, ids);
}
