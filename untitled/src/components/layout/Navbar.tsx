import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Moon,
  Sun,
  Radio,
  LogOut,
  User as UserIcon,
  Sparkles,
  Menu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  onOpenMobileMenu: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export function Navbar({ onOpenMobileMenu, activeView, setActiveView }: NavbarProps) {
  const { user, logout, seedDemoData } = useAuth();
  const { filters, updateFilter, setIsTaskModalOpen, setSelectedTask } = useTasks();
  const { theme, toggleTheme } = useTheme();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateTask = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  return (
    <header
      id="app-navbar"
      className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors"
    >
      {/* Left: Mobile Menu & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          id="mobile-menu-toggle-btn"
          type="button"
          onClick={onOpenMobileMenu}
          className="p-2 md:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="navbar-search-input"
            type="text"
            placeholder="Search tasks by title, category, or notes..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 text-sm bg-slate-100/80 dark:bg-slate-800/80 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white rounded-xl placeholder-slate-400 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Real-time sync badge */}
        <div
          id="realtime-status-pill"
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 rounded-full text-xs font-medium"
          title="Socket.IO real-time synchronization active"
        >
          <Radio className="w-3 h-3 animate-pulse text-emerald-500" />
          <span>Live Sync</span>
        </div>

        {/* Theme Toggle */}
        <button
          id="theme-toggle-btn"
          type="button"
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>

        {/* Quick Add Task Button */}
        <button
          id="navbar-new-task-btn"
          type="button"
          onClick={handleCreateTask}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm shadow-indigo-600/20 active:scale-98 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Task</span>
        </button>

        {/* User Profile Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="navbar-user-avatar-btn"
            type="button"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 p-1 pl-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-semibold text-xs shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="hidden md:block text-xs font-medium text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
              {user?.name || 'Account'}
            </span>
          </button>

          {/* Dropdown Menu */}
          {isProfileMenuOpen && (
            <div
              id="user-dropdown-menu"
              className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {user?.email}
                </p>
                <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-md">
                  {user?.role === 'admin' ? 'Administrator' : 'Standard User'}
                </span>
              </div>

              <div className="py-1">
                <button
                  id="dropdown-profile-link"
                  onClick={() => {
                    setActiveView('profile');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  Account Settings
                </button>

                <button
                  id="dropdown-seed-data-btn"
                  onClick={async () => {
                    await seedDemoData();
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Load Sample Tasks
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  id="dropdown-logout-btn"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
