import type {
  CreateTimetableTemplateParams,
  TimetableTemplateItem,
  UpdateTimetableTemplateParams,
} from '#/types';

import { requestClient } from '#/api/request';

/**
 * 获取课表模板列表
 */
export async function getTimetableTemplateListApi() {
  return requestClient.get<TimetableTemplateItem[]>(
    '/coursescheduletemplate/getall',
  );
}

/**
 * 创建课表模板
 */
export async function createTimetableTemplateApi(
  params: CreateTimetableTemplateParams,
) {
  return requestClient.post<TimetableTemplateItem>(
    '/coursescheduletemplate/create',
    params,
  );
}

/**
 * 更新课表模板
 */
export async function updateTimetableTemplateApi(
  params: UpdateTimetableTemplateParams,
) {
  return requestClient.post<TimetableTemplateItem>(
    '/coursescheduletemplate/update',
    params,
  );
}

/**
 * 删除课表模板
 */
export async function deleteTimetableTemplateApi(id: number) {
  return requestClient.delete(`/coursescheduletemplate/delete?id=${id}`);
}
