import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Key,
  Download,
  Database,
  Radio,
  Sparkles,
  LogOut,
  Save,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  FileCode,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { systemAPI } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export function ProfilePage() {
  const { user, logout, updateProfile, seedDemoData } = useAuth();
  const { tasks } = useTasks();

  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [systemStatus, setSystemStatus] = useState<any>(null);

  useEffect(() => {
    async function loadSystemStatus() {
      try {
        const res = await systemAPI.getStatus();
        if (res.success) {
          setSystemStatus(res.system);
        }
      } catch {
        // ignore
      }
    }
    loadSystemStatus();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      setStatusMsg(null);

      const payload: any = { name: name.trim() };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const success = await updateProfile(payload);
      if (success) {
        setStatusMsg({ type: 'success', text: 'Profile information updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setStatusMsg({ type: 'error', text: 'Failed to update profile. Please verify your current password.' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error saving changes.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `taskflow_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Category', 'DueDate', 'CreatedAt'];
    const rows = tasks.map((t) => [
      t._id,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.status,
      t.priority,
      t.category,
      t.dueDate || '',
      t.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `taskflow_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div id="profile-page-container" className="max-w-4xl space-y-8 animate-in fade-in duration-150">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Account & Workspace Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal credentials, workspace preferences, and data exports.
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/20 mb-4">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {user?.name}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {user?.email}
          </p>

          <div className="mt-4 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-semibold uppercase tracking-wider">
            {user?.role === 'admin' ? 'Administrator' : 'Standard User'}
          </div>

          <div className="w-full mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <button
              id="profile-seed-data-btn"
              onClick={seedDemoData}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Load Sample Tasks</span>
            </button>

            <button
              id="profile-logout-btn"
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Profile Update Form */}
        <div className="md:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Edit Profile Details
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Update your display name or update your secure password.
          </p>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Display Name
              </label>
              <input
                id="profile-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address (Read Only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-slate-500 text-xs rounded-xl cursor-not-allowed"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="block text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-500" />
                Change Password (Optional)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Current Password
                  </label>
                  <input
                    id="profile-current-pass-input"
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    New Password
                  </label>
                  <input
                    id="profile-new-pass-input"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                id="profile-save-btn"
                type="submit"
                disabled={isUpdating}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {isUpdating ? (
                  <LoadingSpinner size="sm" className="p-0 text-white" />
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Data Export & Backup */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Export & Backup Tasks
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Download your tasks for spreadsheet analysis or backup records.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            id="export-csv-btn"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Export as CSV (.csv)</span>
          </button>

          <button
            id="export-json-btn"
            onClick={handleExportJSON}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <FileCode className="w-4 h-4 text-indigo-500" />
            <span>Export as JSON (.json)</span>
          </button>
        </div>
      </div>

      {/* System & Architecture Diagnostics */}
      <div className="p-6 bg-slate-900 text-slate-300 rounded-2xl border border-slate-800 shadow-xs">
        <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          System & Architecture Status
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Real-time server telemetry and persistent database status.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <span className="text-[11px] text-slate-400 block mb-1">Database Engine</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {systemStatus?.database?.type || 'Persistent MongoDB Layer'}
            </span>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <span className="text-[11px] text-slate-400 block mb-1">Socket.IO Real-Time</span>
            <span className="font-bold text-indigo-400 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              Connected & Listening
            </span>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <span className="text-[11px] text-slate-400 block mb-1">Authentication Standard</span>
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              JWT Bearer & Bcrypt
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
