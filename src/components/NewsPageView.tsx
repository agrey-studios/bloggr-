import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Globe2,
  Compass,
  Flame,
  Clock,
  Eye,
  Check,
  TrendingUp,
  Search,
  Zap,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { useBloggr } from '../context/BloggrContext';
import { Post } from '../types';
import { VerifiedBadge } from './VerifiedBadge';

type NewsSubTab = 'local' | 'africa' | 'global' | 'all';

export const NewsPageView: React.FC = () => {
  const { posts, setActivePost, openUserProfile, currentUser, toggleSavePost } = useBloggr();
  const [subTab, setSubTab] = useState<NewsSubTab>('local');
  const [newsSearch, setNewsSearch] = useState('');

  // Filter posts that belong to the News category
  const newsPosts = useMemo(() => {
    return posts.filter(p => {
      const cat = (p.category || '').toLowerCase();
      const cats = (p.categories || []).map(c => c.toLowerCase());
      const isNewsCategory =
        cat.includes('news') ||
        cats.includes('news') ||
        cat === 'kenya news' ||
        cat === 'africa news' ||
        cat === 'global news';

      if (!isNewsCategory) return false;

      // Sub-tab classification
      const tags = (p.tags || []).map(t => t.toLowerCase());
      const titleLower = p.title.toLowerCase();
      const contentLower = (p.content || '').toLowerCase();

      const isLocal =
        cat === 'kenya news' ||
        tags.includes('kenya') ||
        tags.includes('local') ||
        tags.includes('nairobi') ||
        tags.includes('mombasa') ||
        titleLower.includes('kenya') ||
        titleLower.includes('nairobi') ||
        titleLower.includes('mombasa') ||
        titleLower.includes('eldoret') ||
        titleLower.includes('namata') ||
        titleLower.includes('olkaria');

      const isAfrica =
        cat === 'africa news' ||
        tags.includes('africa') ||
        tags.includes('afcfta') ||
        tags.includes('kigali') ||
        tags.includes('lagos') ||
        tags.includes('rwanda') ||
        tags.includes('uganda') ||
        tags.includes('tanzania') ||
        titleLower.includes('africa') ||
        titleLower.includes('rwanda') ||
        titleLower.includes('kigali') ||
        titleLower.includes('ghana') ||
        titleLower.includes('nigeria') ||
        titleLower.includes('papss');

      const isGlobal =
        cat === 'global news' ||
        tags.includes('global') ||
        tags.includes('world') ||
        tags.includes('climate') ||
        titleLower.includes('global') ||
        titleLower.includes('summit') ||
        titleLower.includes('international') ||
        (!isLocal && !isAfrica);

      if (subTab === 'local') return isLocal;
      if (subTab === 'africa') return isAfrica;
      if (subTab === 'global') return isGlobal;
      return true; // 'all'
    });
  }, [posts, subTab]);

  const displayedPosts = useMemo(() => {
    if (!newsSearch.trim()) return newsPosts;
    const q = newsSearch.toLowerCase();
    return newsPosts.filter(
      p =>
        p.title.toLowerCase().includes(q) ||
        (p.content && p.content.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q))) ||
        p.author.toLowerCase().includes(q)
    );
  }, [newsPosts, newsSearch]);

  const breakingPost = useMemo(() => {
    return newsPosts.find(p => p.isBreaking) || newsPosts[0];
  }, [newsPosts]);

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Sub-tabs & Search Toolbar */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-3 sm:p-4 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Sub-tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800/80">
            <button
              onClick={() => setSubTab('local')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                subTab === 'local'
                  ? 'bg-white dark:bg-neutral-900 text-orange-600 dark:text-orange-400 shadow-xs ring-1 ring-black/5'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              <span>Local (Kenya)</span>
            </button>

            <button
              onClick={() => setSubTab('africa')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                subTab === 'africa'
                  ? 'bg-white dark:bg-neutral-900 text-orange-600 dark:text-orange-400 shadow-xs ring-1 ring-black/5'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-emerald-500" />
              <span>Africa (Other Countries)</span>
            </button>

            <button
              onClick={() => setSubTab('global')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                subTab === 'global'
                  ? 'bg-white dark:bg-neutral-900 text-orange-600 dark:text-orange-400 shadow-xs ring-1 ring-black/5'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5 text-blue-500" />
              <span>Global</span>
            </button>

            <button
              onClick={() => setSubTab('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                subTab === 'all'
                  ? 'bg-white dark:bg-neutral-900 text-orange-600 dark:text-orange-400 shadow-xs ring-1 ring-black/5'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <span>All News</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:max-w-xs min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={newsSearch}
              onChange={e => setNewsSearch(e.target.value)}
              placeholder="Filter news by keyword..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Status pill indicating active scope */}
        <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 pt-1">
          <span className="font-semibold text-neutral-700 dark:text-neutral-200">
            {subTab === 'local' && '📍 Showing Geolocalised Kenya Coverage (Nairobi, Counties & National)'}
            {subTab === 'africa' && '🌍 Showing Continental African Coverage (Regional EAC, ECOWAS & Continental)'}
            {subTab === 'global' && '🌐 Showing International & Global Affairs (Diplomacy, Climate & Science)'}
            {subTab === 'all' && '📰 Showing Aggregated News Wire from All Regions'}
          </span>
          <span>•</span>
          <span>{displayedPosts.length} stories available</span>
        </div>
      </div>

      {/* Featured Lead News Card */}
      {breakingPost && !newsSearch && (
        <div
          onClick={() => {
            setActivePost(breakingPost);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="group cursor-pointer rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-all relative"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
            <div className="md:col-span-7 h-56 sm:h-72 md:h-full relative overflow-hidden bg-neutral-100 dark:bg-neutral-800">
              <img
                src={breakingPost.imageUrl || breakingPost.thumbnail || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1000&auto=format&fit=crop&q=80'}
                alt={breakingPost.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                {breakingPost.isBreaking && (
                  <span className="px-2.5 py-1 rounded-md bg-red-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <Zap className="w-3 h-3 fill-white" />
                    <span>DEVELOPING WIRE</span>
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                  {breakingPost.category || 'News'}
                </span>
              </div>
            </div>

            <div className="md:col-span-5 p-5 sm:p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                  <span className="font-bold text-orange-600 dark:text-orange-400 uppercase">
                    FEATURED LEAD
                  </span>
                  <span>•</span>
                  <span>{breakingPost.createdAt}</span>
                </div>

                <h2 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {breakingPost.title}
                </h2>
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2 flex-wrap">
                <div
                  className="flex items-center gap-2 text-xs font-bold text-neutral-800 dark:text-neutral-200"
                  onClick={e => {
                    e.stopPropagation();
                    openUserProfile(breakingPost.author);
                  }}
                >
                  <img
                    src={breakingPost.authorAvatar}
                    alt={breakingPost.author}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span>u/{breakingPost.author}</span>
                  <VerifiedBadge isVerified={Boolean(breakingPost.authorVerified)} role={breakingPost.authorRole} size="xs" />
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-neutral-400 flex items-center gap-1 font-medium">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{(breakingPost.views || 1000).toLocaleString()} reads</span>
                  </span>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      toggleSavePost(breakingPost.id);
                    }}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      (currentUser.savedPostIds || []).includes(breakingPost.id)
                        ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/40'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-orange-600 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                    title={
                      (currentUser.savedPostIds || []).includes(breakingPost.id)
                        ? "Saved to personal 'Saved' list (Synced with Firestore)"
                        : "Save article to personal 'Saved' list"
                    }
                  >
                    {(currentUser.savedPostIds || []).includes(breakingPost.id) ? (
                      <>
                        <BookmarkCheck className="w-3.5 h-3.5 text-orange-600" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stories Grid: At least 4 columns on desktop, 21:9 images, reduced spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {displayedPosts.map(post => {
          return (
            <div
              key={post.id}
              onClick={() => {
                setActivePost(post);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group cursor-pointer bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs hover:shadow-md hover:border-orange-500/40 transition-all flex flex-col justify-between"
            >
              <div className="p-2 sm:p-2.5 space-y-1.5">
                {/* 21:9 Image Thumbnail */}
                <div className="relative aspect-[21/9] w-full rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  <img
                    src={post.imageUrl || post.thumbnail || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80'}
                    alt={post.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider">
                      {post.category || 'News'}
                    </span>
                    {post.flair && (
                      <span className="px-1.5 py-0.5 rounded-md bg-orange-600 text-white text-[9px] font-bold">
                        #{post.flair}
                      </span>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xs sm:text-[13px] font-bold text-neutral-900 dark:text-white leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
                  {post.title}
                </h3>
              </div>

              {/* Byline Footer */}
              <div className="px-2 sm:px-2.5 py-2 bg-neutral-50/80 dark:bg-neutral-800/40 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs">
                <div
                  className="flex items-center gap-1.5 cursor-pointer truncate"
                  onClick={e => {
                    e.stopPropagation();
                    openUserProfile(post.author);
                  }}
                >
                  <img
                    src={post.authorAvatar}
                    alt={post.author}
                    referrerPolicy="no-referrer"
                    className="w-4 h-4 rounded-full object-cover flex-shrink-0"
                  />
                  <span className="font-bold text-[10px] text-neutral-800 dark:text-neutral-200 truncate">
                    u/{post.author}
                  </span>
                  <VerifiedBadge isVerified={Boolean(post.authorVerified)} role={post.authorRole} size="xs" />
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 flex-shrink-0">
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{post.readTimeMinutes || 3}m</span>
                  </span>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      toggleSavePost(post.id);
                    }}
                    className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                      (currentUser.savedPostIds || []).includes(post.id)
                        ? 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 font-bold'
                        : 'text-neutral-500 hover:text-orange-600 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                    title={
                      (currentUser.savedPostIds || []).includes(post.id)
                        ? "Saved (Synced with Firestore)"
                        : "Save to personal 'Saved' list"
                    }
                  >
                    {(currentUser.savedPostIds || []).includes(post.id) ? (
                      <BookmarkCheck className="w-3 h-3 text-orange-500" />
                    ) : (
                      <Bookmark className="w-3 h-3" />
                    )}
                    <span>{(currentUser.savedPostIds || []).includes(post.id) ? 'Saved' : 'Save'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {displayedPosts.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
          <Globe2 className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            No dispatches matching "{newsSearch}"
          </h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or switch between Local, Africa, or Global tabs.
          </p>
        </div>
      )}
    </div>
  );
};
