import React from 'react';

interface Props {
  prompt: string;
  onClose: () => void;
  isLoading: boolean;
}

const ReflectionModal: React.FC<Props> = ({ prompt, onClose, isLoading }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow w-96 space-y-4">
      <h2 className="text-lg font-bold">今日の振り返り</h2>
      {isLoading ? <p>読み込み中...</p> : <p>{prompt}</p>}
      <div className="text-right">
        <button onClick={onClose} className="text-sm text-gray-600">閉じる</button>
      </div>
    </div>
  </div>
);

export default ReflectionModal;
