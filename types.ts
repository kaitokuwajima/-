
export interface Habit {
  id: string;
  name: string;
  description?: string;
  createdAt: string; // ISO string
  completions: Array<{ date: string; notes?: string }>; // date is YYYY-MM-DD
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate?: string; // YYYY-MM-DD
}

export interface SuggestedHabit {
  name: string;
  description?: string;
}
