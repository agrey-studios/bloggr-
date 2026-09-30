import React, { useMemo } from 'react';
import {
  Tag,
  Hash,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Bookmark,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { useBloggr } from '../context/BloggrContext';
import { GoogleAd } from './GoogleAd';
import { Post } from '../types';

interface RightSidebarProps {
  activePost?: Post | null;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ activePost }) => {
  const {
    posts,
    setActivePost,
    openUserProfile,
    openPolicyPage,
    isAuthorVerified,
  } = useBloggr();

  // Extract distinct tags and flair from the active article
  const activeTags = useMemo(() => {
    if (!activePost) return [];
    const list: string[] = [];
    if (activePost.flair) {
      list.push(activePost.flair);
    }
    if (activePost.tags && Array.isArray(activePost.tags)) {
      for (const t of activePost.tags) {
        if (!list.some(existing => existing.toLowerCase() === t.toLowerCase())) {
          list.push(t);
        }
      }
    }
    return list;
  }, [activePost]);

  // Find articles matching similar single article tag(s)
  const similarArticles = useMemo(() => {
    if (!activePost) return [];
    const activeTagsLower = activeTags.map(t => t.toLowerCase());
    const activeCategoryLower = (activePost.category || '').toLowerCase();

    return posts
      .filter(p => p.id !== activePost.id)
      .map(p => {
        const pTags = (p.tags || []).map(t => t.toLowerCase());
        if (p.flair) pTags.push(p.flair.toLowerCase());

        // Check matching tags
        const matchingTags = activeTagsLower.filter(at =>
          pTags.some(pt => pt === at || pt.includes(at) || at.includes(pt))
        );

        let score = matchingTags.length * 20;
        const categoryMatch = p.category && p.category.toLowerCase() === activeCategoryLower;
        if (categoryMatch) score += 5;

        // Label for the matched tag
        const matchedTagLabel =
          matchingTags.length > 0
            ? activeTags.find(t => t.toLowerCase() === matchingTags[0]) || matchingTags[0]
            : p.flair || p.tags?.[0] || p.category || 'Related';

        return {
          post: p,
          score,
          matchedTagLabel,
        };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || (b.post.views || 0) - (a.post.views || 0))
      .slice(0, 6);
  }, [posts, activePost, activeTags]);

  // If no single article is active, this sidebar does not render
  if (!activePost) {
    return null;
  }

  return (
    <aside
      id="single-article-right-sidebar"
      className="w-80 lg:w-84 flex-shrink-0 hidden lg:block sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto space-y-4 select-none pb-12 pr-1"
    >
      {/* 1. TOP SPONSORED ADVERTISEMENT */}
      <GoogleAd format="sidebar" slotId={0} />

      {/* 2. ARTICLES FROM SIMILAR SINGLE ARTICLE TAG */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-xs space-y-3.5">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-1">
            <Tag className="w-3.5 h-3.5" />
            <span>Similar Tag Articles</span>
          </div>
          <h3 className="font-black text-sm text-neutral-900 dark:text-white leading-tight">
            Related to this Dispatch
          </h3>

          {/* Active Article Tags Display */}
          {activeTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {activeTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[11px] font-bold border border-orange-500/20"
                >
                  <Hash className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Similar Articles List */}
        {similarArticles.length === 0 ? (
          <div className="py-6 text-center text-xs text-neutral-400 border-t border-neutral-100 dark:border-neutral-800/80">
            No other stories found with these tags.
          </div>
        ) : (
          <div className="space-y-3 border-t border-neutral-100 dark:border-neutral-800/80 pt-3">
            {similarArticles.map(({ post: similar, matchedTagLabel }) => (
              <article
                key={similar.id}
                onClick={() => {
                  setActivePost(similar);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="p-2.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-800/30 hover:bg-white dark:hover:bg-neutral-800/80 hover:border-orange-500/40 hover:shadow-xs transition-all cursor-pointer group flex gap-2.5 items-start"
              >
                {similar.imageUrl && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-100 dark:bg-neutral-800">
                    <img
                      src={similar.imageUrl}
                      alt={similar.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="font-extrabold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                      #{matchedTagLabel}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-2 leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {similar.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 dark:text-neutral-400">
                    <span
                      onClick={e => {
                        e.stopPropagation();
                        openUserProfile(similar.author);
                      }}
                      className="font-medium hover:underline truncate max-w-[90px]"
                    >
                      u/{similar.author}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Eye className="w-2.5 h-2.5 text-neutral-400" />
                      {(similar.views || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* 3. SECONDARY IN-SIDEBAR ADVERTISEMENT */}
      <GoogleAd format="sidebar" slotId={1} />

      {/* 4. FOOTER & EDITORIAL POLICIES */}
      <div className="pt-2 px-1 text-[11px] text-neutral-400 dark:text-neutral-500 space-y-2 border-t border-neutral-200/80 dark:border-neutral-800">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <button
            onClick={() => openPolicyPage('user-agreement')}
            className="hover:underline cursor-pointer hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            Editorial Code
          </button>
          <button
            onClick={() => openPolicyPage('privacy')}
            className="hover:underline cursor-pointer hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => openPolicyPage('terms')}
            className="hover:underline cursor-pointer hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            Terms of Service
          </button>
        </div>
        <p className="text-[10px] text-neutral-400">
          Bloggr News Network © 2026. All rights reserved.
        </p>
      </div>
    </aside>
  );
};
