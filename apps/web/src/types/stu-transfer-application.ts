enum ApprovalStatus {
  Approved = 2, // 通过
  Pending = 0, // 未审批
  Rejected = 1, // 未通过
}

interface ScheduleItem {
  id: number;
  courseName: string;
  courseType: string;
  startDate: string;
  endDate: string;
  createDate: string;
}

/**
 * 申请调课列表项
 */
interface TransferApplicationItem {
  id: number;
  stuId: number;
  stuName: string;
  originSchedule: ScheduleItem;
  approvedSchedule: ScheduleItem;
  approvalStatus: ApprovalStatus;
  toStartTime: string;
  approvalReason: string;
  rejectReason: string;
  createDate: string;
}

/**
 * 申请调课列表查询参数
 */
interface TransferApplicationQueryParams {
  stuIds: number[];
  startDate: null | string;
  endDate: null | string;
  approvalStatus?: ApprovalStatus;
}

/**
 * 申请审批描述列表项
 */
interface TransferApplicationApprovalItem {
  id: number;
  stuName: string;
  createDate: string;
  course: string;
  originDate: string;
  transferDate: string;
  approvalReason: string;
}

/**
 * 审批调课申请参数
 */
interface ApproveApplicationParams {
  approvalId: number;
  isGrant: boolean;
  rejectResaon: string;
}

export type {
  ApproveApplicationParams,
  TransferApplicationApprovalItem,
  TransferApplicationItem,
  TransferApplicationQueryParams,
};

export { ApprovalStatus };
