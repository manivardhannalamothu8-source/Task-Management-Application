import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Circle,
  CheckCircle2,
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { Task } from '../../types';

export function TaskCalendar() {
  const { tasks, setSelectedTask, setIsTaskModalOpen } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Map tasks by day key: YYYY-MM-DD
  const tasksByDate: Record<string, Task[]> = {};
  tasks.forEach((task) => {
    if (task.dueDate) {
      const d = new Date(task.dueDate);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!tasksByDate[dateKey]) {
        tasksByDate[dateKey] = [];
      }
      tasksByDate[dateKey].push(task);
    }
  });

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const renderCalendarDays = () => {
    const dayCells = [];

    // Empty cells for preceding month
    for (let i = 0; i < firstDayIndex; i++) {
      dayCells.push(
        <div
          key={`empty-${i}`}
          className="min-h-[100px] p-2 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/60 opacity-40 rounded-xl"
        />
      );
    }

    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTasks = tasksByDate[dateKey] || [];
      const isToday = dateKey === todayKey;

      dayCells.push(
        <div
          key={day}
          id={`calendar-day-${dateKey}`}
          className={`min-h-[110px] p-2 bg-white dark:bg-slate-900 border rounded-xl flex flex-col transition-all hover:border-indigo-400 ${
            isToday
              ? 'border-indigo-500 ring-2 ring-indigo-500/20'
              : 'border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className={`w-6 h-6 flex items-center justify-center text-xs font-bold rounded-full ${
                isToday
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {day}
            </span>
            {dayTasks.length > 0 && (
              <span className="text-[10px] font-bold text-slate-400">
                {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
              </span>
            )}
          </div>

          {/* Task Pills */}
          <div className="flex-1 space-y-1 overflow-y-auto max-h-[80px] scrollbar-none">
            {dayTasks.map((t) => {
              const priorityDot =
                t.priority === 'High'
                  ? 'bg-rose-500'
                  : t.priority === 'Medium'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500';

              return (
                <button
                  key={t._id}
                  onClick={() => {
                    setSelectedTask(t);
                    setIsTaskModalOpen(true);
                  }}
                  className={`w-full text-left px-1.5 py-1 text-[11px] font-medium rounded-lg truncate flex items-center gap-1.5 transition-colors ${
                    t.status === 'Completed'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 line-through'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                  }`}
                  title={`${t.title} (${t.priority} Priority)`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityDot}`} />
                  <span className="truncate">{t.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    return dayCells;
  };

  return (
    <div id="calendar-view-container" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
      {/* Month Header & Controls */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {monthNames[month]} {year}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Click on any task to view or edit details
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Header */}
      <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
        {daysOfWeek.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-2">
        {renderCalendarDays()}
      </div>
    </div>
  );
}
