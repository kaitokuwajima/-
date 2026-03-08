import { LeaveRequest, LeaveType, LEAVE_TYPES, Task, TaskStatus, TaskPriority, Patient, Employee, EmploymentType, EmployeeStatus } from '../types.ts';

// ---- ヘルパー ----
function getTodayPlusDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---- 初期データ ----
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

const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'p1',
    name: '田中 花子',
    nameKana: 'タナカ ハナコ',
    birthDate: '1975-04-15',
    gender: 'female',
    phone: '090-1234-5678',
    address: '東京都新宿区...',
    notes: 'アレルギー: ペニシリン',
    lastVisit: getTodayPlusDays(-7),
    nextAppointment: getTodayPlusDays(14),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p2',
    name: '鈴木 一郎',
    nameKana: 'スズキ イチロウ',
    birthDate: '1960-09-22',
    gender: 'male',
    phone: '080-9876-5432',
    address: '東京都渋谷区...',
    notes: '高血圧・要経過観察',
    lastVisit: getTodayPlusDays(-3),
    nextAppointment: getTodayPlusDays(28),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p3',
    name: '山本 美咲',
    nameKana: 'ヤマモト ミサキ',
    birthDate: '1990-01-30',
    gender: 'female',
    phone: '070-1111-2222',
    lastVisit: getTodayPlusDays(-14),
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'e1',
    employeeCode: 'EMP001',
    name: '佐藤 太郎',
    nameKana: 'サトウ タロウ',
    department: '総務部',
    position: '主任',
    employmentType: '正社員',
    hireDate: '2018-04-01',
    birthDate: '1985-07-20',
    phone: '090-1111-2222',
    email: 'sato@example.com',
    paidLeaveDays: 20,
    usedLeaveDays: 5,
    status: '在職',
  },
  {
    id: 'e2',
    employeeCode: 'EMP002',
    name: '鈴木 花子',
    nameKana: 'スズキ ハナコ',
    department: '看護部',
    position: '看護師',
    employmentType: '正社員',
    hireDate: '2020-04-01',
    birthDate: '1992-03-15',
    phone: '090-3333-4444',
    email: 'suzuki@example.com',
    paidLeaveDays: 18,
    usedLeaveDays: 3,
    status: '在職',
  },
  {
    id: 'e3',
    employeeCode: 'EMP003',
    name: '高橋 次郎',
    nameKana: 'タカハシ ジロウ',
    department: '医療技術部',
    position: '技師',
    employmentType: '正社員',
    hireDate: '2019-07-01',
    birthDate: '1988-11-03',
    phone: '080-5555-6666',
    email: 'takahashi@example.com',
    paidLeaveDays: 20,
    usedLeaveDays: 8,
    status: '在職',
  },
  {
    id: 'e4',
    employeeCode: 'EMP004',
    name: '田中 美咲',
    nameKana: 'タナカ ミサキ',
    department: '看護部',
    position: '看護師',
    employmentType: 'パート',
    hireDate: '2022-01-15',
    birthDate: '1995-05-28',
    phone: '070-7777-8888',
    paidLeaveDays: 10,
    usedLeaveDays: 2,
    status: '在職',
  },
  {
    id: 'e5',
    employeeCode: 'EMP005',
    name: '伊藤 健',
    nameKana: 'イトウ ケン',
    department: '総務部',
    position: '部長',
    employmentType: '正社員',
    hireDate: '2010-04-01',
    birthDate: '1975-09-10',
    phone: '090-9999-0000',
    email: 'ito@example.com',
    paidLeaveDays: 20,
    usedLeaveDays: 12,
    status: '在職',
  },
  {
    id: 'e6',
    employeeCode: 'EMP006',
    name: '渡辺 里奈',
    nameKana: 'ワタナベ リナ',
    department: '受付',
    position: '受付スタッフ',
    employmentType: 'パート',
    hireDate: '2023-04-01',
    birthDate: '2000-02-14',
    phone: '080-2222-3333',
    paidLeaveDays: 10,
    usedLeaveDays: 1,
    status: '在職',
    notes: '産休予定あり',
  },
];

// ---- ストレージキー ----
const KEYS = {
  LEAVES: 'dashboard_leaves',
  TASKS: 'dashboard_tasks',
  PATIENTS: 'dashboard_patients',
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

// ---- 休み管理 ----
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
    new Date(a.date).getTime() - new Date(b.date).getTime()
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

// ---- タスク管理 ----
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

// ---- 患者情報 ----
export const getPatients = async (): Promise<Patient[]> => {
  await new Promise(r => setTimeout(r, 100));
  return loadFromStorage<Patient>(KEYS.PATIENTS, INITIAL_PATIENTS);
};

export const addPatient = async (data: Omit<Patient, 'id' | 'createdAt'>): Promise<Patient> => {
  const patients = loadFromStorage<Patient>(KEYS.PATIENTS, INITIAL_PATIENTS);
  const newPatient: Patient = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  saveToStorage(KEYS.PATIENTS, [...patients, newPatient]);
  return newPatient;
};

export const updatePatient = async (id: string, data: Partial<Patient>): Promise<Patient> => {
  const patients = loadFromStorage<Patient>(KEYS.PATIENTS, INITIAL_PATIENTS);
  const idx = patients.findIndex(p => p.id === id);
  if (idx === -1) throw new Error('患者が見つかりませんでした。');
  patients[idx] = { ...patients[idx], ...data };
  saveToStorage(KEYS.PATIENTS, patients);
  return patients[idx];
};

export const deletePatient = async (id: string): Promise<void> => {
  const patients = loadFromStorage<Patient>(KEYS.PATIENTS, INITIAL_PATIENTS);
  const updated = patients.filter(p => p.id !== id);
  if (updated.length === patients.length) throw new Error('患者が見つかりませんでした。');
  saveToStorage(KEYS.PATIENTS, updated);
};

// ---- 従業員情報 ----
export const getEmployees = async (): Promise<Employee[]> => {
  await new Promise(r => setTimeout(r, 100));
  return loadFromStorage<Employee>(KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
};

export const addEmployee = async (data: Omit<Employee, 'id'>): Promise<Employee> => {
  const employees = loadFromStorage<Employee>(KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
  const newEmployee: Employee = { ...data, id: generateId() };
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
