import React from 'react';
import {
  CheckSquare,
  Clock,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Plus,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { StatCard } from '../components/dashboard/StatCard';
import { CompletionProgress } from '../components/dashboard/CompletionProgress';
import { PriorityChart } from '../components/dashboard/PriorityChart';
import { UpcomingTasks } from '../components/dashboard/UpcomingTasks';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface DashboardPageProps {
  onNavigateToTasks: () => void;
  onNavigateToKanban: () => void;
}

export function DashboardPage({ onNavigateToTasks, onNavigateToKanban }: DashboardPageProps) {
  const { user } = useAuth();
  const {
    stats,
    isStatsLoading,
    fetchStats,
    fetchTasks,
    updateFilter,
    setIsTaskModalOpen,
    setSelectedTask,
  } = useTasks();

  const handleStatClick = (statusFilter: string) => {
    updateFilter('status', statusFilter);
    onNavigateToTasks();
  };

  const handlePriorityClick = (priorityFilter: string) => {
    updateFilter('priority', priorityFilter);
    onNavigateToTasks();
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div id="dashboard-page-container" className="space-y-8 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
            {todayFormatted}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Hello, {user?.name || 'there'}! 👋
          </h1>
          <p className="text-sm text-indigo-200/80 mt-1 max-w-xl">
            Here is your productivity overview for today. You have{' '}
            <span className="font-bold text-white">
              {stats?.pendingTasks || 0} pending
            </span>{' '}
            and{' '}
            <span className="font-bold text-white">
              {stats?.inProgressTasks || 0} in progress
            </span>{' '}
            tasks.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 self-start sm:self-center">
          <button
            id="dashboard-refresh-btn"
            onClick={() => {
              fetchStats();
              fetchTasks();
            }}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors backdrop-blur-xs"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${isStatsLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            id="dashboard-create-task-btn"
            onClick={() => {
              setSelectedTask(null);
              setIsTaskModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Task Metrics
          </h2>
          <span className="text-xs text-slate-400">
            Click any metric to filter tasks
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total Tasks"
            value={stats?.totalTasks ?? 0}
            subtitle="All recorded tasks"
            icon={CheckSquare}
            colorScheme="indigo"
            onClick={() => handleStatClick('All')}
          />
          <StatCard
            title="Pending"
            value={stats?.pendingTasks ?? 0}
            subtitle="Waiting to start"
            icon={Clock}
            colorScheme="amber"
            onClick={() => handleStatClick('Pending')}
          />
          <StatCard
            title="In Progress"
            value={stats?.inProgressTasks ?? 0}
            subtitle="Actively working"
            icon={PlayCircle}
            colorScheme="blue"
            onClick={() => handleStatClick('In Progress')}
          />
          <StatCard
            title="Completed"
            value={stats?.completedTasks ?? 0}
            subtitle="Successfully done"
            icon={CheckCircle2}
            colorScheme="emerald"
            onClick={() => handleStatClick('Completed')}
          />
          <StatCard
            title="High Priority"
            value={stats?.highPriorityTasks ?? 0}
            subtitle="Urgent delivery"
            icon={AlertTriangle}
            colorScheme="rose"
            onClick={() => handlePriorityClick('High')}
          />
          <StatCard
            title="Overdue"
            value={stats?.overdueTasks ?? 0}
            subtitle="Past due deadline"
            icon={AlertCircle}
            colorScheme="rose"
            onClick={onNavigateToTasks}
          />
        </div>
      </div>

      {/* Visual Analytics & Schedules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Card */}
        <CompletionProgress stats={stats} />

        {/* Priority & Category Breakdown */}
        <PriorityChart stats={stats} />

        {/* Upcoming Deadlines */}
        <UpcomingTasks onViewAllTasks={onNavigateToTasks} />
      </div>
    </div>
  );
}
