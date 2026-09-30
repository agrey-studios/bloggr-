import React, { useState, useRef, useEffect } from 'react';
import {
  Flame,
  Sparkles,
  Trophy,
  TrendingUp,
  ChevronDown,
  Image as ImageIcon,
  Link2,
  BarChart2,
  X,
  Search,
  Filter,
} from 'lucide-react';
import { useBloggr } from '../context/BloggrContext';
import { FeedSort, TopTimeRange } from '../types';

export const FeedSortBar: React.FC = () => {
  const {
    activeFeed,
    feedSort,
    setFeedSort,
    topTimeRange,
    setTopTimeRange,
    viewMode,
    setViewMode,
    communities,
    currentUser,
    toggleJoinCommunity,
    setIsCreatePostOpen,
    searchQuery,
    setSearchQuery,
    selectedFlair,
    setSelectedFlair,
  } = useBloggr();

  const [isTopDropdownOpen, setIsTopDropdownOpen] = useState(false);
  const topDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (topDropdownRef.current && !topDropdownRef.current.contains(e.target as Node)) {
        setIsTopDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const currentCommunity = communities.find(c => c.id === activeFeed);
  const isJoined = currentCommunity ? currentUser.joinedCommunities.includes(currentCommunity.id) : false;

  const timeLabels: Record<TopTimeRange, string> = {
    today: 'Today',
    week: 'This Week',
    month: 'This Month',
    year: 'This Year',
    all: 'All Time',
  };

  return (
    <div className="space-y-3 mb-4">
      {/* 1. COMMUNITY HERO BANNER (if viewing specific sub-bloggr) */}
      {currentCommunity && (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
          {/* Banner cover */}
          <div
            className="h-28 sm:h-36 w-full bg-cover bg-center relative"
            style={{
              backgroundImage: `url(${currentCommunity.bannerUrl})`,
              backgroundColor: currentCommunity.themeColor,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>

          <div className="p-4 sm:p-5 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-3.5 -mt-10 sm:-mt-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white dark:bg-neutral-900 border-4 border-white dark:border-neutral-900 shadow-lg flex items-center justify-center text-3xl sm:text-4xl flex-shrink-0">
                {currentCommunity.iconEmoji}
              </div>
              <div className="pb-1">
                <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight leading-tight">
                  {currentCommunity.id}
                </h1>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium">
                  {currentCommunity.displayName}
                </p>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                id="banner-join-toggle-btn"
                onClick={() => toggleJoinCommunity(currentCommunity.id)}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold shadow-sm transition-all ${
                  isJoined
                    ? 'border border-neutral-300 dark:border-neutral-700 hover:border-rose-500 hover:text-rose-500 text-neutral-700 dark:text-neutral-300'
                    : 'bg-orange-600 hover:bg-orange-500 text-white'
                }`}
              >
                {isJoined ? 'Joined' : 'Join Community'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. QUICK CREATE POST BAR (Desktop only, mobile uses bottom menu) */}
      <div className="hidden md:flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
        <img
          src={currentUser.avatar}
          alt={currentUser.username}
          referrerPolicy="no-referrer"
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
        <button
          id="quick-create-input-btn"
          onClick={() => setIsCreatePostOpen(true)}
          className="flex-1 h-9 px-3.5 rounded-full bg-neutral-100 hover:bg-neutral-200/70 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 text-left transition-colors flex items-center"
        >
          Create a post in {currentCommunity ? currentCommunity.id : 'any Sub-Bloggr'}...
        </button>
        <div className="flex items-center gap-1 text-neutral-400 flex-shrink-0">
          <button
            onClick={() => setIsCreatePostOpen(true)}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            title="Upload Image / Media"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsCreatePostOpen(true)}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            title="Share Link"
          >
            <Link2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsCreatePostOpen(true)}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            title="Create Poll"
          >
            <BarChart2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. ACTIVE SEARCH / FLAIR FILTER NOTIFICATION BANNER */}
      {(searchQuery || selectedFlair) && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 text-xs">
          <div className="flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
            <Filter className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            <span>
              Filtering by{' '}
              {searchQuery && (
                <span className="font-bold text-orange-600 dark:text-orange-400">
                  query "{searchQuery}"
                </span>
              )}
              {searchQuery && selectedFlair && ' and '}
              {selectedFlair && (
                <span className="font-bold text-orange-600 dark:text-orange-400">
                  flair [{selectedFlair}]
                </span>
              )}
            </span>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedFlair(null);
            }}
            className="text-xs font-semibold text-neutral-500 hover:text-orange-600 flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear filters</span>
          </button>
        </div>
      )}

      {/* 4. SORT FILTER BAR & VIEW TOGGLE (Removed on homefeed per user request) */}
      {activeFeed !== 'home' && (
        <div className="flex items-center justify-between p-2 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm text-xs font-bold">
          {/* Sort options */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {/* Hot */}
            <button
              id="sort-hot-btn"
              onClick={() => setFeedSort('hot')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                feedSort === 'hot'
                  ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 font-extrabold'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span>Hot</span>
            </button>

            {/* New */}
            <button
              id="sort-new-btn"
              onClick={() => setFeedSort('new')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                feedSort === 'new'
                  ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 font-extrabold'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>New</span>
            </button>

            {/* Top (with time period dropdown) */}
            <div className="relative" ref={topDropdownRef}>
              <button
                id="sort-top-btn"
                onClick={() => {
                  setFeedSort('top');
                  setIsTopDropdownOpen(prev => !prev);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                  feedSort === 'top'
                    ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 font-extrabold'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                <span>Top</span>
                {feedSort === 'top' && (
                  <span className="text-[11px] font-normal text-neutral-400">
                    ({timeLabels[topTimeRange]})
                  </span>
                )}
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {isTopDropdownOpen && (
                <div className="absolute left-0 mt-2 w-36 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                  {(['today', 'week', 'month', 'year', 'all'] as TopTimeRange[]).map(t => (
                    <button
                      key={t}
                      onClick={() => {
                        setTopTimeRange(t);
                        setFeedSort('top');
                        setIsTopDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                        topTimeRange === t ? 'text-orange-500 bg-orange-50 dark:bg-orange-950/20' : 'text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {timeLabels[t]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Rising */}
            <button
              id="sort-rising-btn"
              onClick={() => setFeedSort('rising')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                feedSort === 'rising'
                  ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 font-extrabold'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>Rising</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
