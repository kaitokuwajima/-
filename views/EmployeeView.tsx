import React, { useState, useEffect, useCallback } from 'react';
import { Employee, EmploymentType, EmployeeStatus } from '../types.ts';
import {
  getEmployees, addEmployee, updateEmployee, deleteEmployee,
  getLeaveRequests, getTasks,
} from '../services/storageService.ts';
import { downloadEmployeeExcel } from '../services/excelService.ts';

const EMPLOYMENT_TYPES: EmploymentType[] = ['正社員', 'パート', 'アルバイト', '契約社員'];
const EMPLOYEE_STATUSES: EmployeeStatus[] = ['在職', '休職', '退職'];

const STATUS_STYLE: Record<EmployeeStatus, string> = {
  在職: 'bg-green-100 text-green-700',
  休職: 'bg-yellow-100 text-yellow-700',
  退職: 'bg-gray-100 text-gray-500',
};

// ---- フォーム ----
interface EmployeeFormData {
  employeeCode: string;
  name: string;
  nameKana: string;
  department: string;
  position: string;
  employmentType: EmploymentType;
  hireDate: string;
  birthDate: string;
  phone: string;
  email: string;
  paidLeaveDays: number;
  usedLeaveDays: number;
  status: EmployeeStatus;
  notes: string;
}

const emptyForm = (): EmployeeFormData => ({
  employeeCode: '', name: '', nameKana: '', department: '', position: '',
  employmentType: '正社員', hireDate: '', birthDate: '', phone: '', email: '',
  paidLeaveDays: 20, usedLeaveDays: 0, status: '在職', notes: '',
});

interface EmployeeFormProps {
  initial?: Partial<EmployeeFormData>;
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ initial, onSubmit, onCancel, submitLabel }) => {
  const [form, setForm] = useState<EmployeeFormData>({ ...emptyForm(), ...initial });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof EmployeeFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
      setForm(prev => ({ ...prev, [k]: val }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('氏名は必須です。'); return; }
    if (!form.employeeCode.trim()) { setError('社員番号は必須です。'); return; }
    setIsSaving(true);
    try { await onSubmit(form); }
    catch { setError('保存に失敗しました。'); }
    finally { setIsSaving(false); }
  };

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">社員番号 <span className="text-red-500">*</span></label>
          <input className={inputCls} value={form.employeeCode} onChange={set('employeeCode')} placeholder="EMP001" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">氏名 <span className="text-red-500">*</span></label>
          <input className={inputCls} value={form.name} onChange={set('name')} placeholder="山田 太郎" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">フリガナ</label>
          <input className={inputCls} value={form.nameKana} onChange={set('nameKana')} placeholder="ヤマダ タロウ" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">部署</label>
          <input className={inputCls} value={form.department} onChange={set('department')} placeholder="総務部" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">役職</label>
          <input className={inputCls} value={form.position} onChange={set('position')} placeholder="主任" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">雇用形態</label>
          <select className={inputCls} value={form.employmentType} onChange={set('employmentType')}>
            {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">入社日</label>
          <input type="date" className={inputCls} value={form.hireDate} onChange={set('hireDate')} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">生年月日</label>
          <input type="date" className={inputCls} value={form.birthDate} onChange={set('birthDate')} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">電話番号</label>
          <input className={inputCls} value={form.phone} onChange={set('phone')} placeholder="090-0000-0000" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">メールアドレス</label>
          <input type="email" className={inputCls} value={form.email} onChange={set('email')} placeholder="example@company.com" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">付与有給日数</label>
          <input type="number" min={0} className={inputCls} value={form.paidLeaveDays} onChange={set('paidLeaveDays')} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">使用有給日数</label>
          <input type="number" min={0} className={inputCls} value={form.usedLeaveDays} onChange={set('usedLeaveDays')} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">在籍状態</label>
          <select className={inputCls} value={form.status} onChange={set('status')}>
            {EMPLOYEE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">備考</label>
        <textarea className={inputCls} value={form.notes} onChange={set('notes')} rows={3} placeholder="特記事項など" />
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">
          キャンセル
        </button>
        <button type="submit" disabled={isSaving} className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300">
          {isSaving ? '保存中...' : submitLabel}
        </button>
      </div>
    </form>
  );
};

// ---- 従業員カード ----
interface EmployeeCardProps {
  employee: Employee;
  onEdit: (e: Employee) => void;
  onDelete: (id: string) => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onEdit, onDelete }) => {
  const remaining = employee.paidLeaveDays - employee.usedLeaveDays;
  const leaveRatio = employee.paidLeaveDays > 0 ? (employee.usedLeaveDays / employee.paidLeaveDays) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border hover:shadow transition-shadow p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {employee.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-gray-800">{employee.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLE[employee.status]}`}>
                {employee.status}
              </span>
            </div>
            <p className="text-xs text-gray-400">{employee.nameKana}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onEdit(employee)} className="p-1 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50" title="編集">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button onClick={() => onDelete(employee.id)} className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50" title="削除">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
        <span className="text-gray-700 font-medium">{employee.department} / {employee.position}</span>
        <span>{employee.employmentType}</span>
        <span>社員番号: {employee.employeeCode}</span>
        {employee.hireDate && <span>入社: {employee.hireDate}</span>}
        {employee.phone && <span>{employee.phone}</span>}
        {employee.email && <span className="truncate col-span-2">{employee.email}</span>}
      </div>

      {/* 有給バー */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>有給 {employee.usedLeaveDays}/{employee.paidLeaveDays}日使用</span>
          <span className={remaining <= 3 ? 'text-red-500 font-medium' : 'text-green-600 font-medium'}>残 {remaining}日</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${leaveRatio >= 80 ? 'bg-red-400' : leaveRatio >= 50 ? 'bg-yellow-400' : 'bg-green-400'}`}
            style={{ width: `${Math.min(leaveRatio, 100)}%` }}
          />
        </div>
      </div>

      {employee.notes && (
        <p className="mt-2 text-xs text-gray-400 bg-gray-50 rounded p-2 line-clamp-2">{employee.notes}</p>
      )}
    </div>
  );
};

// ---- メインビュー ----
const EmployeeView: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState<EmployeeStatus | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const load = useCallback(async () => {
    const data = await getEmployees();
    setEmployees(data);
    setIsLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (form: EmployeeFormData) => {
    await addEmployee({
      employeeCode: form.employeeCode,
      name: form.name,
      nameKana: form.nameKana,
      department: form.department,
      position: form.position,
      employmentType: form.employmentType,
      hireDate: form.hireDate,
      birthDate: form.birthDate || undefined,
      phone: form.phone || undefined,
      email: form.email || undefined,
      paidLeaveDays: form.paidLeaveDays,
      usedLeaveDays: form.usedLeaveDays,
      status: form.status,
      notes: form.notes || undefined,
    });
    setShowForm(false);
    await load();
  };

  const handleEdit = async (form: EmployeeFormData) => {
    if (!editingEmployee) return;
    await updateEmployee(editingEmployee.id, {
      employeeCode: form.employeeCode,
      name: form.name,
      nameKana: form.nameKana,
      department: form.department,
      position: form.position,
      employmentType: form.employmentType,
      hireDate: form.hireDate,
      birthDate: form.birthDate || undefined,
      phone: form.phone || undefined,
      email: form.email || undefined,
      paidLeaveDays: form.paidLeaveDays,
      usedLeaveDays: form.usedLeaveDays,
      status: form.status,
      notes: form.notes || undefined,
    });
    setEditingEmployee(null);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この従業員情報を削除しますか?')) return;
    await deleteEmployee(id);
    await load();
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const [leaves, tasks] = await Promise.all([getLeaveRequests(), getTasks()]);
      downloadEmployeeExcel(employees, leaves, tasks);
    } finally {
      setIsExporting(false);
    }
  };

  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];

  const filtered = employees.filter(e => {
    const matchSearch = !search || e.name.includes(search) || e.nameKana.includes(search) || e.employeeCode.includes(search);
    const matchDept = !filterDept || e.department === filterDept;
    const matchStatus = !filterStatus || e.status === filterStatus;
    return matchSearch && matchDept && matchStatus;
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">従業員管理</h1>
          <p className="text-sm text-gray-500 mt-1">
            全 {employees.length} 名
            <span className="ml-2">在職 {employees.filter(e => e.status === '在職').length} 名</span>
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-emerald-300 text-sm font-medium shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="11" x2="12" y2="17" />
              <polyline points="9 14 12 17 15 14" />
            </svg>
            {isExporting ? 'エクスポート中...' : 'Excelでダウンロード'}
          </button>
          <button
            onClick={() => { setEditingEmployee(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            従業員を追加
          </button>
        </div>
      </div>

      {/* フィルター */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="氏名・カナ・社員番号で検索"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <select
          value={filterDept}
          onChange={e => setFilterDept(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">全部署</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as EmployeeStatus | '')}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">全状態</option>
          {EMPLOYEE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* フォーム */}
      {(showForm || editingEmployee) && (
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-indigo-500">
          <h3 className="font-bold text-gray-800 mb-4">{editingEmployee ? '従業員情報を編集' : '新規従業員登録'}</h3>
          <EmployeeForm
            initial={editingEmployee ? {
              employeeCode: editingEmployee.employeeCode,
              name: editingEmployee.name,
              nameKana: editingEmployee.nameKana,
              department: editingEmployee.department,
              position: editingEmployee.position,
              employmentType: editingEmployee.employmentType,
              hireDate: editingEmployee.hireDate,
              birthDate: editingEmployee.birthDate || '',
              phone: editingEmployee.phone || '',
              email: editingEmployee.email || '',
              paidLeaveDays: editingEmployee.paidLeaveDays,
              usedLeaveDays: editingEmployee.usedLeaveDays,
              status: editingEmployee.status,
              notes: editingEmployee.notes || '',
            } : undefined}
            onSubmit={editingEmployee ? handleEdit : handleAdd}
            onCancel={() => { setShowForm(false); setEditingEmployee(null); }}
            submitLabel={editingEmployee ? '更新する' : '登録する'}
          />
        </div>
      )}

      {/* 従業員リスト */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow">
          <p className="text-gray-400 text-lg">{search || filterDept || filterStatus ? '該当する従業員が見つかりません' : '従業員情報がありません'}</p>
          <p className="text-gray-300 text-sm mt-1">「従業員を追加」ボタンで登録してください</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(emp => (
            <EmployeeCard
              key={emp.id}
              employee={emp}
              onEdit={(e) => { setShowForm(false); setEditingEmployee(e); }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeView;
