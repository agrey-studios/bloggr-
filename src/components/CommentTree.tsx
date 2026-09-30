import React, { useState } from 'react';
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Award,
  Pin,
  Send,
  CornerDownRight,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import Markdown from 'react-markdown';
import { Comment, Post } from '../types';
import { useBloggr } from '../context/BloggrContext';

interface CommentItemProps {
  comment: Comment;
  post: Post;
  depth?: number;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment, post, depth = 0 }) => {
  const {
    voteComment,
    addComment,
    openAwardModal,
    openUserProfile,
    currentUser,
  } = useBloggr();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const isUpvoted = comment.userVote === 'up';
  const isDownvoted = comment.userVote === 'down';
  const isOP = comment.author === post.author;

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    addComment(post.id, replyText, comment.id);
    setReplyText('');
    setIsReplying(false);
  };

  const handleAward = () => {
    openAwardModal({
      type: 'comment',
      id: comment.id,
      postId: post.id,
      author: comment.author,
    });
  };

  const totalDescendantCount = (c: Comment): number => {
    if (!c.replies || c.replies.length === 0) return 0;
    return c.replies.reduce((sum, r) => sum + 1 + totalDescendantCount(r), 0);
  };

  const descendants = totalDescendantCount(comment);

  // If collapsed, render compact row
  if (isCollapsed) {
    return (
      <div className="py-2 text-xs text-neutral-400 flex items-center gap-2 select-none">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 font-bold flex items-center gap-1"
        >
          <ChevronRight className="w-3.5 h-3.5" />
          <span>[+]</span>
        </button>
        <span className="font-semibold text-neutral-700 dark:text-neutral-300">
          u/{comment.author}
        </span>
        <span>•</span>
        <span>{comment.score} points</span>
        <span>•</span>
        <span>{descendants > 0 ? `${descendants} replies hidden` : 'collapsed'}</span>
      </div>
    );
  }

  return (
    <div className={`relative ${depth > 0 ? 'ml-3 sm:ml-6 pl-2 sm:pl-3 border-l-2 border-neutral-200 dark:border-neutral-800 comment-thread-line' : ''}`}>
      <div className="py-2.5">
        {/* Comment Header */}
        <div className="flex items-center gap-2 text-xs mb-1.5 flex-wrap">
          {/* Collapse Thread Line Trigger */}
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-0.5 -ml-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            title="Collapse thread"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          <img
            src={comment.authorAvatar}
            alt={comment.author}
            referrerPolicy="no-referrer"
            className="w-5 h-5 rounded-full object-cover"
          />

          <button
            onClick={() => openUserProfile(comment.author)}
            className="font-bold text-neutral-800 dark:text-neutral-200 hover:underline"
          >
            u/{comment.author}
          </button>

          {isOP && (
            <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-orange-600 text-white leading-none">
              OP
            </span>
          )}

          {comment.authorFlair && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
              {comment.authorFlair}
            </span>
          )}

          {comment.isPinned && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded">
              <Pin className="w-2.5 h-2.5" /> Pinned
            </span>
          )}

          <span className="text-neutral-400 text-[11px]">• {comment.createdAt}</span>

          {/* Comment Awards */}
          {comment.awards && comment.awards.length > 0 && (
            <div className="flex items-center gap-1 ml-1">
              {comment.awards.map(a => (
                <span
                  key={a.type}
                  className="inline-flex items-center gap-0.5 text-[10px] bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.2 rounded-full font-bold"
                  title={a.name}
                >
                  {a.emoji} {a.count > 1 ? a.count : ''}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Comment Content */}
        <div className="text-neutral-800 dark:text-neutral-200 text-xs sm:text-sm leading-relaxed pl-5 mb-2">
          <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm">
            <Markdown>{comment.content}</Markdown>
          </div>
        </div>

        {/* Comment Action Row: Voting, Reply, Award */}
        <div className="flex items-center gap-3 pl-5 text-xs text-neutral-500 dark:text-neutral-400 font-semibold select-none">
          {/* Vote Controls */}
          <div className="flex items-center gap-0.5 bg-neutral-100 dark:bg-neutral-800/80 rounded-full px-1.5 py-0.5">
            <button
              onClick={() => voteComment(comment.id, post.id, 'up')}
              className={`p-1 rounded-full hover:text-orange-500 ${
                isUpvoted ? 'text-orange-500' : 'text-neutral-400'
              }`}
            >
              <ArrowBigUp className={`w-4 h-4 ${isUpvoted ? 'fill-current' : ''}`} />
            </button>

            <span
              className={`text-xs px-1 font-bold ${
                isUpvoted ? 'text-orange-500' : isDownvoted ? 'text-blue-500' : 'text-neutral-700 dark:text-neutral-300'
              }`}
            >
              {comment.score}
            </span>

            <button
              onClick={() => voteComment(comment.id, post.id, 'down')}
              className={`p-1 rounded-full hover:text-blue-500 ${
                isDownvoted ? 'text-blue-500' : 'text-neutral-400'
              }`}
            >
              <ArrowBigDown className={`w-4 h-4 ${isDownvoted ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Reply Button */}
          <button
            onClick={() => setIsReplying(prev => !prev)}
            className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Reply</span>
          </button>

          {/* Award Button */}
          <button
            onClick={handleAward}
            className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:text-amber-500 transition-colors"
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Award</span>
          </button>
        </div>

        {/* Inline Reply Input Box */}
        {isReplying && (
          <form onSubmit={handleSendReply} className="mt-3 pl-5">
            <div className="rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder={`Replying to u/${comment.author}...`}
                rows={2}
                autoFocus
                className="w-full p-2.5 text-xs sm:text-sm bg-transparent border-none focus:outline-none resize-y text-neutral-900 dark:text-neutral-100 placeholder-neutral-400"
              />
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800/40 border-t border-neutral-200 dark:border-neutral-800 text-xs">
                <span className="text-[11px] text-neutral-400">Markdown supported</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsReplying(false);
                      setReplyText('');
                    }}
                    className="px-2.5 py-1 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="px-3 py-1 rounded-full bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white font-bold text-xs shadow-sm flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Comment</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Recursive Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-1">
            {comment.replies.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                post={post}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const CommentTree: React.FC<{ post: Post }> = ({ post }) => {
  const { comments, addComment, currentUser } = useBloggr();
  const [newCommentText, setNewCommentText] = useState('');
  const postComments = comments[post.id] || [];

  const handleTopLevelComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    addComment(post.id, newCommentText, null);
    setNewCommentText('');
  };

  return (
    <div className="mt-6 border-t border-neutral-200 dark:border-neutral-800 pt-6">
      {/* Add Top-Level Comment Box */}
      <div className="mb-6">
        <div className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
          Comment as <span className="font-bold text-orange-600 dark:text-orange-400">u/{currentUser.username}</span>
        </div>

        <form onSubmit={handleTopLevelComment}>
          <div className="rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all">
            <textarea
              id="top-level-comment-input"
              value={newCommentText}
              onChange={e => setNewCommentText(e.target.value)}
              placeholder="What are your thoughts? Join the discussion..."
              rows={3}
              className="w-full p-3 text-sm bg-transparent border-none focus:outline-none resize-y text-neutral-900 dark:text-neutral-100 placeholder-neutral-400"
            />
            <div className="flex items-center justify-between px-3 py-2 bg-neutral-50 dark:bg-neutral-800/40 border-t border-neutral-200 dark:border-neutral-800 text-xs">
              <span className="text-[11px] text-neutral-400">
                Supports **bold**, *italics*, `code`, and lists
              </span>
              <button
                type="submit"
                id="submit-comment-btn"
                disabled={!newCommentText.trim()}
                className="px-4 py-1.5 rounded-full bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Comment</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Comments List Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-300">
        <span>{post.commentsCount} Comments</span>
        <span className="text-neutral-400 font-normal">Sorted by: Best</span>
      </div>

      {/* Nested Tree List */}
      <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60 mt-1">
        {postComments.length > 0 ? (
          postComments.map(c => (
            <CommentItem key={c.id} comment={c} post={post} depth={0} />
          ))
        ) : (
          <div className="py-12 text-center text-neutral-400 text-sm">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="font-semibold text-neutral-600 dark:text-neutral-300">No comments yet</p>
            <p className="text-xs text-neutral-400 mt-1">Be the first to share what you think!</p>
          </div>
        )}
      </div>
    </div>
  );
};
