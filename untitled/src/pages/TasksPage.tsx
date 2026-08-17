import React, { useState } from 'react';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { TaskKanban } from '../components/tasks/TaskKanban';
import { TaskCalendar } from '../components/tasks/TaskCalendar';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ViewMode } from '../types';

interface TasksPageProps {
  initialViewMode?: ViewMode;
}

export function TasksPage({ initialViewMode = 'list' }: TasksPageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const {
    tasks,
    isLoading,
    filters,
    updateFilter,
    currentPage,
    totalPages,
    totalTasks,
    setSelectedTask,
    setIsTaskModalOpen,
  } = useTasks();

  const handleCreateTask = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  return (
    <div id="tasks-page-container" className="space-y-6 animate-in fade-in duration-150">
      {/* Page Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Task Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage, filter, search, and update your personal and work tasks.
          </p>
        </div>

        <button
          id="tasks-page-add-task-btn"
          onClick={handleCreateTask}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-600/30 transition-all active:scale-98 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter & View Switcher Bar */}
      <TaskFilters viewMode={viewMode} setViewMode={setViewMode} />

      {/* Content Rendering based on ViewMode */}
      {isLoading ? (
        <div className="py-16">
          <LoadingSpinner size="lg" label="Loading tasks..." />
        </div>
      ) : tasks.length === 0 && viewMode !== 'calendar' ? (
        <EmptyState
          title={filters.search || filters.status !== 'All' ? 'No matching tasks found' : 'No tasks created yet'}
          description={
            filters.search || filters.status !== 'All'
              ? 'Try changing your search term or filter parameters.'
              : 'Add your first task to start organizing your work and tracking deadlines.'
          }
          icon={filters.search ? 'search' : 'tasks'}
          actionLabel="Create a Task"
          onAction={handleCreateTask}
        />
      ) : (
        <>
          {viewMode === 'list' && (
            <div id="tasks-list-view" className="space-y-3">
              {tasks.map((task) => (
                <TaskCard key={task._id} task={task} viewMode="list" />
              ))}
            </div>
          )}

          {viewMode === 'grid' && (
            <div id="tasks-grid-view" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <TaskCard key={task._id} task={task} viewMode="grid" />
              ))}
            </div>
          )}

          {viewMode === 'kanban' && <TaskKanban />}

          {viewMode === 'calendar' && <TaskCalendar />}

          {/* Pagination for List and Grid modes */}
          {(viewMode === 'list' || viewMode === 'grid') && totalPages > 1 && (
            <div
              id="tasks-pagination-controls"
              className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400"
            >
              <div>
                Showing page <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> of{' '}
                <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span> ({totalTasks} total tasks)
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="pagination-prev-btn"
                  disabled={currentPage <= 1}
                  onClick={() => updateFilter('page', Math.max(1, currentPage - 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => Math.abs(p - currentPage) <= 2 || p === 1 || p === totalPages)
                    .map((pageNum, idx, arr) => {
                      const isCurrent = pageNum === currentPage;
                      return (
                        <React.Fragment key={pageNum}>
                          {idx > 0 && arr[idx - 1] !== pageNum - 1 && (
                            <span className="px-1 text-slate-400">...</span>
                          )}
                          <button
                            onClick={() => updateFilter('page', pageNum)}
                            className={`w-7 h-7 flex items-center justify-center rounded-lg font-bold transition-colors ${
                              isCurrent
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            {pageNum}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <button
                  id="pagination-next-btn"
                  disabled={currentPage >= totalPages}
                  onClick={() => updateFilter('page', Math.min(totalPages, currentPage + 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
