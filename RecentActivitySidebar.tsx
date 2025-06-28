import React from 'react';
import { LeaveRequest, LEAVE_TYPES } from '../types.ts';

interface RecentActivitySidebarProps {
  requests: LeaveRequest[];
}

const RecentActivitySidebar: React.FC<RecentActivitySidebarProps> = ({ requests }) => {
  const sortedRequests = [...requests]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 30); // 最新30件を表示

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg h-full max-h-[80vh] overflow-y-auto sticky top-24">
      <h3 className="font-bold text-lg mb-4 border-b pb-2 text-gray-800">最近の活動</h3>
      {sortedRequests.length === 0 ? (
        <p className="text-gray-500 text-sm mt-4">活動はまだありません。</p>
      ) : (
        <ul className="space-y-4">
          {sortedRequests.map(req => (
            <li key={req.id} className="text-sm border-b border-gray-100 pb-2 last:border-b-0">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-gray-900">{req.employeeName}</p>
                <p className="text-gray-500">{new Date(req.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}</p>
              </div>
              <p className="text-indigo-600">{req.type}</p>
              {req.type === LEAVE_TYPES.COMMENT && req.comment && (
                <p className="text-xs bg-gray-100 p-2 mt-1 rounded-md italic text-gray-700">"{req.comment}"</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentActivitySidebar;