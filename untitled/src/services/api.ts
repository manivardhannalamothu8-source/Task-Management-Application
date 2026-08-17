import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Task, DashboardStats, User, TaskCategory, TaskPriority, TaskStatus } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: Attach JWT token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('taskflow_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Global token expiry handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      // Clear token if invalid or expired
      const isAuthRoute = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      if (!isAuthRoute) {
        localStorage.removeItem('taskflow_token');
        localStorage.removeItem('taskflow_user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';
    return Promise.reject(new Error(message));
  }
);

// Auth Endpoints
export const authAPI = {
  register: async (data: { name: string; email: string; password: string; confirmPassword?: string }) => {
    const response = await api.post<{ success: boolean; token: string; user: User; message: string }>('/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post<{ success: boolean; token: string; user: User; message: string }>('/auth/login', data);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get<{ success: boolean; user: User }>('/auth/me');
    return response.data;
  },

  updateProfile: async (data: { name?: string; currentPassword?: string; newPassword?: string }) => {
    const response = await api.put<{ success: boolean; message: string; user: User }>('/auth/profile', data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post<{ success: boolean; message: string }>('/auth/logout');
    return response.data;
  },

  seedDemo: async () => {
    const response = await api.post<{ success: boolean; message: string }>('/auth/seed');
    return response.data;
  },
};

// Task Endpoints
export interface GetTasksParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
  sortBy?: string;
}

export interface GetTasksResponse {
  success: boolean;
  tasks: Task[];
  currentPage: number;
  totalPages: number;
  totalTasks: number;
  limit: number;
}

export const taskAPI = {
  getTasks: async (params?: GetTasksParams) => {
    const response = await api.get<GetTasksResponse>('/tasks', { params });
    return response.data;
  },

  getTaskById: async (id: string) => {
    const response = await api.get<{ success: boolean; task: Task }>(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (task: {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    category?: TaskCategory;
    dueDate?: string | null;
  }) => {
    const response = await api.post<{ success: boolean; message: string; task: Task }>('/tasks', task);
    return response.data;
  },

  updateTask: async (
    id: string,
    task: Partial<{
      title: string;
      description: string;
      status: TaskStatus;
      priority: TaskPriority;
      category: TaskCategory;
      dueDate: string | null;
    }>
  ) => {
    const response = await api.put<{ success: boolean; message: string; task: Task }>(`/tasks/${id}`, task);
    return response.data;
  },

  updateStatus: async (id: string, status: TaskStatus) => {
    const response = await api.patch<{ success: boolean; message: string; task: Task }>(`/tasks/${id}/status`, { status });
    return response.data;
  },

  deleteTask: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string; id: string }>(`/tasks/${id}`);
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get<{ success: boolean; stats: DashboardStats }>('/tasks/stats/dashboard');
    return response.data;
  },
};

export const systemAPI = {
  getStatus: async () => {
    const response = await api.get<{ success: boolean; system: any }>('/system/status');
    return response.data;
  },
};

export default api;
