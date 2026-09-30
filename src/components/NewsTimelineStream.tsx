import React from 'react';
import {
  Clock,
  Zap,
  MessageSquare,
  ArrowBigUp,
  ArrowBigDown,
  UserPlus,
  UserCheck,
  Share2,
  Bookmark,
  ExternalLink,
  Flame,
  Radio,
  Sparkles,
} from 'lucide-react';
import { useBloggr } from '../context/BloggrContext';
import { Post } from '../types';
import { FontAwesomeIcon, faBolt } from './FontAwesomeIcon';

interface NewsTimelineStreamProps {
  posts: Post[];
}

export const NewsTimelineStream: React.FC<NewsTimelineStreamProps> = ({ posts }) => {
  const {
    setActivePost,
    toggleFollowAuthor,
    isFollowingAuthor,
    currentUser,
    votePost,
    toggleSavePost,
    showToast,
    setActiveFeed,
  } = useBloggr();

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-12 text-center">
        <p className="text-neutral-500 font-medium">No stories found matching your filter.</p>
      </div>
    );
  }

  // Partition posts into chronological timeline groups
  const breakingPosts = posts.filter(p => p.isBreaking);
  const regularPosts = posts.filter(p => !p.isBreaking);

  // Helper to render timeline post item
  const renderTimelineItem = (post: Post, isLast: boolean) => {
    const isFollowing = isFollowingAuthor(post.author);
    const isSelf = post.author.toLowerCase() === currentUser.username.toLowerCase();
    const isSaved = currentUser.savedPostIds.includes(post.id);

    return (
      <div key={post.id} className="relative pl-6 sm:pl-8 group">
        {/* Timeline Axis Bullet Node */}
        <div
          className={`absolute left-[-5px] sm:left-[-7px] top-4 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 transition-transform group-hover:scale-125 z-10 flex items-center justify-center ${
            post.isBreaking
              ? 'bg-red-600 border-white dark:border-neutral-900 ring-4 ring-red-500/20 animate-pulse'
              : 'bg-white dark:bg-neutral-900 border-orange-500'
          }`}
        >
          {post.isBreaking ? (
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          )}
        </div>

        {/* Timeline Card */}
        <article
          onClick={() => setActivePost(post)}
          className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-orange-500/40 transition-all cursor-pointer mb-5"
        >
          {/* Header with Timestamp, Category, Read Time, and Author */}
          <div className="flex items-center justify-between gap-2 flex-wrap text-xs mb-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Timestamp Badge */}
              <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-orange-500" />
                <span>{post.createdAt}</span>
              </span>

              {/* Community / Category */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  setActiveFeed(post.communityId);
                }}
                className="font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
              >
                <span>{post.communityIcon}</span>
                <span>{post.communityId}</span>
              </button>

              {post.readTimeMinutes && (
                <span className="text-neutral-400 text-[11px] font-medium">
                  {post.readTimeMinutes} min read
                </span>
              )}

              {post.isBreaking && (
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 fill-white" />
                  <span>Developing</span>
                </span>
              )}
            </div>

            {/* Author Byline with Follow Action */}
            <div className="flex items-center gap-1.5">
              <img
                src={post.authorAvatar}
                alt={post.author}
                referrerPolicy="no-referrer"
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 text-xs">
                u/{post.author}
              </span>

              {!isSelf && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    toggleFollowAuthor(post.author);
                  }}
                  className={`ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition-all flex items-center gap-1 ${
                    isFollowing
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                      : 'bg-neutral-100 hover:bg-orange-600 hover:text-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-2.5 h-2.5" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-2.5 h-2.5" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Headline & Body / Thumbnail Layout */}
          <div className="flex gap-4 items-start">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base sm:text-lg text-neutral-900 dark:text-white leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors mb-2">
                {post.title}
              </h3>
            </div>

            {/* Thumbnail if present */}
            {post.imageUrl && (
              <div className="w-24 sm:w-32 h-20 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-800">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
          </div>

          {/* Bottom Interactive Actions Toolbar */}
          <div className="mt-3.5 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            {/* Votes */}
            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-full px-2 py-0.5">
              <button
                onClick={e => {
                  e.stopPropagation();
                  votePost(post.id, 'up');
                }}
                className={`p-1 rounded-full hover:bg-orange-100 dark:hover:bg-neutral-700 transition-colors ${
                  post.userVote === 'up' ? 'text-orange-500 fill-orange-500' : ''
                }`}
              >
                <ArrowBigUp className="w-4 h-4" />
              </button>
              <span className="font-bold font-mono text-xs px-1 text-neutral-800 dark:text-neutral-200">
                {post.score}
              </span>
              <button
                onClick={e => {
                  e.stopPropagation();
                  votePost(post.id, 'down');
                }}
                className={`p-1 rounded-full hover:bg-blue-100 dark:hover:bg-neutral-700 transition-colors ${
                  post.userVote === 'down' ? 'text-blue-500 fill-blue-500' : ''
                }`}
              >
                <ArrowBigDown className="w-4 h-4" />
              </button>
            </div>

            {/* Comments */}
            <div className="flex items-center gap-1 text-xs font-semibold hover:text-neutral-900 dark:hover:text-white transition-colors">
              <MessageSquare className="w-4 h-4" />
              <span>{post.commentsCount} comments</span>
            </div>

            {/* Bookmark & Share */}
            <div className="flex items-center gap-2">
              <button
                onClick={e => {
                  e.stopPropagation();
                  toggleSavePost(post.id);
                  showToast(isSaved ? 'Removed from saved' : 'Saved to reading list');
                }}
                className={`p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
                  isSaved ? 'text-orange-500 fill-orange-500' : ''
                }`}
                title="Bookmark"
              >
                <Bookmark className="w-4 h-4" />
              </button>
              <button
                onClick={e => {
                  e.stopPropagation();
                  navigator.clipboard?.writeText(window.location.href);
                  showToast('Story link copied to clipboard!');
                }}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </article>
      </div>
    );
  };

  return (
    <div id="news-timeline-stream" className="relative">
      {/* 1. BREAKING / DEVELOPING TIMELINE SECTION */}
      {breakingPosts.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-black text-red-600 uppercase tracking-wider mb-4">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
            </span>
            <FontAwesomeIcon icon={faBolt} className="w-3.5 h-3.5 text-red-600" />
            <span>Developing & Breaking Reports</span>
          </div>

          <div className="border-l-2 border-red-500/40 dark:border-red-500/30 ml-2 sm:ml-3">
            {breakingPosts.map((post, idx) =>
              renderTimelineItem(post, idx === breakingPosts.length - 1)
            )}
          </div>
        </div>
      )}

      {/* 2. CHRONOLOGICAL STREAM SECTION */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">
          <Clock className="w-3.5 h-3.5 text-orange-500" />
          <span>Timeline Wire & Updates</span>
        </div>

        <div className="border-l-2 border-orange-500/30 dark:border-orange-500/20 ml-2 sm:ml-3">
          {regularPosts.map((post, idx) =>
            renderTimelineItem(post, idx === regularPosts.length - 1)
          )}
        </div>
      </div>
    </div>
  );
};
