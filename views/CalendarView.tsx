import React, { useState, useEffect, useCallback } from 'react';
import Calendar from '../components/Calendar.tsx';
import RecentActivitySidebar from '../components/RecentActivitySidebar.tsx';
import ActionModal from '../components/ActionModal.tsx';
import { getLeaveRequests, addLeaveEntry, deleteLeaveEntry } from '../services/storageService.ts';
import { LeaveRequest, LeaveType } from '../types.ts';

interface CalendarViewProps {
  employeeName: string;
  onLeaveDataChange: (requests: LeaveRequest[]) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ employeeName, onLeaveDataChange }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const requests = await getLeaveRequests();
      setLeaveRequests(requests);
      onLeaveDataChange(requests);
    } catch (e: any) {
      setError('予定の読み込みに失敗しました。');
    } finally {
      setIsLoading(false);
    }
  }, [onLeaveDataChange]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleAddLeave = useCallback(async (type: LeaveType, comment?: string) => {
    if (!selectedDate) throw new Error('日付が選択されていません。');
    if (!employeeName.trim()) {
      const err = '予定を登録する前に、右上のヘッダーにあなたの名前を入力してください。';
      setError(err);
      throw new Error(err);
    }
    setError(null);
    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      await addLeaveEntry(dateString, employeeName, type, comment);
      await fetchRequests();
    } catch (e: any) {
      setError(e.message || '登録に失敗しました。');
      throw e;
    }
  }, [selectedDate, employeeName, fetchRequests]);

  const handleDeleteLeave = useCallback(async (id: string) => {
    setError(null);
    try {
      await deleteLeaveEntry(id);
      await fetchRequests();
    } catch (e: any) {
      setError(e.message || '削除に失敗しました。');
    }
  }, [fetchRequests]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">休み管理</h1>
        <p className="text-sm text-gray-500 mt-1">カレンダー上の日付をクリックして休み・コメントを登録します</p>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold">エラー</p>
              <p>{error}</p>
            </div>
            <button onClick={() => setError(null)} className="p-1 rounded-full hover:bg-red-200" aria-label="閉じる">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-grow">
          {isLoading ? (
            <div className="flex items-center justify-center h-96 bg-white rounded-xl shadow">
              <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="ml-3 text-gray-600">読み込み中...</span>
            </div>
          ) : (
            <Calendar
              currentDate={currentDate}
              leaveRequests={leaveRequests}
              onDateClick={(date) => { setSelectedDate(date); setIsActionModalOpen(true); }}
              onPrevMonth={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              onNextMonth={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              onDeleteLeave={handleDeleteLeave}
              currentUser={employeeName}
              selectedDate={selectedDate}
            />
          )}
        </div>
        <aside className="w-full lg:w-72 flex-shrink-0">
          <RecentActivitySidebar requests={leaveRequests} />
        </aside>
      </div>

      <ActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        selectedDate={selectedDate}
        employeeName={employeeName}
        onAddLeave={handleAddLeave}
      />
    </div>
  );
};

export default CalendarView;
