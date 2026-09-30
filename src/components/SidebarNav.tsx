import React, { useState, useMemo } from 'react';
import {
  Home,
  Newspaper,
  Flame,
  Clapperboard,
  Users,
  Bookmark,
  Bell,
  PenSquare,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Award,
  Globe,
  Plus,
  CheckCircle2,
  UserPlus,
  UserCheck,
  ArrowRight,
} from 'lucide-react';
import { useBloggr } from '../context/BloggrContext';
import { RECOMMENDED_AUTHORS } from '../data/seedData';
import { VerifiedBadge } from './VerifiedBadge';
import { BLOGGR_DEFAULT_CATEGORIES } from '../types';

export const SidebarNav: React.FC = () => {
  const {
    activeFeed,
    setActiveFeed,
    mainNavTab,
    setMainNavTab,
    currentUser,
    setIsCreatePostOpen,
    setIsReelsOpen,
    openUserProfile,
    closeUserProfile,
    setIsAuthorDirectoryOpen,
    openPolicyPage,
    toggleFollowAuthor,
    isFollowingAuthor,
    sidebarCollapsed,
    toggleSidebarCollapse,
    categoriesList,
    timelineFilter,
    setTimelineFilter,
    notifications,
    setIsAdminDashboardOpen,
    setIsMessagesOpen,
    feedTab,
    setFeedTab,
    platformBranding,
  } = useBloggr();

  const [isExploreExpanded, setIsExploreExpanded] = useState(false);
  const [writersFilter, setWritersFilter] = useState<'all' | 'verified' | 'unverified'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const displayedWriters = useMemo(() => {
    if (writersFilter === 'verified') {
      return RECOMMENDED_AUTHORS.filter(a => a.verified);
    }
    if (writersFilter === 'unverified') {
      return RECOMMENDED_AUTHORS.filter(a => !a.verified);
    }
    return RECOMMENDED_AUTHORS;
  }, [writersFilter]);

  // Explore categories to display
  const initialExploreCategories = categoriesList.slice(0, 10);
  const additionalExploreCategories = categoriesList.slice(10);

  // Active state checkers
  const isHomeActive = mainNavTab === 'home' && activeFeed === 'home' && timelineFilter === 'all';
  const isLatestActive = feedTab === 'latest';
  const isTrendingActive = activeFeed === 'trending';
  const isVideosActive = activeFeed === 'videos';
  const isFollowingActive = feedTab === 'following' || activeFeed === 'following';
  const isBookmarksActive = activeFeed === 'saved';

  return (
    <aside
      className={`flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto px-2 py-3 border-r border-neutral-200 dark:border-neutral-800 hidden md:block select-none text-xs transition-all duration-200 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800 ${
        sidebarCollapsed ? 'w-[72px]' : 'w-64 xl:w-70'
      }`}
    >
      <div className="space-y-4">
        {/* Top: Brand Logo / Wordmark & Collapse Toggle */}
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between px-2'} pb-2 border-b border-neutral-200 dark:border-neutral-800`}>
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">
                {platformBranding.logoText || 'bloggr'}
                <span className="text-orange-500 text-3xl leading-none">.</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 dark:text-neutral-500 ml-1">
                News
              </span>
            </div>
          ) : (
            <span className="text-xl font-black text-orange-500">b.</span>
          )}

          <button
            onClick={toggleSidebarCollapse}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Create Button (Visually prominent) */}
        <button
          onClick={() => setIsCreatePostOpen(true)}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-98 text-white font-bold shadow-sm shadow-orange-500/25 transition-all ${
            sidebarCollapsed ? 'px-0' : 'px-3'
          }`}
          title="Create Article or Video"
        >
          <PenSquare className="w-4 h-4 flex-shrink-0" />
          {!sidebarCollapsed && <span>Create Story</span>}
        </button>

        {/* Core Navigation Items */}
        <div className="space-y-1">
          {/* 1. Home */}
          <button
            onClick={() => {
              closeUserProfile();
              setMainNavTab('home');
              setActiveFeed('home');
              setTimelineFilter('all');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
              isHomeActive
                ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-bold'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
            }`}
            title="Home"
          >
            <Home className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>Home</span>}
          </button>

          {/* 2. Latest */}
          <button
            onClick={() => {
              closeUserProfile();
              setMainNavTab('home');
              setActiveFeed('home');
              setFeedTab('latest');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
              isLatestActive
                ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-bold'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
            }`}
            title="Latest"
          >
            <Newspaper className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>Latest</span>}
          </button>

          {/* 3. Trending */}
          <button
            onClick={() => {
              closeUserProfile();
              setActiveFeed('trending');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
              isTrendingActive
                ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-bold'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
            }`}
            title="Trending"
          >
            <Flame className="w-4 h-4 flex-shrink-0 text-amber-500" />
            {!sidebarCollapsed && <span>Trending</span>}
          </button>

          {/* 4. Videos */}
          <button
            onClick={() => {
              setIsReelsOpen(true);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
              isVideosActive
                ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-bold'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
            }`}
            title="Videos"
          >
            <Clapperboard className="w-4 h-4 flex-shrink-0 text-rose-500" />
            {!sidebarCollapsed && (
              <div className="flex items-center justify-between flex-1">
                <span>Videos</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  Shorts
                </span>
              </div>
            )}
          </button>

          {/* 5. Following */}
          <button
            onClick={() => {
              closeUserProfile();
              setMainNavTab('home');
              setFeedTab('following');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
              isFollowingActive
                ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-bold'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
            }`}
            title="Following"
          >
            <Users className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>Following</span>}
          </button>

          {/* 6. Bookmarks / Saved Stories */}
          <button
            id="sidebar-saved-stories-btn"
            onClick={() => {
              openUserProfile(currentUser.username, 'saved');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
              isBookmarksActive
                ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-bold'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
            }`}
            title="Personal 'Saved' List (Synced with Cloud Firestore)"
          >
            <Bookmark className="w-4 h-4 flex-shrink-0 text-orange-500" />
            {!sidebarCollapsed && (
              <div className="flex items-center justify-between flex-1">
                <span>Saved Stories</span>
                <span className="text-[10px] text-neutral-500 font-mono px-1.5 py-0.2 bg-neutral-200/60 dark:bg-neutral-800 rounded-full font-bold">
                  {currentUser.savedPostIds?.length || 0}
                </span>
              </div>
            )}
          </button>

          {/* 7. Notifications */}
          <button
            onClick={() => {
              const notifBtn = document.getElementById('notifications-bell-btn');
              if (notifBtn) notifBtn.click();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-all"
            title="Notifications"
          >
            <Bell className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && (
              <div className="flex items-center justify-between flex-1">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                )}
              </div>
            )}
          </button>

          {/* 8. Messages */}
          <button
            onClick={() => setIsMessagesOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-all"
            title="Messages"
          >
            <MessageSquare className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>Messages</span>}
          </button>

          {/* 9. Settings */}
          <button
            onClick={() => openUserProfile(currentUser.username)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-all"
            title="Settings & Profile"
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>Settings</span>}
          </button>

          {/* 10. Admin Dashboard Link (if Admin) */}
          {currentUser.isAdmin && (
            <button
              onClick={() => setIsAdminDashboardOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold transition-all border border-orange-500/20"
              title="Admin Dashboard"
            >
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>Admin Dashboard</span>}
            </button>
          )}
        </div>

        {/* Explore Categories Section */}
        {!sidebarCollapsed && (
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-1.5">
            <div className="flex items-center justify-between px-3 text-[11px] font-bold tracking-wider uppercase text-neutral-400">
              <span>Explore</span>
              <Globe className="w-3.5 h-3.5 text-neutral-400" />
            </div>

            <div className="space-y-0.5">
              {initialExploreCategories.map(cat => {
                const isCatActive = timelineFilter.toLowerCase() === cat.slug.toLowerCase();
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      closeUserProfile();
                      setMainNavTab('home');
                      setTimelineFilter(cat.name as any);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg transition-colors text-left ${
                      isCatActive
                        ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span>{cat.icon}</span>
                      <span className="truncate">{cat.name}</span>
                    </span>
                    {cat.count && (
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {cat.count}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* More Categories Accordion */}
              {additionalExploreCategories.length > 0 && (
                <>
                  {isExploreExpanded && (
                    <div className="space-y-0.5 pt-0.5 animate-in fade-in duration-150">
                      {additionalExploreCategories.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            closeUserProfile();
                            setMainNavTab('home');
                            setTimelineFilter(cat.name as any);
                          }}
                          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors text-left"
                        >
                          <span className="flex items-center gap-2 truncate">
                            <span>{cat.icon}</span>
                            <span className="truncate">{cat.name}</span>
                          </span>
                          {cat.count && (
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {cat.count}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setIsExploreExpanded(prev => !prev)}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-orange-600 dark:text-orange-400 font-bold hover:underline"
                  >
                    <span>{isExploreExpanded ? 'Fewer Categories' : 'More Categories'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExploreExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Our Writers Section (Verified & Community Writers) */}
        {!sidebarCollapsed && (
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="flex items-center justify-between px-3">
              <span className="text-[11px] font-bold tracking-wider uppercase text-neutral-400">
                Our Writers
              </span>
              <button
                onClick={() => setIsAuthorDirectoryOpen(true)}
                className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold hover:underline flex items-center gap-0.5"
              >
                <span>Directory</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            </div>

            {/* Filter Tabs: All, Verified, Community */}
            <div className="flex items-center gap-1 px-2 p-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 text-[10px] font-semibold">
              <button
                onClick={() => setWritersFilter('all')}
                className={`flex-1 py-1 rounded text-center transition-colors ${
                  writersFilter === 'all'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setWritersFilter('verified')}
                className={`flex-1 py-1 rounded text-center transition-colors ${
                  writersFilter === 'verified'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                Verified
              </button>
              <button
                onClick={() => setWritersFilter('unverified')}
                className={`flex-1 py-1 rounded text-center transition-colors ${
                  writersFilter === 'unverified'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                Community
              </button>
            </div>

            {/* Scrollable Writers List */}
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800">
              {displayedWriters.slice(0, 6).map(writer => {
                const isFollowing = isFollowingAuthor(writer.username);
                return (
                  <div
                    key={writer.username}
                    className="flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors group"
                  >
                    <button
                      onClick={() => openUserProfile(writer.username)}
                      className="flex items-center gap-2 min-w-0 text-left cursor-pointer flex-1"
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={writer.avatar}
                          alt={writer.displayName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        {writer.verified && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 ring-1 ring-white dark:ring-neutral-900 absolute -bottom-0.5 -right-0.5" />
                        )}
                      </div>
                      <div className="min-w-0 truncate">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-orange-500 truncate text-[11px]">
                            {writer.displayName}
                          </span>
                        </div>
                        <div className="text-[10px] text-neutral-400 truncate">
                          {writer.role || writer.category}
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => toggleFollowAuthor(writer.username)}
                      className={`p-1 rounded text-[10px] transition-colors flex-shrink-0 cursor-pointer ${
                        isFollowing
                          ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                          : 'bg-orange-500/10 hover:bg-orange-500 text-orange-600 dark:text-orange-400 hover:text-white'
                      }`}
                      title={isFollowing ? 'Following' : 'Follow author'}
                    >
                      {isFollowing ? <UserCheck className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Policy Links (Kenya & Platform Compliance) */}
        {!sidebarCollapsed && (
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 px-3 text-[10px] text-neutral-400 space-y-1">
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              <button onClick={() => openPolicyPage('privacy')} className="hover:underline">Privacy</button>
              <span>·</span>
              <button onClick={() => openPolicyPage('terms')} className="hover:underline">Terms</button>
              <span>·</span>
              <button onClick={() => openPolicyPage('content-policy')} className="hover:underline">Content Policy</button>
            </div>
            <div className="text-neutral-500">
              © {new Date().getFullYear()} {platformBranding.siteName} (Kenya & Global)
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
