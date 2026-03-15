// ---- 休み管理 ----
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
  date: string; // YYYY-MM-DD
  employeeName: string;
  type: LeaveType;
  comment?: string;
}

// ---- タスク管理 ----
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  dueDate?: string;
  createdAt: string;
}

// ---- 従業員管理 ----
export type EmploymentType = 'full_time' | 'contract' | 'part_time' | 'intern';

export interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
  email?: string;
  phone?: string;
  joinDate?: string;
  employmentType?: EmploymentType;
  status: 'active' | 'leave' | 'resigned';
  notes?: string;
  createdAt: string;
}

// ---- ナビゲーション ----
export type ViewType = 'dashboard' | 'calendar' | 'tasks' | 'employees';
