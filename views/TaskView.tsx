import React, { useState, useEffect, useCallback } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types.ts';
import { getTasks, addTask, updateTask, deleteTask } from '../services/storageService.ts';

// ---- ラベル定義 ----
const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; dot: string }> = {
  todo:        { label: '未着手',   color: 'bg-gray-100 text-gray-600',   dot: 'bg-gray-400'   },
  in_progress: { label: '進行中', color: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500'   },
  done:        { label: '完了',     color: 'bg-green-100 text-green-700', dot: 'bg-green-500'  },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
  high:   { label: '高',   color: 'bg-red-100 text-red-700'    },
  medium: { label: '中', color: 'bg-yellow-100 text-yellow-700' },
  low:    { label: '低',   color: 'bg-green-100 text-green-700' },
};

// ---- タスクフォーム ----
interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate: string;
}

const emptyForm = (): TaskFormData => ({
  title: '', description: '', status: 'todo', priority: 'medium', assignee: '', dueDate: '',
});

interface TaskFormProps {
  initial?: Partial<TaskFormData>;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

const TaskForm: React.FC<TaskFormProps> = ({ initial, onSubmit, onCancel, submitLabel }) => {
  const [form, setForm] = useState<TaskFormData>({ ...emptyForm(), ...initial });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof TaskFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('タイトルは必須です。'); return; }
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

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">タイトル <span className="text-red-500">*</span></label>
        <input className={inputCls} value={form.title} onChange={set('title')} placeholder="タスクのタイトル" />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">説明</label>
        <textarea className={inputCls} value={form.description} onChange={set('description')} rows={3} placeholder="詳細説明（任意）" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">ステータス</label>
          <select className={inputCls} value={form.status} onChange={set('status')}>
            {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map(s => (
              <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">優先度</label>
          <select className={inputCls} value={form.priority} onChange={set('priority')}>
            {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map(p => (
              <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">担当者</label>
          <input className={inputCls} value={form.assignee} onChange={set('assignee')} placeholder="名前" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">期限</label>
          <input type="date" className={inputCls} value={form.dueDate} onChange={set('dueDate')} />
        </div>
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

// ---- タスクカード ----
interface TaskCardProps {
  task: Task;
  today: string;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, today, onEdit, onDelete, onStatusChange }) => {
  const sc = STATUS_CONFIG[task.status];
  const pc = PRIORITY_CONFIG[task.priority];
  const isOverdue = task.dueDate && task.dueDate < today && task.status !== 'done';

  return (
    <div className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow transition-shadow ${task.status === 'done' ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <button
            onClick={() => {
              const next: TaskStatus = task.status === 'todo' ? 'in_progress' : task.status === 'in_progress' ? 'done' : 'todo';
              onStatusChange(task.id, next);
            }}
            title="ステータスを変更"
            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${task.status === 'done' ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-indigo-400'}`}
          >
            {task.status === 'done' && (
              <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
          <p className={`text-sm font-medium flex-1 min-w-0 ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {task.title}
          </p>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={() => onEdit(task)} className="p-1 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50" title="編集">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button onClick={() => onDelete(task.id)} className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50" title="削除">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
            </svg>
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 mt-2 ml-7 line-clamp-2">{task.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-2 mt-3 ml-7">
        <span className={`text-xs px-2 py-0.5 rounded-full ${sc.color}`}>{sc.label}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${pc.color}`}>優先度: {pc.label}</span>
        {task.assignee && (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            {task.assignee}
          </span>
        )}
        {task.dueDate && (
          <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {new Date(task.dueDate + 'T00:00:00').toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
            {isOverdue && ' (期限超過)'}
          </span>
        )}
      </div>
    </div>
  );
};

// ---- メインビュー ----
interface TaskViewProps {
  onTaskDataChange: (tasks: Task[]) => void;
}

const TaskView: React.FC<TaskViewProps> = ({ onTaskDataChange }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const today = new Date().toISOString().split('T')[0];

  const load = useCallback(async () => {
    const data = await getTasks();
    setTasks(data);
    onTaskDataChange(data);
    setIsLoading(false);
  }, [onTaskDataChange]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (form: { title: string; description: string; status: TaskStatus; priority: TaskPriority; assignee: string; dueDate: string }) => {
    await addTask({
      title: form.title,
      description: form.description || undefined,
      status: form.status,
      priority: form.priority,
      assignee: form.assignee || undefined,
      dueDate: form.dueDate || undefined,
    });
    setShowForm(false);
    await load();
  };

  const handleEdit = async (form: { title: string; description: string; status: TaskStatus; priority: TaskPriority; assignee: string; dueDate: string }) => {
    if (!editingTask) return;
    await updateTask(editingTask.id, {
      title: form.title,
      description: form.description || undefined,
      status: form.status,
      priority: form.priority,
      assignee: form.assignee || undefined,
      dueDate: form.dueDate || undefined,
    });
    setEditingTask(null);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このタスクを削除しますか?')) return;
    await deleteTask(id);
    await load();
  };

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    await updateTask(id, { status });
    await load();
  };

  const filtered = tasks.filter(t => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    return true;
  });

  const counts: Record<TaskStatus | 'all', number> = {
    all: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  };

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
          <h1 className="text-2xl font-bold text-gray-800">タスク管理</h1>
          <p className="text-sm text-gray-500 mt-1">チームのタスクを管理・追跡します</p>
        </div>
        <button
          onClick={() => { setEditingTask(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          新規タスク
        </button>
      </div>

      {/* フィルタータブ */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'todo', 'in_progress', 'done'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === s ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {s === 'all' ? 'すべて' : STATUS_CONFIG[s].label}
            <span className="ml-1.5 text-xs opacity-75">({counts[s]})</span>
          </button>
        ))}
        <div className="ml-auto">
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value as TaskPriority | 'all')}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="all">優先度: すべて</option>
            {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map(p => (
              <option key={p} value={p}>優先度: {PRIORITY_CONFIG[p].label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 新規・編集フォーム */}
      {(showForm || editingTask) && (
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-indigo-500">
          <h3 className="font-bold text-gray-800 mb-4">{editingTask ? 'タスクを編集' : '新規タスク'}</h3>
          <TaskForm
            initial={editingTask ? {
              title: editingTask.title,
              description: editingTask.description || '',
              status: editingTask.status,
              priority: editingTask.priority,
              assignee: editingTask.assignee || '',
              dueDate: editingTask.dueDate || '',
            } : undefined}
            onSubmit={editingTask ? handleEdit : handleAdd}
            onCancel={() => { setShowForm(false); setEditingTask(null); }}
            submitLabel={editingTask ? '更新する' : '追加する'}
          />
        </div>
      )}

      {/* タスクリスト */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow">
          <p className="text-gray-400 text-lg">タスクがありません</p>
          <p className="text-gray-300 text-sm mt-1">「新規タスク」ボタンで追加してください</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              today={today}
              onEdit={(t) => { setShowForm(false); setEditingTask(t); }}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskView;
