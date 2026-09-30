import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Bookmark,
  User,
  RotateCcw,
  LogIn,
  LogOut,
  Settings,
  X,
  Trash2,
  Award,
  ArrowBigUp,
  MessageSquare,
  MessageSquareQuote,
  Shield,
  Sparkles,
  MoreVertical,
} from 'lucide-react';
import { useBloggr } from '../context/BloggrContext';
import { FontAwesomeIcon, faStar } from './FontAwesomeIcon';

export const Navbar: React.FC = () => {
  const {
    theme,
    toggleTheme,
    currentUser,
    activeFeed,
    setActiveFeed,
    timelineFilter,
    setTimelineFilter,
    mainNavTab,
    setMainNavTab,
    setActivePost,
    searchQuery,
    setSearchQuery,
    notifications,
    markNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    openNotification,
    setIsCreatePostOpen,
    openUserProfile,
    closeUserProfile,
    resetToDefaults,
    isAuthenticated,
    logout,
    setIsAuthModalOpen,
    setAuthModalMode,
    platformBranding,
    setIsAdminDashboardOpen,
    setIsMessagesOpen,
    toggleMobileSideNav,
  } = useBloggr();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 h-14 w-full border-b-2 sm:border-b-[3px] border-orange-500 bg-white/95 dark:bg-[#121316]/95 backdrop-blur-md transition-colors shadow-xs dark:shadow-orange-500/5">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-3 sm:px-4 gap-2">
        
        {/* Left: Brand Logo & Navigation Tabs */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button
            id="brand-logo-btn"
            onClick={() => {
              setActivePost(null);
              closeUserProfile();
              setMainNavTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center group cursor-pointer"
            title="Bloggr - Return to Home Feed"
          >
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 dark:text-white transition-transform group-hover:scale-[1.02] flex items-baseline">
              bloggr<span className="text-orange-500 font-black text-4xl sm:text-5xl ml-0.5 leading-none select-none inline-block">.</span>
            </span>
          </button>

          {/* Desktop & Tablet Main 4 Navigation Tabs */}
          <nav className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-neutral-100/90 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/50 text-xs font-bold">
            <button
              id="desktop-nav-home-btn"
              onClick={() => {
                closeUserProfile();
                setActivePost(null);
                setMainNavTab('home');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                mainNavTab === 'home'
                  ? 'bg-white dark:bg-neutral-900 text-orange-600 dark:text-orange-400 shadow-xs ring-1 ring-neutral-200/50 dark:ring-neutral-700/50'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Home
            </button>
            <button
              id="desktop-nav-news-btn"
              onClick={() => {
                closeUserProfile();
                setActivePost(null);
                setMainNavTab('news');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                mainNavTab === 'news'
                  ? 'bg-white dark:bg-neutral-900 text-red-600 dark:text-red-400 shadow-xs ring-1 ring-neutral-200/50 dark:ring-neutral-700/50'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              News
            </button>
            <button
              id="desktop-nav-football-btn"
              onClick={() => {
                closeUserProfile();
                setActivePost(null);
                setMainNavTab('football');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                mainNavTab === 'football'
                  ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 shadow-xs ring-1 ring-neutral-200/50 dark:ring-neutral-700/50'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Football
            </button>
            <button
              id="desktop-nav-opinion-btn"
              onClick={() => {
                closeUserProfile();
                setActivePost(null);
                setMainNavTab('opinion');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                mainNavTab === 'opinion'
                  ? 'bg-white dark:bg-neutral-900 text-purple-600 dark:text-purple-400 shadow-xs ring-1 ring-neutral-200/50 dark:ring-neutral-700/50'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Opinion
            </button>
          </nav>
        </div>

        {/* Middle: Search Bar with Search Button */}
        <div className="flex-1 max-w-xl mx-2 sm:mx-4">
          <form
            onSubmit={e => {
              e.preventDefault();
            }}
            className="flex items-center gap-1.5"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="search-navbar-input"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search news, topics, authors, or analysis..."
                className="w-full pl-9 pr-8 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full bg-neutral-100/90 dark:bg-neutral-800/80 text-neutral-900 dark:text-white placeholder-neutral-500 border border-neutral-200/70 dark:border-neutral-700/60 focus:border-orange-500 focus:bg-white dark:focus:bg-[#16171d] focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="hidden sm:inline-flex items-center justify-center px-3 py-1.5 sm:py-2 text-xs font-semibold rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 transition-all cursor-pointer"
              title="Search"
            >
              Search
            </button>
          </form>
        </div>

        {/* Right: Actions, Theme, Auth & User Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Create Post Shortcut Button */}
          <button
            id="create-post-header-btn"
            onClick={() => setIsCreatePostOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white text-xs sm:text-sm font-bold transition-all shadow-sm shadow-orange-500/25 cursor-pointer"
            title="Create Post"
          >
            <Plus className="w-4 h-4" />
            <span>Create</span>
          </button>

          {/* Theme Switcher */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-600" />}
          </button>

          {/* Quick-Access Saved Stories Button */}
          <button
            id="navbar-saved-stories-btn"
            onClick={() => {
              setActivePost(null);
              openUserProfile(currentUser.username, 'saved');
            }}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 relative transition-colors focus:outline-hidden cursor-pointer"
            title={`Personal Saved List (${currentUser.savedPostIds?.length || 0}) • Synced with Firestore`}
          >
            <Bookmark className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform hover:scale-105 text-neutral-700 dark:text-neutral-200 hover:text-orange-500 dark:hover:text-orange-400" />
            {(currentUser.savedPostIds?.length || 0) > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[9px] font-black bg-orange-600 text-white shadow-xs">
                {currentUser.savedPostIds.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown (Desktop & Tablet) */}
          <div className="relative hidden sm:block" ref={notifMenuRef}>
            <button
              id="notifications-bell-btn"
              onClick={() => {
                setIsNotificationsOpen(prev => !prev);
                if (!isNotificationsOpen) {
                  markNotificationsAsRead();
                }
              }}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 relative transition-colors focus:outline-hidden"
              title="Notifications"
            >
              <Bell className="w-5.5 h-5.5 sm:w-6 sm:h-6 transition-transform hover:scale-105" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between px-3.5 py-2 border-b border-neutral-100 dark:border-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-orange-500" />
                    <span>Notifications</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 text-[10px] font-mono">
                      {notifications.length}
                    </span>
                  </div>
                  {notifications.length > 0 && (
                    <button
                      id="clear-all-notifications-btn"
                      onClick={clearAllNotifications}
                      className="text-[11px] text-neutral-400 hover:text-rose-500 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      title="Delete all notifications"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete all</span>
                    </button>
                  )}
                </div>

                <div className="max-h-88 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-xs text-neutral-400 space-y-2">
                      <Bell className="w-8 h-8 mx-auto text-neutral-300 dark:text-neutral-700 stroke-[1.5]" />
                      <p className="font-semibold text-neutral-600 dark:text-neutral-400">No notifications</p>
                      <p className="text-[11px] text-neutral-400">All caught up! New dispatches and alerts will appear here.</p>
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          openNotification(notif);
                          setIsNotificationsOpen(false);
                        }}
                        className={`p-3 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors cursor-pointer group flex items-start justify-between gap-2.5 ${
                          !notif.read ? 'bg-orange-50/50 dark:bg-orange-950/20' : ''
                        }`}
                        title="Click to open notification"
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                            {notif.type === 'award' ? (
                              <Award className="w-3.5 h-3.5 text-amber-500" />
                            ) : notif.type === 'upvote' ? (
                              <ArrowBigUp className="w-3.5 h-3.5 text-orange-500" />
                            ) : notif.type === 'reply' ? (
                              <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                            ) : notif.type === 'mention' ? (
                              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                            ) : (
                              <Bell className="w-3.5 h-3.5 text-emerald-500" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1 text-neutral-800 dark:text-neutral-200 font-semibold mb-0.5">
                              <span className="truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                {notif.title}
                              </span>
                              <span className="text-[10px] text-neutral-400 flex-shrink-0">{notif.timeAgo}</span>
                            </div>
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-[11px] line-clamp-2">
                              {notif.message}
                            </p>
                          </div>
                        </div>

                        {/* Individual Delete Button */}
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 opacity-70 group-hover:opacity-100 transition-all flex-shrink-0 cursor-pointer"
                          title="Delete notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Header Vertical 3-Dot Side Nav Button (Replaces Mobile Header Bell Icon) */}
          <button
            id="mobile-header-3dot-btn"
            onClick={toggleMobileSideNav}
            className="sm:hidden p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 relative transition-transform active:scale-95 cursor-pointer"
            title="Open Directory & Navigation Menu"
            aria-label="Open Directory & Navigation Menu"
          >
            <MoreVertical className="w-5.5 h-5.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
              </span>
            )}
          </button>

          {/* User Profile Pill & Dropdown */}
          <div className="relative hidden md:block" ref={userMenuRef}>
            <button
              id="user-profile-menu-btn"
              onClick={() => setIsUserMenuOpen(prev => !prev)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 transition-all text-left"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
              />
              <div className="hidden lg:block text-xs leading-tight">
                <div className="font-semibold text-neutral-900 dark:text-neutral-100 truncate max-w-[90px]">
                  {currentUser.displayName || currentUser.username}
                </div>
                <div className="text-[10px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                  <span className="text-orange-500 font-medium flex items-center gap-0.5">
                    <FontAwesomeIcon icon={faStar} className="w-2.5 h-2.5 text-amber-500" />
                    {(currentUser.karma?.total ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-neutral-400 hidden lg:block" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl py-2 z-50">
                <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                    {currentUser.displayName || currentUser.username}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    @{currentUser.username}
                  </div>
                </div>

                <button
                  id="view-my-profile-btn"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    openUserProfile(currentUser.username);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <User className="w-3.5 h-3.5 text-neutral-400" />
                  <span>My Profile Page</span>
                </button>

                <button
                  id="view-saved-posts-btn"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    openUserProfile(currentUser.username, 'saved');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-left text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-3.5 h-3.5 text-orange-500" />
                    <span>Read Later List</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400">
                    {currentUser.savedPostIds?.length || 0}
                  </span>
                </button>

                <button
                  id="view-messages-btn"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setIsMessagesOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <MessageSquareQuote className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Messages & Dispatches</span>
                </button>

                {currentUser.isAdmin && (
                  <button
                    id="menu-admin-dashboard-btn"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsAdminDashboardOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left font-bold text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                  >
                    <Shield className="w-3.5 h-3.5 text-orange-500" />
                    <span>Admin Dashboard</span>
                  </button>
                )}

                {isAuthenticated ? (
                  <button
                    id="menu-logout-btn"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <LogOut className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <button
                    id="menu-login-btn"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setAuthModalMode('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-orange-600 dark:text-orange-400 font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In / Register</span>
                  </button>
                )}

                <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />

                <button
                  id="reset-demo-data-btn"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    resetToDefaults();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Demo Data</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
