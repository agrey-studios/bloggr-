import React, { useState } from 'react';
import {
  Home,
  Compass,
  Plus,
  Bell,
  User,
  PenLine,
  Video,
  Image as ImageIcon,
  Zap,
  X,
} from 'lucide-react';
import { useBloggr } from '../context/BloggrContext';

export const BottomMenu: React.FC = () => {
  const {
    mainNavTab,
    setMainNavTab,
    isReelsOpen,
    setIsReelsOpen,
    openCreatePostModal,
    closeUserProfile,
    openUserProfile,
    isUserProfileOpen,
    currentUser,
    setTimelineFilter,
    setActiveFeed,
    profileInitialTab,
    unreadNotificationsCount,
    markNotificationsAsRead,
  } = useBloggr();

  const [showCreateSheet, setShowCreateSheet] = useState(false);

  const isHomeActive = mainNavTab === 'home' && !isReelsOpen && !isUserProfileOpen && !showCreateSheet;
  const isExploreActive = mainNavTab === 'news' && !isReelsOpen && !isUserProfileOpen && !showCreateSheet;
  const isNotificationsActive = isUserProfileOpen && profileInitialTab === 'notifications';
  const isProfileActive = isUserProfileOpen && profileInitialTab !== 'notifications';

  const handleCreateSelect = (mode: 'article' | 'video' | 'photo_story' | 'short_update') => {
    setShowCreateSheet(false);
    openCreatePostModal(mode);
  };

  return (
    <>
      {/* Mobile Create Action Sheet Modal / Popover */}
      {showCreateSheet && (
        <div
          id="mobile-create-sheet-backdrop"
          onClick={() => setShowCreateSheet(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end md:hidden animate-in fade-in duration-200"
        >
          <div
            id="mobile-create-sheet-card"
            onClick={e => e.stopPropagation()}
            className="w-full bg-white dark:bg-neutral-900 rounded-t-3xl border-t border-neutral-200 dark:border-neutral-800 p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200"
          >
            <div className="flex items-center justify-between pb-1 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  Bloggr Creator Studio
                </span>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Publish New Content
                </h3>
              </div>
              <button
                onClick={() => setShowCreateSheet(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* 1. Write Article */}
              <button
                onClick={() => handleCreateSelect('article')}
                className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-orange-500/50 hover:bg-orange-50/40 dark:hover:bg-orange-950/20 text-left space-y-1.5 transition-all group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <PenLine className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-orange-600 transition-colors">
                  Write Article
                </h4>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-tight">
                  Long-form editorial, investigative reporting & blog posts.
                </p>
              </button>

              {/* 2. Upload Video */}
              <button
                onClick={() => handleCreateSelect('video')}
                className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-orange-500/50 hover:bg-orange-50/40 dark:hover:bg-orange-950/20 text-left space-y-1.5 transition-all group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Video className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-orange-600 transition-colors">
                  Upload Video
                </h4>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-tight">
                  Broadcast clips, sports highlights & vertical shorts.
                </p>
              </button>

              {/* 3. Photo Story */}
              <button
                onClick={() => handleCreateSelect('photo_story')}
                className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-orange-500/50 hover:bg-orange-50/40 dark:hover:bg-orange-950/20 text-left space-y-1.5 transition-all group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-orange-600 transition-colors">
                  Photo Story
                </h4>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-tight">
                  Multi-image galleries, documentary dispatches & captions.
                </p>
              </button>

              {/* 4. Short Update */}
              <button
                onClick={() => handleCreateSelect('short_update')}
                className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-orange-500/50 hover:bg-orange-50/40 dark:hover:bg-orange-950/20 text-left space-y-1.5 transition-all group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Zap className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-orange-600 transition-colors">
                  Short Update
                </h4>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-tight">
                  Fast Opera-style breaking news flash & bite-sized wire dispatches.
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FIXED BOTTOM NAVIGATION BAR */}
      <nav
        id="mobile-bottom-menu"
        aria-label="Bottom Navigation"
        className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#121316]/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 px-3 py-1 flex items-center justify-around md:hidden shadow-[0_-2px_12px_rgba(0,0,0,0.08)]"
      >
        {/* 1. HOME */}
        <button
          id="bottom-nav-home"
          onClick={() => {
            closeUserProfile();
            setIsReelsOpen(false);
            setShowCreateSheet(false);
            setMainNavTab('home');
            setActiveFeed('home');
            setTimelineFilter('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            isHomeActive
              ? 'text-orange-600 dark:text-orange-400 font-bold'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Home className={`w-5 h-5 transition-transform ${isHomeActive ? 'scale-110' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Home</span>
        </button>

        {/* 2. EXPLORE */}
        <button
          id="bottom-nav-explore"
          onClick={() => {
            closeUserProfile();
            setIsReelsOpen(false);
            setShowCreateSheet(false);
            setMainNavTab('news');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            isExploreActive
              ? 'text-orange-600 dark:text-orange-400 font-bold'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Compass className={`w-5 h-5 transition-transform ${isExploreActive ? 'scale-110' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Explore</span>
        </button>

        {/* 3. CREATE (Visually prominent center button) */}
        <button
          id="bottom-nav-create"
          onClick={() => setShowCreateSheet(prev => !prev)}
          className="flex flex-col items-center justify-center -mt-3 group cursor-pointer"
          title="Create Article, Video, Photo Story or Short"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/40 group-active:scale-95 transition-all ring-4 ring-white dark:ring-[#121316]">
            <Plus className={`w-6 h-6 stroke-[2.5] transition-transform ${showCreateSheet ? 'rotate-45' : ''}`} />
          </div>
          <span className="text-[10px] mt-0.5 font-bold text-neutral-800 dark:text-neutral-200">
            Create
          </span>
        </button>

        {/* 4. NOTIFICATIONS */}
        <button
          id="bottom-nav-notifications"
          onClick={() => {
            setIsReelsOpen(false);
            setShowCreateSheet(false);
            markNotificationsAsRead();
            openUserProfile(currentUser.username, 'notifications');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
            isNotificationsActive
              ? 'text-orange-600 dark:text-orange-400 font-bold'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <div className="relative">
            <Bell className={`w-5 h-5 transition-transform ${isNotificationsActive ? 'scale-110 text-orange-500' : ''}`} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 min-w-3.5 h-3.5 rounded-full text-[8px] font-black bg-orange-600 text-white flex items-center justify-center animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Notifications</span>
        </button>

        {/* 5. PROFILE */}
        <button
          id="bottom-nav-profile"
          onClick={() => {
            setIsReelsOpen(false);
            setShowCreateSheet(false);
            openUserProfile(currentUser.username);
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            isProfileActive
              ? 'text-orange-600 dark:text-orange-400 font-bold'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          {currentUser.avatar ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.username}
              className={`w-5 h-5 rounded-full object-cover transition-transform ${
                isProfileActive ? 'ring-2 ring-orange-500 scale-105' : ''
              }`}
            />
          ) : (
            <User className={`w-5 h-5 transition-transform ${isProfileActive ? 'scale-110' : ''}`} />
          )}
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Profile</span>
        </button>
      </nav>
    </>
  );
};
