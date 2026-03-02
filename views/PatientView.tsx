import React, { useState, useEffect, useCallback } from 'react';
import { Patient, PatientGender } from '../types.ts';
import { getPatients, addPatient, updatePatient, deletePatient } from '../services/storageService.ts';

const GENDER_LABEL: Record<PatientGender, string> = {
  male: '男性', female: '女性', other: 'その他',
};

// ---- 患者フォーム ----
interface PatientFormData {
  name: string;
  nameKana: string;
  birthDate: string;
  gender: PatientGender | '';
  phone: string;
  address: string;
  notes: string;
  lastVisit: string;
  nextAppointment: string;
}

const emptyForm = (): PatientFormData => ({
  name: '', nameKana: '', birthDate: '', gender: '', phone: '',
  address: '', notes: '', lastVisit: '', nextAppointment: '',
});

interface PatientFormProps {
  initial?: Partial<PatientFormData>;
  onSubmit: (data: PatientFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

const PatientForm: React.FC<PatientFormProps> = ({ initial, onSubmit, onCancel, submitLabel }) => {
  const [form, setForm] = useState<PatientFormData>({ ...emptyForm(), ...initial });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof PatientFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('氏名は必須です。'); return; }
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
          <label className="block text-xs font-medium text-gray-700 mb-1">氏名 <span className="text-red-500">*</span></label>
          <input className={inputCls} value={form.name} onChange={set('name')} placeholder="山田 太郎" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">氏名（カナ）</label>
          <input className={inputCls} value={form.nameKana} onChange={set('nameKana')} placeholder="ヤマダ タロウ" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">生年月日</label>
          <input type="date" className={inputCls} value={form.birthDate} onChange={set('birthDate')} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">性別</label>
          <select className={inputCls} value={form.gender} onChange={set('gender')}>
            <option value="">選択してください</option>
            <option value="male">男性</option>
            <option value="female">女性</option>
            <option value="other">その他</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">電話番号</label>
          <input className={inputCls} value={form.phone} onChange={set('phone')} placeholder="090-0000-0000" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">住所</label>
          <input className={inputCls} value={form.address} onChange={set('address')} placeholder="東京都..." />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">最終来院日</label>
          <input type="date" className={inputCls} value={form.lastVisit} onChange={set('lastVisit')} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">次回予約日</label>
          <input type="date" className={inputCls} value={form.nextAppointment} onChange={set('nextAppointment')} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">備考・メモ</label>
        <textarea className={inputCls} value={form.notes} onChange={set('notes')} rows={3} placeholder="アレルギー、持病など" />
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

// ---- 患者カード ----
interface PatientCardProps {
  patient: Patient;
  today: string;
  onEdit: (p: Patient) => void;
  onDelete: (id: string) => void;
}

function calcAge(birthDate?: string): number | null {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, today, onEdit, onDelete }) => {
  const age = calcAge(patient.birthDate);
  const hasAppointmentToday = patient.nextAppointment === today;
  const isOverdue = patient.nextAppointment && patient.nextAppointment < today;

  return (
    <div className="bg-white rounded-xl shadow-sm border hover:shadow transition-shadow p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0
            ${patient.gender === 'female' ? 'bg-pink-400' : patient.gender === 'male' ? 'bg-blue-400' : 'bg-gray-400'}`}
          >
            {patient.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-800">{patient.name}</p>
              {hasAppointmentToday && (
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">本日予約</span>
              )}
            </div>
            {patient.nameKana && <p className="text-xs text-gray-400">{patient.nameKana}</p>}
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onEdit(patient)} className="p-1 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50" title="編集">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button onClick={() => onDelete(patient.id)} className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50" title="削除">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
        {(age !== null || patient.gender) && (
          <span>
            {patient.gender ? GENDER_LABEL[patient.gender] : ''}
            {age !== null ? `　${age}歳` : ''}
          </span>
        )}
        {patient.phone && (
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.7A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.09a16 16 0 006 6l1.46-1.46a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" />
            </svg>
            {patient.phone}
          </span>
        )}
        {patient.lastVisit && (
          <span>最終来院: {new Date(patient.lastVisit + 'T00:00:00').toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}</span>
        )}
        {patient.nextAppointment && (
          <span className={isOverdue ? 'text-red-500 font-medium' : hasAppointmentToday ? 'text-indigo-600 font-medium' : ''}>
            次回予約: {new Date(patient.nextAppointment + 'T00:00:00').toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
            {isOverdue && ' (要確認)'}
          </span>
        )}
      </div>

      {patient.notes && (
        <p className="mt-2 text-xs text-gray-400 bg-gray-50 rounded p-2 line-clamp-2">{patient.notes}</p>
      )}
    </div>
  );
};

// ---- メインビュー ----
interface PatientViewProps {
  onPatientDataChange: (patients: Patient[]) => void;
}

const PatientView: React.FC<PatientViewProps> = ({ onPatientDataChange }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const today = new Date().toISOString().split('T')[0];

  const load = useCallback(async () => {
    const data = await getPatients();
    setPatients(data);
    onPatientDataChange(data);
    setIsLoading(false);
  }, [onPatientDataChange]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (form: PatientFormData) => {
    await addPatient({
      name: form.name,
      nameKana: form.nameKana || undefined,
      birthDate: form.birthDate || undefined,
      gender: (form.gender as PatientGender) || undefined,
      phone: form.phone || undefined,
      address: form.address || undefined,
      notes: form.notes || undefined,
      lastVisit: form.lastVisit || undefined,
      nextAppointment: form.nextAppointment || undefined,
    });
    setShowForm(false);
    await load();
  };

  const handleEdit = async (form: PatientFormData) => {
    if (!editingPatient) return;
    await updatePatient(editingPatient.id, {
      name: form.name,
      nameKana: form.nameKana || undefined,
      birthDate: form.birthDate || undefined,
      gender: (form.gender as PatientGender) || undefined,
      phone: form.phone || undefined,
      address: form.address || undefined,
      notes: form.notes || undefined,
      lastVisit: form.lastVisit || undefined,
      nextAppointment: form.nextAppointment || undefined,
    });
    setEditingPatient(null);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この患者情報を削除しますか?')) return;
    await deletePatient(id);
    await load();
  };

  const filtered = patients.filter(p =>
    p.name.includes(search) ||
    (p.nameKana && p.nameKana.includes(search)) ||
    (p.phone && p.phone.includes(search))
  );

  const todayAppointments = patients.filter(p => p.nextAppointment === today).length;

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">患者情報</h1>
          <p className="text-sm text-gray-500 mt-1">
            全 {patients.length} 名
            {todayAppointments > 0 && <span className="ml-2 text-indigo-600 font-medium">本日予約 {todayAppointments} 件</span>}
          </p>
        </div>
        <button
          onClick={() => { setEditingPatient(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          患者を追加
        </button>
      </div>

      {/* 検索バー */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="氏名・カナ・電話番号で検索"
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* 新規・編集フォーム */}
      {(showForm || editingPatient) && (
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-emerald-500">
          <h3 className="font-bold text-gray-800 mb-4">{editingPatient ? '患者情報を編集' : '新規患者登録'}</h3>
          <PatientForm
            initial={editingPatient ? {
              name: editingPatient.name,
              nameKana: editingPatient.nameKana || '',
              birthDate: editingPatient.birthDate || '',
              gender: editingPatient.gender || '',
              phone: editingPatient.phone || '',
              address: editingPatient.address || '',
              notes: editingPatient.notes || '',
              lastVisit: editingPatient.lastVisit || '',
              nextAppointment: editingPatient.nextAppointment || '',
            } : undefined}
            onSubmit={editingPatient ? handleEdit : handleAdd}
            onCancel={() => { setShowForm(false); setEditingPatient(null); }}
            submitLabel={editingPatient ? '更新する' : '登録する'}
          />
        </div>
      )}

      {/* 患者リスト */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow">
          <p className="text-gray-400 text-lg">{search ? '該当する患者が見つかりません' : '患者情報がありません'}</p>
          <p className="text-gray-300 text-sm mt-1">{search ? '検索条件を変更してください' : '「患者を追加」ボタンで登録してください'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(patient => (
            <PatientCard
              key={patient.id}
              patient={patient}
              today={today}
              onEdit={(p) => { setShowForm(false); setEditingPatient(p); }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientView;

// PatientFormData を外部で使えるように re-export
export type { PatientFormData };
