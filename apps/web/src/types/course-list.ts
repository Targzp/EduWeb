/**
 * 课程列表项
 */
interface CourseItemInfo {
  id: number;
  name: string;
  type: string;
  notes: string;
  sortOrder: number;
}

/**
 * 创建及编辑课程参数
 */
interface CourseItemCeParams {
  id?: number;
  name: string;
  type: string;
  notes: string;
}

export type { CourseItemCeParams, CourseItemInfo };
