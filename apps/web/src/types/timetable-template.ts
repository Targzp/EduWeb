import type { TeacherItemInfo } from './teacher-list';

enum WeekType {
  FRIDAY = 'fri',
  MONDAY = 'mon',
  SATURDAY = 'sat',
  SUNDAY = 'sun',
  THURSDAY = 'thu',
  TUESDAY = 'tue',
  WEDNESDAY = 'wed',
}

/**
 * 模板排课时间段项
 */
interface TemplateSchesItem {
  id: number;
  startTime: string;
  endTime: string;
  courseId: number;
  courseType: string;
  courseName: string;
  teacherId: number;
  teacherName: string;
}

/**
 * 课表模板列表项
 */
interface TimetableTemplateItem {
  id: number;
  name: string;
  notes: string;
  sun: boolean;
  mon: boolean;
  tue: boolean;
  wed: boolean;
  thu: boolean;
  fri: boolean;
  sat: boolean;
  sches: TemplateSchesItem[];
  createDate: string;
}

/**
 * 课表模板表单内课程项
 */
interface TimetableTemplateCourseItem {
  id?: number;
  timeRange: [Date?, Date?];
  courseId?: number;
  courseName?: string;
  courseType?: string;
  teacherId?: number;
  teacherName?: string;
  teacherList: TeacherItemInfo[];
  isEdit?: boolean;
  isNew?: boolean;
}

/**
 * 课表模板表单项
 */
interface TimetableTemplateFormData {
  name: string;
  weeks: string[];
  notes: string;
  courses: TimetableTemplateCourseItem[];
}

/**
 * 创建课表模板参数类型
 */
interface CreateTimetableTemplateParams
  extends Omit<TimetableTemplateItem, 'createDate' | 'id' | 'sches'> {
  sches: Omit<
    TemplateSchesItem,
    'courseName' | 'courseType' | 'id' | 'teacherName'
  >[];
}

/**
 * 更新课表模板参数类型
 */
interface UpdateTimetableTemplateParams
  extends Omit<TimetableTemplateItem, 'createDate' | 'sches'> {
  sches: Omit<TemplateSchesItem, 'courseName' | 'courseType' | 'teacherName'>[];
}

export type {
  CreateTimetableTemplateParams,
  TemplateSchesItem,
  TimetableTemplateCourseItem,
  TimetableTemplateFormData,
  TimetableTemplateItem,
  UpdateTimetableTemplateParams,
};

export { WeekType };
