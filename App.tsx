import React, { useState, useEffect, useCallback } from 'react';
import Calendar from './components/Calendar.tsx';
import RecentActivitySidebar from './components/RecentActivitySidebar.tsx';
import ActionModal from './components/ActionModal.tsx';
import { getLeaveRequests, addLeaveEntry, deleteLeaveEntry } from './services/googleSheetService.ts';
import { LeaveRequest, LeaveType } from './types.ts';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employeeName, setEmployeeName] = useState('山田');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const requests = await getLeaveRequests();
      setLeaveRequests(requests);
    } catch (e: any) {
      setError('予定の読み込みに失敗しました。ページを再読み込みしてください。');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsActionModalOpen(true);
  };

  const handleCloseActionModal = () => {
      setIsActionModalOpen(false);
  };

  const handleAddLeave = useCallback(async (type: LeaveType, comment?: string) => {
    if (!selectedDate) {
        throw new Error('日付が選択されていません。');
    }
    if (!employeeName.trim()) {
      const err = "予定を登録する前に、右上の入力欄にあなたの名前を入力してください。";
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
      throw e; // Re-throw for the modal to handle its state
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
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
      <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-20">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">共有休み希望カレンダー</h1>
        <div className="flex items-center space-x-2">
          <label htmlFor="employeeName" className="text-sm font-medium text-gray-700 hidden sm:block">あなたの名前:</label>
          <input
            type="text"
            id="employeeName"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            placeholder="名前を入力"
            className="w-32 sm:w-48 px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            aria-label="あなたの名前"
          />
        </div>
      </header>

      <main className="flex flex-col lg:flex-row p-4 gap-6 max-w-screen-2xl mx-auto">
        <div className="flex-grow lg:w-3/4">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md shadow" role="alert" aria-live="assertive">
              <div className="flex justify-between items-center">
                <div>
                    <p className="font-bold">エラー</p>
                    <p>{error}</p>
                </div>
                <button onClick={() => setError(null)} className="p-1 rounded-full hover:bg-red-200" aria-label="エラーを閉じる">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </div>
          )}
          {isLoading ? (
            <div className="flex items-center justify-center h-96 bg-white rounded-xl shadow-lg">
              <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="ml-3 text-lg text-gray-600">カレンダーを読み込み中...</span>
            </div>
          ) : (
            <Calendar
              currentDate={currentDate}
              leaveRequests={leaveRequests}
              onDateClick={handleDateClick}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onDeleteLeave={handleDeleteLeave}
              currentUser={employeeName}
              selectedDate={selectedDate}
            />
          )}
        </div>

        <aside className="w-full lg:w-1/4 lg:max-w-sm flex-shrink-0">
          <RecentActivitySidebar requests={leaveRequests} />
        </aside>
      </main>
      
      <ActionModal 
        isOpen={isActionModalOpen}
        onClose={handleCloseActionModal}
        selectedDate={selectedDate}
        employeeName={employeeName}
        onAddLeave={handleAddLeave}
      />
    </div>
  );
}

export default App;