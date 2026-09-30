import React from 'react';
import {
  Clock,
  Zap,
  MessageSquare,
  ArrowBigUp,
  ArrowBigDown,
  UserPlus,
  UserCheck,
  ExternalLink,
  Share2,
  Bookmark,
} from 'lucide-react';
import { useBloggr } from '../context/BloggrContext';
import { Post } from '../types';

interface NewsGridProps {
  posts: Post[];
}

export const NewsGrid: React.FC<NewsGridProps> = ({ posts }) => {
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

  return (
    <div id="news-grid-container" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {posts.map((post, idx) => {
        const isFollowing = isFollowingAuthor(post.author);
        const isSelf = post.author.toLowerCase() === currentUser.username.toLowerCase();
        const isSaved = currentUser.savedPostIds.includes(post.id);

        // Highlight first item as prominent lead card if it has an image
        const isLead = idx === 0 && Boolean(post.imageUrl);

        return (
          <article
            key={post.id}
            onClick={() => setActivePost(post)}
            className={`group rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs hover:shadow-md hover:border-orange-500/40 transition-all flex flex-col justify-between cursor-pointer ${
              isLead ? 'sm:col-span-2' : ''
            }`}
          >
            {/* Lead Post Card Style (Large Hero visual) */}
            {isLead ? (
              <div>
                <div className="relative aspect-[21/9] sm:aspect-[2.4/1] w-full overflow-hidden bg-neutral-900">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Badges on Hero */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    {post.isBreaking && (
                      <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] tracking-wider uppercase flex items-center gap-1">
                        <Zap className="w-3 h-3 fill-white" />
                        <span>Breaking</span>
                      </span>
                    )}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setActiveFeed(post.communityId);
                      }}
                      className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold"
                    >
                      {post.communityId}
                    </button>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-lg sm:text-xl font-black group-hover:text-orange-400 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                  </div>
                </div>
              </div>
            ) : (
              /* Standard Grid Card */
              <div>
                {/* Image if available */}
                {post.imageUrl && (
                  <div className="relative aspect-[21/9] sm:aspect-[16/9] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {post.isBreaking && (
                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-sm">
                          <Zap className="w-2.5 h-2.5 fill-white" />
                          <span>Breaking</span>
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-4">
                  {/* Category & Read Time */}
                  <div className="flex items-center gap-2 text-xs mb-2">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setActiveFeed(post.communityId);
                      }}
                      className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
                    >
                      <span>{post.communityIcon}</span>
                      <span>{post.communityId}</span>
                    </button>

                    <span className="text-neutral-300 dark:text-neutral-700">•</span>

                    {post.readTimeMinutes && (
                      <span className="text-[11px] text-neutral-400 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" />
                        <span>{post.readTimeMinutes}m</span>
                      </span>
                    )}

                    <span className="text-neutral-300 dark:text-neutral-700">•</span>
                    <span className="text-[11px] text-neutral-400">{post.createdAt}</span>
                  </div>

                  {/* Headline */}
                  <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                </div>
              </div>
            )}

            {/* Author Byline + Follow Button + Engagement Footer */}
            <div className="px-4 pb-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
              {/* Author with Follow button */}
              <div className="flex items-center gap-1.5 truncate max-w-[55%]">
                <img
                  src={post.authorAvatar}
                  alt={post.author}
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                />
                <span className="font-semibold text-neutral-800 dark:text-neutral-200 text-xs truncate">
                  u/{post.author}
                </span>

                {!isSelf && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      toggleFollowAuthor(post.author);
                    }}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all flex items-center gap-1 flex-shrink-0 ${
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

              {/* Engagement metrics */}
              <div className="flex items-center gap-3">
                <div
                  onClick={e => {
                    e.stopPropagation();
                    votePost(post.id, 'up');
                  }}
                  className="flex items-center gap-1 hover:text-orange-500 transition-colors"
                >
                  <ArrowBigUp
                    className={`w-4 h-4 ${
                      post.userVote === 'up' ? 'text-orange-500 fill-orange-500' : ''
                    }`}
                  />
                  <span className="font-bold text-xs">{post.score}</span>
                </div>

                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{post.commentsCount}</span>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};
