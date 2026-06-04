'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Flame, Star, Trophy, Zap } from 'lucide-react';

interface Badge {
  id: string;
  label: string;
  icon: string;
  description: string;
  earned: boolean;
}

interface Stats {
  xp: number;
  level: number;
  xpToNextLevel: number;
  xpProgress: number;
  streak: number;
  completedLessons: number;
  certificates: number;
  badges: Badge[];
  earnedBadges: number;
}

export default function StatsWidget() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/api/student/stats')
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-4" />
        <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
          Your Progress
        </h3>
        <span className="text-xs text-brand-600 font-medium bg-brand-50 dark:bg-brand-900/20 px-2 py-0.5 rounded-full">
          Level {stats.level}
        </span>
      </div>

      {/* XP bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span className="flex items-center gap-1">
            <Star size={11} className="text-amber-400" /> {stats.xp} XP
          </span>
          <span>{stats.xpToNextLevel} XP to Level {stats.level + 1}</span>
        </div>
        <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full transition-all duration-700"
            style={{ width: `${stats.xpProgress}%` }}
          />
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: <Flame size={16} className={stats.streak > 0 ? 'text-orange-500' : 'text-gray-400'} />,
            value: stats.streak,
            label: 'Day streak',
            highlight: stats.streak >= 7,
          },
          {
            icon: <Zap size={16} className="text-blue-500" />,
            value: stats.completedLessons,
            label: 'Lessons done',
            highlight: false,
          },
          {
            icon: <Trophy size={16} className="text-amber-500" />,
            value: stats.certificates,
            label: 'Certificates',
            highlight: stats.certificates > 0,
          },
        ].map(({ icon, value, label, highlight }) => (
          <div
            key={label}
            className={`text-center p-3 rounded-xl ${
              highlight
                ? 'bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30'
                : 'bg-gray-50 dark:bg-gray-800/50'
            }`}
          >
            <div className="flex justify-center mb-1">{icon}</div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Badges
          </p>
          <p className="text-xs text-gray-400">
            {stats.earnedBadges}/{stats.badges.length} earned
          </p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {stats.badges.map((badge) => (
            <div
              key={badge.id}
              title={`${badge.label}: ${badge.description}`}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all cursor-default ${
                badge.earned
                  ? 'bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-900/40'
                  : 'bg-gray-50 dark:bg-gray-800/40 opacity-40'
              }`}
            >
              <span className="text-xl">{badge.icon}</span>
              <span className="text-[9px] text-center text-gray-500 dark:text-gray-400 leading-tight line-clamp-2">
                {badge.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
