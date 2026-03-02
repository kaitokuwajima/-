import React from 'react';
import { LeaveRequest, Task, Patient, ViewType } from '../types.ts';

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
  patients: Patient[];
  onNavigate: (view: ViewType) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ leaveRequests, tasks, patients, onNavigate }) => {
  const today = new Date().toISOString().split('T')[0];

  const todayLeaves = leaveRequests.filter(r => r.date === today).length;
  const upcomingLeaves = leaveRequests.filter(r => r.date > today).length;
  const pendingTasks = tasks.filter(t => t.status !== 'done').length;
  const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length;
  const totalPatients = patients.length;
  const todayAppointments = patients.filter(p => p.nextAppointment === today).length;

  const recentTasks = [...tasks]
    .filter(t => t.status !== 'done')
    .sort((a, b) => {
      const pa = a.priority === 'high' ? 0 : a.priority === 'medium' ? 1 : 2;
      const pb = b.priority === 'high' ? 0 : b.priority === 'medium' ? 1 : 2;
      return pa - pb;
    })
    .slice(0, 5);

  const todayLeavePeople = leaveRequests.filter(r => r.date === today);
  const upcomingLeavePeople = leaveRequests
    .filter(r => r.date > today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  const priorityLabel: Record<string, { text: string; cls: string }> = {
    high:   { text: '高',   cls: 'bg-red-100 text-red-700' },
    medium: { text: '中', cls: 'bg-yellow-100 text-yellow-700' },
    low:    { text: '低',   cls: 'bg-green-100 text-green-700' },
  };

  const statusLabel: Record<string, { text: string; cls: string }> = {
    todo:        { text: '未着手',   cls: 'bg-gray-100 text-gray-600' },
    in_progress: { text: '進行中', cls: 'bg-blue-100 text-blue-700' },
    done:        { text: '完了',     cls: 'bg-green-100 text-green-700' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">ダッシュボード</h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
        </p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard
          label="本日の休み"
          value={todayLeaves}
          sub={`予定 ${upcomingLeaves} 件`}
          color="bg-indigo-100 text-indigo-600"
          onClick={() => onNavigate('calendar')}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
        />
        <StatCard
          label="未完了タスク"
          value={pendingTasks}
          sub={`優先度高 ${highPriorityTasks} 件`}
          color="bg-amber-100 text-amber-600"
          onClick={() => onNavigate('tasks')}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <polyline points="3 6 4 7 6 5" /><polyline points="3 12 4 13 6 11" /><polyline points="3 18 4 19 6 17" />
            </svg>
          }
        />
        <StatCard
          label="患者数"
          value={totalPatients}
          sub={`本日の予約 ${todayAppointments} 件`}
          color="bg-emerald-100 text-emerald-600"
          onClick={() => onNavigate('patients')}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 本日の休み */}
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-800">本日の休み・予定</h2>
            <button onClick={() => onNavigate('calendar')} className="text-xs text-indigo-600 hover:underline">
              カレンダーを見る →
            </button>
          </div>
          {todayLeavePeople.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">本日の休み申請はありません</p>
          ) : (
            <ul className="space-y-2">
              {todayLeavePeople.map(r => (
                <li key={r.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                  <span className="font-medium text-gray-700">{r.employeeName}</span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs">{r.type}</span>
                </li>
              ))}
            </ul>
          )}
          {upcomingLeavePeople.length > 0 && (
            <>
              <p className="text-xs font-semibold text-gray-500 mt-4 mb-2">直近の予定</p>
              <ul className="space-y-1">
                {upcomingLeavePeople.map(r => (
                  <li key={r.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      <span className="font-medium">{r.employeeName}</span>
                      <span className="ml-1 text-gray-400">
                        {new Date(r.date + 'T00:00:00').toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                      </span>
                    </span>
                    <span className="text-xs text-gray-500">{r.type}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* 優先タスク */}
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
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusLabel[task.status].cls}`}>
                      {statusLabel[task.status].text}
                    </span>
                    {task.assignee && (
                      <span className="text-xs text-gray-400">{task.assignee}</span>
                    )}
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
