import React from 'react';
import { CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';
import { DashboardStats } from '../../types';

interface CompletionProgressProps {
  stats: DashboardStats | null;
}

export function CompletionProgress({ stats }: CompletionProgressProps) {
  const percentage = stats?.completionPercentage || 0;
  const total = stats?.totalTasks || 0;
  const completed = stats?.completedTasks || 0;
  const pending = stats?.pendingTasks || 0;
  const inProgress = stats?.inProgressTasks || 0;

  // SVG Circular progress math
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      id="completion-progress-card"
      className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Overall Progress
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Your task completion rate
          </p>
        </div>

        {percentage === 100 && total > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full">
            <Sparkles className="w-3 h-3" /> All Done!
          </span>
        )}
      </div>

      <div className="flex items-center justify-around py-4">
        {/* Circular Ring */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="text-slate-100 dark:text-slate-800 stroke-current"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Progress Stroke */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="text-indigo-600 dark:text-indigo-500 stroke-current transition-all duration-1000 ease-out"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {percentage}%
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Done
            </span>
          </div>
        </div>

        {/* Legend / Breakdown */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600 dark:text-slate-300">Completed</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white">{completed}</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-slate-600 dark:text-slate-300">In Progress</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white">{inProgress}</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span className="text-slate-600 dark:text-slate-300">Pending</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white">{pending}</span>
          </div>
        </div>
      </div>

      {/* Progress Message */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
        <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
        <span>
          {total === 0
            ? 'No tasks created yet. Start by adding one!'
            : completed === total
            ? 'Phenomenal work! You completed all tasks.'
            : `${total - completed} remaining tasks to reach 100% completion.`}
        </span>
      </div>
    </div>
  );
}
