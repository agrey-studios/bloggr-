import React, { useState, useMemo } from 'react';
import {
  Feather,
  Heart,
  Trees,
  Sparkles,
  Tv,
  Clock,
  Eye,
  MessageSquare,
  Gift,
  Search,
  UserPlus,
  Check,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { useBloggr } from '../context/BloggrContext';
import { Post } from '../types';
import { VerifiedBadge } from './VerifiedBadge';

type OpinionTopic = 'all' | 'health' | 'nature' | 'entertainment' | 'tech';

export const OpinionPageView: React.FC = () => {
  const { posts, setActivePost, openUserProfile, toggleFollowAuthor, isFollowingAuthor, openAwardModal, currentUser, toggleSavePost } =
    useBloggr();

  const [topic, setTopic] = useState<OpinionTopic>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter opinion posts
  const opinionPosts = useMemo(() => {
    return posts.filter(p => {
      const cat = (p.category || '').toLowerCase();
      const cats = (p.categories || []).map(c => c.toLowerCase());
      const tags = (p.tags || []).map(t => t.toLowerCase());
      const flair = (p.flair || '').toLowerCase();

      const isOpinion =
        cat.includes('opinion') ||
        cats.includes('opinion') ||
        tags.includes('opinion') ||
        flair.includes('opinion') ||
        flair.includes('column') ||
        flair.includes('analysis');

      if (!isOpinion) return false;

      // Topic sub-filter
      const text = `${p.title} ${p.content || ''} ${tags.join(' ')} ${flair}`.toLowerCase();

      if (topic === 'health') {
        return text.includes('health') || text.includes('wellness') || text.includes('doctor') || text.includes('nutrition') || text.includes('cortisol');
      }
      if (topic === 'nature') {
        return text.includes('nature') || text.includes('wildlife') || text.includes('climate') || text.includes('conservation') || text.includes('elephant');
      }
      if (topic === 'entertainment') {
        return text.includes('entertainment') || text.includes('music') || text.includes('culture') || text.includes('afrobeats') || text.includes('pop');
      }
      if (topic === 'tech') {
        return text.includes('tech') || text.includes('grassroots') || text.includes('academy') || text.includes('digital');
      }

      return true; // 'all'
    });
  }, [posts, topic]);

  // Search filter
  const displayedPosts = useMemo(() => {
    if (!searchQuery.trim()) return opinionPosts;
    const q = searchQuery.toLowerCase();
    return opinionPosts.filter(
      p =>
        p.title.toLowerCase().includes(q) ||
        (p.content && p.content.toLowerCase().includes(q)) ||
        p.author.toLowerCase().includes(q) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
    );
  }, [opinionPosts, searchQuery]);

  // Notable bloggers
  const featuredBloggers = [
    {
      username: 'DrAmina_Health',
      name: 'Dr. Amina Hassan',
      role: 'Preventive Medicine Physician & Health Blogger',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80',
      topic: 'Health & Wellness',
    },
    {
      username: 'EcoWanderer_Paul',
      name: 'Paul Kiprono',
      role: 'Conservation Biologist & Wildlife Essayist',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      topic: 'Nature & Climate',
    },
    {
      username: 'CultureCritic_K',
      name: 'Kezia Ochieng',
      role: 'Arts & Pop Culture Essayist',
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80',
      topic: 'Entertainment & Music',
    },
    {
      username: 'AlexRider',
      name: 'Alex Rider',
      role: 'Sports Culture & Investigative Reporter',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      topic: 'Sports & Society',
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Featured Bloggers Spotlight */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Feather className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h2 className="text-xs sm:text-sm font-black text-neutral-900 dark:text-white uppercase tracking-wider">
              Featured Bloggers & Columnists
            </h2>
          </div>
          <span className="text-[11px] text-neutral-400">Independent Voices</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {featuredBloggers.map(blogger => {
            const isFollowing = isFollowingAuthor(blogger.username);
            return (
              <div
                key={blogger.username}
                className="p-3.5 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-2.5"
              >
                <div
                  className="flex items-center gap-2.5 cursor-pointer"
                  onClick={() => openUserProfile(blogger.username)}
                >
                  <img
                    src={blogger.avatar}
                    alt={blogger.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/20"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-neutral-900 dark:text-white truncate flex items-center gap-1">
                      <span>{blogger.name}</span>
                      <VerifiedBadge isVerified={true} size="xs" />
                    </div>
                    <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold truncate">
                      {blogger.topic}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-tight">
                  {blogger.role}
                </p>

                <button
                  type="button"
                  onClick={() => toggleFollowAuthor(blogger.username)}
                  className={`w-full py-1 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    isFollowing
                      ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3" />
                      <span>Follow Blogger</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Topic Filter Pills & Search */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-3 sm:p-4 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Topic Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 text-xs flex-wrap">
            <button
              onClick={() => setTopic('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                topic === 'all'
                  ? 'bg-white dark:bg-neutral-900 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              All Opinions
            </button>

            <button
              onClick={() => setTopic('health')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                topic === 'health'
                  ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>Health & Wellness</span>
            </button>

            <button
              onClick={() => setTopic('nature')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                topic === 'nature'
                  ? 'bg-white dark:bg-neutral-900 text-green-600 dark:text-green-400 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Trees className="w-3.5 h-3.5 text-emerald-500" />
              <span>Nature & Wildlife</span>
            </button>

            <button
              onClick={() => setTopic('entertainment')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                topic === 'entertainment'
                  ? 'bg-white dark:bg-neutral-900 text-pink-600 dark:text-pink-400 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5 text-pink-500" />
              <span>Entertainment & Pop Culture</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:max-w-xs min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search blogger columns..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          Showing {displayedPosts.length} columns & opinion essays
        </div>
      </div>

      {/* Columns & Essays Feed: At least 4 columns on desktop, 21:9 images, reduced spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {displayedPosts.map(post => {
          return (
            <div
              key={post.id}
              onClick={() => {
                setActivePost(post);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group cursor-pointer bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs hover:shadow-md hover:border-purple-500/40 transition-all flex flex-col justify-between"
            >
              <div className="p-2 sm:p-2.5 space-y-1.5">
                {/* 21:9 Image Thumbnail */}
                {post.imageUrl && (
                  <div className="relative aspect-[21/9] w-full rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded-md bg-purple-600 text-white text-[9px] font-bold uppercase tracking-wider">
                        {post.flair || 'Opinion'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Author Info */}
                <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
                  <span
                    className="font-bold text-neutral-800 dark:text-neutral-200 hover:underline flex items-center gap-0.5"
                    onClick={e => {
                      e.stopPropagation();
                      openUserProfile(post.author);
                    }}
                  >
                    u/{post.author}
                    <VerifiedBadge isVerified={Boolean(post.authorVerified)} role={post.authorRole} size="xs" />
                  </span>
                  <span>•</span>
                  <span>{post.createdAt}</span>
                </div>

                {/* Title */}
                <h3 className="text-xs sm:text-[13px] font-bold text-neutral-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-snug line-clamp-2">
                  {post.title}
                </h3>
              </div>

              {/* Engagement Stats & Footer */}
              <div className="px-2 sm:px-2.5 py-2 bg-neutral-50/80 dark:bg-neutral-800/40 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-400">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{post.readTimeMinutes || 4}m</span>
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Eye className="w-2.5 h-2.5" />
                    <span>{(post.views || 0).toLocaleString()}</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      toggleSavePost(post.id);
                    }}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-0.5 transition-colors cursor-pointer ${
                      (currentUser.savedPostIds || []).includes(post.id)
                        ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold'
                        : 'text-neutral-500 hover:text-orange-600 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                    title={
                      (currentUser.savedPostIds || []).includes(post.id)
                        ? "Saved (Synced with Firestore)"
                        : "Save to personal 'Saved' list"
                    }
                  >
                    {(currentUser.savedPostIds || []).includes(post.id) ? (
                      <BookmarkCheck className="w-2.5 h-2.5 text-orange-500" />
                    ) : (
                      <Bookmark className="w-2.5 h-2.5" />
                    )}
                    <span>{(currentUser.savedPostIds || []).includes(post.id) ? 'Saved' : 'Save'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      openAwardModal({
                        type: 'post',
                        id: post.id,
                        postId: post.id,
                        author: post.author,
                      });
                    }}
                    className="px-2 py-0.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold flex items-center gap-0.5 transition-colors"
                  >
                    <Gift className="w-2.5 h-2.5" />
                    <span>Gift</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {displayedPosts.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
          <Feather className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            No columns found
          </h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Try switching topics above to explore health, nature, entertainment, or technology columns.
          </p>
        </div>
      )}
    </div>
  );
};
