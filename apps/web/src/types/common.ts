/**
 * 分页查询参数
 */
interface PageQueryParams {
  pageNumber: number;
  pageSize: number;
}

/**
 * 分页列表类型
 */
interface PageListType<T> {
  data: T;
  totalCount: number;
}

/**
 * 表格中交换两行数据类型
 */
interface ExchangeRowType {
  id1: number;
  id2: number;
}

export type { ExchangeRowType, PageListType, PageQueryParams };
