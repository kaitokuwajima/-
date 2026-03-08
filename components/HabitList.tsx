import React from 'react';
import { Habit } from '../types';

interface Props {
  habits: Habit[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const HabitList: React.FC<Props> = ({ habits, onToggleComplete, onDelete }) => (
  <div className="space-y-4">
    {habits.map(habit => (
      <div key={habit.id} className="flex items-center justify-between bg-white p-4 rounded shadow">
        <div>
          <h3 className="font-semibold">{habit.name}</h3>
          {habit.description && <p className="text-sm text-gray-500">{habit.description}</p>}
          <p className="text-xs text-gray-400">連続: {habit.currentStreak}日 / 最長: {habit.longestStreak}日</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onToggleComplete(habit.id)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded">
            完了
          </button>
          <button onClick={() => onDelete(habit.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
            削除
          </button>
        </div>
      </div>
    ))}
    {habits.length === 0 && <p className="text-center text-gray-500">まだ習慣がありません</p>}
  </div>
);

export default HabitList;
