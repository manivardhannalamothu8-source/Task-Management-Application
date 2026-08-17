import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { ToastContainer } from '../common/ToastContainer';
import { TaskFormModal } from '../tasks/TaskFormModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { useTasks } from '../../context/TaskContext';

interface AppLayoutProps {
  children: React.ReactNode;
  activeView: string;
  setActiveView: (view: string) => void;
}

export function AppLayout({ children, activeView, setActiveView }: AppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    taskToDelete,
    deleteTask,
  } = useTasks();

  const handleConfirmDelete = async () => {
    if (taskToDelete?._id) {
      await deleteTask(taskToDelete._id);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row font-sans antialiased transition-colors">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          activeView={activeView}
          setActiveView={setActiveView}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <TaskFormModal />
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Task"
        message={`Are you sure you want to permanently delete "${taskToDelete?.title || 'this task'}"? This action cannot be undone.`}
        confirmText="Delete Task"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
      <ToastContainer />
    </div>
  );
}
