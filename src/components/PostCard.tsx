import React from 'react';
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  Bookmark,
  BookmarkCheck,
  Award,
  ExternalLink,
  Pin,
  CheckCircle2,
  Eye,
  UserPlus,
  UserCheck,
  Zap,
  Clock,
  Flag,
} from 'lucide-react';
import Markdown from 'react-markdown';
import { Post, PollOption } from '../types';
import { AwardFaIcon } from './FontAwesomeIcon';
import { useBloggr } from '../context/BloggrContext';
import { VerifiedBadge } from './VerifiedBadge';

interface PostCardProps {
  post: Post;
  isDetailView?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ post, isDetailView = false }) => {
  const {
    votePost,
    toggleSavePost,
    openAwardModal,
    setActivePost,
    setActiveFeed,
    openUserProfile,
    votePoll,
    showToast,
    viewMode,
    currentUser,
    toggleFollowAuthor,
    isFollowingAuthor,
    isAuthorVerified,
    openReportModal,
    isPostReported,
  } = useBloggr();

  const isSaved = currentUser.savedPostIds.includes(post.id);
  const isReported = isPostReported(post.id);
  const isUpvoted = post.userVote === 'up';
  const isDownvoted = post.userVote === 'down';
  const isFollowing = isFollowingAuthor(post.author);
  const isSelf = post.author.toLowerCase() === currentUser.username.toLowerCase();
  const authorVerifiedStatus = isSelf ? currentUser.isVerified : (isAuthorVerified(post.author) || post.authorVerified);

  const formatScore = (num: number) => {
    if (Math.abs(num) >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(window.location.href);
    showToast('Post link copied to clipboard!');
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSavePost(post.id);
  };

  const handleAwardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openAwardModal({
      type: 'post',
      id: post.id,
      postId: post.id,
      author: post.author,
    });
  };

  // Check if current user voted on poll
  const userVotedPollOption = post.pollOptions?.find(o =>
    o.votedUserIds.includes(currentUser.username)
  );
  const totalPollVotes = post.pollOptions?.reduce((acc, curr) => acc + curr.votes, 0) || 0;

  // COMPACT VIEW (used when viewMode === 'compact' and not in detail view)
  if (viewMode === 'compact' && !isDetailView) {
    return (
      <article
        id={`post-compact-${post.id}`}
        onClick={() => setActivePost(post)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all cursor-pointer group shadow-xs"
      >
        {/* Compact Votes below/inline */}
        <div
          className="flex items-center gap-0.5 text-xs font-bold"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => votePost(post.id, 'up')}
            className={`p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
              isUpvoted ? 'text-orange-500' : 'text-neutral-400'
            }`}
          >
            <ArrowBigUp className="w-3.5 h-3.5" />
          </button>
          <span
            className={`min-w-[24px] text-center text-[11px] ${
              isUpvoted ? 'text-orange-500' : isDownvoted ? 'text-blue-500' : 'text-neutral-600 dark:text-neutral-300'
            }`}
          >
            {formatScore(post.score)}
          </span>
          <button
            onClick={() => votePost(post.id, 'down')}
            className={`p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
              isDownvoted ? 'text-blue-500' : 'text-neutral-400'
            }`}
          >
            <ArrowBigDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Thumbnail if link or image */}
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt=""
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
          />
        )}

        {/* Info & Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mb-0.5 truncate">
            <span
              onClick={e => {
                e.stopPropagation();
                setActiveFeed(post.communityId);
              }}
              className="font-bold text-neutral-800 dark:text-neutral-200 hover:underline"
            >
              {post.communityId}
            </span>
            <span>•</span>
            <span>{post.createdAt}</span>
            {post.flair && (
              <span className="px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-medium">
                {post.flair}
              </span>
            )}
          </div>
          <h2 className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors truncate">
            {post.title}
          </h2>
        </div>

        {/* Compact Comments */}
        <div className="flex items-center gap-1 text-[11px] text-neutral-400 flex-shrink-0">
          <MessageSquare className="w-3 h-3" />
          <span>{post.commentsCount}</span>
        </div>

        {/* Compact Save Button */}
        <button
          id={`compact-save-btn-${post.id}`}
          onClick={handleSave}
          className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium transition-colors flex-shrink-0 ${
            isSaved
              ? 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 font-bold'
              : 'text-neutral-500 hover:text-orange-600 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
          title={isSaved ? "Saved to personal 'Saved' list (Synced with Firestore)" : "Save to personal 'Saved' list"}
        >
          {isSaved ? <BookmarkCheck className="w-3 h-3 text-orange-500" /> : <Bookmark className="w-3 h-3" />}
          <span>{isSaved ? 'Saved' : 'Save'}</span>
        </button>
      </article>
    );
  }

  // STANDARD CARD VIEW - Reaction buttons moved to below post with reduced item spacing
  return (
    <article
      id={`post-card-${post.id}`}
      onClick={() => {
        if (!isDetailView) setActivePost(post);
      }}
      className={`rounded-2xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-900 transition-all p-2.5 sm:p-3.5 ${
        !isDetailView ? 'hover:border-orange-500/40 dark:hover:border-orange-500/40 hover:shadow-md hover:shadow-orange-500/5 cursor-pointer group' : 'shadow-none'
      }`}
    >
      {/* Top Thumbnail in Single Post Detail View (Mobile 21:9 aspect ratio) */}
      {isDetailView && post.imageUrl && (
        <div className="mb-3.5 -mx-2.5 sm:mx-0 sm:rounded-xl overflow-hidden border-y sm:border border-neutral-200 dark:border-neutral-800 bg-black/5 dark:bg-black/30">
          <img
            src={post.imageUrl}
            alt={post.title}
            referrerPolicy="no-referrer"
            className="w-full aspect-[21/9] sm:aspect-video md:max-h-[460px] object-cover"
            loading="eager"
          />
        </div>
      )}

      {/* Post Header: Sub-bloggr, Author, Time, Flair */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-xs">
          <button
            onClick={e => {
              e.stopPropagation();
              setActiveFeed(post.communityId);
            }}
            className="flex items-center gap-1 font-bold text-neutral-900 dark:text-neutral-100 hover:underline"
          >
            <span className="text-xs sm:text-sm">{post.communityIcon}</span>
            <span>{post.communityId}</span>
          </button>

          <span className="text-neutral-300 dark:text-neutral-700">•</span>

          <span className="text-neutral-500 dark:text-neutral-400 text-[11px] sm:text-xs flex items-center gap-1.5">
            <span>by</span>
            <button
              onClick={e => {
                e.stopPropagation();
                openUserProfile(post.author);
              }}
              className="hover:underline font-semibold text-neutral-800 dark:text-neutral-200 inline-flex items-center gap-1"
            >
              <span>u/{post.author}</span>
              <VerifiedBadge isVerified={authorVerifiedStatus} role={post.authorRole} size="xs" />
            </button>

            {/* Author Follow Toggle Button */}
            {!isSelf && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  toggleFollowAuthor(post.author);
                }}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all flex items-center gap-1 ${
                  isFollowing
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-500/20'
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
          </span>

          <span className="text-neutral-400 text-[11px]">{post.createdAt}</span>

          {post.readTimeMinutes && (
            <span className="text-neutral-400 text-[11px] font-medium flex items-center gap-1">
              <Clock className="w-3 h-3 text-neutral-400" />
              <span>{post.readTimeMinutes}m</span>
            </span>
          )}

          {post.isBreaking && (
            <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <Zap className="w-2.5 h-2.5 fill-white" />
              <span>Developing</span>
            </span>
          )}

          {/* Verified Creator Indicator */}
          <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.2 rounded-full">
            <CheckCircle2 className="w-2.5 h-2.5" /> Creator
          </span>

          {post.isPinned && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.2 rounded-full">
              <Pin className="w-2.5 h-2.5" /> Pinned
            </span>
          )}

          {post.flair && (
            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
              {post.flair}
            </span>
          )}

          {post.category && (
            <span
              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                post.category === 'FOOTBALL'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : post.category === 'OPINION'
                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                  : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
              }`}
            >
              {post.category}
            </span>
          )}
        </div>
      </div>

      {/* Post Title */}
      <h2 className="text-[14px] sm:text-base font-bold text-neutral-900 dark:text-white leading-snug tracking-tight mb-1.5">
        {post.url ? (
          <span className="flex items-start gap-1.5 group">
            <span className="group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              {post.title}
            </span>
            {post.domain && (
              <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400 font-normal mt-0.5 flex-shrink-0">
                ({post.domain} <ExternalLink className="w-2.5 h-2.5" />)
              </span>
            )}
          </span>
        ) : (
          post.title
        )}
      </h2>

      {/* Post Content Body (Shown only in detail view; post excerpt removed from feed cards) */}
      {isDetailView && post.content && (
        <div className="text-neutral-700 dark:text-neutral-300 text-[13px] leading-relaxed mb-2">
          <div className="prose dark:prose-invert max-w-none text-[13px]">
            <Markdown>{post.content}</Markdown>
          </div>
        </div>
      )}

      {/* Image Media in Feed Card View (Mobile 21:9 aspect ratio) */}
      {!isDetailView && post.imageUrl && (
        <div className="mb-2 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-black/5 dark:bg-black/30">
          <img
            src={post.imageUrl}
            alt={post.title}
            referrerPolicy="no-referrer"
            className="w-full aspect-[21/9] sm:aspect-auto sm:max-h-80 object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Link Preview Card */}
      {post.type === 'link' && post.url && (
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="flex items-center justify-between p-2.5 mb-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors text-xs"
        >
          <div className="truncate mr-2">
            <div className="font-semibold text-neutral-900 dark:text-white truncate text-xs">
              {post.url}
            </div>
            <div className="text-neutral-400 truncate mt-0.5 text-[11px]">
              Visit external news source on {post.domain || 'web'}
            </div>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
        </a>
      )}

      {/* Interactive Poll */}
      {post.type === 'poll' && post.pollOptions && (
        <div
          className="p-2.5 mb-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/30 select-none"
          onClick={e => e.stopPropagation()}
        >
          <div className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-2 flex items-center justify-between">
            <span>Community Poll • {totalPollVotes.toLocaleString()} votes cast</span>
            {userVotedPollOption && (
              <span className="text-emerald-500 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Vote cast
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            {post.pollOptions.map(option => {
              const percentage = totalPollVotes > 0 ? Math.round((option.votes / totalPollVotes) * 100) : 0;
              const isUserPick = option.votedUserIds.includes(currentUser.username);

              return (
                <button
                  key={option.id}
                  onClick={() => votePoll(post.id, option.id)}
                  disabled={!!userVotedPollOption}
                  className={`w-full relative overflow-hidden rounded-lg border text-left p-2 transition-all text-xs flex items-center justify-between ${
                    isUserPick
                      ? 'border-orange-500 bg-orange-50/30 dark:bg-orange-950/20'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-orange-400 bg-white dark:bg-neutral-800'
                  }`}
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-orange-500/15 dark:bg-orange-500/20 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                  <span className="relative z-10 font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                    {isUserPick && <span className="text-orange-500">✓</span>}
                    {option.text}
                  </span>
                  <span className="relative z-10 font-bold text-neutral-500 dark:text-neutral-400 ml-2 text-[11px]">
                    {percentage}% ({option.votes})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Awards display bar */}
      {post.awards && post.awards.length > 0 && (
        <div className="flex items-center gap-1 mb-2 flex-wrap">
          {post.awards.map(award => (
            <span
              key={award.type}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[10px] font-semibold text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700/60"
              title={`${award.name} Award`}
            >
              <AwardFaIcon awardType={award.type} className="w-3 h-3" />
              <span>{award.count}</span>
            </span>
          ))}
        </div>
      )}

      {/* Post Action Footer Bar with REACTION BUTTONS BELOW POST */}
      <div className="flex items-center justify-between pt-1.5 border-t border-neutral-100 dark:border-neutral-800/60 text-neutral-500 dark:text-neutral-400 text-xs font-semibold select-none flex-wrap gap-y-1.5">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* REACTION BUTTONS (UPVOTE / SCORE / DOWNVOTE) LOCATED BELOW POST */}
          <div
            className="flex items-center rounded-full bg-neutral-100 dark:bg-neutral-800/80 p-0.5 border border-neutral-200/50 dark:border-neutral-700/50"
            onClick={e => e.stopPropagation()}
          >
            <button
              id={`upvote-btn-${post.id}`}
              onClick={() => votePost(post.id, 'up')}
              className={`p-1 sm:p-1.5 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors ${
                isUpvoted ? 'text-orange-500 fill-orange-500 bg-orange-500/10' : 'text-neutral-500 hover:text-orange-500'
              }`}
              title="Upvote"
            >
              <ArrowBigUp className={`w-4 h-4 sm:w-5 sm:h-5 ${isUpvoted ? 'fill-current' : ''}`} />
            </button>

            <span
              className={`text-[12px] sm:text-xs font-extrabold px-1.5 min-w-[24px] text-center tracking-tight ${
                isUpvoted ? 'text-orange-500' : isDownvoted ? 'text-blue-500' : 'text-neutral-700 dark:text-neutral-300'
              }`}
            >
              {formatScore(post.score)}
            </span>

            <button
              id={`downvote-btn-${post.id}`}
              onClick={() => votePost(post.id, 'down')}
              className={`p-1 sm:p-1.5 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors ${
                isDownvoted ? 'text-blue-500 fill-blue-500 bg-blue-500/10' : 'text-neutral-500 hover:text-blue-500'
              }`}
              title="Downvote"
            >
              <ArrowBigDown className={`w-4 h-4 sm:w-5 sm:h-5 ${isDownvoted ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Comments Button */}
          <button
            id={`comments-btn-${post.id}`}
            onClick={e => {
              e.stopPropagation();
              setActivePost(post);
            }}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200/50 dark:border-neutral-700/50 transition-colors text-neutral-700 dark:text-neutral-300 text-[11px] sm:text-xs"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{post.commentsCount}</span>
            <span className="hidden sm:inline">Comments</span>
          </button>

          {/* Award Button */}
          <button
            id={`award-btn-${post.id}`}
            onClick={handleAwardClick}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800/80 hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:text-amber-600 dark:hover:text-amber-400 border border-neutral-200/50 dark:border-neutral-700/50 transition-colors text-[11px] sm:text-xs"
            title="Give an Award"
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden xs:inline">Award</span>
          </button>

          {/* Share Button */}
          <button
            id={`share-btn-${post.id}`}
            onClick={handleShare}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200/50 dark:border-neutral-700/50 transition-colors text-[11px] sm:text-xs"
            title="Copy Link"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Save / Bookmark Button */}
          <button
            id={`save-btn-${post.id}`}
            onClick={handleSave}
            className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition-colors text-[11px] sm:text-xs font-semibold ${
              isSaved
                ? 'bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50'
                : 'bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200/50 dark:border-neutral-700/50 text-neutral-600 dark:text-neutral-300 hover:text-orange-600'
            }`}
            title={isSaved ? "Saved to personal 'Saved' list (Synced with Firestore)" : "Save to personal 'Saved' list"}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-orange-500" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                <span>Save</span>
              </>
            )}
          </button>

          {/* Report Button */}
          <button
            id={`report-btn-${post.id}`}
            onClick={(e) => {
              e.stopPropagation();
              openReportModal(post);
            }}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full border transition-colors text-[11px] sm:text-xs ${
              isReported
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/40'
                : 'bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 border-neutral-200/50 dark:border-neutral-700/50 text-neutral-600 dark:text-neutral-400 hover:text-rose-600'
            }`}
            title={isReported ? 'Reported for review' : 'Report article'}
          >
            <Flag className={`w-3.5 h-3.5 ${isReported ? 'text-rose-500' : ''}`} />
            <span className="hidden md:inline">{isReported ? 'Reported' : 'Report'}</span>
          </button>
        </div>

        {/* Views metric & monetization */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-neutral-400">
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{post.views.toLocaleString()}</span>
          </div>
          {/* Only display author earnings to the author themselves, never to other users */}
          {isSelf && post.views > 1000 && (
            <span
              title={`Your author earnings: KSH ${((post.views / 180) * 0.65).toFixed(2)} (65% share from ${post.views.toLocaleString()} views)`}
              className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/30"
            >
              My Earnings: KSH {((post.views / 180) * 0.65).toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
