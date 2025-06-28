import React from 'react';
import { LeaveRequest, LEAVE_TYPES, LeaveType } from '../types.ts';

interface CalendarProps {
  currentDate: Date;
  leaveRequests: LeaveRequest[];
  onDateClick: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDeleteLeave: (id: string) => void;
  currentUser: string;
  selectedDate: Date | null;
}

const leaveTypeColors: Record<LeaveType, { bg: string, text: string, border: string }> = {
    [LEAVE_TYPES.DAY_OFF]: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
    [LEAVE_TYPES.AM_OFF]: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
    [LEAVE_TYPES.PM_OFF]: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
    [LEAVE_TYPES.PAID_LEAVE]: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
    [LEAVE_TYPES.AM_PAID_LEAVE]: { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300' },
    [LEAVE_TYPES.PM_PAID_LEAVE]: { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300' },
    [LEAVE_TYPES.COMMENT]: { bg: 'bg-gray-200', text: 'text-gray-800', border: 'border-gray-400' }
};


const CalendarHeader: React.FC<{
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}> = ({ currentDate, onPrevMonth, onNextMonth }) => (
  <div className="flex items-center justify-between mb-4">
    <button onClick={onPrevMonth} className="p-2 rounded-full hover:bg-gray-200 transition-colors" aria-label="前の月">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="m15 18-6-6 6-6"/></svg>
    </button>
    <h2 className="text-xl font-semibold text-gray-800">
      {currentDate.toLocaleString('ja-JP', { year: 'numeric', month: 'long' })}
    </h2>
    <button onClick={onNextMonth} className="p-2 rounded-full hover:bg-gray-200 transition-colors" aria-label="次の月">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="m9 18 6-6-6-6"/></svg>
    </button>
  </div>
);

const DaysOfWeek: React.FC = () => {
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day, index) => (
        <div key={day} className={`text-center font-medium text-sm pb-2 ${index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-500'}`}>
          {day}
        </div>
      ))}
    </div>
  );
};


const Calendar: React.FC<CalendarProps> = ({ currentDate, leaveRequests, onDateClick, onPrevMonth, onNextMonth, onDeleteLeave, currentUser, selectedDate }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDateString = selectedDate ? selectedDate.toISOString().split('T')[0] : null;

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="border rounded-lg border-transparent"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      const requestsForDay = leaveRequests.filter(req => req.date === dateString);
      const isToday = date.getTime() === today.getTime();
      const isSelected = dateString === selectedDateString;

      let dayClasses = `border-gray-200 bg-white hover:bg-indigo-50 focus:bg-indigo-100`;
      if (isToday) dayClasses += ' bg-blue-100 font-bold';
      if (isSelected) dayClasses += ' ring-2 ring-indigo-500 ring-offset-0 border-transparent';
      
      days.push(
        <div
          key={day}
          onClick={() => onDateClick(date)}
          className={`relative p-2 text-center border rounded-lg transition-colors duration-200 cursor-pointer min-h-[120px] flex flex-col items-center justify-start ${dayClasses}`}
          tabIndex={0}
          aria-label={`${day}日`}
        >
          <span className={`w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : ''}`}>{day}</span>
          <div className="w-full mt-1 space-y-1 overflow-y-auto max-h-24 text-left p-0.5">
            {requestsForDay.map(req => {
                const colors = leaveTypeColors[req.type];
                const canDelete = currentUser && currentUser === req.employeeName;
                return (
                    <div key={req.id} className={`text-xs p-1 rounded-md border ${colors.bg} ${colors.text} ${colors.border} flex justify-between items-start`}>
                        <div className="flex-grow overflow-hidden mr-1">
                            <p className="font-semibold truncate">{req.employeeName}: {req.type}</p>
                            {req.type === LEAVE_TYPES.COMMENT && req.comment && <p className="text-gray-600 italic truncate whitespace-normal text-xs">"{req.comment}"</p>}
                        </div>
                        {canDelete && (
                            <button onClick={(e) => { e.stopPropagation(); onDeleteLeave(req.id); }} className="flex-shrink-0 text-red-500 hover:text-red-800 rounded-full hover:bg-red-200 p-0.5" aria-label={`${req.type}を削除`}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        )}
                    </div>
                );
            })}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded-xl shadow-lg w-full">
      <CalendarHeader currentDate={currentDate} onPrevMonth={onPrevMonth} onNextMonth={onNextMonth} />
      <DaysOfWeek />
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {renderDays()}
      </div>
    </div>
  );
};

export default Calendar;