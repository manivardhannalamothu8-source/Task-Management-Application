import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  colorScheme: 'indigo' | 'amber' | 'blue' | 'emerald' | 'rose';
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme,
  onClick,
}: StatCardProps) {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      text: 'text-indigo-600 dark:text-indigo-400',
      ring: 'ring-indigo-100 dark:ring-indigo-900/30',
      border: 'hover:border-indigo-300 dark:hover:border-indigo-800',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-600 dark:text-amber-400',
      ring: 'ring-amber-100 dark:ring-amber-900/30',
      border: 'hover:border-amber-300 dark:hover:border-amber-800',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      text: 'text-blue-600 dark:text-blue-400',
      ring: 'ring-blue-100 dark:ring-blue-900/30',
      border: 'hover:border-blue-300 dark:hover:border-blue-800',
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-600 dark:text-emerald-400',
      ring: 'ring-emerald-100 dark:ring-emerald-900/30',
      border: 'hover:border-emerald-300 dark:hover:border-emerald-800',
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-600 dark:text-rose-400',
      ring: 'ring-rose-100 dark:ring-rose-900/30',
      border: 'hover:border-rose-300 dark:hover:border-rose-800',
    },
  };

  const scheme = colorMap[colorScheme];

  return (
    <div
      id={`stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
      onClick={onClick}
      className={`relative p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md ' + scheme.border : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${scheme.bg} ${scheme.text}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {value}
        </span>
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}
