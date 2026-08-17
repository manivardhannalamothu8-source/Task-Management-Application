import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', label, className = '' }: LoadingSpinnerProps) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div id="loading-spinner-container" className={`flex flex-col items-center justify-center p-6 gap-3 ${className}`}>
      <Loader2 className={`${sizeMap[size]} text-indigo-600 dark:text-indigo-400 animate-spin`} />
      {label && (
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {label}
        </span>
      )}
    </div>
  );
}
