import React, { useState } from 'react';

interface Props {
  onAddHabit: (name: string, description?: string) => void;
  onClose: () => void;
}

const HabitForm: React.FC<Props> = ({ onAddHabit, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddHabit(name.trim(), description.trim() || undefined);
    setName('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form onSubmit={submit} className="bg-white p-6 rounded shadow w-80 space-y-4">
        <h2 className="text-lg font-bold">新しい習慣</h2>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="習慣名"
          className="w-full border p-2 rounded"
        />
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="説明 (任意)"
          className="w-full border p-2 rounded"
        />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1 rounded bg-gray-200">キャンセル</button>
          <button type="submit" className="px-3 py-1 rounded bg-sky-600 text-white">追加</button>
        </div>
      </form>
    </div>
  );
};

export default HabitForm;
