import React, { useState } from 'react';
import {
  CheckSquare,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Zap,
  KanbanSquare,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface LoginPageProps {
  onNavigateToRegister: () => void;
}

export function LoginPage({ onNavigateToRegister }: LoginPageProps) {
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setError(null);
    const success = await login(email.trim(), password);
    if (!success) {
      setError('Invalid email or password. Please try again.');
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      {/* Left Branding Panel (Hidden on small mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-12 flex-col justify-between relative overflow-hidden border-r border-slate-800 text-white">
        {/* Abstract background glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <CheckSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">TaskFlow</h1>
            <p className="text-xs text-indigo-300">Enterprise Task Management</p>
          </div>
        </div>

        {/* Hero Copy & Visual Highlights */}
        <div className="space-y-8 z-10 max-w-lg">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Full-Stack Architecture
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
              Organize, Track, and Deliver Your Best Work.
            </h2>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              Experience seamless productivity with real-time Socket.IO synchronization,
              interactive Kanban boards, robust JWT security, and persistent database storage.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-xs">
              <Zap className="w-5 h-5 text-indigo-400 mb-2" />
              <h4 className="text-xs font-bold text-white">Instant Real-Time</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Zero-reload live state sync across sessions.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-xs">
              <KanbanSquare className="w-5 h-5 text-emerald-400 mb-2" />
              <h4 className="text-xs font-bold text-white">Kanban & Calendar</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Drag-and-drop workflow tracking.
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center gap-2 text-xs text-slate-400 z-10">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>MongoDB Atlas Ready &bull; Bcrypt Encrypted</span>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div>
            <div className="flex lg:hidden items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <CheckSquare className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                TaskFlow
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Sign in to TaskFlow
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Welcome back! Enter your credentials to access your tasks.
            </p>
          </div>

          {/* Quick Demo Fill Buttons */}
          <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Quick Demo Login (1-Click)
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                id="demo-user-fill-btn"
                onClick={() => handleFillDemo('alex.morgan@taskflow.dev', 'Password123!')}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 shadow-2xs transition-all active:scale-98"
              >
                Lead Engineer (Alex)
              </button>
              <button
                type="button"
                id="demo-admin-fill-btn"
                onClick={() => handleFillDemo('sarah.admin@taskflow.dev', 'AdminPass2026!')}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 shadow-2xs transition-all active:scale-98"
              >
                Admin (Sarah)
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-700 dark:text-rose-400 font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="login-email-input"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/30 transition-all active:scale-98 cursor-pointer mt-2"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" className="p-0 text-white" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Register */}
          <div className="text-center pt-2 text-xs text-slate-500 dark:text-slate-400">
            Don't have an account yet?{' '}
            <button
              id="switch-to-register-btn"
              type="button"
              onClick={onNavigateToRegister}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
            >
              Create an account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
