import type {
  CourseItemCeParams,
  CourseItemInfo,
  ExchangeRowType,
} from '#/types';

import { requestClient } from '#/api/request';

/**
 * 获取课程列表
 */
export async function getCourseListApi() {
  return requestClient.get<CourseItemInfo[]>('/course/getall');
}

/**
 * 创建课程
 */
export async function createCourseApi(paramsData: CourseItemCeParams) {
  return requestClient.post<CourseItemInfo[]>('/course/create', paramsData);
}

/**
 * 修改课程
 */
export async function updateCourseApi(paramsData: CourseItemCeParams) {
  return requestClient.post<CourseItemInfo[]>('/course/update', paramsData);
}

/**
 * 删除课程
 */
export async function deleteCourseApi(id: string) {
  return requestClient.delete(`/course/delete?id=${id}`);
}

/**
 * 交换两条课程的排序
 */
export async function exchangeCourseApi(paramsData: ExchangeRowType) {
  return requestClient.post<boolean>('/course/exchangesortorder', paramsData);
}
