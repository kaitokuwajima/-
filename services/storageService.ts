import { LeaveRequest, LeaveType, LEAVE_TYPES, Task, Employee } from '../types.ts';

function getTodayPlusDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  { id: '1', date: getTodayPlusDays(2), employeeName: '佐藤', type: LEAVE_TYPES.PAID_LEAVE },
  { id: '2', date: getTodayPlusDays(2), employeeName: '鈴木', type: LEAVE_TYPES.AM_OFF },
  { id: '3', date: getTodayPlusDays(5), employeeName: '高橋', type: LEAVE_TYPES.DAY_OFF },
  { id: '4', date: getTodayPlusDays(10), employeeName: '田中', type: LEAVE_TYPES.PM_PAID_LEAVE },
  { id: '5', date: getTodayPlusDays(10), employeeName: '伊藤', type: LEAVE_TYPES.COMMENT, comment: 'リモートワーク' },
  { id: '6', date: getTodayPlusDays(-1), employeeName: '渡辺', type: LEAVE_TYPES.PAID_LEAVE },
];

const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: '月次レポートの作成',
    description: '先月の業績をまとめてレポートを作成する',
    status: 'in_progress',
    priority: 'high',
    assignee: '山田',
    dueDate: getTodayPlusDays(3),
    createdAt: new Date().toISOString(),
  },
  {
    id: 't2',
    title: '備品の発注',
    description: 'コピー用紙・ボールペンなど事務用品の補充',
    status: 'todo',
    priority: 'low',
    assignee: '佐藤',
    dueDate: getTodayPlusDays(7),
    createdAt: new Date().toISOString(),
  },
  {
    id: 't3',
    title: 'スタッフ研修の準備',
    description: '来月の研修用資料の作成と会場手配',
    status: 'todo',
    priority: 'medium',
    assignee: '高橋',
    dueDate: getTodayPlusDays(14),
    createdAt: new Date().toISOString(),
  },
  {
    id: 't4',
    title: '設備点検の対応',
    description: '年次設備点検の立ち合いと記録',
    status: 'done',
    priority: 'medium',
    assignee: '鈴木',
    dueDate: getTodayPlusDays(-5),
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'e1',
    name: '山田 太郎',
    department: '営業部',
    role: 'マネージャー',
    email: 'taro.yamada@example.com',
    phone: '090-1111-2222',
    joinDate: '2020-04-01',
    employmentType: 'full_time',
    status: 'active',
    notes: 'チームリーダー',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'e2',
    name: '鈴木 花子',
    department: '人事部',
    role: '採用担当',
    email: 'hanako.suzuki@example.com',
    phone: '080-3333-4444',
    joinDate: '2022-10-01',
    employmentType: 'contract',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'e3',
    name: '佐藤 健',
    department: '開発部',
    role: 'フロントエンドエンジニア',
    email: 'ken.sato@example.com',
    joinDate: '2024-04-01',
    employmentType: 'intern',
    status: 'leave',
    notes: '育児休業中',
    createdAt: new Date().toISOString(),
  },
];

const KEYS = {
  LEAVES: 'dashboard_leaves',
  TASKS: 'dashboard_tasks',
  EMPLOYEES: 'dashboard_employees',
};

function loadFromStorage<T>(key: string, initial: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return initial;
    return JSON.parse(raw) as T[];
  } catch {
    return initial;
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export const getLeaveRequests = async (): Promise<LeaveRequest[]> => {
  await new Promise(r => setTimeout(r, 100));
  return loadFromStorage<LeaveRequest>(KEYS.LEAVES, INITIAL_LEAVE_REQUESTS);
};

export const addLeaveEntry = async (
  date: string,
  employeeName: string,
  type: LeaveType,
  comment?: string,
): Promise<LeaveRequest> => {
  if (!employeeName.trim()) throw new Error('従業員の名前は空にできません。');
  const requests = loadFromStorage<LeaveRequest>(KEYS.LEAVES, INITIAL_LEAVE_REQUESTS);
  const newRequest: LeaveRequest = {
    id: generateId(),
    date,
    employeeName,
    type,
    ...(comment && { comment }),
  };
  const updated = [...requests, newRequest].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  saveToStorage(KEYS.LEAVES, updated);
  return newRequest;
};

export const deleteLeaveEntry = async (id: string): Promise<{ id: string }> => {
  const requests = loadFromStorage<LeaveRequest>(KEYS.LEAVES, INITIAL_LEAVE_REQUESTS);
  const updated = requests.filter(r => r.id !== id);
  if (updated.length === requests.length) throw new Error('削除対象が見つかりませんでした。');
  saveToStorage(KEYS.LEAVES, updated);
  return { id };
};

export const getTasks = async (): Promise<Task[]> => {
  await new Promise(r => setTimeout(r, 100));
  return loadFromStorage<Task>(KEYS.TASKS, INITIAL_TASKS);
};

export const addTask = async (data: Omit<Task, 'id' | 'createdAt'>): Promise<Task> => {
  const tasks = loadFromStorage<Task>(KEYS.TASKS, INITIAL_TASKS);
  const newTask: Task = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  saveToStorage(KEYS.TASKS, [...tasks, newTask]);
  return newTask;
};

export const updateTask = async (id: string, data: Partial<Task>): Promise<Task> => {
  const tasks = loadFromStorage<Task>(KEYS.TASKS, INITIAL_TASKS);
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) throw new Error('タスクが見つかりませんでした。');
  tasks[idx] = { ...tasks[idx], ...data };
  saveToStorage(KEYS.TASKS, tasks);
  return tasks[idx];
};

export const deleteTask = async (id: string): Promise<void> => {
  const tasks = loadFromStorage<Task>(KEYS.TASKS, INITIAL_TASKS);
  const updated = tasks.filter(t => t.id !== id);
  if (updated.length === tasks.length) throw new Error('タスクが見つかりませんでした。');
  saveToStorage(KEYS.TASKS, updated);
};

export const getEmployees = async (): Promise<Employee[]> => {
  await new Promise(r => setTimeout(r, 100));
  return loadFromStorage<Employee>(KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
};

export const addEmployee = async (data: Omit<Employee, 'id' | 'createdAt'>): Promise<Employee> => {
  const employees = loadFromStorage<Employee>(KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
  const newEmployee: Employee = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  saveToStorage(KEYS.EMPLOYEES, [...employees, newEmployee]);
  return newEmployee;
};

export const updateEmployee = async (id: string, data: Partial<Employee>): Promise<Employee> => {
  const employees = loadFromStorage<Employee>(KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
  const idx = employees.findIndex(e => e.id === id);
  if (idx === -1) throw new Error('従業員が見つかりませんでした。');
  employees[idx] = { ...employees[idx], ...data };
  saveToStorage(KEYS.EMPLOYEES, employees);
  return employees[idx];
};

export const deleteEmployee = async (id: string): Promise<void> => {
  const employees = loadFromStorage<Employee>(KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
  const updated = employees.filter(e => e.id !== id);
  if (updated.length === employees.length) throw new Error('従業員が見つかりませんでした。');
  saveToStorage(KEYS.EMPLOYEES, updated);
};
