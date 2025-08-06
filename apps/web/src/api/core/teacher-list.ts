import type {
  PageListType,
  TeacherItemCeParams,
  TeacherItemInfo,
  TeacherQueryParams,
} from '#/types';

import { requestClient } from '#/api/request';

/**
 * 获取教师列表
 */
export async function getTeacherListApi(paramsData: TeacherQueryParams) {
  return requestClient.post<PageListType<TeacherItemInfo[]>>(
    '/teacher/query',
    paramsData,
  );
}

/**
 * 获取全部教师列表
 */
export async function getAllTeacherListApi() {
  return requestClient.get<TeacherItemInfo[]>('/teacher/getall');
}

/**
 * 根据课程Id获取教师列表
 */
export async function getTeacherListByCourseApi(courseId: number) {
  return requestClient.post<TeacherItemInfo[]>(
    `/teacher/querybycourse?courseId=${courseId}`,
  );
}

/**
 * 注册教师
 */
export async function createTeacherApi(paramsData: TeacherItemCeParams) {
  return requestClient.post<TeacherItemInfo>('/teacher/create', paramsData);
}

/**
 * 修改教师
 */
export async function updateTeacherApi(paramsData: TeacherItemCeParams) {
  return requestClient.post<TeacherItemInfo>('/teacher/update', paramsData);
}

/**
 * 注销教师
 */
export async function deleteTeacherApi(ids: number[]) {
  return requestClient.delete(`/teacher/delete`, ids);
}
