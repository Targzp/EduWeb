import type {
  CourseScheduleItem,
  CourseScheduleQueryInfo,
  DeleteCourseScheduleByConditionParams,
  ScheduleBatchCreateCourseByTemplateParams,
  ScheduleBatchCreateCourseParams,
  ScheduleCreateOrUpdateCourseParams,
} from '#/types';

import { requestClient } from '#/api/request';

/**
 * 获取排课信息（按月查询）
 */
export async function getCourseScheduleListApi(
  paramsData: CourseScheduleQueryInfo,
) {
  return requestClient.post<CourseScheduleItem[]>(
    '/courseschedule/query',
    paramsData,
  );
}

/**
 * 创建/编辑排课信息
 */
export async function createOrUpdateCourseScheduleApi(
  paramsData: ScheduleCreateOrUpdateCourseParams[],
) {
  return requestClient.post<CourseScheduleItem[]>(
    '/courseschedule/edit',
    paramsData,
  );
}

/**
 * 批量创建排课日期
 */
export async function batchCreateCourseScheduleApi(
  paramsData: ScheduleBatchCreateCourseParams,
) {
  return requestClient.post<boolean>(
    '/courseschedule/multischedule',
    paramsData,
  );
}

/**
 * 根据模板批量排课
 */
export async function batchCreateCourseScheduleByTemplateApi(
  paramsData: ScheduleBatchCreateCourseByTemplateParams,
) {
  return requestClient.post<boolean>(
    '/courseschedule/templateschedule',
    paramsData,
  );
}

/**
 * 根据Id删除排课信息
 */
export async function deleteCourseScheduleApi(ids: number[]) {
  return requestClient.delete<boolean>('/courseschedule/delete', ids);
}

/**
 * 根据特定条件删除排课信息
 */
export async function deleteCourseScheduleByConditionApi(
  paramsData: DeleteCourseScheduleByConditionParams,
) {
  return requestClient.post<boolean>('/courseschedule/delete', paramsData);
}
