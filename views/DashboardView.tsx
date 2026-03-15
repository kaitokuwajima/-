import React from 'react';
import { LeaveRequest, Task, Employee, ViewType } from '../types.ts';

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  color: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, color, icon, onClick }) => (
  <button
    onClick={onClick}
    className={`bg-white rounded-xl shadow p-5 flex items-center space-x-4 w-full text-left
      ${onClick ? 'hover:shadow-md transition-shadow cursor-pointer' : 'cursor-default'}`}
  >
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </button>
);

interface DashboardViewProps {
  leaveRequests: LeaveRequest[];
  tasks: Task[];
  employees: Employee[];
  onNavigate: (view: ViewType) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ leaveRequests, tasks, employees, onNavigate }) => {
  const today = new Date().toISOString().split('T')[0];

  const todayLeaves = leaveRequests.filter(r => r.date === today).length;
  const upcomingLeaves = leaveRequests.filter(r => r.date > today).length;
  const pendingTasks = tasks.filter(t => t.status !== 'done').length;
  const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length;
  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const onLeaveEmployees = employees.filter(e => e.status === 'leave').length;

  const recentTasks = [...tasks]
    .filter(t => t.status !== 'done')
    .sort((a, b) => {
      const pa = a.priority === 'high' ? 0 : a.priority === 'medium' ? 1 : 2;
      const pb = b.priority === 'high' ? 0 : b.priority === 'medium' ? 1 : 2;
      return pa - pb;
    })
    .slice(0, 5);

  const recentEmployees = [...employees]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const priorityLabel: Record<string, { text: string; cls: string }> = {
    high: { text: '高', cls: 'bg-red-100 text-red-700' },
    medium: { text: '中', cls: 'bg-yellow-100 text-yellow-700' },
    low: { text: '低', cls: 'bg-green-100 text-green-700' },
  };

  const employmentTypeLabel: Record<string, string> = {
    full_time: '正社員',
    contract: '契約社員',
    part_time: 'パート',
    intern: 'インターン',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">ダッシュボード</h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard
          label="本日の休み"
          value={todayLeaves}
          sub={`予定 ${upcomingLeaves} 件`}
          color="bg-indigo-100 text-indigo-600"
          onClick={() => onNavigate('calendar')}
          icon={<span className="text-2xl">📅</span>}
        />
        <StatCard
          label="未完了タスク"
          value={pendingTasks}
          sub={`優先度高 ${highPriorityTasks} 件`}
          color="bg-amber-100 text-amber-600"
          onClick={() => onNavigate('tasks')}
          icon={<span className="text-2xl">📝</span>}
        />
        <StatCard
          label="在籍従業員"
          value={activeEmployees}
          sub={`休職中 ${onLeaveEmployees} 名`}
          color="bg-emerald-100 text-emerald-600"
          onClick={() => onNavigate('employees')}
          icon={<span className="text-2xl">👥</span>}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-800">最近追加した従業員</h2>
            <button onClick={() => onNavigate('employees')} className="text-xs text-indigo-600 hover:underline">
              一覧を見る →
            </button>
          </div>
          {recentEmployees.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">従業員データがありません</p>
          ) : (
            <ul className="space-y-3">
              {recentEmployees.map(employee => (
                <li key={employee.id} className="border border-gray-100 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-800">{employee.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{employee.department} / {employee.role}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {employee.employmentType ? employmentTypeLabel[employee.employmentType] : '雇用形態未設定'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-800">優先タスク</h2>
            <button onClick={() => onNavigate('tasks')} className="text-xs text-indigo-600 hover:underline">
              全て見る →
            </button>
          </div>
          {recentTasks.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">未完了のタスクはありません 🎉</p>
          ) : (
            <ul className="space-y-3">
              {recentTasks.map(task => (
                <li key={task.id} className="border border-gray-100 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-gray-800 flex-1">{task.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${priorityLabel[task.priority].cls}`}>
                      {priorityLabel[task.priority].text}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    {task.assignee && <span className="text-xs text-gray-400">担当: {task.assignee}</span>}
                    {task.dueDate && (
                      <span className={`text-xs ml-auto ${task.dueDate < today ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                        期限: {new Date(task.dueDate + 'T00:00:00').toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
