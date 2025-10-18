
import React, { useState, useEffect } from 'react';

interface ScoreGaugeProps {
  score: number;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score }) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setDisplayScore(score));
    return () => cancelAnimationFrame(animation);
  }, [score]);

  const getScoreColor = (s: number) => {
    if (s < 50) return 'text-red-500 dark:text-red-400';
    if (s < 85) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-green-500 dark:text-green-400';
  };

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-52 h-52">
      <svg className="absolute w-full h-full transform -rotate-90">
        <circle
          className="text-slate-200 dark:text-slate-700"
          strokeWidth="12"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="104"
          cy="104"
        />
        <circle
          className={`${getScoreColor(score)} transition-all duration-1000 ease-out`}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="104"
          cy="104"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-5xl font-bold ${getScoreColor(score)}`}>
          {Math.round(displayScore)}
        </span>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">ATS Score</span>
      </div>
    </div>
  );
};

export default ScoreGauge;