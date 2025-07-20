import type { Ref } from 'vue';

import { reactive, toRefs } from 'vue';

// 返回值类型
interface ReturnValue {
  total: Ref<number>;
  pageSize: Ref<number>;
  pageSizes: Ref<number[]>;
  pageNo: Ref<number>;
  handleSizeChange: (val: number) => void;
  handleCurrentChange: (val: number) => void;
}

/**
 * 表格分页 Hook 函数
 * @param pageSize 初始分页大小
 * @param getTableData 获取表格数据函数
 * @returns ReturnValue
 */
export const usePagination = (
  pageSize: number,
  getTableData: () => void,
  pageSizes = [10, 20, 30, 40],
): ReturnValue => {
  const pageConfig = reactive({
    total: 0, // 表格数据总条数
    pageSize, // 分页大小
    pageNo: 1, // 当前页号
    pageSizes, // 可选每页大小
  });

  /**
   * 处理分页数变化
   * @param val 分页数
   */
  const handleSizeChange = (val: number) => {
    pageConfig.pageSize = val;
    pageConfig.pageNo = 1;
    getTableData();
  };

  /**
   * 处理页码变化
   * @param val 页码
   */
  const handleCurrentChange = (val: number) => {
    pageConfig.pageNo = val;
    getTableData();
  };

  return {
    ...toRefs(pageConfig),
    handleSizeChange,
    handleCurrentChange,
  };
};
