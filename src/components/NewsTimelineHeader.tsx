import React from 'react';
import { Users } from 'lucide-react';
import { useBloggr } from '../context/BloggrContext';
import { NEWS_CATEGORIES_CONFIG, NewsCategoryFilter } from '../types';

export const NewsTimelineHeader: React.FC = () => {
  const {
    timelineFilter,
    setTimelineFilter,
    setIsAuthorDirectoryOpen,
    posts,
  } = useBloggr();

  const getCategoryBadge = (categoryValue?: string) => {
    if (!categoryValue) return posts.length;
    return posts.filter(p => p.category === categoryValue).length;
  };

  return (
    <div
      id="news-timeline-header"
      className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-2.5 sm:p-3 shadow-xs mb-2.5 space-y-2"
    >
      {/* Top Status Row: Live Wire Indicator & Authors Pop-up Button */}
      <div className="flex items-center justify-between gap-2 flex-wrap pb-1.5 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live News Wire</span>
          </div>

          <button
            id="open-author-directory-btn"
            onClick={() => setIsAuthorDirectoryOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-neutral-200 dark:border-neutral-700 hover:border-orange-500 text-neutral-600 dark:text-neutral-300 hover:text-orange-600 dark:hover:text-orange-400 text-xs font-semibold transition-colors bg-neutral-50/50 dark:bg-neutral-800/50"
            title="Browse verified journalists & correspondents"
          >
            <Users className="w-3 h-3 text-orange-500" />
            <span>Authors Directory</span>
          </button>
        </div>

        <div className="text-[11px] text-neutral-400 hidden sm:block">
          Select desk to filter wire dispatches
        </div>
      </div>

      {/* Category Pills Row with Horizontal Scroll */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
        {NEWS_CATEGORIES_CONFIG.map(cat => {
          const isActive = timelineFilter === cat.id;
          const count = getCategoryBadge(cat.categoryValue);

          const activeColorClass = {
            all: 'bg-orange-600 text-white shadow-sm shadow-orange-500/30',
            NEWS: 'bg-red-600 text-white shadow-sm shadow-red-500/30',
            FOOTBALL: 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/30',
            OPINION: 'bg-purple-600 text-white shadow-sm shadow-purple-500/30',
          }[cat.id] || 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900';

          return (
            <button
              key={cat.id}
              onClick={() => setTimelineFilter(cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? activeColorClass
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  isActive
                    ? 'bg-white/25 text-white'
                    : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
