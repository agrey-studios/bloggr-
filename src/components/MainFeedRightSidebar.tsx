import React, { useMemo } from 'react';
import {
  Flame,
  BookOpen,
  Users,
  CheckCircle2,
  UserPlus,
  UserCheck,
  Eye,
  TrendingUp,
  Share2,
} from 'lucide-react';
import { useBloggr } from '../context/BloggrContext';
import { GoogleAd } from './GoogleAd';
import { RECOMMENDED_AUTHORS } from '../data/seedData';
import { Post } from '../types';

export const MainFeedRightSidebar: React.FC = () => {
  const {
    posts,
    setActivePost,
    openUserProfile,
    toggleFollowAuthor,
    isFollowingAuthor,
    platformBranding,
  } = useBloggr();

  // 1. Trending Stories: Top 5 by score / engagement
  const trendingStories = useMemo(() => {
    return [...posts]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [posts]);

  // 2. Most Read Articles: Top 4 by views
  const mostReadArticles = useMemo(() => {
    return [...posts]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 4);
  }, [posts]);

  // 3. Popular Authors: Mix of accredited journalists and community writers
  const popularAuthors = useMemo(() => {
    const verified = RECOMMENDED_AUTHORS.filter(a => a.verified).slice(0, 3);
    const unverified = RECOMMENDED_AUTHORS.filter(a => !a.verified).slice(0, 2);
    return [...verified, ...unverified];
  }, []);

  return (
    <aside
      id="main-feed-right-sidebar"
      aria-label="Bloggr Right Sidebar"
      className="w-80 lg:w-84 flex-shrink-0 hidden xl:block sticky top-20 h-[calc(100vh-5.5rem)] overflow-y-auto space-y-4 select-none pb-12 pr-1 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-800"
    >
      {/* 1. TRENDING (Top 5 numbered stories) */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-black text-neutral-900 dark:text-white uppercase tracking-wider">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span>Trending Stories</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400">
            Top 5
          </span>
        </div>

        <div className="space-y-2.5">
          {trendingStories.map((story, idx) => (
            <div
              key={story.id}
              onClick={() => setActivePost(story)}
              className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors cursor-pointer group"
            >
              {/* Numbering: 01, 02, 03... */}
              <span className="font-mono text-base font-black text-neutral-300 dark:text-neutral-700 group-hover:text-orange-500 transition-colors flex-shrink-0 w-6">
                0{idx + 1}
              </span>

              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase text-orange-600 dark:text-orange-400">
                  {story.category || 'News'}
                </span>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 leading-snug">
                  {story.title}
                </h4>
                <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-1">
                  <span>{story.author}</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">
                    <Eye className="w-3 h-3" />
                    {story.views || 450}
                  </span>
                </div>
              </div>

              {story.imageUrl && (
                <img
                  src={story.imageUrl}
                  alt=""
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0 group-hover:scale-103 transition-transform"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. MOST READ */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-black text-neutral-900 dark:text-white uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span>Most Read</span>
          </div>
          <span className="text-[10px] text-neutral-400 font-semibold">24h Wire</span>
        </div>

        <div className="space-y-2.5">
          {mostReadArticles.map(article => (
            <div
              key={article.id}
              onClick={() => setActivePost(article)}
              className="p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {article.category || 'Opinion'}
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {(article.views || 500).toLocaleString()} reads
                </span>
              </div>
              <h4 className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-2 group-hover:text-orange-500 leading-snug">
                {article.title}
              </h4>
            </div>
          ))}
        </div>
      </div>

      {/* 3. POPULAR AUTHORS */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-black text-neutral-900 dark:text-white uppercase tracking-wider">
            <Users className="w-4 h-4 text-emerald-500" />
            <span>Popular Authors</span>
          </div>
          <span className="text-[10px] text-neutral-400 font-semibold">Our Writers</span>
        </div>

        <div className="space-y-3">
          {popularAuthors.map(author => {
            const isFollowing = isFollowingAuthor(author.username);

            return (
              <div key={author.username} className="flex items-center justify-between gap-2.5">
                <button
                  onClick={() => openUserProfile(author.username)}
                  className="flex items-center gap-2.5 min-w-0 text-left group cursor-pointer"
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={author.avatar}
                      alt={author.displayName}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-neutral-200 dark:ring-neutral-700 group-hover:ring-orange-500 transition-all"
                    />
                    {author.verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-white dark:fill-neutral-900 absolute -bottom-1 -right-1" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-orange-500 transition-colors truncate">
                        {author.displayName}
                      </span>
                      {!author.verified && (
                        <span className="text-[8px] px-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                          Writer
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-neutral-400 truncate">
                      {author.role || author.category}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => toggleFollowAuthor(author.username)}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer ${
                    isFollowing
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
                      : 'bg-orange-500/10 hover:bg-orange-500 text-orange-600 dark:text-orange-400 hover:text-white'
                  }`}
                  title={isFollowing ? 'Following' : 'Follow author'}
                >
                  {isFollowing ? (
                    <UserCheck className="w-3.5 h-3.5" />
                  ) : (
                    <UserPlus className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. ADVERTISEMENT */}
      {platformBranding.adEnabled && (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 p-3 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-neutral-400">
            <span>Advertisement</span>
            <span>Bloggr Ad Network</span>
          </div>
          <GoogleAd format="sidebar" slotId={1} />
        </div>
      )}
    </aside>
  );
};
