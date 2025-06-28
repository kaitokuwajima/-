export const LEAVE_TYPES = {
  DAY_OFF: '休み',
  AM_OFF: '午前休み',
  PM_OFF: '午後休み',
  PAID_LEAVE: '有給',
  AM_PAID_LEAVE: '午前有給',
  PM_PAID_LEAVE: '午後有給',
  COMMENT: '共有コメント',
} as const;

export type LeaveType = typeof LEAVE_TYPES[keyof typeof LEAVE_TYPES];

export interface LeaveRequest {
  id: string;
  date: string; // YYYY-MM-DD format
  employeeName: string;
  type: LeaveType;
  comment?: string;
}
