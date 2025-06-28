import React, { useState, useEffect } from 'react';
import { LeaveType, LEAVE_TYPES } from '../types.ts';

interface ActionModalProps {
  isOpen: boolean;
  selectedDate: Date | null;
  employeeName: string;
  onAddLeave: (type: LeaveType, comment?: string) => Promise<void>;
  onClose: () => void;
}

const ActionModal: React.FC<ActionModalProps> = ({ isOpen, selectedDate, employeeName, onAddLeave, onClose }) => {
  const [comment, setComment] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setComment('');
        setShowCommentInput(false);
        setIsSubmitting(false);
      }, 200); // Animation duration
    }
  }, [isOpen]);

  if (!isOpen || !selectedDate) {
    return null;
  }
  
  const handleActionClick = async (type: LeaveType, commentText?: string) => {
    setIsSubmitting(true);
    try {
      await onAddLeave(type, commentText);
      onClose();
    } catch (e) {
      console.error("Failed to add leave from modal:", e);
      // Error is handled in App.tsx, just stop submitting
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = () => {
    if (comment.trim()) {
      handleActionClick(LEAVE_TYPES.COMMENT, comment);
    }
  };

  const leaveButtons = (Object.values(LEAVE_TYPES) as LeaveType[]).filter(t => t !== LEAVE_TYPES.COMMENT);

  const formattedDate = selectedDate.toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity duration-300" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 id="modal-title" className="font-bold text-xl text-gray-800">予定を追加</h3>
              <p className="text-indigo-600 font-medium">{formattedDate}</p>
            </div>
            <button onClick={onClose} disabled={isSubmitting} className="p-2 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400" aria-label="閉じる">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          
          {!employeeName.trim() && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-3 my-4 rounded-r-lg" role="alert">
                <p className="font-bold">名前の入力が必要です</p>
                <p className="text-sm">予定を登録するには、まず右上であなたの名前を入力してください。</p>
            </div>
          )}

          <div className="space-y-4">
             <p className="text-sm text-gray-600">登録する予定の種類を選択してください。</p>
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {leaveButtons.map(type => (
                <button 
                    key={type} 
                    onClick={() => handleActionClick(type)}
                    disabled={!employeeName.trim() || isSubmitting}
                    className="px-4 py-3 text-base font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isSubmitting ? '登録中...' : type}
                </button>
                ))}
                 <button 
                    onClick={() => setShowCommentInput(prev => !prev)}
                    disabled={!employeeName.trim() || isSubmitting}
                    className="px-4 py-3 text-base font-semibold text-white bg-gray-600 rounded-lg shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {LEAVE_TYPES.COMMENT}
                </button>
             </div>
          </div>

          {showCommentInput && (
            <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
              <label htmlFor="commentInput" className="block text-sm font-medium text-gray-700">共有コメントを入力:</label>
              <textarea
                id="commentInput"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="例：15時に宅急便対応"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
                disabled={isSubmitting}
              ></textarea>
              <div className="flex justify-end">
                <button onClick={handleAddComment} className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 disabled:cursor-wait" disabled={!comment.trim() || isSubmitting}>
                  {isSubmitting ? '登録中...' : 'コメントを追加'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
       <style>{`
          @keyframes scale-in {
            from { transform: scale(.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-scale-in {
            animation: scale-in 0.2s ease-out forwards;
          }
        `}</style>
    </div>
  );
};

export default ActionModal;