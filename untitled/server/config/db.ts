import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface for embedded data storage fallback
export interface EmbeddedData {
  users: Array<{
    _id: string;
    name: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
    createdAt: string;
    updatedAt: string;
  }>;
  tasks: Array<{
    _id: string;
    title: string;
    description?: string;
    status: 'Pending' | 'In Progress' | 'Completed';
    priority: 'Low' | 'Medium' | 'High';
    category: 'Work' | 'Personal' | 'Study' | 'Shopping' | 'Other';
    dueDate?: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data folder and file exist with demo accounts
function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const salt = bcrypt.genSaltSync(10);
    const alexPass = bcrypt.hashSync('Password123!', salt);
    const adminPass = bcrypt.hashSync('AdminPass2026!', salt);

    const alexId = 'user_alex_morgan_001';
    const adminId = 'user_sarah_admin_002';
    const now = new Date();

    const todayStr = new Date().toISOString();
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString();
    const nextWeekStr = new Date(Date.now() + 7 * 86400000).toISOString();
    const pastStr = new Date(Date.now() - 2 * 86400000).toISOString();

    const initialData: EmbeddedData = {
      users: [
        {
          _id: alexId,
          name: 'Alex Morgan',
          email: 'alex.morgan@taskflow.dev',
          password: alexPass,
          role: 'user',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        },
        {
          _id: adminId,
          name: 'Sarah Connor (Admin)',
          email: 'sarah.admin@taskflow.dev',
          password: adminPass,
          role: 'admin',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        },
      ],
      tasks: [
        {
          _id: 'task_001',
          title: 'Implement JWT Authentication & Refresh Interceptor',
          description: 'Ensure token expiration is handled gracefully with axios response interceptors and bcrypt hashing.',
          status: 'Completed',
          priority: 'High',
          category: 'Work',
          dueDate: pastStr,
          userId: alexId,
          createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
          updatedAt: todayStr,
        },
        {
          _id: 'task_002',
          title: 'Build Interactive Kanban Drag and Drop View',
          description: 'Support seamless column transitions across Pending, In Progress, and Completed states.',
          status: 'In Progress',
          priority: 'High',
          category: 'Work',
          dueDate: tomorrowStr,
          userId: alexId,
          createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          updatedAt: todayStr,
        },
        {
          _id: 'task_003',
          title: 'Review System Metrics & MongoDB Connection Pooling',
          description: 'Audit production query latency and configure automatic connection reconnects.',
          status: 'Pending',
          priority: 'Medium',
          category: 'Work',
          dueDate: nextWeekStr,
          userId: alexId,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: todayStr,
        },
        {
          _id: 'task_004',
          title: 'Weekly Tech Reading & System Architecture Study',
          description: 'Read chapters on distributed locks, consensus algorithms, and event sourcing.',
          status: 'In Progress',
          priority: 'Low',
          category: 'Study',
          dueDate: nextWeekStr,
          userId: alexId,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: todayStr,
        },
        {
          _id: 'task_005',
          title: 'Grocery Run & Household Essentials',
          description: 'Pick up organic produce, coffee beans, almond milk, and pantry supplies.',
          status: 'Pending',
          priority: 'Medium',
          category: 'Shopping',
          dueDate: todayStr,
          userId: alexId,
          createdAt: todayStr,
          updatedAt: todayStr,
        },
      ],
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

export function readEmbeddedData(): EmbeddedData {
  try {
    ensureDataFile();
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading embedded db:', error);
    return { users: [], tasks: [] };
  }
}

export function writeEmbeddedData(data: EmbeddedData): void {
  try {
    ensureDataFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing embedded db:', error);
  }
}

let isMongoConnected = false;

export async function connectDB(): Promise<{ mode: 'mongodb' | 'embedded'; isConnected: boolean }> {
  const mongoUri = process.env.MONGO_URI;

  if (mongoUri && !mongoUri.includes('<username>')) {
    try {
      console.log('Connecting to MongoDB Atlas...');
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      isMongoConnected = true;
      console.log('✅ Connected to MongoDB successfully.');
      return { mode: 'mongodb', isConnected: true };
    } catch (err: any) {
      console.warn('⚠️ MongoDB connection failed, falling back to persistent embedded JSON database engine:', err.message);
      ensureDataFile();
      return { mode: 'embedded', isConnected: true };
    }
  } else {
    console.log('ℹ️ No external MONGO_URI specified. Using robust local persistent database engine.');
    ensureDataFile();
    return { mode: 'embedded', isConnected: true };
  }
}

export function getDatabaseStatus() {
  return {
    isMongo: isMongoConnected,
    type: isMongoConnected ? 'MongoDB Atlas' : 'Embedded Persistent Store',
    connected: true
  };
}
