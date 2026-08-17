import React from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Edit3,
  Trash2,
  CheckCircle2,
  Circle,
  AlertCircle,
  Briefcase,
  UserCircle,
  GraduationCap,
  ShoppingBag,
  MoreHorizontal,
  ChevronDown,
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus, TaskCategory } from '../../types';
import { useTasks } from '../../context/TaskContext';

interface TaskCardProps {
  task: Task;
  viewMode?: 'list' | 'grid';
}

export function TaskCard({ task, viewMode = 'list' }: TaskCardProps) {
  const {
    updateTaskStatus,
    setSelectedTask,
    setIsTaskModalOpen,
    setTaskToDelete,
    setIsDeleteModalOpen,
  } = useTasks();

  const isCompleted = task.status === 'Completed';
  const isInProgress = task.status === 'In Progress';

  // Check if overdue
  const isOverdue =
    task.dueDate &&
    !isCompleted &&
    new Date(task.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

  const priorityStyles: Record<TaskPriority, { bg: string; text: string; border: string }> = {
    High: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-400',
      border: 'border-rose-200 dark:border-rose-900/50',
    },
    Medium: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-900/50',
    },
    Low: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-900/50',
    },
  };

  const categoryIcons: Record<TaskCategory, any> = {
    Work: Briefcase,
    Personal: UserCircle,
    Study: GraduationCap,
    Shopping: ShoppingBag,
    Other: MoreHorizontal,
  };

  const CategoryIcon = categoryIcons[task.category] || MoreHorizontal;

  const handleToggleComplete = () => {
    updateTaskStatus(task._id, isCompleted ? 'Pending' : 'Completed');
  };

  const handleEdit = () => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleDelete = () => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const formatDueDate = (dateString?: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <div
      id={`task-card-${task._id}`}
      className={`group relative bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 hover:shadow-md ${
        isCompleted
          ? 'border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 opacity-75'
          : isOverdue
          ? 'border-rose-200 dark:border-rose-900/50 hover:border-rose-300'
          : 'border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800'
      } ${viewMode === 'grid' ? 'p-5 flex flex-col justify-between h-full' : 'p-4 sm:p-5'}`}
    >
      <div className="flex items-start gap-3.5">
        {/* Checkbox */}
        <button
          id={`task-checkbox-${task._id}`}
          onClick={handleToggleComplete}
          className="mt-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
          title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
          ) : (
            <Circle className="w-5 h-5 text-slate-400 hover:text-indigo-600" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            {/* Category Pill */}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <CategoryIcon className="w-3 h-3 text-slate-500 dark:text-slate-400" />
              {task.category}
            </span>

            {/* Priority Badge */}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                priorityStyles[task.priority]?.bg || ''
              } ${priorityStyles[task.priority]?.text || ''} ${
                priorityStyles[task.priority]?.border || ''
              }`}
            >
              {task.priority} Priority
            </span>

            {/* Status Badge */}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                isCompleted
                  ? 'bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                  : isInProgress
                  ? 'bg-blue-100/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {task.status}
            </span>
          </div>

          <h3
            className={`text-base font-semibold text-slate-900 dark:text-white leading-snug break-words ${
              isCompleted ? 'line-through text-slate-500 dark:text-slate-500' : ''
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed break-words">
              {task.description}
            </p>
          )}

          {/* Footer Metadata & Actions */}
          <div className="mt-3.5 flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-400">
            {/* Due Date & Overdue */}
            <div className="flex items-center gap-3">
              {task.dueDate ? (
                <div
                  className={`flex items-center gap-1.5 font-medium ${
                    isOverdue
                      ? 'text-rose-600 dark:text-rose-400 font-semibold'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {isOverdue ? (
                    <AlertCircle className="w-3.5 h-3.5" />
                  ) : (
                    <CalendarIcon className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isOverdue ? 'Overdue: ' : 'Due: '}
                    {formatDueDate(task.dueDate)}
                  </span>
                </div>
              ) : (
                <span className="text-slate-400 italic">No due date</span>
              )}

              {/* Created timestamp */}
              <div className="hidden sm:flex items-center gap-1 text-slate-400">
                <Clock className="w-3 h-3" />
                <span>{new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Actions: Status switcher, Edit, Delete */}
            <div className="flex items-center gap-1">
              {/* Quick status change button */}
              <select
                id={`task-status-select-${task._id}`}
                value={task.status}
                onChange={(e) => updateTaskStatus(task._id, e.target.value as TaskStatus)}
                className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium py-1 px-2 rounded-lg border-0 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <button
                id={`task-edit-btn-${task._id}`}
                onClick={handleEdit}
                className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Edit Task"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>

              <button
                id={`task-delete-btn-${task._id}`}
                onClick={handleDelete}
                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                title="Delete Task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
