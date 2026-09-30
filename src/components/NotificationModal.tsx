import React from 'react';
import {
  X,
  Bell,
  Trash2,
  ExternalLink,
  Award,
  ArrowBigUp,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useBloggr } from '../context/BloggrContext';

export const NotificationModal: React.FC = () => {
  const {
    activeNotification,
    setActiveNotification,
    deleteNotification,
    posts,
    setActivePost,
    closeUserProfile,
  } = useBloggr();

  if (!activeNotification) return null;

  const linkedPost = activeNotification.postId
    ? posts.find(p => p.id === activeNotification.postId)
    : undefined;

  const handleOpenLinkedPost = () => {
    if (linkedPost) {
      setActivePost(linkedPost);
      closeUserProfile();
      setActiveNotification(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = () => {
    deleteNotification(activeNotification.id);
    setActiveNotification(null);
  };

  const getIcon = () => {
    switch (activeNotification.type) {
      case 'award':
        return <Award className="w-5 h-5 text-amber-500" />;
      case 'upvote':
        return <ArrowBigUp className="w-5 h-5 text-orange-500" />;
      case 'reply':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'mention':
        return <Sparkles className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-emerald-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              {getIcon()}
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Notification Detail
              </h3>
              <p className="text-[11px] text-neutral-400">
                {activeNotification.timeAgo}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveNotification(null)}
            className="p-1.5 rounded-full text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
              {activeNotification.type}
            </span>
            <h4 className="text-base font-bold text-neutral-900 dark:text-white mt-2">
              {activeNotification.title}
            </h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1.5 leading-relaxed">
              {activeNotification.message}
            </p>
          </div>

          {/* Linked post preview */}
          {linkedPost && (
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 space-y-1.5">
              <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                Linked Dispatch
              </span>
              <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 line-clamp-2">
                {linkedPost.title}
              </p>
              <p className="text-[11px] text-neutral-400">
                By {linkedPost.author} • {linkedPost.views?.toLocaleString()} views
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveNotification(null)}
              className="px-3 py-1.5 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold transition-colors"
            >
              Close
            </button>
            {linkedPost && (
              <button
                onClick={handleOpenLinkedPost}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <span>Read Dispatch</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
