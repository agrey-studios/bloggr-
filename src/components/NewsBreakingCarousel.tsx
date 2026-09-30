import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  Clock,
  MessageSquare,
  ArrowBigUp,
  UserPlus,
  UserCheck,
  Flame,
  ExternalLink,
} from 'lucide-react';
import { useBloggr } from '../context/BloggrContext';
import { Post } from '../types';

interface NewsBreakingCarouselProps {
  posts: Post[];
}

export const NewsBreakingCarousel: React.FC<NewsBreakingCarouselProps> = ({ posts }) => {
  const {
    setActivePost,
    toggleFollowAuthor,
    isFollowingAuthor,
    currentUser,
    setActiveFeed,
  } = useBloggr();

  // Filter posts that have images and high engagement or are breaking
  const carouselPosts = posts.filter(p => p.imageUrl && (p.isBreaking || p.score > 1000 || p.isPinned)).slice(0, 6);
  const displayPosts = carouselPosts.length > 0 ? carouselPosts : posts.filter(p => p.imageUrl).slice(0, 5);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance carousel every 6 seconds if not hovered
  useEffect(() => {
    if (displayPosts.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % displayPosts.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [displayPosts.length, isPaused]);

  if (displayPosts.length === 0) return null;

  const currentPost = displayPosts[currentIndex];
  const isFollowing = isFollowingAuthor(currentPost.author);
  const isSelf = currentPost.author.toLowerCase() === currentUser.username.toLowerCase();

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev - 1 + displayPosts.length) % displayPosts.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev + 1) % displayPosts.length);
  };

  return (
    <div
      id="news-breaking-carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-900 shadow-md mb-4 group select-none"
    >
      {/* Background Hero Image with Dynamic Overlay */}
      <div className="relative aspect-[21/9] md:aspect-[2.4/1] w-full overflow-hidden">
        <img
          src={currentPost.imageUrl}
          alt={currentPost.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {/* Cinematic dark gradients for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Floating Carousel Navigation Buttons */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full border border-white/10 text-white text-xs">
        <button
          onClick={handlePrev}
          aria-label="Previous story"
          className="p-1 rounded-full hover:bg-white/20 transition-colors text-white"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-mono text-[11px] px-1 font-semibold">
          {currentIndex + 1} / {displayPosts.length}
        </span>
        <button
          onClick={handleNext}
          aria-label="Next story"
          className="p-1 rounded-full hover:bg-white/20 transition-colors text-white"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Post Content Overlay */}
      <div
        onClick={() => setActivePost(currentPost)}
        className="absolute inset-0 z-10 flex flex-col justify-end p-4 sm:p-6 cursor-pointer"
      >
        {/* Badges Row */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          {currentPost.isBreaking ? (
            <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-sm animate-pulse">
              <Zap className="w-3 h-3 fill-white" />
              <span>Breaking News</span>
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-orange-600 text-white font-black text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Flame className="w-3 h-3 fill-white" />
              <span>Top Story</span>
            </span>
          )}

          <button
            onClick={e => {
              e.stopPropagation();
              setActiveFeed(currentPost.communityId);
            }}
            className="px-2.5 py-0.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-[11px] font-bold transition-colors flex items-center gap-1"
          >
            <span>{currentPost.communityIcon}</span>
            <span>{currentPost.communityId}</span>
          </button>

          {currentPost.readTimeMinutes && (
            <span className="text-[11px] text-neutral-300 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{currentPost.readTimeMinutes} min read</span>
            </span>
          )}
        </div>

        {/* Headline */}
        <h2 className="text-base sm:text-xl md:text-2xl font-black text-white leading-tight tracking-tight line-clamp-2 max-w-3xl drop-shadow-sm group-hover:text-orange-400 transition-colors">
          {currentPost.title}
        </h2>

        {/* Author Byline & Follow Action & Metrics */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/15 text-xs text-white/90 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <img
              src={currentPost.authorAvatar}
              alt={currentPost.author}
              referrerPolicy="no-referrer"
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-white/30"
            />
            <span className="font-semibold text-white">u/{currentPost.author}</span>

            <span className="text-white/40">•</span>
            <span className="text-white/70 text-[11px]">{currentPost.createdAt}</span>

            {/* Author Follow Button in Carousel */}
            {!isSelf && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  toggleFollowAuthor(currentPost.author);
                }}
                className={`ml-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-all flex items-center gap-1 shadow-sm ${
                  isFollowing
                    ? 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                    : 'bg-orange-500 hover:bg-orange-400 text-white'
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-3 h-3 text-emerald-300" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3 h-3" />
                    <span>Follow</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-white/80">
            <div className="flex items-center gap-1">
              <ArrowBigUp className="w-4 h-4 text-orange-400" />
              <span>{currentPost.score.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{currentPost.commentsCount} comments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators Dots at the Bottom */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 pointer-events-none">
        {displayPosts.map((_, idx) => (
          <div
            key={idx}
            className={`h-1 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-6 bg-orange-500' : 'w-1.5 bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
