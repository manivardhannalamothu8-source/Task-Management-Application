import React from 'react';
import { BarChart3, PieChart } from 'lucide-react';
import { DashboardStats, TaskCategory } from '../../types';

interface PriorityChartProps {
  stats: DashboardStats | null;
}

export function PriorityChart({ stats }: PriorityChartProps) {
  const high = stats?.highPriorityTasks || 0;
  const medium = stats?.mediumPriorityTasks || 0;
  const low = stats?.lowPriorityTasks || 0;
  const total = high + medium + low || 1;

  const highPct = Math.round((high / total) * 100);
  const mediumPct = Math.round((medium / total) * 100);
  const lowPct = Math.round((low / total) * 100);

  const categories: Array<{ id: TaskCategory; label: string; color: string }> = [
    { id: 'Work', label: 'Work', color: 'bg-blue-500' },
    { id: 'Personal', label: 'Personal', color: 'bg-emerald-500' },
    { id: 'Study', label: 'Study', color: 'bg-purple-500' },
    { id: 'Shopping', label: 'Shopping', color: 'bg-amber-500' },
    { id: 'Other', label: 'Other', color: 'bg-slate-400' },
  ];

  return (
    <div
      id="priority-category-charts-card"
      className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Priority & Category Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Task breakdown by urgency and type
            </p>
          </div>
        </div>

        {/* Priority Segmented Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Priority Spread</span>
            <span className="text-slate-400 font-normal text-[11px]">
              {high + medium + low} Total Tasks
            </span>
          </div>

          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${highPct}%` }}
              className="bg-rose-500 transition-all duration-500"
              title={`High Priority: ${high} tasks (${highPct}%)`}
            />
            <div
              style={{ width: `${mediumPct}%` }}
              className="bg-amber-500 transition-all duration-500"
              title={`Medium Priority: ${medium} tasks (${mediumPct}%)`}
            />
            <div
              style={{ width: `${lowPct}%` }}
              className="bg-emerald-500 transition-all duration-500"
              title={`Low Priority: ${low} tasks (${lowPct}%)`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> High: {high} ({highPct}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Med: {medium} ({mediumPct}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Low: {low} ({lowPct}%)
            </span>
          </div>
        </div>

        {/* Categories Linear List */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
            Category Breakdown
          </span>

          <div className="space-y-1.5">
            {categories.map((cat) => {
              const count = stats?.categoryCounts?.[cat.id] || 0;
              const max = stats?.totalTasks || 1;
              const pct = Math.round((count / max) * 100);

              return (
                <div key={cat.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                      {cat.label}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {count}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full ${cat.color}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
