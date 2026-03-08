import React from 'react';

interface Props {
  quote: string;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const MotivationalMessage: React.FC<Props> = ({ quote, isLoading, error, onRefresh }) => (
  <div className="text-center my-4">
    {isLoading ? (
      <p>読み込み中...</p>
    ) : error ? (
      <p className="text-red-500">{error}</p>
    ) : (
      <blockquote className="italic">{quote}</blockquote>
    )}
    <button onClick={onRefresh} className="mt-2 text-sm text-sky-600">別の言葉を見る</button>
  </div>
);

export default MotivationalMessage;
