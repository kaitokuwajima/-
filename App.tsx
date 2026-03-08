import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar.tsx';
import DashboardView from './views/DashboardView.tsx';
import CalendarView from './views/CalendarView.tsx';
import TaskView from './views/TaskView.tsx';
import EmployeeView from './views/PatientView.tsx';
import { ViewType, LeaveRequest, Task, Employee } from './types.ts';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [employeeName, setEmployeeName] = useState('山田');

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const handleLeaveDataChange = useCallback((requests: LeaveRequest[]) => {
    setLeaveRequests(requests);
  }, []);

  const handleTaskDataChange = useCallback((data: Task[]) => {
    setTasks(data);
  }, []);

  const handleEmployeeDataChange = useCallback((data: Employee[]) => {
    setEmployees(data);
  }, []);

  const viewTitles: Record<ViewType, string> = {
    dashboard: 'ダッシュボード',
    calendar: '休み管理',
    tasks: 'タスク管理',
    employees: '従業員管理',
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
              aria-label="メニューを開く"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-800">{viewTitles[currentView]}</h1>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="employeeName" className="text-sm text-gray-500 hidden sm:block">あなたの名前:</label>
            <input
              id="employeeName"
              type="text"
              value={employeeName}
              onChange={e => setEmployeeName(e.target.value)}
              placeholder="名前を入力"
              className="w-28 sm:w-40 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              aria-label="あなたの名前"
            />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-screen-2xl w-full mx-auto">
          {currentView === 'dashboard' && (
            <DashboardView
              leaveRequests={leaveRequests}
              tasks={tasks}
              employees={employees}
              onNavigate={setCurrentView}
            />
          )}
          {currentView === 'calendar' && (
            <CalendarView
              employeeName={employeeName}
              onLeaveDataChange={handleLeaveDataChange}
            />
          )}
          {currentView === 'tasks' && (
            <TaskView onTaskDataChange={handleTaskDataChange} />
          )}
          {currentView === 'employees' && (
            <EmployeeView onEmployeeDataChange={handleEmployeeDataChange} />
          )}
        </main>

        <footer className="text-center text-xs text-gray-400 py-3 border-t border-gray-100">
          従業員管理アプリ — データはこのブラウザのローカルストレージに保存されています
        </footer>
      </div>
    </div>
  );
}

export default App;
