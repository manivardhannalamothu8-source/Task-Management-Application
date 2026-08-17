import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Task, DashboardStats, FilterState, TaskCategory, TaskPriority, TaskStatus } from '../types';
import { taskAPI } from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface TaskContextType {
  tasks: Task[];
  stats: DashboardStats | null;
  isLoading: boolean;
  isStatsLoading: boolean;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  updateFilter: (key: keyof FilterState, value: any) => void;
  resetFilters: () => void;
  totalPages: number;
  totalTasks: number;
  currentPage: number;
  fetchTasks: () => Promise<void>;
  fetchStats: () => Promise<void>;
  createTask: (task: {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    category?: TaskCategory;
    dueDate?: string | null;
  }) => Promise<boolean>;
  updateTask: (
    id: string,
    task: Partial<{
      title: string;
      description: string;
      status: TaskStatus;
      priority: TaskPriority;
      category: TaskCategory;
      dueDate: string | null;
    }>
  ) => Promise<boolean>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  isTaskModalOpen: boolean;
  setIsTaskModalOpen: (open: boolean) => void;
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (open: boolean) => void;
  taskToDelete: Task | null;
  setTaskToDelete: (task: Task | null) => void;
}

const initialFilters: FilterState = {
  search: '',
  status: 'All',
  priority: 'All',
  category: 'All',
  sortBy: 'newest',
  page: 1,
  limit: 10,
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(false);

  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalTasks, setTotalTasks] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal states
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key !== 'page' ? { page: 1 } : {}), // Reset to page 1 on filter change
    }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const res = await taskAPI.getTasks({
        page: filters.page,
        limit: filters.limit,
        search: filters.search || undefined,
        status: filters.status,
        priority: filters.priority,
        category: filters.category,
        sortBy: filters.sortBy,
      });

      if (res.success) {
        setTasks(res.tasks);
        setTotalPages(res.totalPages);
        setTotalTasks(res.totalTasks);
        setCurrentPage(res.currentPage);
      }
    } catch (err: any) {
      console.error('Fetch tasks error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, filters]);

  const fetchStats = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsStatsLoading(true);
      const res = await taskAPI.getDashboardStats();
      if (res.success && res.stats) {
        setStats(res.stats);
      }
    } catch (err: any) {
      console.error('Fetch stats error:', err);
    } finally {
      setIsStatsLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch data on filter or auth changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    } else {
      setTasks([]);
      setStats(null);
    }
  }, [isAuthenticated, fetchTasks]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated, fetchStats]);

  // Real-time Socket.IO Listeners
  useEffect(() => {
    if (!isAuthenticated || !user?._id) return;

    const socket = getSocket();

    const handleTaskCreated = (newTask: Task) => {
      // Refresh current list and stats seamlessly
      fetchTasks();
      fetchStats();
      showToast('info', 'Task Created', `"${newTask.title}" added to your workspace.`);
    };

    const handleTaskUpdated = (updatedTask: Task) => {
      setTasks((prev) =>
        prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
      );
      fetchStats();
    };

    const handleTaskDeleted = ({ id }: { id: string }) => {
      setTasks((prev) => prev.filter((t) => t._id !== id));
      fetchStats();
    };

    const handleTaskStatusChanged = (updatedTask: Task) => {
      setTasks((prev) =>
        prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
      );
      fetchStats();
    };

    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:deleted', handleTaskDeleted);
    socket.on('task:status_changed', handleTaskStatusChanged);

    return () => {
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:deleted', handleTaskDeleted);
      socket.off('task:status_changed', handleTaskStatusChanged);
    };
  }, [isAuthenticated, user?._id, fetchTasks, fetchStats, showToast]);

  const createTask = async (taskData: {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    category?: TaskCategory;
    dueDate?: string | null;
  }): Promise<boolean> => {
    try {
      const res = await taskAPI.createTask(taskData);
      if (res.success) {
        showToast('success', 'Task Created', `"${taskData.title}" created successfully.`);
        await fetchTasks();
        await fetchStats();
        return true;
      }
      return false;
    } catch (err: any) {
      showToast('error', 'Error Creating Task', err.message || 'Please check all required fields.');
      return false;
    }
  };

  const updateTask = async (
    id: string,
    taskData: Partial<{
      title: string;
      description: string;
      status: TaskStatus;
      priority: TaskPriority;
      category: TaskCategory;
      dueDate: string | null;
    }>
  ): Promise<boolean> => {
    try {
      const res = await taskAPI.updateTask(id, taskData);
      if (res.success) {
        showToast('success', 'Task Updated', 'Changes saved successfully.');
        await fetchTasks();
        await fetchStats();
        return true;
      }
      return false;
    } catch (err: any) {
      showToast('error', 'Error Updating Task', err.message || 'Could not update task.');
      return false;
    }
  };

  const updateTaskStatus = async (id: string, status: TaskStatus): Promise<boolean> => {
    try {
      // Optimistic update in UI
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? { ...t, status } : t))
      );

      if (status === 'Completed') {
        // Confetti burst for dopamine reward
        try {
          confetti({
            particleCount: 45,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#10B981', '#3B82F6', '#6366F1', '#F59E0B'],
          });
        } catch {
          // ignore
        }
      }

      const res = await taskAPI.updateStatus(id, status);
      if (res.success) {
        showToast(
          status === 'Completed' ? 'success' : 'info',
          'Status Updated',
          `Task marked as ${status}.`
        );
        await fetchStats();
        return true;
      }
      return false;
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message || 'Could not change status.');
      await fetchTasks(); // Revert
      return false;
    }
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    try {
      const res = await taskAPI.deleteTask(id);
      if (res.success) {
        setTasks((prev) => prev.filter((t) => t._id !== id));
        showToast('success', 'Task Deleted', 'The task has been permanently removed.');
        await fetchStats();
        return true;
      }
      return false;
    } catch (err: any) {
      showToast('error', 'Delete Failed', err.message || 'Could not delete task.');
      return false;
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        stats,
        isLoading,
        isStatsLoading,
        filters,
        setFilters,
        updateFilter,
        resetFilters,
        totalPages,
        totalTasks,
        currentPage,
        fetchTasks,
        fetchStats,
        createTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
        selectedTask,
        setSelectedTask,
        isTaskModalOpen,
        setIsTaskModalOpen,
        isDeleteModalOpen,
        setIsDeleteModalOpen,
        taskToDelete,
        setTaskToDelete,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
