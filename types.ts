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

// ---- 患者情報 ----
export type PatientGender = 'male' | 'female' | 'other';

export interface Patient {
  id: string;
  name: string;
  nameKana?: string;
  birthDate?: string;
  gender?: PatientGender;
  phone?: string;
  address?: string;
  notes?: string;
  lastVisit?: string;
  nextAppointment?: string;
  createdAt: string;
}

// ---- ナビゲーション ----
export type ViewType = 'dashboard' | 'calendar' | 'tasks' | 'patients';
