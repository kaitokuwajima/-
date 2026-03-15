import React, { useState, useEffect, useCallback } from 'react';
import { Employee, EmploymentType } from '../types.ts';
import { getEmployees, addEmployee, updateEmployee, deleteEmployee } from '../services/storageService.ts';

const EMPLOYMENT_LABEL: Record<EmploymentType, string> = {
  full_time: '正社員',
  contract: '契約社員',
  part_time: 'パート',
  intern: 'インターン',
};

const STATUS_LABEL: Record<Employee['status'], string> = {
  active: '在籍',
  leave: '休職',
  resigned: '退職',
};

interface EmployeeFormData {
  name: string;
  department: string;
  role: string;
  email: string;
  phone: string;
  joinDate: string;
  employmentType: EmploymentType | '';
  status: Employee['status'];
  notes: string;
}

const emptyForm = (): EmployeeFormData => ({
  name: '',
  department: '',
  role: '',
  email: '',
  phone: '',
  joinDate: '',
  employmentType: '',
  status: 'active',
  notes: '',
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
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.department.trim() || !form.role.trim()) {
      setError('氏名・部署・役職は必須です。');
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit(form);
    } catch {
      setError('保存に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">氏名 <span className="text-red-500">*</span></label>
          <input className={inputCls} value={form.name} onChange={set('name')} placeholder="山田 太郎" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">部署 <span className="text-red-500">*</span></label>
          <input className={inputCls} value={form.department} onChange={set('department')} placeholder="営業部" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">役職 <span className="text-red-500">*</span></label>
          <input className={inputCls} value={form.role} onChange={set('role')} placeholder="マネージャー" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">雇用形態</label>
          <select className={inputCls} value={form.employmentType} onChange={set('employmentType')}>
            <option value="">選択してください</option>
            <option value="full_time">正社員</option>
            <option value="contract">契約社員</option>
            <option value="part_time">パート</option>
            <option value="intern">インターン</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">メールアドレス</label>
          <input className={inputCls} value={form.email} onChange={set('email')} placeholder="example@company.com" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">電話番号</label>
          <input className={inputCls} value={form.phone} onChange={set('phone')} placeholder="090-0000-0000" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">入社日</label>
          <input type="date" className={inputCls} value={form.joinDate} onChange={set('joinDate')} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">在籍ステータス</label>
          <select className={inputCls} value={form.status} onChange={set('status')}>
            <option value="active">在籍</option>
            <option value="leave">休職</option>
            <option value="resigned">退職</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">メモ</label>
        <textarea className={inputCls} value={form.notes} onChange={set('notes')} rows={3} placeholder="備考を入力" />
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

interface EmployeeViewProps {
  onEmployeeDataChange: (employees: Employee[]) => void;
}

const EmployeeView: React.FC<EmployeeViewProps> = ({ onEmployeeDataChange }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const load = useCallback(async () => {
    const data = await getEmployees();
    setEmployees(data);
    onEmployeeDataChange(data);
    setIsLoading(false);
  }, [onEmployeeDataChange]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (form: EmployeeFormData) => {
    await addEmployee({
      name: form.name,
      department: form.department,
      role: form.role,
      email: form.email || undefined,
      phone: form.phone || undefined,
      joinDate: form.joinDate || undefined,
      employmentType: (form.employmentType as EmploymentType) || undefined,
      status: form.status,
      notes: form.notes || undefined,
    });
    setShowForm(false);
    await load();
  };

  const handleEdit = async (form: EmployeeFormData) => {
    if (!editingEmployee) return;
    await updateEmployee(editingEmployee.id, {
      name: form.name,
      department: form.department,
      role: form.role,
      email: form.email || undefined,
      phone: form.phone || undefined,
      joinDate: form.joinDate || undefined,
      employmentType: (form.employmentType as EmploymentType) || undefined,
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

  const filtered = employees.filter(e =>
    e.name.includes(query) || e.department.includes(query) || e.role.includes(query) || (e.email && e.email.includes(query)),
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">従業員管理</h1>
          <p className="text-sm text-gray-500 mt-1">全 {employees.length} 名</p>
        </div>
        <button
          onClick={() => { setEditingEmployee(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm"
        >
          従業員を追加
        </button>
      </div>

      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="氏名・部署・役職・メールで検索"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />

      {(showForm || editingEmployee) && (
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-emerald-500">
          <h3 className="font-bold text-gray-800 mb-4">{editingEmployee ? '従業員情報を編集' : '新規従業員登録'}</h3>
          <EmployeeForm
            initial={editingEmployee ? {
              name: editingEmployee.name,
              department: editingEmployee.department,
              role: editingEmployee.role,
              email: editingEmployee.email || '',
              phone: editingEmployee.phone || '',
              joinDate: editingEmployee.joinDate || '',
              employmentType: editingEmployee.employmentType || '',
              status: editingEmployee.status,
              notes: editingEmployee.notes || '',
            } : undefined}
            onSubmit={editingEmployee ? handleEdit : handleAdd}
            onCancel={() => { setShowForm(false); setEditingEmployee(null); }}
            submitLabel={editingEmployee ? '更新する' : '登録する'}
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow">
          <p className="text-gray-400 text-lg">{query ? '該当する従業員が見つかりません' : '従業員情報がありません'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(employee => (
            <div key={employee.id} className="bg-white rounded-xl shadow-sm border p-4 space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-semibold text-gray-800">{employee.name}</p>
                  <p className="text-sm text-gray-500">{employee.department} / {employee.role}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">{STATUS_LABEL[employee.status]}</span>
              </div>
              <p className="text-xs text-gray-500">{employee.employmentType ? EMPLOYMENT_LABEL[employee.employmentType] : '雇用形態未設定'}</p>
              {employee.email && <p className="text-sm text-gray-600">📧 {employee.email}</p>}
              {employee.phone && <p className="text-sm text-gray-600">📞 {employee.phone}</p>}
              {employee.joinDate && <p className="text-xs text-gray-500">入社日: {employee.joinDate}</p>}
              {employee.notes && <p className="text-xs text-gray-500">メモ: {employee.notes}</p>}
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button onClick={() => { setShowForm(false); setEditingEmployee(employee); }} className="text-sm text-indigo-600 hover:underline">編集</button>
                <button onClick={() => handleDelete(employee.id)} className="text-sm text-red-600 hover:underline">削除</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeView;
