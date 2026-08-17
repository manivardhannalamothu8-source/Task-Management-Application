import mongoose from 'mongoose';
import { readEmbeddedData, writeEmbeddedData } from './db.js';
import UserModel, { IUser } from '../models/User.js';
import TaskModel, { ITask, TaskCategory, TaskPriority, TaskStatus } from '../models/Task.js';

function isMongo() {
  return mongoose.connection.readyState === 1;
}

function generateId(): string {
  return new mongoose.Types.ObjectId().toString();
}

// User DAO
export const UserDAO = {
  async findByEmail(email: string, includePassword = false) {
    if (isMongo()) {
      const query = UserModel.findOne({ email: email.toLowerCase().trim() });
      if (includePassword) query.select('+password');
      return await query.exec();
    }
    const data = readEmbeddedData();
    const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) return null;
    if (!includePassword) {
      const { password, ...rest } = user;
      return rest;
    }
    return user;
  },

  async findById(id: string) {
    if (isMongo()) {
      return await UserModel.findById(id).select('-password').exec();
    }
    const data = readEmbeddedData();
    const user = data.users.find(u => u._id === id);
    if (!user) return null;
    const { password, ...rest } = user;
    return rest;
  },

  async create(userData: { name: string; email: string; password: string; role?: 'user' | 'admin' }) {
    if (isMongo()) {
      const user = await UserModel.create({
        name: userData.name,
        email: userData.email.toLowerCase().trim(),
        password: userData.password,
        role: userData.role || 'user',
      });
      const userObj = user.toObject();
      delete userObj.password;
      return userObj;
    }
    const data = readEmbeddedData();
    const existing = data.users.find(u => u.email.toLowerCase() === userData.email.toLowerCase().trim());
    if (existing) {
      throw new Error('User with this email already exists');
    }
    const now = new Date().toISOString();
    const newUser = {
      _id: generateId(),
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      password: userData.password,
      role: userData.role || 'user',
      createdAt: now,
      updatedAt: now,
    };
    data.users.push(newUser);
    writeEmbeddedData(data);
    const { password, ...rest } = newUser;
    return rest;
  },

  async update(id: string, updateData: Partial<{ name: string; password: string; role: 'user' | 'admin' }>) {
    if (isMongo()) {
      return await UserModel.findByIdAndUpdate(id, updateData, { new: true }).select('-password').exec();
    }
    const data = readEmbeddedData();
    const index = data.users.findIndex(u => u._id === id);
    if (index === -1) return null;
    const now = new Date().toISOString();
    data.users[index] = {
      ...data.users[index],
      ...updateData,
      updatedAt: now,
    };
    writeEmbeddedData(data);
    const { password, ...rest } = data.users[index];
    return rest;
  }
};

// Task DAO
export interface TaskQueryParams {
  userId: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
  sortBy?: 'newest' | 'oldest' | 'dueDate' | 'priority' | 'title';
}

export const TaskDAO = {
  async findMany(params: TaskQueryParams) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 10));
    const skip = (page - 1) * limit;

    if (isMongo()) {
      const filter: any = { userId: params.userId };

      if (params.status && params.status !== 'All') {
        filter.status = params.status;
      }
      if (params.priority && params.priority !== 'All') {
        filter.priority = params.priority;
      }
      if (params.category && params.category !== 'All') {
        filter.category = params.category;
      }
      if (params.search) {
        const regex = new RegExp(params.search, 'i');
        filter.$or = [
          { title: regex },
          { description: regex },
          { category: regex }
        ];
      }

      let sort: any = { createdAt: -1 };
      if (params.sortBy === 'oldest') sort = { createdAt: 1 };
      if (params.sortBy === 'dueDate') sort = { dueDate: 1, createdAt: -1 };
      if (params.sortBy === 'priority') sort = { priority: -1, createdAt: -1 };
      if (params.sortBy === 'title') sort = { title: 1 };

      const [tasks, totalTasks] = await Promise.all([
        TaskModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
        TaskModel.countDocuments(filter).exec()
      ]);

      const totalPages = Math.ceil(totalTasks / limit) || 1;

      return {
        tasks,
        currentPage: page,
        totalPages,
        totalTasks,
        limit,
      };
    }

    // Embedded store implementation
    const data = readEmbeddedData();
    let userTasks = data.tasks.filter(t => t.userId === params.userId);

    if (params.status && params.status !== 'All') {
      userTasks = userTasks.filter(t => t.status === params.status);
    }
    if (params.priority && params.priority !== 'All') {
      userTasks = userTasks.filter(t => t.priority === params.priority);
    }
    if (params.category && params.category !== 'All') {
      userTasks = userTasks.filter(t => t.category === params.category);
    }
    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      userTasks = userTasks.filter(
        t =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          t.category.toLowerCase().includes(q)
      );
    }

    // Sort
    const priorityWeight: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
    userTasks.sort((a, b) => {
      if (params.sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (params.sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (params.sortBy === 'priority') {
        return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      }
      if (params.sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      // default newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const totalTasks = userTasks.length;
    const totalPages = Math.ceil(totalTasks / limit) || 1;
    const paginatedTasks = userTasks.slice(skip, skip + limit);

    return {
      tasks: paginatedTasks,
      currentPage: page,
      totalPages,
      totalTasks,
      limit,
    };
  },

  async findById(id: string, userId: string) {
    if (isMongo()) {
      return await TaskModel.findOne({ _id: id, userId }).exec();
    }
    const data = readEmbeddedData();
    return data.tasks.find(t => t._id === id && t.userId === userId) || null;
  },

  async create(taskData: {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    category?: TaskCategory;
    dueDate?: string | Date | null;
    userId: string;
  }) {
    if (isMongo()) {
      return await TaskModel.create({
        title: taskData.title.trim(),
        description: taskData.description?.trim() || '',
        status: taskData.status || 'Pending',
        priority: taskData.priority || 'Medium',
        category: taskData.category || 'Work',
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        userId: taskData.userId,
      });
    }

    const data = readEmbeddedData();
    const now = new Date().toISOString();
    const newTask = {
      _id: generateId(),
      title: taskData.title.trim(),
      description: taskData.description?.trim() || '',
      status: (taskData.status || 'Pending') as TaskStatus,
      priority: (taskData.priority || 'Medium') as TaskPriority,
      category: (taskData.category || 'Work') as TaskCategory,
      dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : undefined,
      userId: taskData.userId,
      createdAt: now,
      updatedAt: now,
    };
    data.tasks.unshift(newTask);
    writeEmbeddedData(data);
    return newTask;
  },

  async update(id: string, userId: string, updateData: Partial<{
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    category: TaskCategory;
    dueDate: string | Date | null;
  }>) {
    if (isMongo()) {
      const payload: any = { ...updateData };
      if (updateData.dueDate !== undefined) {
        payload.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null;
      }
      return await TaskModel.findOneAndUpdate(
        { _id: id, userId },
        { $set: payload },
        { new: true, runValidators: true }
      ).exec();
    }

    const data = readEmbeddedData();
    const index = data.tasks.findIndex(t => t._id === id && t.userId === userId);
    if (index === -1) return null;

    const now = new Date().toISOString();
    const updated = {
      ...data.tasks[index],
      ...updateData,
      dueDate: updateData.dueDate !== undefined
        ? (updateData.dueDate ? new Date(updateData.dueDate).toISOString() : undefined)
        : data.tasks[index].dueDate,
      updatedAt: now,
    };
    data.tasks[index] = updated;
    writeEmbeddedData(data);
    return updated;
  },

  async delete(id: string, userId: string) {
    if (isMongo()) {
      const result = await TaskModel.findOneAndDelete({ _id: id, userId }).exec();
      return !!result;
    }
    const data = readEmbeddedData();
    const initialLen = data.tasks.length;
    data.tasks = data.tasks.filter(t => !(t._id === id && t.userId === userId));
    const deleted = data.tasks.length < initialLen;
    if (deleted) writeEmbeddedData(data);
    return deleted;
  },

  async getStats(userId: string) {
    const now = new Date();
    if (isMongo()) {
      const tasks = await TaskModel.find({ userId }).lean().exec();
      return calculateStats(tasks, now);
    }
    const data = readEmbeddedData();
    const tasks = data.tasks.filter(t => t.userId === userId);
    return calculateStats(tasks, now);
  },

  async seedUserTasks(userId: string) {
    const sampleTasks = [
      {
        title: 'Complete Full-Stack Architecture Review',
        description: 'Review the REST endpoints, token middleware, and MongoDB index configurations for production deployment.',
        status: 'In Progress' as TaskStatus,
        priority: 'High' as TaskPriority,
        category: 'Work' as TaskCategory,
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        userId,
      },
      {
        title: 'Prepare for Technical Interview',
        description: 'Practice dynamic programming, React hooks lifecycle, and system design questions.',
        status: 'Pending' as TaskStatus,
        priority: 'High' as TaskPriority,
        category: 'Study' as TaskCategory,
        dueDate: new Date(Date.now() + 86400000 * 4).toISOString(),
        userId,
      },
      {
        title: 'Finish React & Tailwind Component Library',
        description: 'Ensure all modals, toast notifications, and dark mode themes pass accessibility WCAG AA standards.',
        status: 'Completed' as TaskStatus,
        priority: 'Medium' as TaskPriority,
        category: 'Work' as TaskCategory,
        dueDate: new Date(Date.now() - 86400000 * 1).toISOString(),
        userId,
      },
      {
        title: 'Study Database Management & Index Optimization',
        description: 'Read MongoDB indexing strategies for compound query keys and compound sorting performance.',
        status: 'In Progress' as TaskStatus,
        priority: 'Medium' as TaskPriority,
        category: 'Study' as TaskCategory,
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
        userId,
      },
      {
        title: 'Submit College Capstone Assignment',
        description: 'Submit project report, GitHub repository link, and live demonstration video.',
        status: 'Pending' as TaskStatus,
        priority: 'High' as TaskPriority,
        category: 'Study' as TaskCategory,
        dueDate: new Date(Date.now() - 86400000 * 2).toISOString(), // Overdue example
        userId,
      },
      {
        title: 'Buy Groceries & Weekly Essentials',
        description: 'Organic vegetables, almond milk, coffee beans, and fresh fruits.',
        status: 'Completed' as TaskStatus,
        priority: 'Low' as TaskPriority,
        category: 'Shopping' as TaskCategory,
        dueDate: new Date(Date.now() - 86400000 * 3).toISOString(),
        userId,
      },
      {
        title: 'Evening 5km Jog & Mindfulness Routine',
        description: '30 mins outdoor run followed by 10 mins breathing exercise.',
        status: 'Pending' as TaskStatus,
        priority: 'Low' as TaskPriority,
        category: 'Personal' as TaskCategory,
        dueDate: new Date(Date.now() + 86400000 * 1).toISOString(),
        userId,
      }
    ];

    for (const t of sampleTasks) {
      await this.create(t);
    }
  }
};

function calculateStats(tasks: any[], now: Date) {
  const totalTasks = tasks.length;
  let pendingTasks = 0;
  let inProgressTasks = 0;
  let completedTasks = 0;
  let highPriorityTasks = 0;
  let mediumPriorityTasks = 0;
  let lowPriorityTasks = 0;
  let overdueTasks = 0;

  const categoryCounts: Record<string, number> = {
    Work: 0,
    Personal: 0,
    Study: 0,
    Shopping: 0,
    Other: 0,
  };

  const upcomingTasks: any[] = [];

  for (const t of tasks) {
    if (t.status === 'Pending') pendingTasks++;
    else if (t.status === 'In Progress') inProgressTasks++;
    else if (t.status === 'Completed') completedTasks++;

    if (t.priority === 'High') highPriorityTasks++;
    else if (t.priority === 'Medium') mediumPriorityTasks++;
    else if (t.priority === 'Low') lowPriorityTasks++;

    if (t.category && categoryCounts[t.category] !== undefined) {
      categoryCounts[t.category]++;
    } else {
      categoryCounts['Other'] = (categoryCounts['Other'] || 0) + 1;
    }

    if (t.dueDate) {
      const d = new Date(t.dueDate);
      if (t.status !== 'Completed' && d < now) {
        overdueTasks++;
      }
      if (t.status !== 'Completed' && d >= now) {
        upcomingTasks.push(t);
      }
    }
  }

  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Sort upcoming tasks by due date
  upcomingTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return {
    totalTasks,
    pendingTasks,
    inProgressTasks,
    completedTasks,
    highPriorityTasks,
    mediumPriorityTasks,
    lowPriorityTasks,
    overdueTasks,
    completionPercentage,
    categoryCounts,
    upcomingTasks: upcomingTasks.slice(0, 5),
  };
}
