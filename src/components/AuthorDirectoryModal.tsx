import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Users,
  CheckCircle2,
  UserPlus,
  UserCheck,
  Search,
  Sparkles,
  Award,
  ArrowRight,
} from 'lucide-react';
import { useBloggr } from '../context/BloggrContext';
import { RECOMMENDED_AUTHORS } from '../data/seedData';

export const AuthorDirectoryModal: React.FC = () => {
  const {
    isAuthorDirectoryOpen,
    setIsAuthorDirectoryOpen,
    currentUser,
    toggleFollowAuthor,
    isFollowingAuthor,
    openUserProfile,
  } = useBloggr();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // ESC key listener to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthorDirectoryOpen) {
        setIsAuthorDirectoryOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthorDirectoryOpen, setIsAuthorDirectoryOpen]);

  // Lock scroll when open
  useEffect(() => {
    if (isAuthorDirectoryOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAuthorDirectoryOpen]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    RECOMMENDED_AUTHORS.forEach(a => cats.add(a.category));
    return ['all', ...Array.from(cats)];
  }, []);

  const filteredAuthors = useMemo(() => {
    return RECOMMENDED_AUTHORS.filter(author => {
      const matchesSearch =
        author.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        author.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        author.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        author.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'all' || author.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  if (!isAuthorDirectoryOpen) return null;

  return (
    <div
      id="authors-popup-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setIsAuthorDirectoryOpen(false)}
    >
      <div
        id="authors-popup-content"
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header with Exit Option */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white">
                  Our Writers & Correspondents
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-[11px] font-bold">
                  {RECOMMENDED_AUTHORS.length} Writers
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Follow verified journalists and independent community writers to personalize your feed
              </p>
            </div>
          </div>

          {/* Explicit Exit Option Button */}
          <button
            id="authors-popup-exit-btn"
            onClick={() => setIsAuthorDirectoryOpen(false)}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1 font-bold text-xs"
            title="Exit popup"
          >
            <span className="hidden sm:inline text-neutral-500">Exit</span>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-3 sm:p-4 border-b border-neutral-100 dark:border-neutral-800 space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search journalists, beats, or topics..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          {/* Categories Pill Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {cat === 'all' ? 'All Beats' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Author List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 divide-y divide-neutral-100 dark:divide-neutral-800/60">
          {filteredAuthors.map(author => {
            const isFollowing = isFollowingAuthor(author.username);
            const isSelf = author.username.toLowerCase() === currentUser.username.toLowerCase();

            return (
              <div
                key={author.username}
                className="pt-2.5 first:pt-0 flex items-start justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    onClick={() => {
                      setIsAuthorDirectoryOpen(false);
                      openUserProfile(author.username);
                    }}
                    className="relative cursor-pointer flex-shrink-0"
                  >
                    <img
                      src={author.avatar}
                      alt={author.displayName}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-full object-cover border-2 border-neutral-200 dark:border-neutral-700 group-hover:border-orange-500 transition-colors"
                    />
                    {author.verified && (
                      <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500 bg-white dark:bg-neutral-900 rounded-full absolute -bottom-0.5 -right-0.5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        onClick={() => {
                          setIsAuthorDirectoryOpen(false);
                          openUserProfile(author.username);
                        }}
                        className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer truncate"
                      >
                        {author.displayName}
                      </h4>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        u/{author.username}
                      </span>
                      {author.verified ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/60 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-orange-500 flex-shrink-0" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                          Community Writer
                        </span>
                      )}
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                        {author.category}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                      {author.bio}
                    </p>

                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-neutral-400">
                      <span>{(author.followersCount / 1000).toFixed(1)}k followers</span>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Top Contributor
                      </span>
                    </div>
                  </div>
                </div>

                {/* Follow Button */}
                {!isSelf && (
                  <button
                    onClick={() => toggleFollowAuthor(author.username)}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                      isFollowing
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30'
                        : 'bg-orange-600 hover:bg-orange-500 text-white'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}

          {filteredAuthors.length === 0 && (
            <div className="py-8 text-center text-xs text-neutral-400">
              No authors found matching "{searchQuery}".
            </div>
          )}
        </div>

        {/* Modal Footer with Exit Option */}
        <div className="p-3 sm:p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between">
          <span className="text-[11px] text-neutral-400">
            Following authors updates your timeline in real time.
          </span>

          <button
            id="authors-popup-footer-exit-btn"
            onClick={() => setIsAuthorDirectoryOpen(false)}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-xs"
          >
            Exit Directory
          </button>
        </div>
      </div>
    </div>
  );
};
