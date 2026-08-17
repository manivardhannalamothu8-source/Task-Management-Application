import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { LoadingSpinner } from './components/common/LoadingSpinner';

function MainApp() {
  const { isAuthenticated, isLoading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [activeView, setActiveView] = useState<string>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <LoadingSpinner size="lg" label="Initializing TaskFlow workspace..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authView === 'register') {
      return <RegisterPage onNavigateToLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onNavigateToRegister={() => setAuthView('register')} />;
  }

  return (
    <TaskProvider>
      <AppLayout activeView={activeView} setActiveView={setActiveView}>
        {activeView === 'dashboard' && (
          <DashboardPage
            onNavigateToTasks={() => setActiveView('tasks')}
            onNavigateToKanban={() => setActiveView('kanban')}
          />
        )}
        {activeView === 'tasks' && <TasksPage initialViewMode="list" />}
        {activeView === 'kanban' && <TasksPage initialViewMode="kanban" />}
        {activeView === 'calendar' && <TasksPage initialViewMode="calendar" />}
        {activeView === 'profile' && <ProfilePage />}
      </AppLayout>
    </TaskProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
