import { SuggestedHabit } from '../types';

const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=';

const request = async (prompt: string): Promise<string> => {
  const res = await fetch(BASE_URL + API_KEY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  if (!res.ok) {
    throw new Error('API request failed');
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

export const getMotivationalQuote = () =>
  request('日本語で短いモチベーションの上がる格言を1つ教えて');

export const getHabitSuggestions = async (): Promise<SuggestedHabit[]> => {
  const text = await request('日本語で習慣のアイデアを3つ箇条書きで教えて');
  return text
    .split('\n')
    .map(t => t.replace(/^[-*\s]+/, '').trim())
    .filter(Boolean)
    .map(line => ({ name: line }));
};

export const getReflectionPrompt = () =>
  request('日本語で1日の振り返りの質問を1つ出してください');
