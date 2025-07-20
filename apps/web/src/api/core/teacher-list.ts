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
