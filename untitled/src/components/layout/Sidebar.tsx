import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  KanbanSquare,
  Calendar,
  User,
  Database,
  Plus,
  LogOut,
  X,
  Briefcase,
  UserCircle,
  GraduationCap,
  ShoppingBag,
  MoreHorizontal,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { TaskCategory } from '../../types';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  activeView,
  setActiveView,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const { stats, updateFilter, filters, setIsTaskModalOpen, setSelectedTask } = useTasks();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: CheckSquare,
      badge: stats?.totalTasks || null,
    },
    {
      id: 'kanban',
      label: 'Kanban Board',
      icon: KanbanSquare,
      badge: null,
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      badge: stats?.upcomingTasks?.length || null,
    },
    {
      id: 'profile',
      label: 'Settings',
      icon: User,
      badge: null,
    },
  ];

  const categories: Array<{ id: TaskCategory; label: string; icon: any; color: string }> = [
    { id: 'Work', label: 'Work', icon: Briefcase, color: 'bg-blue-500' },
    { id: 'Personal', label: 'Personal', icon: UserCircle, color: 'bg-emerald-500' },
    { id: 'Study', label: 'Study', icon: GraduationCap, color: 'bg-purple-500' },
    { id: 'Shopping', label: 'Shopping', icon: ShoppingBag, color: 'bg-amber-500' },
    { id: 'Other', label: 'Other', icon: MoreHorizontal, color: 'bg-slate-400' },
  ];

  const handleNavClick = (viewId: string) => {
    setActiveView(viewId);
    onCloseMobile();
  };

  const handleCategoryClick = (cat: TaskCategory) => {
    if (filters.category === cat) {
      updateFilter('category', 'All');
    } else {
      updateFilter('category', cat);
    }
    setActiveView('tasks');
    onCloseMobile();
  };

  const handleCreateNew = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(true);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              TaskFlow
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-semibold uppercase tracking-wider">
                Pro
              </span>
            </h1>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg md:hidden hover:bg-slate-800 transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Action Button */}
      <div className="px-4 pt-5 pb-3">
        <button
          id="sidebar-create-task-btn"
          onClick={handleCreateNew}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl shadow-md shadow-indigo-600/30 transition-all active:scale-98 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Task</span>
        </button>
      </div>

      {/* Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        {/* Main Navigation */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 font-semibold border-l-4 border-indigo-500 pl-2.5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                      isActive
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Categories Section */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <span>Categories</span>
            {filters.category !== 'All' && (
              <button
                onClick={() => updateFilter('category', 'All')}
                className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          {categories.map((cat) => {
            const count = stats?.categoryCounts?.[cat.id] || 0;
            const isSelected = filters.category === cat.id;
            return (
              <button
                key={cat.id}
                id={`sidebar-category-${cat.id.toLowerCase()}`}
                onClick={() => handleCategoryClick(cat.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                  <span>{cat.label}</span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Storage / System Status Card */}
        <div className="p-3.5 mx-1 rounded-xl bg-slate-800/50 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-medium mb-1">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Database Status</span>
          </div>
          <p className="text-[11px] text-slate-400">
            MongoDB / Durable Engine Active
          </p>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-semibold text-xs shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.name}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            id="sidebar-logout-btn"
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        id="desktop-sidebar"
        className="hidden md:block w-64 shrink-0 h-screen sticky top-0 z-40 border-r border-slate-800"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          id="mobile-sidebar-overlay"
          className="fixed inset-0 z-50 flex md:hidden bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            id="mobile-sidebar-drawer"
            className="relative w-72 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-200"
          >
            {sidebarContent}
          </div>
          <div className="flex-1" onClick={onCloseMobile} />
        </div>
      )}
    </>
  );
}
