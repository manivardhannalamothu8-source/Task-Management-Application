import React from 'react';
import {
  Filter,
  ArrowUpDown,
  LayoutList,
  LayoutGrid,
  KanbanSquare,
  Calendar,
  X,
  RotateCcw,
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { TaskStatus, TaskPriority, TaskCategory, ViewMode } from '../../types';

interface TaskFiltersProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export function TaskFilters({ viewMode, setViewMode }: TaskFiltersProps) {
  const { filters, updateFilter, resetFilters } = useTasks();

  const statuses: Array<{ id: string; label: string }> = [
    { id: 'All', label: 'All Statuses' },
    { id: 'Pending', label: 'Pending' },
    { id: 'In Progress', label: 'In Progress' },
    { id: 'Completed', label: 'Completed' },
  ];

  const priorities: Array<{ id: string; label: string }> = [
    { id: 'All', label: 'All Priorities' },
    { id: 'High', label: 'High Priority' },
    { id: 'Medium', label: 'Medium Priority' },
    { id: 'Low', label: 'Low Priority' },
  ];

  const categories: Array<{ id: string; label: string }> = [
    { id: 'All', label: 'All Categories' },
    { id: 'Work', label: 'Work' },
    { id: 'Personal', label: 'Personal' },
    { id: 'Study', label: 'Study' },
    { id: 'Shopping', label: 'Shopping' },
    { id: 'Other', label: 'Other' },
  ];

  const sortOptions = [
    { id: 'newest', label: 'Newest First' },
    { id: 'oldest', label: 'Oldest First' },
    { id: 'dueDate', label: 'Due Date' },
    { id: 'priority', label: 'Highest Priority' },
    { id: 'title', label: 'Alphabetical (A-Z)' },
  ];

  const isFiltered =
    filters.status !== 'All' ||
    filters.priority !== 'All' ||
    filters.category !== 'All' ||
    filters.search !== '' ||
    filters.sortBy !== 'newest';

  return (
    <div
      id="task-filter-panel"
      className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-xs space-y-4"
    >
      {/* Top Filter Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3.5">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 w-full lg:w-auto scrollbar-none">
          {statuses.map((st) => {
            const isActive = filters.status === st.id;
            return (
              <button
                key={st.id}
                id={`filter-status-${st.id.toLowerCase().replace(' ', '-')}`}
                onClick={() => updateFilter('status', st.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {st.label}
              </button>
            );
          })}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 self-end lg:self-auto">
          <button
            id="view-mode-list-btn"
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
            title="List View"
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button
            id="view-mode-grid-btn"
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            id="view-mode-kanban-btn"
            onClick={() => setViewMode('kanban')}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'kanban'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
            title="Kanban View"
          >
            <KanbanSquare className="w-4 h-4" />
          </button>
          <button
            id="view-mode-calendar-btn"
            onClick={() => setViewMode('calendar')}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'calendar'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
            title="Calendar View"
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Secondary Dropdown Filter Strip */}
      <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        {/* Priority Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium">Priority:</span>
          <select
            id="filter-priority-select"
            value={filters.priority}
            onChange={(e) => updateFilter('priority', e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {priorities.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium">Category:</span>
          <select
            id="filter-category-select"
            value={filters.category}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3" />
            Sort:
          </span>
          <select
            id="filter-sort-select"
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {sortOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filters */}
        {isFiltered && (
          <button
            id="reset-filters-btn"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors ml-auto"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}
