import React from 'react';
import { CheckSquare, Plus, FolderSearch } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: 'tasks' | 'search';
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = 'No tasks found',
  description = 'Get started by creating your first task to stay organized and boost productivity.',
  icon = 'tasks',
  actionLabel = 'Create Your First Task',
  onAction,
}: EmptyStateProps) {
  return (
    <div
      id="empty-state-container"
      className="flex flex-col items-center justify-center text-center p-10 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl my-6"
    >
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 ring-8 ring-indigo-50/50 dark:ring-indigo-950/20">
        {icon === 'search' ? (
          <FolderSearch className="w-8 h-8" />
        ) : (
          <CheckSquare className="w-8 h-8" />
        )}
      </div>

      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>

      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {onAction && actionLabel && (
        <button
          id="empty-state-action-btn"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm shadow-indigo-600/20 transition-all active:scale-98"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
