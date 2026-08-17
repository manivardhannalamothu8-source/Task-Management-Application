import React, { useState } from 'react';
import {
  Plus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  MoreVertical,
  Edit3,
  Trash2,
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { Task, TaskStatus, TaskPriority } from '../../types';

export function TaskKanban() {
  const {
    tasks,
    updateTaskStatus,
    setSelectedTask,
    setIsTaskModalOpen,
    setTaskToDelete,
    setIsDeleteModalOpen,
  } = useTasks();

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const columns: Array<{
    id: TaskStatus;
    title: string;
    description: string;
    border: string;
    bg: string;
    badge: string;
  }> = [
    {
      id: 'Pending',
      title: 'To Do / Pending',
      description: 'Tasks waiting to be started',
      border: 'border-slate-300 dark:border-slate-700',
      bg: 'bg-slate-50 dark:bg-slate-900/60',
      badge: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    },
    {
      id: 'In Progress',
      title: 'In Progress',
      description: 'Active work in motion',
      border: 'border-blue-300 dark:border-blue-800',
      bg: 'bg-blue-50/40 dark:bg-slate-900/60',
      badge: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400',
    },
    {
      id: 'Completed',
      title: 'Completed',
      description: 'Accomplished tasks',
      border: 'border-emerald-300 dark:border-emerald-800',
      bg: 'bg-emerald-50/30 dark:bg-slate-900/60',
      badge: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400',
    },
  ];

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedTaskId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      updateTaskStatus(taskId, targetStatus);
    }
    setDraggedTaskId(null);
  };

  const priorityStyles: Record<TaskPriority, string> = {
    High: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50',
    Medium: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50',
    Low: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50',
  };

  return (
    <div id="kanban-board-container" className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start pb-8">
      {columns.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            id={`kanban-column-${col.id.toLowerCase().replace(' ', '-')}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`rounded-2xl border ${col.border} ${col.bg} p-4 min-h-[500px] flex flex-col transition-all`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {col.title}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${col.badge}`}>
                    {columnTasks.length}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {col.description}
                </p>
              </div>

              <button
                id={`kanban-add-task-${col.id.toLowerCase().replace(' ', '-')}`}
                onClick={() => {
                  setSelectedTask(null);
                  setIsTaskModalOpen(true);
                }}
                className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
                title={`Add task to ${col.title}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Task Cards in Column */}
            <div className="flex-1 space-y-3">
              {columnTasks.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
                  <span>No tasks here</span>
                  <span className="text-[10px] text-slate-500 mt-1">
                    Drag tasks here or click + above
                  </span>
                </div>
              ) : (
                columnTasks.map((task) => {
                  const isOverdue =
                    task.dueDate &&
                    task.status !== 'Completed' &&
                    new Date(task.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

                  return (
                    <div
                      key={task._id}
                      id={`kanban-card-${task._id}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task._id)}
                      className={`p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
                        task.status === 'Completed' ? 'opacity-80' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {task.category}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            priorityStyles[task.priority]
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      <h4
                        className={`text-sm font-semibold text-slate-900 dark:text-white leading-snug mb-1.5 ${
                          task.status === 'Completed' ? 'line-through text-slate-500' : ''
                        }`}
                      >
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                          {task.description}
                        </p>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                        {task.dueDate ? (
                          <span
                            className={`flex items-center gap-1 font-medium ${
                              isOverdue ? 'text-rose-500 font-semibold' : ''
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            {new Date(task.dueDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        ) : (
                          <span className="italic">No deadline</span>
                        )}

                        {/* Move Actions */}
                        <div className="flex items-center gap-1">
                          {col.id !== 'Pending' && (
                            <button
                              onClick={() =>
                                updateTaskStatus(
                                  task._id,
                                  col.id === 'Completed' ? 'In Progress' : 'Pending'
                                )
                              }
                              className="p-1 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Move left"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {col.id !== 'Completed' && (
                            <button
                              onClick={() =>
                                updateTaskStatus(
                                  task._id,
                                  col.id === 'Pending' ? 'In Progress' : 'Completed'
                                )
                              }
                              className="p-1 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Move right"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setIsTaskModalOpen(true);
                            }}
                            className="p-1 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setTaskToDelete(task);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
