import type {
  ApproveApplicationParams,
  PageListType,
  TransferApplicationItem,
  TransferApplicationQueryParams,
} from '#/types';

import { requestClient } from '#/api/request';

/**
 * 获取调课申请列表
 */
export async function getTransferApplicationListApi(
  paramsData: TransferApplicationQueryParams,
) {
  return requestClient.post<PageListType<TransferApplicationItem[]>>(
    '/coursescheduleapproval/query',
    paramsData,
  );
}

/**
 * 审批调课申请
 */
export async function approveTransferApplicationApi(
  paramsData: ApproveApplicationParams,
) {
  return requestClient.post<boolean>(
    '/coursescheduleapproval/approve',
    paramsData,
  );
}

/**
 * 删除调课申请
 */
export async function deleteTransferApplicationApi(id: number) {
  return requestClient.delete<boolean>(
    `/coursescheduleapproval/delete?id=${id}`,
  );
}
