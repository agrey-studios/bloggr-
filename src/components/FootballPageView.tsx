import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Flame,
  TrendingUp,
  Clock,
  Eye,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Activity,
  Award,
  Sparkles,
  BarChart3,
  X,
  CheckCircle2,
  Share2,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { useBloggr } from '../context/BloggrContext';
import { Post } from '../types';
import {
  LIVE_FOOTBALL_MATCHES,
  FOOTBALL_PREDICTIONS,
  FootballMatch,
  FootballPrediction,
} from '../data/footballData';
import { VerifiedBadge } from './VerifiedBadge';

export const FootballPageView: React.FC = () => {
  const { posts, setActivePost, openUserProfile, currentUser, toggleSavePost } = useBloggr();

  // Selected match for live stats detail drawer
  const [selectedMatch, setSelectedMatch] = useState<FootballMatch | null>(
    LIVE_FOOTBALL_MATCHES[0]
  );

  // Trending Carousel index
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Football tag filter for Latest Stories
  const [activeStoryFilter, setActiveStoryFilter] = useState<string>('all');

  // Predictions state for community voting
  const [predictions, setPredictions] = useState<FootballPrediction[]>(FOOTBALL_PREDICTIONS);
  const [votedPredictions, setVotedPredictions] = useState<Record<string, 'home' | 'draw' | 'away'>>({});

  // Filter football stories from posts
  const footballPosts = useMemo(() => {
    return posts.filter(p => {
      const cat = (p.category || '').toLowerCase();
      const cats = (p.categories || []).map(c => c.toLowerCase());
      const tags = (p.tags || []).map(t => t.toLowerCase());
      return (
        cat.includes('football') ||
        cats.includes('football') ||
        tags.includes('football') ||
        tags.includes('fkf') ||
        tags.includes('champions league') ||
        tags.includes('premier league') ||
        p.title.toLowerCase().includes('derby') ||
        p.title.toLowerCase().includes('mbappé')
      );
    });
  }, [posts]);

  // Trending stories for carousel
  const trendingCarouselPosts = useMemo(() => {
    return footballPosts.slice(0, 4);
  }, [footballPosts]);

  // Most Read stories (sorted by views/score)
  const mostReadPosts = useMemo(() => {
    return [...footballPosts]
      .sort((a, b) => (b.views || b.score) - (a.views || a.score))
      .slice(0, 5);
  }, [footballPosts]);

  // Latest stories filter
  const filteredLatestStories = useMemo(() => {
    if (activeStoryFilter === 'all') return footballPosts;
    const filterLower = activeStoryFilter.toLowerCase();
    return footballPosts.filter(p => {
      const tags = (p.tags || []).map(t => t.toLowerCase());
      const flair = (p.flair || '').toLowerCase();
      const title = p.title.toLowerCase();
      return (
        tags.includes(filterLower) ||
        flair.includes(filterLower) ||
        title.includes(filterLower)
      );
    });
  }, [footballPosts, activeStoryFilter]);

  const handleVote = (predId: string, choice: 'home' | 'draw' | 'away') => {
    if (votedPredictions[predId]) return;
    setVotedPredictions(prev => ({ ...prev, [predId]: choice }));
    setPredictions(prev =>
      prev.map(p => {
        if (p.id !== predId) return p;
        const userVotes = p.userVotes || { home: 100, draw: 50, away: 50 };
        return {
          ...p,
          userVotes: {
            ...userVotes,
            [choice]: userVotes[choice] + 1,
          },
        };
      })
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* SECTION 1: LIVE SCORES AND STATS (HORIZONTAL SCROLLER) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-xs sm:text-sm font-black text-neutral-900 dark:text-white uppercase tracking-wider">
              Live Scores & Stats
            </h2>
          </div>
          <span className="text-[11px] text-neutral-400 font-medium">
            Tap a match for in-depth pitch stats
          </span>
        </div>

        <div className="flex items-stretch gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
          {LIVE_FOOTBALL_MATCHES.map(match => {
            const isSelected = selectedMatch?.id === match.id;
            return (
              <div
                key={match.id}
                onClick={() => setSelectedMatch(match)}
                className={`flex-shrink-0 w-64 p-3 rounded-2xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-emerald-500/50 hover:shadow-xs'
                }`}
              >
                {/* League & Status */}
                <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-2">
                  <span className="font-semibold flex items-center gap-1 truncate max-w-[130px]">
                    <span>{match.leagueFlag}</span>
                    <span className="truncate">{match.league}</span>
                  </span>
                  {match.status === 'LIVE' ? (
                    <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 font-black text-[10px] flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      {match.minute}
                    </span>
                  ) : match.status === 'FT' ? (
                    <span className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 font-bold text-[10px]">
                      FT
                    </span>
                  ) : (
                    <span className="text-neutral-400 font-medium text-[10px]">
                      {match.startTime}
                    </span>
                  )}
                </div>

                {/* Score Line */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-white truncate">
                      <span>{match.homeTeam.logo}</span>
                      <span className="truncate">{match.homeTeam.name}</span>
                    </span>
                    <span className="text-sm font-black text-neutral-900 dark:text-white ml-2">
                      {match.status === 'UPCOMING' ? '-' : match.homeTeam.score}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-white truncate">
                      <span>{match.awayTeam.logo}</span>
                      <span className="truncate">{match.awayTeam.name}</span>
                    </span>
                    <span className="text-sm font-black text-neutral-900 dark:text-white ml-2">
                      {match.status === 'UPCOMING' ? '-' : match.awayTeam.score}
                    </span>
                  </div>
                </div>

                {/* Micro Stats Preview */}
                {match.stats && (
                  <div className="mt-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[10px] text-neutral-500">
                    <span>Possession</span>
                    <span className="font-bold text-neutral-700 dark:text-neutral-300">
                      {match.stats.possession[0]}% - {match.stats.possession[1]}%
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Match Expanded Stats Card */}
        {selectedMatch && selectedMatch.stats && (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-emerald-500/30 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs sm:text-sm font-black text-neutral-900 dark:text-white">
                  Live Match Statistics: {selectedMatch.homeTeam.name} vs {selectedMatch.awayTeam.name}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                  {selectedMatch.minute}
                </span>
              </div>
              <button
                onClick={() => setSelectedMatch(null)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stats Bars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Possession */}
              <div className="space-y-1.5 bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-xl">
                <div className="flex justify-between text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  <span>{selectedMatch.homeTeam.shortName} {selectedMatch.stats.possession[0]}%</span>
                  <span className="text-neutral-400 font-normal">Ball Possession</span>
                  <span>{selectedMatch.stats.possession[1]}% {selectedMatch.awayTeam.shortName}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden flex">
                  <div
                    style={{ width: `${selectedMatch.stats.possession[0]}%` }}
                    className="h-full bg-emerald-500"
                  />
                  <div
                    style={{ width: `${selectedMatch.stats.possession[1]}%` }}
                    className="h-full bg-blue-500"
                  />
                </div>
              </div>

              {/* Shots on Target */}
              <div className="space-y-1.5 bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-xl">
                <div className="flex justify-between text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  <span>{selectedMatch.stats.shotsOnTarget[0]}</span>
                  <span className="text-neutral-400 font-normal">Shots on Target</span>
                  <span>{selectedMatch.stats.shotsOnTarget[1]}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden flex">
                  <div
                    style={{
                      width: `${
                        (selectedMatch.stats.shotsOnTarget[0] /
                          (selectedMatch.stats.shotsOnTarget[0] +
                            selectedMatch.stats.shotsOnTarget[1] || 1)) *
                        100
                      }%`,
                    }}
                    className="h-full bg-emerald-500"
                  />
                  <div
                    style={{
                      width: `${
                        (selectedMatch.stats.shotsOnTarget[1] /
                          (selectedMatch.stats.shotsOnTarget[0] +
                            selectedMatch.stats.shotsOnTarget[1] || 1)) *
                        100
                      }%`,
                    }}
                    className="h-full bg-blue-500"
                  />
                </div>
              </div>

              {/* Corners & Fouls */}
              <div className="flex items-center justify-around bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-xl text-xs">
                <div className="text-center">
                  <div className="text-neutral-400 text-[10px]">Corners</div>
                  <div className="font-black text-neutral-900 dark:text-white">
                    {selectedMatch.stats.corners[0]} - {selectedMatch.stats.corners[1]}
                  </div>
                </div>
                <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-700" />
                <div className="text-center">
                  <div className="text-neutral-400 text-[10px]">Fouls</div>
                  <div className="font-black text-neutral-900 dark:text-white">
                    {selectedMatch.stats.fouls[0]} - {selectedMatch.stats.fouls[1]}
                  </div>
                </div>
                <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-700" />
                <div className="text-center">
                  <div className="text-neutral-400 text-[10px]">Yellow Cards</div>
                  <div className="font-black text-amber-600 dark:text-amber-400">
                    {selectedMatch.stats.yellowCards[0]} - {selectedMatch.stats.yellowCards[1]}
                  </div>
                </div>
              </div>
            </div>

            {/* Match Events timeline if present */}
            {selectedMatch.events && selectedMatch.events.length > 0 && (
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2 flex-wrap text-xs">
                <span className="font-bold text-neutral-500 text-[11px]">Match Events:</span>
                {selectedMatch.events.map((ev, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-[11px]"
                  >
                    <span>⚽</span>
                    <span className="font-bold">{ev.minute}</span>
                    <span>{ev.player}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 2: TRENDING (CAROUSEL AND MOST READ) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Flame className="w-4 h-4 text-orange-500" />
          <h2 className="text-sm sm:text-base font-black text-neutral-900 dark:text-white uppercase tracking-wider">
            Trending Football Desk
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Carousel (Left: 7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs relative">
            {trendingCarouselPosts.length > 0 && (
              <div className="relative">
                {(() => {
                  const post = trendingCarouselPosts[carouselIndex % trendingCarouselPosts.length];
                  return (
                    <div
                      onClick={() => {
                        setActivePost(post);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="cursor-pointer group"
                    >
                      <div className="h-64 sm:h-80 relative overflow-hidden bg-neutral-900">
                        <img
                          src={post.imageUrl || post.thumbnail || 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1000&auto=format&fit=crop&q=80'}
                          alt={post.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                        {/* Top Pills */}
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-md bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                            <Flame className="w-3 h-3 fill-white" />
                            <span>TRENDING #{carouselIndex + 1}</span>
                          </span>
                          {post.flair && (
                            <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-white text-[10px] font-bold">
                              #{post.flair}
                            </span>
                          )}
                        </div>

                        {/* Story Content Overlay */}
                        <div className="absolute bottom-4 left-4 right-4 text-white space-y-2">
                          <h3 className="text-base sm:text-xl font-black leading-tight group-hover:text-emerald-400 transition-colors">
                            {post.title}
                          </h3>
                          <div className="flex items-center justify-between text-[11px] text-white/70 pt-1">
                            <span className="flex items-center gap-1 font-bold text-white">
                              <span>u/{post.author}</span>
                              <VerifiedBadge isVerified={Boolean(post.authorVerified)} role={post.authorRole} size="xs" />
                            </span>
                            <span className="flex items-center gap-2">
                              <span>{post.readTimeMinutes || 3} min read</span>
                              <span>•</span>
                              <span>{(post.views || 0).toLocaleString()} views</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Carousel Controls */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setCarouselIndex(prev => (prev > 0 ? prev - 1 : trendingCarouselPosts.length - 1));
                    }}
                    className="p-1.5 rounded-full bg-black/60 hover:bg-black text-white transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setCarouselIndex(prev => (prev + 1) % trendingCarouselPosts.length);
                    }}
                    className="p-1.5 rounded-full bg-black/60 hover:bg-black text-white transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Carousel Dots */}
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/80 flex items-center justify-center gap-1.5">
                  {trendingCarouselPosts.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCarouselIndex(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        carouselIndex === idx ? 'w-6 bg-emerald-600' : 'w-2 bg-neutral-300 dark:bg-neutral-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Most Read (Right: 5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xs sm:text-sm font-black text-neutral-900 dark:text-white uppercase tracking-wider">
                  Most Read Football Stories
                </h3>
              </div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase">24H RANKING</span>
            </div>

            <div className="space-y-3">
              {mostReadPosts.map((post, idx) => (
                <div
                  key={post.id}
                  onClick={() => {
                    setActivePost(post);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group flex items-start gap-3 cursor-pointer py-1.5 border-b border-neutral-100 dark:border-neutral-800/60 last:border-0"
                >
                  <span
                    className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                      idx === 0
                        ? 'bg-amber-500 text-white'
                        : idx === 1
                        ? 'bg-neutral-400 text-white'
                        : idx === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                    }`}
                  >
                    {idx + 1}
                  </span>

                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                      <span>{(post.views || 0).toLocaleString()} reads</span>
                      <span>•</span>
                      <span>u/{post.author}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: LATEST STORIES (FOOTBALL NEWS) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 px-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm sm:text-base font-black text-neutral-900 dark:text-white uppercase tracking-wider">
              Latest Stories (Football News)
            </h2>
          </div>

          {/* Story Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs">
            {['all', 'Derby', 'Champions League', 'FKF', 'Analysis'].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveStoryFilter(filter)}
                className={`px-3 py-1 rounded-lg font-bold capitalize transition-all ${
                  activeStoryFilter === filter
                    ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {filter === 'all' ? 'All Stories' : filter}
              </button>
            ))}
          </div>
        </div>

        {/* Latest Football Stories Grid: At least 4 columns on desktop, 21:9 images, tight spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {filteredLatestStories.map(post => (
            <div
              key={post.id}
              onClick={() => {
                setActivePost(post);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group cursor-pointer bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all flex flex-col justify-between"
            >
              <div className="p-2 sm:p-2.5 space-y-1.5">
                <div className="relative aspect-[21/9] w-full rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  <img
                    src={post.imageUrl || post.thumbnail || 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&auto=format&fit=crop&q=80'}
                    alt={post.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider">
                      Football
                    </span>
                    {post.flair && (
                      <span className="px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[9px] font-bold">
                        #{post.flair}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-xs sm:text-[13px] font-bold text-neutral-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                  {post.title}
                </h3>
              </div>

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
                  <span>{post.readTimeMinutes || 3}m</span>
                  <span>•</span>
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
          ))}
        </div>
      </div>

      {/* SECTION 4: FOOTBALL PREDICTIONS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm sm:text-base font-black text-neutral-900 dark:text-white uppercase tracking-wider">
              Football Predictions & Form Analysis
            </h2>
          </div>
          <span className="text-[11px] text-neutral-400 font-medium">
            Tactical models & community fan voting
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {predictions.map(pred => {
            const hasVoted = votedPredictions[pred.id];
            const totalVotes =
              (pred.userVotes?.home || 0) +
              (pred.userVotes?.draw || 0) +
              (pred.userVotes?.away || 0);

            return (
              <div
                key={pred.id}
                className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-xs space-y-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {pred.league}
                    </span>
                    <h3 className="text-base font-black text-neutral-900 dark:text-white">
                      {pred.fixture}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                    {pred.confidence} Confidence
                  </span>
                </div>

                {/* Tactical Tip & Predicted Score */}
                <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">
                      Expert Model Verdict
                    </div>
                    <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                      {pred.expertVerdict}
                    </div>
                  </div>
                  <div className="text-center pl-3 border-l border-emerald-500/20">
                    <div className="text-[10px] uppercase font-bold text-neutral-400">Predicted</div>
                    <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      {pred.predictedScore}
                    </div>
                  </div>
                </div>

                {/* Key Insight */}
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed italic">
                  "{pred.keyInsight}"
                </p>

                {/* Probability Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold text-neutral-600 dark:text-neutral-400">
                    <span>{pred.homeTeam} ({pred.homeProb}%)</span>
                    <span>Draw ({pred.drawProb}%)</span>
                    <span>{pred.awayTeam} ({pred.awayProb}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden flex">
                    <div style={{ width: `${pred.homeProb}%` }} className="h-full bg-emerald-500" />
                    <div style={{ width: `${pred.drawProb}%` }} className="h-full bg-amber-500" />
                    <div style={{ width: `${pred.awayProb}%` }} className="h-full bg-blue-500" />
                  </div>
                </div>

                {/* Community Voting */}
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span>Fan Community Prediction:</span>
                    <span>{totalVotes.toLocaleString()} votes cast</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleVote(pred.id, 'home')}
                      className={`p-2 rounded-xl text-xs font-bold transition-all border ${
                        hasVoted === 'home'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-emerald-500 text-neutral-800 dark:text-neutral-200'
                      }`}
                    >
                      <div>1 (Home)</div>
                      <div className="text-[10px] font-normal opacity-80">
                        {Math.round(((pred.userVotes?.home || 0) / (totalVotes || 1)) * 100)}%
                      </div>
                    </button>

                    <button
                      onClick={() => handleVote(pred.id, 'draw')}
                      className={`p-2 rounded-xl text-xs font-bold transition-all border ${
                        hasVoted === 'draw'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-amber-500 text-neutral-800 dark:text-neutral-200'
                      }`}
                    >
                      <div>X (Draw)</div>
                      <div className="text-[10px] font-normal opacity-80">
                        {Math.round(((pred.userVotes?.draw || 0) / (totalVotes || 1)) * 100)}%
                      </div>
                    </button>

                    <button
                      onClick={() => handleVote(pred.id, 'away')}
                      className={`p-2 rounded-xl text-xs font-bold transition-all border ${
                        hasVoted === 'away'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-blue-500 text-neutral-800 dark:text-neutral-200'
                      }`}
                    >
                      <div>2 (Away)</div>
                      <div className="text-[10px] font-normal opacity-80">
                        {Math.round(((pred.userVotes?.away || 0) / (totalVotes || 1)) * 100)}%
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
