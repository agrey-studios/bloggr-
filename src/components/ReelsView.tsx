import React, { useState, useMemo } from 'react';
import {
  X,
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  Bookmark,
  Award,
  ChevronUp,
  ChevronDown,
  Volume2,
  VolumeX,
  Sparkles,
  Music,
} from 'lucide-react';
import { useBloggr } from '../context/BloggrContext';
import { Post } from '../types';

export const ReelsView: React.FC = () => {
  const {
    posts,
    isReelsOpen,
    setIsReelsOpen,
    votePost,
    toggleSavePost,
    openAwardModal,
    setActivePost,
    openUserProfile,
    showToast,
    currentUser,
  } = useBloggr();

  // Pick media posts (posts with images, or interesting news posts)
  const mediaPosts = useMemo(() => {
    const withImg = posts.filter(p => p.imageUrl);
    return withImg.length > 0 ? withImg : posts;
  }, [posts]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  if (!isReelsOpen) return null;

  const currentPost = mediaPosts[currentIndex] || mediaPosts[0];
  if (!currentPost) return null;

  const isUpvoted = currentPost.userVote === 'up';
  const isDownvoted = currentPost.userVote === 'down';
  const isSaved = currentUser.savedPostIds.includes(currentPost.id);

  const formatScore = (num: number) => {
    if (Math.abs(num) >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const handleNext = () => {
    if (currentIndex < mediaPosts.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0); // loop around
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setCurrentIndex(mediaPosts.length - 1);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Reel link copied!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-in fade-in duration-200">
      {/* Top Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm sm:text-base tracking-tight bg-orange-600 px-3 py-1 rounded-full flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Bloggr Reels
          </span>
          <span className="text-xs text-white/70">
            {currentIndex + 1} / {mediaPosts.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setIsReelsOpen(false)}
            className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors"
            title="Close Reels"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Reel Card Container */}
      <div className="relative w-full max-w-sm sm:max-w-md h-[88vh] sm:h-[84vh] bg-neutral-900 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-neutral-800 flex flex-col justify-end">
        {/* Background Visual Media */}
        {currentPost.imageUrl ? (
          <img
            src={currentPost.imageUrl}
            alt={currentPost.title}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center p-6 text-center text-white"
            style={{ backgroundColor: currentPost.communityColor || '#ea580c' }}
          >
            <p className="text-lg font-bold">{currentPost.content || currentPost.title}</p>
          </div>
        )}

        {/* Gradient Overlay for Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

        {/* Floating Vertical Reaction / Action Stack */}
        <div className="absolute right-3 bottom-20 z-20 flex flex-col items-center gap-3">
          {/* Upvote & Downvote Reaction Pill */}
          <div className="flex flex-col items-center bg-black/60 backdrop-blur-md rounded-full p-1 border border-white/15 text-white">
            <button
              onClick={() => votePost(currentPost.id, 'up')}
              className={`p-2 rounded-full transition-colors ${
                isUpvoted ? 'text-orange-500 bg-orange-500/20' : 'hover:text-orange-400'
              }`}
              title="Upvote"
            >
              <ArrowBigUp className={`w-5 h-5 ${isUpvoted ? 'fill-current' : ''}`} />
            </button>
            <span className={`text-xs font-bold my-0.5 ${isUpvoted ? 'text-orange-500' : isDownvoted ? 'text-blue-500' : ''}`}>
              {formatScore(currentPost.score)}
            </span>
            <button
              onClick={() => votePost(currentPost.id, 'down')}
              className={`p-2 rounded-full transition-colors ${
                isDownvoted ? 'text-blue-500 bg-blue-500/20' : 'hover:text-blue-400'
              }`}
              title="Downvote"
            >
              <ArrowBigDown className={`w-5 h-5 ${isDownvoted ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Comments */}
          <button
            onClick={() => setActivePost(currentPost)}
            className="flex flex-col items-center gap-0.5 p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white hover:bg-black/80 transition-colors"
            title="Comments"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] font-bold">{currentPost.commentsCount}</span>
          </button>

          {/* Award */}
          <button
            onClick={() =>
              openAwardModal({
                type: 'post',
                id: currentPost.id,
                postId: currentPost.id,
                author: currentPost.author,
              })
            }
            className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-amber-400 hover:bg-black/80 transition-colors"
            title="Give Award"
          >
            <Award className="w-5 h-5" />
          </button>

          {/* Bookmark */}
          <button
            onClick={() => toggleSavePost(currentPost.id)}
            className={`p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 transition-colors ${
              isSaved ? 'text-orange-500' : 'text-white hover:bg-black/80'
            }`}
            title="Save"
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white hover:bg-black/80 transition-colors"
            title="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Post Information */}
        <div className="relative z-10 p-4 pb-5 pr-16 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-orange-600/90 text-xs font-bold flex items-center gap-1">
              <span>{currentPost.communityIcon}</span>
              <span>{currentPost.communityId}</span>
            </span>
            <button
              onClick={() => openUserProfile(currentPost.author)}
              className="text-xs text-neutral-300 hover:underline font-medium"
            >
              u/{currentPost.author}
            </button>
          </div>

          <h2 className="text-base font-bold line-clamp-2 leading-snug mb-1 text-white shadow-sm">
            {currentPost.title}
          </h2>

          {currentPost.content && (
            <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
              {currentPost.content}
            </p>
          )}

          {/* Reel Audio Simulation Track */}
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mt-2 font-mono">
            <Music className="w-3 h-3 text-orange-400 animate-pulse" />
            <span className="truncate">Original audio • {currentPost.communityId}</span>
          </div>
        </div>

        {/* Up / Down reel navigation on desktop */}
        <div className="hidden sm:flex absolute right-[-54px] top-1/2 -translate-y-1/2 flex-col gap-2">
          <button
            onClick={handlePrev}
            className="w-10 h-10 rounded-full bg-neutral-800/90 hover:bg-neutral-700 text-white flex items-center justify-center transition-all border border-neutral-700 shadow-md"
            title="Previous Reel (Up)"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="w-10 h-10 rounded-full bg-neutral-800/90 hover:bg-neutral-700 text-white flex items-center justify-center transition-all border border-neutral-700 shadow-md"
            title="Next Reel (Down)"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
