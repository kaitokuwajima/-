import { Habit } from '../types';

const HABITS_KEY = 'habits';

export const getHabits = (): Habit[] => {
  if (typeof localStorage === 'undefined') return [];
  try {
    const item = localStorage.getItem(HABITS_KEY);
    return item ? JSON.parse(item) as Habit[] : [];
  } catch (e) {
    console.error('Failed to load habits from localStorage', e);
    return [];
  }
};

export const saveHabits = (habits: Habit[]): void => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  } catch (e) {
    console.error('Failed to save habits to localStorage', e);
  }
};
