import React, { useMemo, useState, useEffect } from 'react';
import {
  Plus,
  SearchX,
  WifiOff,
  RefreshCw,
  Sparkles,
  Users,
  Clock,
  Compass,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  BookmarkCheck,
  Eye,
  TrendingUp,
  UserCheck,
  UserPlus,
  Flame,
  Play,
  Clapperboard,
  BookOpen,
  ArrowUpRight,
  ChevronRight,
  Mail,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { useBloggr } from '../context/BloggrContext';
import { Post, FeedTab, VideoItem } from '../types';
import { LiveWireTicker } from './LiveWireTicker';
import { RECOMMENDED_AUTHORS } from '../data/seedData';

const FEEDLIST_CACHE_KEY = 'bloggr_feedlist_cache_v1';

interface FeedlistCacheData {
  timestamp: number;
  posts: Post[];
}

export const FeedList: React.FC = () => {
  const {
    posts,
    activeFeed,
    setActiveFeed,
    searchQuery,
    selectedFlair,
    currentUser,
    timelineFilter,
    setIsCreatePostOpen,
    setSearchQuery,
    setSelectedFlair,
    setTimelineFilter,
    feedTab,
    setFeedTab,
    setActivePost,
    openUserProfile,
    isFollowingAuthor,
    toggleFollowAuthor,
    toggleSavePost,
    votePost,
    showToast,
    platformBranding,
    videosList,
    setIsReelsOpen,
    isAuthorVerified,
  } = useBloggr();

  // Network online/offline status detection
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  // Category showcase active tab on homepage
  const [selectedCategorySection, setSelectedCategorySection] = useState<string>('Kenya');

  // For You Category filter pill
  const [forYouCategory, setForYouCategory] = useState<string>('all');

  // Newsletter subscription
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterDone, setNewsletterDone] = useState(false);

  // Cached posts snapshot for offline / unstable connection fallback
  const [cachedSnapshot, setCachedSnapshot] = useState<FeedlistCacheData | null>(() => {
    try {
      const saved = localStorage.getItem(FEEDLIST_CACHE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Back online! Syncing live Kenya & global dispatches.');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Connection offline. Showing cached articles.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  // Update localStorage cache whenever posts are successfully loaded
  useEffect(() => {
    if (posts && posts.length > 0) {
      try {
        const payload: FeedlistCacheData = {
          timestamp: Date.now(),
          posts: posts.slice(0, 30),
        };
        localStorage.setItem(FEEDLIST_CACHE_KEY, JSON.stringify(payload));
        setCachedSnapshot(payload);
      } catch (e) {
        console.warn('Failed to cache feed posts locally:', e);
      }
    }
  }, [posts]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Feed refreshed with latest wire dispatches!');
    }, 600);
  };

  const effectivePosts = useMemo(() => {
    if (posts && posts.length > 0) return posts;
    if (cachedSnapshot?.posts && cachedSnapshot.posts.length > 0) return cachedSnapshot.posts;
    return [];
  }, [posts, cachedSnapshot]);

  const isServingFromCacheOnly = (!isOnline || posts.length === 0) && (cachedSnapshot?.posts.length ?? 0) > 0;

  // Filter & Sort Pipeline
  const filteredAndSortedPosts = useMemo(() => {
    let result = [...effectivePosts];

    // 1. Saved Dispatches Scope
    if (activeFeed === 'saved') {
      result = result.filter(p => (currentUser.savedPostIds || []).includes(p.id));
    }

    // 2. Feed Tab: For You | Following | Latest
    if (feedTab === 'following') {
      const followed = (currentUser.followingAuthors || []).map(a => a.toLowerCase());
      result = result.filter(p => followed.includes(p.author.toLowerCase()));
    } else if (feedTab === 'latest') {
      result.sort((a, b) => (b.id > a.id ? 1 : -1));
    } else if (feedTab === 'for_you') {
      // Personalized recommendation: boost user's favorite category & followed authors
      const favCat = (currentUser.favoriteCategory || 'Kenya').toLowerCase();
      const followed = (currentUser.followingAuthors || []).map(a => a.toLowerCase());
      result.sort((a, b) => {
        const aBoost =
          (a.category?.toLowerCase() === favCat ? 200 : 0) +
          (followed.includes(a.author.toLowerCase()) ? 300 : 0) +
          (a.isFeatured ? 100 : 0);
        const bBoost =
          (b.category?.toLowerCase() === favCat ? 200 : 0) +
          (followed.includes(b.author.toLowerCase()) ? 300 : 0) +
          (b.isFeatured ? 100 : 0);
        return (b.score + bBoost) - (a.score + aBoost);
      });
    }

    // 3. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.author.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.flair?.toLowerCase().includes(q)
      );
    }

    // 4. Category / Flair Filter
    if (selectedFlair) {
      result = result.filter(
        p =>
          p.flair?.toLowerCase() === selectedFlair.toLowerCase() ||
          p.category?.toLowerCase() === selectedFlair.toLowerCase()
      );
    }

    return result;
  }, [effectivePosts, activeFeed, feedTab, currentUser, searchQuery, selectedFlair]);

  // Featured News Stories (1 Lead + 4 Companion Stories)
  const featuredLead = useMemo(() => {
    return filteredAndSortedPosts.find(p => p.isFeatured || p.isBreaking) || filteredAndSortedPosts[0];
  }, [filteredAndSortedPosts]);

  const featuredSecondary = useMemo(() => {
    if (!featuredLead) return [];
    return filteredAndSortedPosts.filter(p => p.id !== featuredLead.id).slice(0, 4);
  }, [filteredAndSortedPosts, featuredLead]);

  // Trending Stories (Calculated by views, score/likes, commentsCount, shares, saves)
  const trendingStories = useMemo(() => {
    return [...effectivePosts]
      .sort((a, b) => {
        const momentumA = (a.views || 0) + a.score * 5 + (a.commentsCount || 0) * 8;
        const momentumB = (b.views || 0) + b.score * 5 + (b.commentsCount || 0) * 8;
        return momentumB - momentumA;
      })
      .slice(0, 5);
  }, [effectivePosts]);

  // For You Recommendations
  const forYouStories = useMemo(() => {
    let list = [...effectivePosts];
    if (forYouCategory !== 'all') {
      list = list.filter(p => p.category?.toLowerCase() === forYouCategory.toLowerCase());
    }
    const followed = (currentUser.followingAuthors || []).map(a => a.toLowerCase());
    return list
      .sort((a, b) => {
        const aScore = (followed.includes(a.author.toLowerCase()) ? 500 : 0) + a.score;
        const bScore = (followed.includes(b.author.toLowerCase()) ? 500 : 0) + b.score;
        return bScore - aScore;
      })
      .slice(0, 6);
  }, [effectivePosts, forYouCategory, currentUser.followingAuthors]);

  // Category News Desk Stories
  const categoryStories = useMemo(() => {
    const list = effectivePosts.filter(
      p => p.category?.toLowerCase() === selectedCategorySection.toLowerCase()
    );
    return list.length > 0 ? list.slice(0, 4) : effectivePosts.slice(0, 4);
  }, [effectivePosts, selectedCategorySection]);

  // Most Read Stories (Sorted by total readership views)
  const mostReadStories = useMemo(() => {
    return [...effectivePosts]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);
  }, [effectivePosts]);

  // Popular Creators Spotlight
  const popularCreators = useMemo(() => {
    const verified = RECOMMENDED_AUTHORS.filter(a => a.verified).slice(0, 3);
    const unverified = RECOMMENDED_AUTHORS.filter(a => !a.verified).slice(0, 2);
    return [...verified, ...unverified];
  }, []);

  const handleSubscribeNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      showToast('Please enter a valid email address');
      return;
    }
    setNewsletterDone(true);
    showToast('Subscribed to the Bloggr Morning Wire!');
    setNewsletterEmail('');
  };

  const isHomeCustomView = Boolean(searchQuery.trim() || selectedFlair || activeFeed === 'saved');

  return (
    <div className="flex-1 min-w-0 space-y-6">
      {/* SECTION 1: BREAKING NEWS BAR (LiveWireTicker) */}
      <LiveWireTicker />

      {/* Offline / Cached Dispatches Indicator Banner */}
      {isServingFromCacheOnly && (
        <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span>
              <strong>Offline Mode:</strong> Viewing previously loaded wire dispatches.
            </span>
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-200/60 dark:bg-amber-800/40 hover:bg-amber-200 text-[11px] font-bold text-amber-900 dark:text-amber-100 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* SAVED FEED VIEW (Dedicated Header if activeFeed === 'saved') */}
      {activeFeed === 'saved' && (
        <div className="rounded-2xl border border-orange-200/80 dark:border-orange-900/50 bg-gradient-to-r from-orange-50/80 via-white to-amber-50/80 dark:from-neutral-900 dark:via-neutral-900 dark:to-orange-950/20 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Bookmark className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                  Your Saved Stories
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/60">
                  {filteredAndSortedPosts.length} {filteredAndSortedPosts.length === 1 ? 'Dispatch' : 'Dispatches'}
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Personal reading list synced with Cloud Firestore database
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => openUserProfile(currentUser.username, 'saved')}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:border-orange-500 transition-colors cursor-pointer"
            >
              Manage Saved
            </button>
            <button
              onClick={() => {
                setActiveFeed('home');
                setTimelineFilter('all');
              }}
              className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Browse All Wire
            </button>
          </div>
        </div>
      )}

      {/* Empty Saved State */}
      {activeFeed === 'saved' && filteredAndSortedPosts.length === 0 && (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 sm:p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto">
            <Bookmark className="w-7 h-7 text-orange-500" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
            Your personal saved list is empty
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
            Click the "Save" button on any story card or article reader view to bookmark dispatches to your personal list. Your saved stories are securely synced across your devices with Cloud Firestore.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setActiveFeed('home');
                setTimelineFilter('all');
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 transition-all cursor-pointer"
            >
              Discover Top Stories Now
            </button>
          </div>
        </div>
      )}

      {/* SEARCH / FLAIR ACTIVE HEADER */}
      {searchQuery.trim() && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/40 text-xs">
          <div>
            <span>Search results for: </span>
            <strong className="text-neutral-900 dark:text-white">"{searchQuery}"</strong>
            <span className="text-neutral-500 ml-2">({filteredAndSortedPosts.length} stories found)</span>
          </div>
          <button
            onClick={() => setSearchQuery('')}
            className="text-orange-600 dark:text-orange-400 font-bold hover:underline cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* FILTER TABS: For You | Following | Latest (When on normal home stream) */}
      {!isHomeCustomView && (
        <div className="flex items-center justify-between gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setFeedTab('for_you')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                feedTab === 'for_you'
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/25'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>For You</span>
            </button>

            <button
              onClick={() => setFeedTab('following')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                feedTab === 'following'
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/25'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Following</span>
              {(currentUser.followingAuthors?.length ?? 0) > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 dark:bg-neutral-900/40">
                  {currentUser.followingAuthors?.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setFeedTab('latest')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                feedTab === 'latest'
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/25'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Latest</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION 2: FEATURED NEWS GRID (MSN-Style 1 Large Main + 4 Secondary Stories) */}
      {!isHomeCustomView && featuredLead && (
        <section aria-label="Featured Stories Grid" className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 sm:p-4 shadow-xs">
            {/* Main Lead Story */}
            <div
              onClick={() => setActivePost(featuredLead)}
              className="lg:col-span-7 group cursor-pointer space-y-3 flex flex-col justify-between"
            >
              <div className="relative aspect-[21/9] sm:aspect-video rounded-xl overflow-hidden bg-neutral-950">
                <img
                  src={featuredLead.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80'}
                  alt={featuredLead.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-600 text-white shadow-xs">
                    {featuredLead.category || 'Lead Story'}
                  </span>
                  {featuredLead.isBreaking && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white animate-pulse">
                      Breaking
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-base sm:text-xl font-black text-neutral-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2 leading-snug">
                  {featuredLead.title}
                </h2>

                <div className="flex items-center justify-between gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">
                      {featuredLead.author}
                    </span>
                    <span>·</span>
                    <span>{featuredLead.createdAt}</span>
                    <span>·</span>
                    <span>{featuredLead.readTimeMinutes || 4} min read</span>
                  </div>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      toggleSavePost(featuredLead.id);
                    }}
                    className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-orange-600 transition-colors"
                    title="Bookmark Story"
                  >
                    {(currentUser.savedPostIds || []).includes(featuredLead.id) ? (
                      <BookmarkCheck className="w-4 h-4 text-orange-600" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 4 Secondary Stories Stack */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-3 lg:border-l lg:border-neutral-200 lg:dark:border-neutral-800 lg:pl-4">
              {featuredSecondary.map(subStory => (
                <div
                  key={subStory.id}
                  onClick={() => setActivePost(subStory)}
                  className="flex gap-3 group cursor-pointer items-start pb-2.5 border-b border-neutral-100 dark:border-neutral-800/80 last:border-0 last:pb-0"
                >
                  <div className="w-24 sm:w-28 aspect-[21/9] sm:aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-neutral-950">
                    <img
                      src={subStory.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=300&q=80'}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                      {subStory.category || 'News'}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white group-hover:text-orange-600 transition-colors line-clamp-2 leading-tight">
                      {subStory.title}
                    </h3>
                    <div className="text-[10px] text-neutral-400 flex items-center gap-1.5">
                      <span>{subStory.author}</span>
                      <span>·</span>
                      <span>{subStory.createdAt}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 3: FOR YOU (Personalized Feed Recommendations) */}
      {!isHomeCustomView && (
        <section aria-label="For You Personalized Stories" className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-neutral-900 dark:text-white">
                For You
              </h2>
              <span className="text-[11px] text-neutral-400 hidden sm:inline">
                Personalized from followed categories, authors & reading patterns
              </span>
            </div>

            {/* Category Preferences Segmented Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
              {['all', 'Kenya', 'Africa', 'Politics', 'Business', 'Technology', 'Sports'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setForYouCategory(cat)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    forYouCategory === cat
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {cat === 'all' ? 'All Desks' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* For You Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {forYouStories.map(story => (
              <article
                key={story.id}
                onClick={() => setActivePost(story)}
                className="group p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs hover:border-orange-500/40 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="relative aspect-[21/9] sm:aspect-video rounded-xl overflow-hidden bg-neutral-950">
                    <img
                      src={story.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=400&q=80'}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-black/60 text-white backdrop-blur-xs">
                      {story.category || 'News'}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
                    {story.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between gap-1 pt-2.5 mt-2 border-t border-neutral-100 dark:border-neutral-800 text-[10px] text-neutral-500">
                  <span className="truncate max-w-[120px] font-semibold text-neutral-700 dark:text-neutral-300">
                    {story.author}
                  </span>
                  <span>·</span>
                  <span>{story.createdAt}</span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      toggleSavePost(story.id);
                    }}
                    className="p-1 text-neutral-400 hover:text-orange-500 ml-auto"
                    title="Bookmark"
                  >
                    {(currentUser.savedPostIds || []).includes(story.id) ? (
                      <BookmarkCheck className="w-3.5 h-3.5 text-orange-600" />
                    ) : (
                      <Bookmark className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 4: LATEST NEWS GRID (3-Column Desktop / 2-Column Tablet / 1-Column Mobile) */}
      <section aria-label="Latest News Grid" className="space-y-3 pt-2">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-neutral-900 dark:text-white">
              Latest News Dispatches
            </h2>
          </div>
          <span className="text-xs text-neutral-400">Live Continuous Wire</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedPosts.slice(0, 9).map(post => {
            const isSaved = (currentUser.savedPostIds || []).includes(post.id);
            return (
              <article
                key={post.id}
                onClick={() => setActivePost(post)}
                className="group p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs hover:border-orange-500/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="relative aspect-[21/9] sm:aspect-video rounded-xl overflow-hidden bg-neutral-950">
                    <img
                      src={post.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=400&q=80'}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-orange-600 text-white">
                        {post.category || 'News'}
                      </span>
                      {post.isBreaking && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-red-600 text-white animate-pulse">
                          Alert
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between gap-1 pt-2.5 mt-2 border-t border-neutral-100 dark:border-neutral-800 text-[10px] text-neutral-500">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300 truncate">
                      {post.author}
                    </span>
                    <span>·</span>
                    <span>{post.readTimeMinutes || 3}m read</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5 text-neutral-400">
                      <Eye className="w-3 h-3" />
                      {post.views || 310}
                    </span>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleSavePost(post.id);
                      }}
                      className="p-1 text-neutral-400 hover:text-orange-600"
                      title="Bookmark"
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-3.5 h-3.5 text-orange-600" />
                      ) : (
                        <Bookmark className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* SECTION 5: TRENDING STORIES (Top 5 Ranking Calculated with Momentum) */}
      {!isHomeCustomView && trendingStories.length > 0 && (
        <section aria-label="Trending Stories Ranking" className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
                <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
              </div>
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-neutral-900 dark:text-white">
                Trending Today
              </h2>
            </div>
            <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400">
              Ranked by Engagement & Velocity
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {trendingStories.map((story, rankIdx) => (
              <div
                key={story.id}
                onClick={() => setActivePost(story)}
                className="group p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-orange-500/40 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-orange-600 dark:text-orange-500">
                      0{rankIdx + 1}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400">
                      Trending
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-orange-600 transition-colors line-clamp-3 leading-snug">
                    {story.title}
                  </h4>
                </div>

                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[10px] text-neutral-400 flex items-center justify-between">
                  <span className="truncate">{story.author}</span>
                  <span className="font-semibold text-neutral-600 dark:text-neutral-300">
                    {story.views || 450} reads
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 6: CATEGORY NEWS SECTIONS (Interactive Desk Showcase) */}
      {!isHomeCustomView && (
        <section aria-label="Category News Desks" className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <Compass className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-neutral-900 dark:text-white">
                Category Desks
              </h2>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
              {['Kenya', 'Africa', 'Politics', 'Business', 'Technology', 'Sports', 'Opinion'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategorySection(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    selectedCategorySection === cat
                      ? 'bg-orange-600 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
            {categoryStories.map((catStory, idx) => (
              <article
                key={catStory.id}
                onClick={() => setActivePost(catStory)}
                className={`group p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs hover:border-orange-500/40 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between ${
                  idx === 0 ? 'md:col-span-2' : ''
                }`}
              >
                <div className="space-y-2">
                  <div className="relative aspect-[21/9] sm:aspect-video rounded-xl overflow-hidden bg-neutral-950">
                    <img
                      src={catStory.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=500&q=80'}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-black/60 text-white">
                      {catStory.category || selectedCategorySection}
                    </span>
                  </div>

                  <h3 className={`font-bold text-neutral-900 dark:text-white group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug ${
                    idx === 0 ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
                  }`}>
                    {catStory.title}
                  </h3>
                </div>

                <div className="pt-2 mt-2 border-t border-neutral-100 dark:border-neutral-800 text-[10px] text-neutral-500 flex items-center justify-between">
                  <span>{catStory.author}</span>
                  <span>{catStory.createdAt}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 7: VIDEO GRID & SHORTS */}
      {!isHomeCustomView && videosList.length > 0 && (
        <section aria-label="Videos and Shorts Grid" className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
                <Clapperboard className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-neutral-900 dark:text-white">
                Video Stories & Shorts
              </h2>
            </div>
            <button
              onClick={() => setIsReelsOpen(true)}
              className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline cursor-pointer"
            >
              <span>Watch Fullscreen Shorts</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {videosList.slice(0, 4).map(vid => (
              <div
                key={vid.id}
                onClick={() => setIsReelsOpen(true)}
                className="group relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-950 cursor-pointer shadow-xs"
              >
                <div className="relative aspect-[21/9] sm:aspect-[4/3] w-full overflow-hidden">
                  <img
                    src={vid.thumbnail}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono font-bold flex items-center gap-1">
                    <Play className="w-2.5 h-2.5 fill-white text-white" />
                    <span>0:58</span>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-rose-400">
                      {vid.category}
                    </span>
                    <h4 className="text-xs font-bold line-clamp-2 leading-tight">
                      {vid.title}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] text-neutral-300 pt-0.5">
                      <span>{vid.author}</span>
                      <span>{(vid.views || 1200).toLocaleString()} views</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 8: POPULAR CREATORS SPOTLIGHT */}
      {!isHomeCustomView && popularCreators.length > 0 && (
        <section aria-label="Popular Creators Spotlight" className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <Users className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-neutral-900 dark:text-white">
                Popular Writers & Journalists
              </h2>
            </div>
            <button
              onClick={() => {
                const writersBtn = document.getElementById('sidebar-explore-all-writers-btn');
                if (writersBtn) writersBtn.click();
              }}
              className="text-xs font-bold text-orange-600 hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>Explore Directory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {popularCreators.map(author => {
              const isFollowed = isFollowingAuthor(author.username);
              return (
                <div
                  key={author.username}
                  className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs flex flex-col justify-between space-y-2 text-center items-center"
                >
                  <div
                    onClick={() => openUserProfile(author.username)}
                    className="cursor-pointer group flex flex-col items-center space-y-1.5"
                  >
                    <div className="relative">
                      <img
                        src={author.avatar}
                        alt={author.displayName}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-neutral-200 dark:ring-neutral-700 group-hover:ring-orange-500 transition-all"
                      />
                      {author.verified && (
                        <span className="w-4 h-4 rounded-full bg-orange-600 text-white flex items-center justify-center absolute -bottom-0.5 -right-0.5 ring-2 ring-white dark:ring-neutral-900">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-orange-600 transition-colors truncate max-w-[120px]">
                        {author.displayName}
                      </h4>
                      <p className="text-[10px] text-neutral-400">@{author.username}</p>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-tight">
                      {author.bio}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleFollowAuthor(author.username)}
                    className={`w-full py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isFollowed
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                        : 'bg-orange-600 hover:bg-orange-500 text-white shadow-xs'
                    }`}
                  >
                    {isFollowed ? 'Following' : '+ Follow'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION 9: MOST READ STORIES */}
      {!isHomeCustomView && mostReadStories.length > 0 && (
        <section aria-label="Most Read Stories" className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-neutral-900 dark:text-white">
                Most Read This Week
              </h2>
            </div>
            <span className="text-xs text-neutral-400">By Total Readership</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {mostReadStories.slice(0, 3).map((story, i) => (
              <div
                key={story.id}
                onClick={() => setActivePost(story)}
                className="group p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-orange-500/40 hover:shadow-sm transition-all cursor-pointer flex flex-col sm:flex-row gap-3 items-start sm:items-center"
              >
                <div className="w-full sm:w-20 aspect-[21/9] sm:aspect-square rounded-xl overflow-hidden bg-neutral-950 flex-shrink-0">
                  <img
                    src={story.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=400&q=80'}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="min-w-0 space-y-1">
                  <span className="text-[10px] font-bold text-orange-600 uppercase">
                    {story.category}
                  </span>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-orange-600 transition-colors line-clamp-2">
                    {story.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                    <span>{story.views || 400} views</span>
                    <span>·</span>
                    <span>{story.readTimeMinutes || 3}m read</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 10: NEWSLETTER CARD (In-feed subscription) */}
      {!isHomeCustomView && (
        <section aria-label="Newsletter Box" className="pt-2">
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white p-5 sm:p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full inline-block">
                Free Email Newsletter
              </span>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                Stay Ahead with the Bloggr Daily Brief
              </h3>
              <p className="text-xs text-white/90 max-w-md">
                Get real-time breaking news alerts, policy breakdowns, and the day's best creator dispatches delivered straight to your inbox.
              </p>
            </div>

            <form onSubmit={handleSubscribeNewsletter} className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-2">
              <input
                type="email"
                value={newsletterEmail}
                onChange={e => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="w-full sm:w-64 px-3.5 py-2 text-xs rounded-xl bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-white"
                required
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap"
              >
                {newsletterDone ? 'Subscribed ✓' : 'Subscribe Free'}
              </button>
            </form>
          </div>
        </section>
      )}
    </div>
  );
};
