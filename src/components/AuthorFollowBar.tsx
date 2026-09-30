import React from 'react';
import {
  Users,
  CheckCircle2,
  UserPlus,
  UserCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useBloggr } from '../context/BloggrContext';
import { RECOMMENDED_AUTHORS } from '../data/seedData';

export const AuthorFollowBar: React.FC = () => {
  const {
    currentUser,
    toggleFollowAuthor,
    isFollowingAuthor,
    openUserProfile,
    setTimelineFilter,
    timelineFilter,
  } = useBloggr();

  const followingCount = currentUser.followingAuthors?.length || 0;

  return (
    <div
      id="author-follow-bar"
      className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 sm:p-4 shadow-sm mb-4"
    >
      {/* Header with Title and Following Counter */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <span>Follow Top Reporters & Authors</span>
              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Personalize your timeline stream with verified correspondents
            </p>
          </div>
        </div>

        {/* Following Filter Pill */}
        <button
          onClick={() => setTimelineFilter(timelineFilter === 'following' ? 'all' : 'following')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            timelineFilter === 'following'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-orange-500 hover:text-orange-500'
          }`}
        >
          <span>Following</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              timelineFilter === 'following'
                ? 'bg-white/20 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            {followingCount}
          </span>
        </button>
      </div>

      {/* Horizontal Scrollable Row of Author Cards */}
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800">
        {RECOMMENDED_AUTHORS.map(author => {
          const isFollowing = isFollowingAuthor(author.username);
          const isSelf = author.username.toLowerCase() === currentUser.username.toLowerCase();

          return (
            <div
              key={author.username}
              className="flex-shrink-0 w-44 sm:w-48 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/80 hover:border-orange-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Avatar and Verification */}
                <div className="flex items-start justify-between">
                  <div
                    onClick={() => openUserProfile(author.username)}
                    className="relative cursor-pointer group"
                  >
                    <img
                      src={author.avatar}
                      alt={author.displayName}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-neutral-800 group-hover:scale-105 transition-transform"
                    />
                    {author.verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500 bg-white dark:bg-neutral-900 rounded-full absolute -bottom-0.5 -right-0.5" />
                    )}
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                    {author.category}
                  </span>
                </div>

                {/* Name & Handle */}
                <div
                  onClick={() => openUserProfile(author.username)}
                  className="mt-2 cursor-pointer"
                >
                  <div className="font-bold text-xs text-neutral-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors truncate">
                    {author.displayName}
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono truncate">
                    u/{author.username}
                  </div>
                </div>

                {/* Short Bio */}
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1 leading-snug">
                  {author.bio}
                </p>
              </div>

              {/* Follower count & Follow Toggle Button */}
              <div className="mt-3 pt-2 border-t border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400 font-medium">
                  {(author.followersCount / 1000).toFixed(1)}k followers
                </span>

                {!isSelf && (
                  <button
                    onClick={() => toggleFollowAuthor(author.username)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 shadow-xs ${
                      isFollowing
                        ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950/30'
                        : 'bg-orange-600 hover:bg-orange-500 text-white'
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
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
