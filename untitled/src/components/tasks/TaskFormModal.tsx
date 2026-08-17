import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  AlertCircle,
  Briefcase,
  UserCircle,
  GraduationCap,
  ShoppingBag,
  MoreHorizontal,
  Loader2,
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { TaskCategory, TaskPriority, TaskStatus } from '../../types';

export function TaskFormModal() {
  const {
    isTaskModalOpen,
    setIsTaskModalOpen,
    selectedTask,
    createTask,
    updateTask,
  } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('Pending');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [category, setCategory] = useState<TaskCategory>('Work');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!selectedTask;

  useEffect(() => {
    if (selectedTask) {
      setTitle(selectedTask.title || '');
      setDescription(selectedTask.description || '');
      setStatus(selectedTask.status || 'Pending');
      setPriority(selectedTask.priority || 'Medium');
      setCategory(selectedTask.category || 'Work');
      setDueDate(
        selectedTask.dueDate
          ? new Date(selectedTask.dueDate).toISOString().split('T')[0]
          : ''
      );
    } else {
      // Reset form
      setTitle('');
      setDescription('');
      setStatus('Pending');
      setPriority('Medium');
      setCategory('Work');
      setDueDate('');
    }
    setError(null);
  }, [selectedTask, isTaskModalOpen]);

  if (!isTaskModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      let success = false;
      if (isEditMode && selectedTask) {
        success = await updateTask(selectedTask._id, {
          title: title.trim(),
          description: description.trim(),
          status,
          priority,
          category,
          dueDate: dueDate || null,
        });
      } else {
        success = await createTask({
          title: title.trim(),
          description: description.trim(),
          status,
          priority,
          category,
          dueDate: dueDate || null,
        });
      }

      if (success) {
        setIsTaskModalOpen(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDueDate = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    setDueDate(d.toISOString().split('T')[0]);
  };

  const categories: TaskCategory[] = ['Work', 'Personal', 'Study', 'Shopping', 'Other'];
  const priorities: TaskPriority[] = ['Low', 'Medium', 'High'];
  const statuses: TaskStatus[] = ['Pending', 'In Progress', 'Completed'];

  return (
    <div
      id="task-form-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        id="task-form-modal-card"
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 my-8 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isEditMode ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isEditMode
                ? 'Update your task details and deadline'
                : 'Fill in the details to add a task to your workspace'}
            </p>
          </div>

          <button
            id="task-modal-close-btn"
            onClick={() => setIsTaskModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="task-title-input"
              type="text"
              required
              maxLength={120}
              placeholder="e.g. Complete Full-Stack Capstone Project"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Description / Notes
            </label>
            <textarea
              id="task-description-input"
              rows={3}
              maxLength={1000}
              placeholder="Add additional context, acceptance criteria, or notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  id={`category-btn-${cat.toLowerCase()}`}
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-2 text-xs font-medium rounded-xl border transition-all ${
                    category === cat
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Priority & Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Priority
              </label>
              <div className="flex gap-2">
                {priorities.map((p) => {
                  const colors = {
                    Low: 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40',
                    Medium: 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/40',
                    High: 'border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-950/40',
                  };
                  return (
                    <button
                      type="button"
                      key={p}
                      id={`priority-btn-${p.toLowerCase()}`}
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all ${
                        priority === p
                          ? `${colors[p]} font-semibold shadow-xs`
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Status
              </label>
              <select
                id="task-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                {statuses.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date & Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Due Date
              </label>
              {dueDate && (
                <button
                  type="button"
                  onClick={() => setDueDate('')}
                  className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                >
                  Clear date
                </button>
              )}
            </div>

            <div className="flex gap-2 mb-2">
              <input
                id="task-due-date-input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Quick date presets */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDueDate(0)}
                className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleQuickDueDate(1)}
                className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => handleQuickDueDate(3)}
                className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors"
              >
                In 3 Days
              </button>
              <button
                type="button"
                onClick={() => handleQuickDueDate(7)}
                className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors"
              >
                Next Week
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              id="task-form-cancel-btn"
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsTaskModalOpen(false)}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              id="task-form-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-600/30 transition-all active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditMode ? 'Update Task' : 'Create Task'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
