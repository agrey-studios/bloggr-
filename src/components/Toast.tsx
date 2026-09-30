import React from 'react';
import { Sparkles, Check } from 'lucide-react';
import { useBloggr } from '../context/BloggrContext';

export const Toast: React.FC = () => {
  const { toastMessage } = useBloggr();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200 pointer-events-none">
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-neutral-900/95 dark:bg-white/95 text-white dark:text-neutral-900 shadow-2xl border border-neutral-700/50 dark:border-neutral-200 text-xs font-semibold backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
