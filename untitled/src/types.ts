export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskCategory = 'Work' | 'Personal' | 'Study' | 'Shopping' | 'Other';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt?: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate?: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  highPriorityTasks: number;
  mediumPriorityTasks: number;
  lowPriorityTasks: number;
  overdueTasks: number;
  completionPercentage: number;
  categoryCounts: Record<TaskCategory, number>;
  upcomingTasks: Task[];
}

export interface FilterState {
  search: string;
  status: string; // 'All' | TaskStatus
  priority: string; // 'All' | TaskPriority
  category: string; // 'All' | TaskCategory
  sortBy: 'newest' | 'oldest' | 'dueDate' | 'priority' | 'title';
  page: number;
  limit: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

export type ViewMode = 'list' | 'grid' | 'kanban' | 'calendar';

export interface SystemStatus {
  environment: string;
  database: {
    isMongo: boolean;
    type: string;
    connected: boolean;
  };
  realtime: {
    socketIO: boolean;
    status: string;
  };
  uptime: number;
}
