import React from 'react';
import {
  Calendar,
  AlertCircle,
  CheckCircle2,
  Circle,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { Task } from '../../types';

interface UpcomingTasksProps {
  onViewAllTasks: () => void;
}

export function UpcomingTasks({ onViewAllTasks }: UpcomingTasksProps) {
  const {
    tasks,
    updateTaskStatus,
    setSelectedTask,
    setIsTaskModalOpen,
  } = useTasks();

  const now = new Date().setHours(0, 0, 0, 0);

  // Filter overdue and upcoming
  const overdueTasks = tasks.filter(
    (t) =>
      t.dueDate &&
      t.status !== 'Completed' &&
      new Date(t.dueDate).getTime() < now
  );

  const upcomingTasks = tasks
    .filter(
      (t) =>
        t.dueDate &&
        t.status !== 'Completed' &&
        new Date(t.dueDate).getTime() >= now
    )
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 4);

  const formatDueDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    });
  };

  return (
    <div
      id="upcoming-tasks-card"
      className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Deadlines & Upcoming Schedule
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tasks requiring your immediate attention
            </p>
          </div>

          <button
            onClick={onViewAllTasks}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Overdue alert banner if any */}
        {overdueTasks.length > 0 && (
          <div className="mb-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs font-bold mb-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? 's' : ''}</span>
            </div>
            <div className="space-y-2">
              {overdueTasks.slice(0, 3).map((task) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between gap-2 p-2 bg-white/80 dark:bg-slate-900/80 rounded-lg text-xs"
                >
                  <span className="font-semibold text-slate-900 dark:text-white truncate">
                    {task.title}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                      {new Date(task.dueDate!).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => updateTaskStatus(task._id, 'Completed')}
                      className="p-1 text-slate-400 hover:text-emerald-600"
                      title="Mark as Completed"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming List */}
        <div className="space-y-2.5">
          {upcomingTasks.length === 0 && overdueTasks.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <p>No upcoming deadlines scheduled.</p>
              <button
                onClick={() => {
                  setSelectedTask(null);
                  setIsTaskModalOpen(true);
                }}
                className="mt-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Schedule a Task
              </button>
            </div>
          ) : (
            upcomingTasks.map((task) => {
              const priorityColors = {
                High: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40',
                Medium: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40',
                Low: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
              };

              return (
                <div
                  key={task._id}
                  className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      onClick={() => updateTaskStatus(task._id, 'Completed')}
                      className="text-slate-400 hover:text-emerald-500 transition-colors shrink-0"
                    >
                      <Circle className="w-4 h-4" />
                    </button>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {task.title}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {task.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                        priorityColors[task.priority]
                      }`}
                    >
                      {task.priority}
                    </span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {formatDueDate(task.dueDate!)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
