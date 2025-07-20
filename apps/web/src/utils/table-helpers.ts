/**
 * 表格序号格式化方法
 */
export const tableIndexMethod = (index: number) => {
  return index + 1;
};

/**
 * 表格单元格为控制格式化方法
 */
export const formatTableCell = (_row: any, _column: any, cellValue: any) => {
  if (typeof cellValue === 'number') {
    return cellValue;
  }
  if (Array.isArray(cellValue)) {
    return cellValue.length > 0 ? cellValue.join(',') : '-';
  }
  return cellValue || '-';
};
