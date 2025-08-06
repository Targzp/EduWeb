import dayjs from 'dayjs';

export const formatDate = (
  date: string,
  format: string = 'YYYY-MM-DD HH:mm',
) => {
  return dayjs(date).format(format);
};

/**
 * 检查两个时间范围是否有交集（不包含端点）
 */
export const hasOverlapWithoutAdjacent = (
  start1?: Date,
  end1?: Date,
  start2?: Date,
  end2?: Date,
) => {
  if (!start1 || !end1 || !start2 || !end2) {
    return false;
  }
  // 转换为时间戳便于比较
  const s1 = start1.getTime();
  const e1 = end1.getTime();
  const s2 = start2.getTime();
  const e2 = end2.getTime();

  // 检查时间范围有效性
  if (s1 > e1 || s2 > e2) {
    throw new Error('Invalid time range: start cannot be after end');
  }

  // 基本无交集条件
  if (s1 > e2 || s2 > e1) {
    return false;
  }

  // 检查是否仅为端点相接
  const isAdjacent = e1 === s2 || e2 === s1;

  // 如果是相接情况，检查是否为零长度范围（时间点）
  const isZeroLength1 = s1 === e1; // 第一个范围是时间点
  const isZeroLength2 = s2 === e2; // 第二个范围是时间点

  // 排除非时间点的相接情况
  if (isAdjacent && !(isZeroLength1 || isZeroLength2)) {
    return false;
  }

  // 其他情况都有交集
  return true;
};

/**
 * 按日期排序
 */
export const sortByDate = <T extends Record<string, any>, K extends keyof T>(
  list: T[],
  dateKey: K,
) => {
  return [...list].sort(
    (a, b) => new Date(a[dateKey]).getTime() - new Date(b[dateKey]).getTime(),
  );
};

/**
 * 生成时间范围
 */
export const makeTimeRange = (start: number, end: number) => {
  const result: number[] = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
};

/**
 * 生成统一日期的时间
 */
export const makeUnifiedDate = (unifiedDate: Date, date: Date) => {
  return dayjs(unifiedDate)
    .hour(dayjs(date).hour())
    .minute(dayjs(date).minute())
    .toDate();
};

export const formatRangeTimeWithWeek = (start: Date, end: Date) => {
  return `${dayjs(start).format('YYYY-MM-DD ddd HH:mm')}-${dayjs(end).format('HH:mm')}`;
};
