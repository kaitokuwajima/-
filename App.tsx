
import React, { useState, useEffect, useCallback } from 'react';
import { Habit } from './types';
import { getHabits, saveHabits } from './services/localStorageService';
import { getMotivationalQuote, getHabitSuggestions, getReflectionPrompt } from './services/geminiService';
import Navbar from './components/Navbar';
import HabitList from './components/HabitList';
import HabitForm from './components/HabitForm';
import MotivationalMessage from './components/MotivationalMessage';
import HabitSuggester from './components/HabitSuggester';
import ReflectionModal from './components/ReflectionModal';
import Footer from './components/Footer';
import { AddIcon, LightBulbIcon, SparklesIcon } from './components/Icons';

const App: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoadingHabits, setIsLoadingHabits] = useState<boolean>(true);
  const [isLoadingGemini, setIsLoadingGemini] = useState<boolean>(false);
  const [motivationalQuote, setMotivationalQuote] = useState<string>('');
  const [geminiError, setGeminiError] = useState<string | null>(null);
  const [showHabitForm, setShowHabitForm] = useState<boolean>(false);
  const [showHabitSuggester, setShowHabitSuggester] = useState<boolean>(false);
  const [showReflectionModal, setShowReflectionModal] = useState<boolean>(false);
  const [reflectionPrompt, setReflectionPrompt] = useState<string>('');

  useEffect(() => {
    const loadedHabits = getHabits();
    setHabits(loadedHabits);
    setIsLoadingHabits(false);
  }, []);

  useEffect(() => {
    if (!isLoadingHabits) { // Ensure habits are loaded before saving
      saveHabits(habits);
    }
  }, [habits, isLoadingHabits]);

  const fetchMotivationalQuote = useCallback(async () => {
    setIsLoadingGemini(true);
    setGeminiError(null);
    try {
      const quote = await getMotivationalQuote();
      setMotivationalQuote(quote);
    } catch (error) {
      console.error("Failed to fetch motivational quote:", error);
      setGeminiError("心に響く言葉を取得できませんでした。後でもう一度お試しください。");
    } finally {
      setIsLoadingGemini(false);
    }
  }, []);

  useEffect(() => {
    fetchMotivationalQuote();
  }, [fetchMotivationalQuote]);

  const fetchNewReflectionPrompt = useCallback(async () => {
    setIsLoadingGemini(true);
    setGeminiError(null);
    try {
      const prompt = await getReflectionPrompt();
      setReflectionPrompt(prompt);
      setShowReflectionModal(true);
    } catch (error) {
      console.error("Failed to fetch reflection prompt:", error);
      setGeminiError("振り返りのプロンプトを取得できませんでした。後でもう一度お試しください。");
    } finally {
      setIsLoadingGemini(false);
    }
  }, []);


  const getTodayDateString = (): string => {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  };

  const addHabit = (name: string, description?: string) => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name,
      description,
      createdAt: new Date().toISOString(),
      completions: [],
      currentStreak: 0,
      longestStreak: 0,
    };
    setHabits(prevHabits => [newHabit, ...prevHabits]);
    setShowHabitForm(false);
  };

  const deleteHabit = (id: string) => {
    setHabits(prevHabits => prevHabits.filter(habit => habit.id !== id));
  };

  const toggleHabitCompletion = (id: string) => {
    const today = getTodayDateString();
    setHabits(prevHabits =>
      prevHabits.map(habit => {
        if (habit.id === id) {
          const alreadyCompletedToday = habit.completions.some(c => c.date === today);
          if (alreadyCompletedToday) {
            // Undo completion for today
            const updatedCompletions = habit.completions.filter(c => c.date !== today);
            // Recalculate streak (this is simplified, a full robust recalc would be more complex)
            let newCurrentStreak = 0;
            if (updatedCompletions.length > 0) {
                 // Simplified: if last completion was yesterday, keep streak, otherwise reset.
                 // This part needs more robust logic if undoing affects streak significantly.
                 // For this version, undoing resets streak if it was the only one in sequence.
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];
                if (updatedCompletions.find(c => c.date === yesterdayStr)) {
                    newCurrentStreak = habit.currentStreak > 0 ? habit.currentStreak -1 : 0; // Approximate
                }
            }
            return {
              ...habit,
              completions: updatedCompletions,
              currentStreak: newCurrentStreak, // This part might need more complex logic
              lastCompletionDate: updatedCompletions.length > 0 ? updatedCompletions[updatedCompletions.length - 1].date : undefined
            };
          } else {
            // Mark as complete
            let newCurrentStreak = habit.currentStreak;
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (habit.lastCompletionDate === yesterdayStr) {
              newCurrentStreak++;
            } else {
              newCurrentStreak = 1;
            }
            
            const newLongestStreak = Math.max(habit.longestStreak, newCurrentStreak);

            return {
              ...habit,
              completions: [...habit.completions, { date: today }],
              currentStreak: newCurrentStreak,
              longestStreak: newLongestStreak,
              lastCompletionDate: today,
            };
          }
        }
        return habit;
      })
    );
    // Optionally fetch a new quote on completion
    // fetchMotivationalQuote(); 
  };
  
  if (isLoadingHabits) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-sky-100">
        <div className="text-xl font-semibold text-sky-700">習慣を読み込んでいます...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <MotivationalMessage quote={motivationalQuote} isLoading={isLoadingGemini} error={geminiError} onRefresh={fetchMotivationalQuote} />

        <div className="my-8 flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={() => setShowHabitForm(true)}
            className="flex items-center justify-center bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105 w-full sm:w-auto"
          >
            <AddIcon className="w-5 h-5 mr-2" />
            新しい習慣を追加
          </button>
          <button
            onClick={() => setShowHabitSuggester(true)}
            className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105 w-full sm:w-auto"
          >
            <LightBulbIcon className="w-5 h-5 mr-2" />
            習慣のアイデアを見る (AI)
          </button>
           <button
            onClick={fetchNewReflectionPrompt}
            disabled={isLoadingGemini}
            className="flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105 disabled:opacity-50 w-full sm:w-auto"
          >
            <SparklesIcon className="w-5 h-5 mr-2" />
            今日の振り返り (AI)
          </button>
        </div>

        {showHabitForm && (
          <HabitForm
            onAddHabit={addHabit}
            onClose={() => setShowHabitForm(false)}
          />
        )}

        {showHabitSuggester && (
          <HabitSuggester
            onAddSuggestedHabit={(name, description) => {
              addHabit(name, description);
              setShowHabitSuggester(false);
            }}
            onClose={() => setShowHabitSuggester(false)}
            getHabitSuggestions={getHabitSuggestions}
          />
        )}

        {showReflectionModal && reflectionPrompt && (
          <ReflectionModal
            prompt={reflectionPrompt}
            onClose={() => setShowReflectionModal(false)}
            isLoading={isLoadingGemini}
          />
        )}
        
        <HabitList
          habits={habits}
          onToggleComplete={toggleHabitCompletion}
          onDelete={deleteHabit}
        />
      </main>
      <Footer />
    </div>
  );
};

export default App;
