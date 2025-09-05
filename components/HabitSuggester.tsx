import React, { useState } from 'react';
import { SuggestedHabit } from '../types';

interface Props {
  onAddSuggestedHabit: (name: string, description?: string) => void;
  onClose: () => void;
  getHabitSuggestions: () => Promise<SuggestedHabit[]>;
}

const HabitSuggester: React.FC<Props> = ({ onAddSuggestedHabit, onClose, getHabitSuggestions }) => {
  const [suggestions, setSuggestions] = useState<SuggestedHabit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await getHabitSuggestions();
      setSuggestions(s);
    } catch (e) {
      console.error(e);
      setError('取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-96 space-y-4">
        <h2 className="text-lg font-bold">習慣アイデア</h2>
        <button onClick={fetch} className="px-3 py-1 rounded bg-sky-600 text-white">取得</button>
        {loading && <p>読み込み中...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <ul className="space-y-2">
          {suggestions.map((s, idx) => (
            <li key={idx} className="border p-2 rounded flex justify-between">
              <div>
                <p className="font-semibold">{s.name}</p>
                {s.description && <p className="text-xs text-gray-500">{s.description}</p>}
              </div>
              <button onClick={() => onAddSuggestedHabit(s.name, s.description)} className="ml-2 text-sky-600">追加</button>
            </li>
          ))}
        </ul>
        <div className="text-right">
          <button onClick={onClose} className="text-sm text-gray-600">閉じる</button>
        </div>
      </div>
    </div>
  );
};

export default HabitSuggester;
