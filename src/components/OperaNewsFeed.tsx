import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Eye,
  CheckCircle2,
  UserPlus,
  UserCheck,
  Share2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CloudSun,
  Bookmark,
  BookmarkCheck,
  ThumbsUp,
  BarChart2,
  Check,
  Bot,
  FileText,
  Radio,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Post, NewsCategoryFilter } from '../types';
import { useBloggr } from '../context/BloggrContext';

interface OperaNewsFeedProps {
  posts: Post[];
}

export const OperaNewsFeed: React.FC<OperaNewsFeedProps> = ({ posts }) => {
  const {
    setActivePost,
    openUserProfile,
    toggleFollowAuthor,
    isFollowingAuthor,
    currentUser,
    showToast,
    toggleSavePost,
    votePost,
    timelineFilter,
    setTimelineFilter,
  } = useBloggr();

  // Top 4 stories for the 4 sliding hero grids
  const heroStories = posts.slice(0, 4);
  const otherPosts = posts.slice(4);

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const gridTrackRef = useRef<HTMLDivElement>(null);
  const gridItemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Bloggr Pulse Poll interactive state
  const [pollVotedOption, setPollVotedOption] = useState<number | null>(null);
  const [pollVotes, setPollVotes] = useState<number[]>([1420, 895, 630]);

  // Google Gemini API state: AI Smart Brief cache & loading state per post
  const [aiBriefs, setAiBriefs] = useState<Record<string, string>>({});
  const [loadingAiBriefId, setLoadingAiBriefId] = useState<string | null>(null);
  const [expandedBriefId, setExpandedBriefId] = useState<string | null>(null);

  // Google Gemini API state: Live Wire 1-Sentence Briefing for Header Infopane
  const [wireBrief, setWireBrief] = useState<string>('Live Wire: Top tech, energy and regional economic stories moving the African continent today.');
  const [isGeneratingWireBrief, setIsGeneratingWireBrief] = useState<boolean>(false);

  // Fetch real-time AI wire brief from Google Gemini API on mount
  useEffect(() => {
    let isMounted = true;
    const fetchWireBrief = async () => {
      if (heroStories.length === 0) return;
      setIsGeneratingWireBrief(true);
      try {
        const res = await fetch('/api/gemini/wire-brief', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            headlines: heroStories.map(s => s.title),
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.brief && isMounted) {
            setWireBrief(data.brief.replace(/^["]+|["]+$/g, ''));
          }
        }
      } catch (err) {
        console.warn('Notice: Wire brief generation offline fallback', err);
      } finally {
        if (isMounted) setIsGeneratingWireBrief(false);
      }
    };

    fetchWireBrief();
    return () => {
      isMounted = false;
    };
  }, [heroStories.length > 0 ? heroStories[0].id : '']);

  // Handle generating an AI Brief using Google Gemini API
  const handleToggleAiBrief = async (e: React.MouseEvent, post: Post) => {
    e.stopPropagation();

    if (expandedBriefId === post.id) {
      setExpandedBriefId(null);
      return;
    }

    setExpandedBriefId(post.id);

    // If already generated, return cached
    if (aiBriefs[post.id]) return;

    setLoadingAiBriefId(post.id);
    try {
      const res = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: post.title,
          content: post.content || post.title,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiBriefs(prev => ({ ...prev, [post.id]: data.summary }));
        showToast('Executive briefing generated');
      } else {
        setAiBriefs(prev => ({
          ...prev,
          [post.id]: `• Verified dispatch filed by u/${post.author}\n• Categorized under ${post.category || 'News'}\nKey Takeaway: High-impact developments reported from the field.`,
        }));
      }
    } catch (err) {
      setAiBriefs(prev => ({
        ...prev,
        [post.id]: `• Real-time briefing for "${post.title}"\n• Reported by correspondent u/${post.author}\nKey Takeaway: Active discussion and verified reporting underway.`,
      }));
    } finally {
      setLoadingAiBriefId(null);
    }
  };

  const handleVotePoll = (index: number) => {
    if (pollVotedOption !== null) return;
    setPollVotedOption(index);
    setPollVotes(prev => {
      const next = [...prev];
      next[index] += 1;
      return next;
    });
    showToast('Your vote was recorded on Bloggr Pulse!');
  };

  const totalPollVotes = pollVotes.reduce((a, b) => a + b, 0);

  // Auto-slide every 5 seconds unless user hovers
  useEffect(() => {
    if (isPaused || heroStories.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex(prev => (prev + 1) % heroStories.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, heroStories.length]);

  // Scroll active grid item horizontally within carousel track container ONLY (without affecting window scroll)
  useEffect(() => {
    const activeItem = gridItemRefs.current[currentSlideIndex];
    const track = gridTrackRef.current;
    if (activeItem && track && track.scrollWidth > track.clientWidth) {
      const itemLeft = activeItem.offsetLeft;
      const itemWidth = activeItem.offsetWidth;
      const trackWidth = track.clientWidth;
      const targetScroll = itemLeft - (trackWidth / 2) + (itemWidth / 2);
      
      track.scrollLeft = Math.max(0, targetScroll);
    }
  }, [currentSlideIndex]);

  if (posts.length === 0) return null;

  const nextSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentSlideIndex(prev => (prev + 1) % heroStories.length);
  };

  const prevSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentSlideIndex(prev => (prev - 1 + heroStories.length) % heroStories.length);
  };

  const handleShare = (e: React.MouseEvent, post: Post) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(window.location.href);
    showToast('Story link copied to clipboard!');
  };

  const handleToggleSave = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    toggleSavePost(postId);
    const isSaved = (currentUser.savedPostIds || []).includes(postId);
    showToast(isSaved ? 'Removed from saved articles' : 'Saved to your Bloggr reading list!');
  };

  const handleVote = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    votePost(postId, 'up');
  };

  // Bloggr Financial Market Watch data
  const marketTickers = [
    { symbol: 'NSE 20', value: '1,642.50', change: '+0.42%', isUp: true },
    { symbol: 'S&P 500', value: '5,618.25', change: '+0.78%', isUp: true },
    { symbol: 'NASDAQ', value: '17,912.40', change: '+1.15%', isUp: true },
    { symbol: 'BTC/USD', value: '$64,320.00', change: '+2.10%', isUp: true },
    { symbol: 'BRENT CRUDE', value: '$74.50', change: '-0.40%', isUp: false },
    { symbol: 'EUR/USD', value: '1.084', change: '+0.12%', isUp: true },
  ];

  // Bloggr Topic Filter Ribbon
  const bloggrTopics: { id: NewsCategoryFilter; label: string }[] = [
    { id: 'all', label: 'Top Stories' },
    { id: 'kenya', label: 'Kenya' },
    { id: 'africa', label: 'Africa' },
    { id: 'global', label: 'World' },
    { id: 'FOOTBALL', label: 'Sports' },
    { id: 'NEWS', label: 'Politics' },
    { id: 'opinion', label: 'Opinion' },
  ];

  return (
    <div className="space-y-2 font-sans">
      {/* 1. BLOGGR INFOPANE: WEATHER GLANCE, LIVE WIRE BRIEF & FINANCIAL MARKET WATCH TICKER */}
      <div
        id="bloggr-infopane-bar"
        className="rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-2 sm:p-2.5 shadow-xs space-y-1.5"
      >
        <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none pb-0.5">
          {/* Weather Widget Glance */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 flex-shrink-0 border border-neutral-200/60 dark:border-neutral-700/60 text-xs">
            <div className="p-1 rounded-lg bg-amber-400/20 text-amber-500">
              <CloudSun className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold leading-none">
                <span className="text-sm font-black">24°C</span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">Nairobi</span>
              </div>
              <div className="text-[10px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                <span>Mostly Sunny</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">AQI 24</span>
              </div>
            </div>
          </div>

          {/* Bloggr Live Financial Market Watch */}
          <div className="flex items-center gap-1.5 flex-nowrap flex-shrink-0">
            <div className="hidden lg:flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-neutral-400 px-1 border-r border-neutral-200 dark:border-neutral-800">
              <BarChart2 className="w-3.5 h-3.5 text-orange-500" />
              <span>MARKETS</span>
            </div>

            {marketTickers.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-2 py-0.5 sm:px-2 sm:py-0.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-800 text-xs flex-shrink-0 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <span className="font-bold text-neutral-800 dark:text-neutral-200">{item.symbol}</span>
                <span className="font-mono text-neutral-600 dark:text-neutral-400 text-[11px]">{item.value}</span>
                <span
                  className={`text-[10px] font-extrabold flex items-center ${
                    item.isUp
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {item.isUp ? (
                    <TrendingUp className="w-2.5 h-2.5 mr-0.5 inline" />
                  ) : (
                    <TrendingDown className="w-2.5 h-2.5 mr-0.5 inline" />
                  )}
                  {item.change}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bloggr Quick Topic Filter Ribbon */}
        <div className="pt-1.5 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-black uppercase text-orange-600 dark:text-orange-400 tracking-wider px-1.5 py-0.5 rounded bg-orange-50 dark:bg-orange-950/40 flex-shrink-0">
            BLOGGR WIRE
          </span>
          {bloggrTopics.map(topic => {
            const isActive = timelineFilter === topic.id;
            return (
              <button
                key={topic.id}
                onClick={() => setTimelineFilter(topic.id)}
                className={`flex-shrink-0 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {topic.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. TOP STORY HERO: 4 SLIDING GRIDS (REDUCED DESKTOP HEIGHT, 21:9 ON MOBILE) */}
      {heroStories.length > 0 && (
        <div
          id="hero-sliding-grids-container"
          className="rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs hover:shadow-sm transition-shadow"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Main Slider Track */}
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlideIndex * 100}%)` }}
            >
              {heroStories.map((story, idx) => {
                const isFollowing = isFollowingAuthor(story.author);
                const isSelf = story.author.toLowerCase() === currentUser.username.toLowerCase();
                const isSaved = (currentUser.savedPostIds || []).includes(story.id);
                const isBriefExpanded = expandedBriefId === story.id;
                const isLoadingBrief = loadingAiBriefId === story.id;

                return (
                  <article
                    key={story.id}
                    onClick={() => setActivePost(story)}
                    className="w-full flex-shrink-0 cursor-pointer group"
                  >
                    {/* Media Banner: 21:9 ratio on all devices */}
                    <div className="relative aspect-[21/9] overflow-hidden bg-neutral-950">
                      <img
                        src={story.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80'}
                        alt={story.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/20" />

                      {/* Header Overlays: Bloggr Badge & Slide Index */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-orange-600 text-white font-black text-[9px] sm:text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                            <span>BLOGGR LEAD STORY</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white font-bold text-[9px] sm:text-[10px] uppercase border border-white/10">
                            {story.category || 'News Wire'}
                          </span>
                        </div>

                        {/* Slide Indicator Badge */}
                        <div className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white font-mono text-[9px] sm:text-[10px] font-bold border border-white/10">
                          Story {idx + 1} / {heroStories.length}
                        </div>
                      </div>

                      {/* Title & Publisher Overlay (Compact desktop size, no excerpt) */}
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3 sm:left-3 sm:right-3 text-white space-y-1">
                        <h2 className="text-sm sm:text-lg md:text-xl font-black leading-tight drop-shadow-md line-clamp-2 group-hover:text-orange-300 transition-colors">
                          {story.title}
                        </h2>

                        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-neutral-300 pt-0.5 flex-wrap">
                          <div
                            onClick={e => {
                              e.stopPropagation();
                              openUserProfile(story.author);
                            }}
                            className="flex items-center gap-1 font-bold text-white hover:underline cursor-pointer"
                          >
                            <img
                              src={story.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                              alt={story.author}
                              referrerPolicy="no-referrer"
                              className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover border border-white/40"
                            />
                            <span>u/{story.author}</span>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                          </div>
                          <span>•</span>
                          <span>{story.createdAt}</span>
                          <span>•</span>
                          <span>{story.readTimeMinutes || 3} min read</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {(story.views || 4200).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Byline & Quick Action Row (Compact desktop layout) */}
                    <div className="p-2 sm:p-2.5 flex items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/70">
                      <div className="flex items-center gap-2">
                        {!isSelf && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              toggleFollowAuthor(story.author);
                            }}
                            className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                              isFollowing
                                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                                : 'bg-orange-600 hover:bg-orange-500 text-white shadow-xs'
                            }`}
                          >
                            {isFollowing ? (
                              <>
                                <UserCheck className="w-3 h-3 text-emerald-500" />
                                <span>Following</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3 h-3" />
                                <span>+ Follow</span>
                              </>
                            )}
                          </button>
                        )}

                        {/* Executive Brief Trigger */}
                        <button
                          onClick={e => handleToggleAiBrief(e, story)}
                          className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            isBriefExpanded
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50'
                          }`}
                          title="Executive Briefing"
                        >
                          {isLoadingBrief ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <FileText className="w-3 h-3" />
                          )}
                          <span>Brief</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1 sm:gap-1.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={e => handleVote(e, story.id)}
                          className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
                          title="Like story"
                        >
                          <ThumbsUp className="w-3.5 h-3.5 text-orange-600" />
                          <span>{story.score}</span>
                        </button>

                        <button
                          onClick={() => setActivePost(story)}
                          className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-medium hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
                          title="Comments"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{story.commentsCount}</span>
                        </button>

                        <button
                          onClick={e => handleToggleSave(e, story.id)}
                          className={`flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-semibold transition-colors ${
                            isSaved
                              ? 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/40 font-bold'
                              : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                          }`}
                          title={isSaved ? "Saved to personal 'Saved' list (Synced with Firestore)" : "Save to personal 'Saved' list"}
                        >
                          {isSaved ? (
                            <BookmarkCheck className="w-3.5 h-3.5 text-orange-600" />
                          ) : (
                            <Bookmark className="w-3.5 h-3.5" />
                          )}
                          <span>{isSaved ? 'Saved' : 'Save'}</span>
                        </button>

                        <button
                          onClick={e => handleShare(e, story)}
                          className="p-1 sm:p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
                          title="Share"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Executive Brief Drawer */}
                    {isBriefExpanded && (
                      <div
                        onClick={e => e.stopPropagation()}
                        className="p-3 bg-gradient-to-r from-orange-50/90 to-amber-50/90 dark:from-neutral-900 dark:to-neutral-900 border-b border-orange-200 dark:border-orange-900/50 text-xs text-neutral-800 dark:text-neutral-200 animate-in fade-in duration-200 space-y-1.5"
                      >
                        <div className="flex items-center justify-between font-bold text-orange-700 dark:text-orange-300 text-[11px]">
                          <span className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-orange-600" />
                            Executive Briefing
                          </span>
                        </div>
                        {isLoadingBrief ? (
                          <div className="py-2 flex items-center justify-center gap-2 text-neutral-500 text-xs">
                            <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                            <span>Synthesizing briefing...</span>
                          </div>
                        ) : (
                          <div className="whitespace-pre-line text-[11px] sm:text-xs leading-relaxed font-sans text-neutral-700 dark:text-neutral-300">
                            {aiBriefs[story.id]}
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            {/* Left/Right Floating Navigation Buttons */}
            {heroStories.length > 1 && (
              <>
                <button
                  id="hero-slide-prev-btn"
                  onClick={prevSlide}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur-md transition-all z-10 shadow-md border border-white/20"
                  title="Previous Top Story"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  id="hero-slide-next-btn"
                  onClick={nextSlide}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur-md transition-all z-10 shadow-md border border-white/20"
                  title="Next Top Story"
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </>
            )}
          </div>

          {/* 4 SLIDING GRIDS INTERACTIVE CAROUSEL STRIP: 4 COLUMNS ON DESKTOP (REDUCED SIZE), 2 AND 1/4 COLUMNS ON MOBILE */}
          <div className="p-1 sm:p-1.5 bg-neutral-100/70 dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800">
            <div
              ref={gridTrackRef}
              className="flex overflow-x-auto md:grid md:grid-cols-4 gap-1.5 sm:gap-2 scrollbar-none snap-x pb-0.5 px-0.5"
            >
              {heroStories.map((story, i) => {
                const isActive = currentSlideIndex === i;
                return (
                  <button
                    key={story.id}
                    ref={el => { gridItemRefs.current[i] = el; }}
                    onClick={() => setCurrentSlideIndex(i)}
                    className={`flex-none w-[calc((100%-16px)/2.25)] md:w-auto p-1 sm:p-1.5 rounded-xl text-left transition-all relative overflow-hidden flex items-center gap-1.5 sm:gap-2 border snap-start cursor-pointer ${
                      isActive
                        ? 'bg-white dark:bg-neutral-800 border-orange-500 dark:border-orange-500 shadow-xs ring-1 ring-orange-500/20'
                        : 'bg-white/60 dark:bg-neutral-800/40 border-transparent hover:bg-white dark:hover:bg-neutral-800'
                    }`}
                    title={`Story 0${i + 1}: ${story.title}`}
                  >
                    {/* Active highlight bar on top */}
                    {isActive && (
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-orange-600 animate-in fade-in duration-200" />
                    )}

                    {/* Mini thumbnail */}
                    {story.imageUrl && (
                      <img
                        src={story.imageUrl}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg object-cover flex-shrink-0"
                      />
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 text-[8px] sm:text-[9px] font-black uppercase text-orange-600 dark:text-orange-400">
                        <span>Story 0{i + 1}</span>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />}
                      </div>
                      <div className="text-[10px] sm:text-[11px] font-bold text-neutral-900 dark:text-white line-clamp-2 leading-tight">
                        {story.title}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. NEWS ARTICLE STREAM: AT LEAST 4 COLUMNS ON DESKTOP, REDUCED SPACING, 21:9 IMAGES */}
      <div id="news-list-section" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {otherPosts.map((post, index) => {
          const isFollowing = isFollowingAuthor(post.author);
          const isSelf = post.author.toLowerCase() === currentUser.username.toLowerCase();
          const isSaved = (currentUser.savedPostIds || []).includes(post.id);
          const isBriefExpanded = expandedBriefId === post.id;
          const isLoadingBrief = loadingAiBriefId === post.id;

          // Insert Bloggr Pulse interactive widget after the 4th article
          const isPollPosition = index === 4;

          // Archetype 1: Cover Image on Top (Featured Card)
          const isCoverTopCard = index % 3 === 0;

          // Archetype 2: 3-Photo Gallery Card (every 6th card)
          const isThreeImageCard = index % 6 === 5 && post.imageUrl;

          return (
            <React.Fragment key={post.id}>
              {/* Bloggr Interactive Pulse Poll Breaker */}
              {isPollPosition && (
                <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 rounded-2xl border border-orange-200 dark:border-orange-900/50 bg-gradient-to-r from-orange-50/70 via-white to-amber-50/70 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900 p-2.5 sm:p-3 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                      <span>BLOGGR PULSE</span>
                    </div>
                    <span className="text-[11px] text-neutral-500 font-medium">
                      {totalPollVotes.toLocaleString()} community votes
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
                    Which technological breakthrough will shape the African and global economy most over the next 5 years?
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { label: 'Robotics & Automation', count: pollVotes[0] },
                      { label: 'Clean Fusion & Smart Grid', count: pollVotes[1] },
                      { label: 'Quantum & Next-Gen Chips', count: pollVotes[2] },
                    ].map((opt, optIdx) => {
                      const percentage = Math.round((opt.count / totalPollVotes) * 100);
                      const isSelected = pollVotedOption === optIdx;

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleVotePoll(optIdx)}
                          className={`p-2 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                            isSelected
                              ? 'border-orange-600 bg-orange-600/10 dark:bg-orange-600/20'
                              : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/80 hover:border-orange-400'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1 text-xs font-bold text-neutral-900 dark:text-white">
                            <span>{opt.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-orange-600" />}
                          </div>

                          {pollVotedOption !== null ? (
                            <div>
                              <div className="flex justify-between text-[10px] font-semibold text-neutral-600 dark:text-neutral-400 mb-0.5">
                                <span>{percentage}%</span>
                                <span>{opt.count}</span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                                <div
                                  className="h-full bg-orange-600 rounded-full transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-[11px] text-orange-600 dark:text-orange-400 font-bold">
                              Vote now →
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CARD ARCHETYPE 1: BLOGGR COVER-TOP CARD (21:9 RATIO ON ALL SCREENS, COMPACT PADDING) */}
              {isCoverTopCard && post.imageUrl ? (
                <article
                  onClick={() => setActivePost(post)}
                  className="rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-orange-400 dark:hover:border-orange-600 transition-all cursor-pointer group shadow-xs hover:shadow-sm flex flex-col justify-between overflow-hidden h-full"
                >
                  <div>
                    {/* 21:9 image aspect ratio on desktop and mobile */}
                    <div className="relative aspect-[21/9] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2 flex items-center gap-1">
                        <span className="px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider">
                          {post.category || 'News'}
                        </span>
                        {post.isBreaking && (
                          <span className="px-1.5 py-0.5 rounded-md bg-red-600 text-white text-[8px] font-black uppercase">
                            HOT
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Headline and Publisher Attribution */}
                    <div className="p-2 sm:p-2.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-neutral-500 dark:text-neutral-400">
                        <img
                          src={post.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                          alt={post.author}
                          referrerPolicy="no-referrer"
                          className="w-3.5 h-3.5 rounded-full object-cover"
                        />
                        <span className="font-bold text-neutral-800 dark:text-neutral-200">
                          u/{post.author}
                        </span>
                        <span>•</span>
                        <span>{post.createdAt}</span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xs sm:text-[13px] font-bold text-neutral-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-2 sm:p-2.5 pt-0 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 border-t border-neutral-100 dark:border-neutral-800/80 mt-1">
                    <div className="flex items-center gap-1 pt-1 text-[10px]">
                      <Eye className="w-3 h-3" />
                      <span>{(post.views || 2500).toLocaleString()}</span>
                    </div>

                    <div className="flex items-center gap-1 pt-1" onClick={e => e.stopPropagation()}>
                      {/* Brief Button */}
                      <button
                        onClick={e => handleToggleAiBrief(e, post)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 transition-colors ${
                          isBriefExpanded
                            ? 'bg-amber-500 text-white'
                            : 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-300 hover:bg-orange-100'
                        }`}
                        title="Executive Brief"
                      >
                        {isLoadingBrief ? (
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        ) : (
                          <FileText className="w-2.5 h-2.5" />
                        )}
                        <span>Brief</span>
                      </button>

                      <button
                        onClick={e => handleVote(e, post.id)}
                        className="flex items-center gap-0.5 px-1 py-0.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold text-[10px]"
                        title="Upvote"
                      >
                        <ThumbsUp className="w-3 h-3 text-orange-600" />
                        <span>{post.score}</span>
                      </button>

                      <div className="flex items-center gap-0.5 px-1 py-0.5 text-neutral-500 text-[10px]">
                        <MessageSquare className="w-3 h-3" />
                        <span>{post.commentsCount}</span>
                      </div>

                      <button
                        onClick={e => handleToggleSave(e, post.id)}
                        className={`p-1 rounded transition-colors ${
                          isSaved
                            ? 'text-orange-600 bg-orange-50 dark:bg-orange-950/40'
                            : 'text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        }`}
                        title="Bookmark"
                      >
                        <Bookmark className={`w-3 h-3 ${isSaved ? 'fill-orange-600' : ''}`} />
                      </button>

                      <button
                        onClick={e => handleShare(e, post)}
                        className="p-1 rounded text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        title="Share"
                      >
                        <Share2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Expandable Brief Box */}
                  {isBriefExpanded && (
                    <div
                      onClick={e => e.stopPropagation()}
                      className="p-2.5 bg-orange-50/90 dark:bg-neutral-900 border-t border-orange-200 dark:border-orange-900/50 text-[11px] leading-relaxed text-neutral-800 dark:text-neutral-200"
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold text-orange-700 dark:text-orange-300 mb-1">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          Executive Brief
                        </span>
                      </div>
                      {isLoadingBrief ? (
                        <div className="py-1 flex items-center justify-center gap-1 text-neutral-500 text-[11px]">
                          <Loader2 className="w-3 h-3 animate-spin text-orange-600" />
                          <span>Generating summary...</span>
                        </div>
                      ) : (
                        <div className="whitespace-pre-line text-neutral-700 dark:text-neutral-300">
                          {aiBriefs[post.id]}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              ) : isThreeImageCard ? (
                /* CARD ARCHETYPE 2: BLOGGR 3-PHOTO STORY CARD (21:9 IMAGES, COMPACT PADDING) */
                <article
                  onClick={() => setActivePost(post)}
                  className="p-2 sm:p-2.5 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-orange-400 dark:hover:border-orange-600 transition-all cursor-pointer group shadow-xs hover:shadow-sm space-y-1.5 flex flex-col justify-between h-full"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider">
                        <span>{post.category || 'News'}</span>
                        {post.isBreaking && (
                          <span className="px-1.5 py-0.2 rounded bg-red-600 text-white text-[8px] font-black uppercase">
                            HOT
                          </span>
                        )}
                      </div>
                      <span className="text-neutral-400">{post.createdAt}</span>
                    </div>

                    <h3 className="text-xs sm:text-[13px] font-bold text-neutral-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h3>
                  </div>

                  {/* 3 Images in 21:9 Widescreen Ratio */}
                  <div className="grid grid-cols-3 gap-1">
                    <div className="overflow-hidden rounded-lg aspect-[21/9] bg-neutral-100 dark:bg-neutral-800">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform"
                      />
                    </div>
                    <div className="overflow-hidden rounded-lg aspect-[21/9] bg-neutral-100 dark:bg-neutral-800">
                      <img
                        src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80"
                        alt="Context"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform"
                      />
                    </div>
                    <div className="overflow-hidden rounded-lg aspect-[21/9] bg-neutral-100 dark:bg-neutral-800">
                      <img
                        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80"
                        alt="Analysis"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform"
                      />
                    </div>
                  </div>

                  {/* Bottom Meta Row */}
                  <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="font-bold text-neutral-800 dark:text-neutral-200">
                        u/{post.author}
                      </span>
                    </div>

                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={e => handleToggleAiBrief(e, post)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 transition-colors ${
                          isBriefExpanded
                            ? 'bg-amber-500 text-white'
                            : 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-300 hover:bg-orange-100'
                        }`}
                        title="Executive Brief"
                      >
                        <FileText className="w-2.5 h-2.5" />
                        <span>Brief</span>
                      </button>

                      <button
                        onClick={e => handleVote(e, post.id)}
                        className="flex items-center gap-0.5 px-1 py-0.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold text-[10px]"
                      >
                        <ThumbsUp className="w-3 h-3 text-orange-600" />
                        <span>{post.score}</span>
                      </button>

                      <div className="flex items-center gap-0.5 px-1 text-neutral-500 text-[10px]">
                        <MessageSquare className="w-3 h-3" />
                        <span>{post.commentsCount}</span>
                      </div>

                      <button
                        onClick={e => handleToggleSave(e, post.id)}
                        className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                          isSaved ? 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 font-bold' : 'text-neutral-500 hover:bg-neutral-100 hover:text-orange-600'
                        }`}
                        title={isSaved ? "Saved (Synced with Firestore)" : "Save"}
                      >
                        {isSaved ? <BookmarkCheck className="w-3 h-3 text-orange-600" /> : <Bookmark className="w-3 h-3" />}
                        <span>{isSaved ? 'Saved' : 'Save'}</span>
                      </button>

                      <button
                        onClick={e => handleShare(e, post)}
                        className="p-1 rounded text-neutral-400 hover:bg-neutral-100"
                      >
                        <Share2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Expandable Brief */}
                  {isBriefExpanded && (
                    <div
                      onClick={e => e.stopPropagation()}
                      className="p-2.5 bg-orange-50/90 dark:bg-neutral-900 border-t border-orange-200 dark:border-orange-900/50 text-[11px] leading-relaxed text-neutral-800 dark:text-neutral-200"
                    >
                      <div className="whitespace-pre-line text-neutral-700 dark:text-neutral-300">
                        {aiBriefs[post.id]}
                      </div>
                    </div>
                  )}
                </article>
              ) : (
                /* CARD ARCHETYPE 3: BLOGGR 21:9 WIDESCREEN STORY CARD (OPTIMIZED FOR 4-COLUMN DESKTOP GRID) */
                <article
                  onClick={() => setActivePost(post)}
                  className="p-2 sm:p-2.5 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-orange-400 dark:hover:border-orange-600 transition-all cursor-pointer group shadow-xs hover:shadow-sm flex flex-col justify-between h-full"
                >
                  <div className="space-y-1.5">
                    {/* 21:9 Widescreen Photo on Desktop & Mobile */}
                    {post.imageUrl && (
                      <div className="overflow-hidden rounded-xl w-full aspect-[21/9] bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-orange-600 dark:text-orange-400 mb-0.5">
                        <span className="uppercase tracking-wider font-extrabold">{post.category || 'News'}</span>
                        {post.flair && (
                          <>
                            <span className="text-neutral-300 dark:text-neutral-700">•</span>
                            <span className="text-neutral-500 dark:text-neutral-400">{post.flair}</span>
                          </>
                        )}
                        {post.isBreaking && (
                          <span className="px-1.5 py-0.2 rounded bg-red-600 text-white font-black text-[8px] uppercase tracking-wider">
                            HOT
                          </span>
                        )}
                      </div>

                      <h3 className="text-xs sm:text-[13px] font-bold text-neutral-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                    </div>

                    {/* Byline */}
                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
                      <span
                        onClick={e => {
                          e.stopPropagation();
                          openUserProfile(post.author);
                        }}
                        className="font-bold text-neutral-700 dark:text-neutral-300 hover:underline flex items-center gap-0.5"
                      >
                        <span>u/{post.author}</span>
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                      </span>
                      <span>•</span>
                      <span>{post.createdAt}</span>
                    </div>
                  </div>

                  {/* Bottom Meta & Quick Actions */}
                  <div className="flex items-center justify-between flex-wrap gap-1 text-[10px] text-neutral-400 pt-1.5 border-t border-neutral-100 dark:border-neutral-800/80 mt-1.5">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{(post.views || 1800).toLocaleString()}</span>
                    </div>

                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      {/* Brief Button */}
                      <button
                        onClick={e => handleToggleAiBrief(e, post)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 transition-colors ${
                          isBriefExpanded
                            ? 'bg-amber-500 text-white'
                            : 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-300 hover:bg-orange-100'
                        }`}
                        title="Executive Brief"
                      >
                        {isLoadingBrief ? (
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        ) : (
                          <FileText className="w-2.5 h-2.5" />
                        )}
                        <span>Brief</span>
                      </button>

                      <button
                        onClick={e => handleVote(e, post.id)}
                        className="flex items-center gap-0.5 px-1 py-0.5 rounded text-neutral-700 dark:text-neutral-300 font-bold text-[10px] hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <ThumbsUp className="w-3 h-3 text-orange-600" />
                        <span>{post.score}</span>
                      </button>

                      <div className="flex items-center gap-0.5 text-neutral-500 text-[10px] px-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{post.commentsCount}</span>
                      </div>

                      <button
                        onClick={e => handleToggleSave(e, post.id)}
                        className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                          isSaved ? 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 font-bold' : 'text-neutral-500 hover:bg-neutral-100 hover:text-orange-600'
                        }`}
                        title={isSaved ? "Saved (Synced with Firestore)" : "Save"}
                      >
                        {isSaved ? <BookmarkCheck className="w-3 h-3 text-orange-600" /> : <Bookmark className="w-3 h-3" />}
                        <span>{isSaved ? 'Saved' : 'Save'}</span>
                      </button>

                      <button
                        onClick={e => handleShare(e, post)}
                        className="p-1 rounded text-neutral-400 hover:bg-neutral-100"
                      >
                        <Share2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Expandable Brief */}
                  {isBriefExpanded && (
                    <div
                      onClick={e => e.stopPropagation()}
                      className="p-2.5 mt-1.5 rounded-xl bg-orange-50/90 dark:bg-neutral-900 border border-orange-200 dark:border-orange-900/50 text-[11px] leading-relaxed text-neutral-800 dark:text-neutral-200"
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold text-orange-700 dark:text-orange-300 mb-1">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          Executive Brief
                        </span>
                      </div>
                      {isLoadingBrief ? (
                        <div className="py-1 flex items-center justify-center gap-1 text-neutral-500 text-[11px]">
                          <Loader2 className="w-3 h-3 animate-spin text-orange-600" />
                          <span>Generating summary...</span>
                        </div>
                      ) : (
                        <div className="whitespace-pre-line text-neutral-700 dark:text-neutral-300">
                          {aiBriefs[post.id]}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
