import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowLeft,
  X,
  Share2,
  Bookmark,
  BookmarkCheck,
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Flame,
  Zap,
  UserPlus,
  UserCheck,
  Award,
  Coins,
  Flag,
  ChevronLeft,
  ChevronRight,
  Check,
  ZoomIn,
  Link2,
  Copy,
  Mail,
  Send,
  Globe,
  MessageCircle,
  ExternalLink,
  Smartphone,
  Sparkles,
  Bot,
  FileText,
  Loader2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Heart,
  Smile,
} from 'lucide-react';
import Markdown from 'react-markdown';
import { Post, calculateArticleEarnings } from '../types';
import { useBloggr } from '../context/BloggrContext';
import { CommentTree } from './CommentTree';
import { GoogleAd } from './GoogleAd';
import { VerifiedBadge } from './VerifiedBadge';
import { getAuthorFirstName } from '../utils/authorUtils';

interface OperaArticleReaderProps {
  post: Post;
  onClose: () => void;
}

export const OperaArticleReader: React.FC<OperaArticleReaderProps> = ({ post, onClose }) => {
  const {
    votePost,
    toggleSavePost,
    openUserProfile,
    toggleFollowAuthor,
    isFollowingAuthor,
    currentUser,
    showToast,
    posts,
    setActivePost,
    openAwardModal,
    isAuthorVerified,
    openReportModal,
    isPostReported,
  } = useBloggr();

  // Reading settings: Font size (Small: 15px, Normal: 17px, Large: 20px)
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xl'>('normal');
  const [isCopied, setIsCopied] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const relatedScrollRef = useRef<HTMLDivElement>(null);

  // Google Gemini API: Executive Summary State
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiExpanded, setIsAiExpanded] = useState(false);

  // Reading scroll depth progress bar
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        setReadingProgress(Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Previous and Next Post for continuous reading
  const currentIndex = posts.findIndex(p => p.id === post.id);
  const prevPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const nextPost = currentIndex >= 0 && currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && prevPost) {
        setActivePost(prevPost);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (e.key === 'ArrowRight' && nextPost) {
        setActivePost(nextPost);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (e.key.toLowerCase() === 's') {
        toggleSavePost(post.id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevPost, nextPost, post.id, onClose, setActivePost, toggleSavePost]);

  // Web Speech API: Audio Dispatch Narrator State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPausedAudio, setIsPausedAudio] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState<number>(1.0);

  // Stop speech synthesis when post changes or component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [post.id]);

  const handlePlayAudio = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      showToast('Text-to-speech is not supported on this browser');
      return;
    }

    if (isPausedAudio) {
      window.speechSynthesis.resume();
      setIsPausedAudio(false);
      setIsPlayingAudio(true);
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.pause();
      setIsPausedAudio(true);
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanContent = (post.content || '').replace(/[#*`_\[\]()]/g, ' ');
    const fullText = `${post.title}. Reported by ${post.author}. ${cleanContent || post.summary || ''}`;
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = audioSpeed;
    utterance.onend = () => {
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
    };
    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
    };
    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
    setIsPausedAudio(false);
    showToast('Playing audio dispatch');
  };

  const handleStopAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setIsPausedAudio(false);
  };

  const handleCycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5];
    const nextIdx = (speeds.indexOf(audioSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setAudioSpeed(nextSpeed);
    if (isPlayingAudio) {
      handleStopAudio();
      setTimeout(() => {
        handlePlayAudio();
      }, 50);
    }
  };

  // Community Sentiments / Micro-Reactions
  const [userReactions, setUserReactions] = useState<{ [key: string]: boolean }>(() => {
    try {
      const saved = localStorage.getItem(`bloggr_reactions_${post.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [reactionCounts, setReactionCounts] = useState<{ [key: string]: number }>(() => {
    return {
      fire: Math.floor((post.score || 10) * 0.4) + 12,
      insight: Math.floor((post.score || 10) * 0.25) + 8,
      clap: Math.floor((post.score || 10) * 0.3) + 15,
      mindblown: Math.floor((post.score || 10) * 0.1) + 4,
      heart: Math.floor((post.score || 10) * 0.2) + 9,
    };
  });

  const handleToggleReaction = (reactionKey: string) => {
    const wasActive = Boolean(userReactions[reactionKey]);
    const nextState = { ...userReactions, [reactionKey]: !wasActive };
    setUserReactions(nextState);
    setReactionCounts(prev => ({
      ...prev,
      [reactionKey]: prev[reactionKey] + (wasActive ? -1 : 1),
    }));
    try {
      localStorage.setItem(`bloggr_reactions_${post.id}`, JSON.stringify(nextState));
    } catch (e) {
      console.warn('Reaction save notice:', e);
    }
    showToast(wasActive ? 'Reaction removed' : 'Reaction recorded!');
  };

  const handleToggleAiSummary = async () => {
    if (isAiExpanded) {
      setIsAiExpanded(false);
      return;
    }
    setIsAiExpanded(true);
    if (aiSummary) return;

    setIsAiLoading(true);
    try {
      const res = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: post.title,
          content: post.content || post.title,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiSummary(data.summary);
        showToast('Key Takeaways generated');
      } else {
        setAiSummary(`• Verified field dispatch by ${post.author}\n• Categorized under ${post.category || 'News Wire'}\nKey Takeaway: Direct coverage of developments shaping the continent.`);
      }
    } catch (e) {
      setAiSummary(`• Instant briefing for "${post.title}"\n• Reported by correspondent ${post.author}\nKey Takeaway: Fast-breaking story with ongoing updates.`);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setIsShareMenuOpen(false);
      }
    };
    if (isShareMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isShareMenuOpen]);

  const isFollowing = isFollowingAuthor(post.author);
  const isSelf = post.author.toLowerCase() === currentUser.username.toLowerCase();
  const isSaved = currentUser.savedPostIds.includes(post.id);
  const isUpvoted = post.userVote === 'up';
  const isDownvoted = post.userVote === 'down';
  const isAuthorAccredited = isSelf
    ? Boolean(currentUser.isVerified)
    : Boolean(isAuthorVerified(post.author) || post.authorVerified);
  const isReported = isPostReported(post.id);
  const authorFirstName = useMemo(() => getAuthorFirstName(post.author), [post.author]);

  // Split markdown content into logical paragraph blocks
  const contentParagraphs = useMemo(() => {
    if (!post.content) return [];
    return post.content
      .split(/\n\s*\n/)
      .map(b => b.trim())
      .filter(b => b.length > 0);
  }, [post.content]);

  // Related articles from similar tags (tags, category, topics), up to 10 articles
  const relatedArticles = useMemo(() => {
    const activeTags = (post.tags || (post.flair ? [post.flair] : [])).map(t => t.toLowerCase());
    const activeCat = post.category?.toLowerCase() || '';
    const activeComm = post.communityId?.toLowerCase() || '';
    const titleWords = post.title.toLowerCase().split(/[^a-zA-Z0-9]+/).filter(w => w.length > 3);

    const scored = posts
      .filter(p => p.id !== post.id)
      .map(p => {
        let score = 0;
        const pTags = (p.tags || (p.flair ? [p.flair] : [])).map(t => t.toLowerCase());
        const pCat = p.category?.toLowerCase() || '';
        const pComm = p.communityId?.toLowerCase() || '';
        const pText = (p.title + ' ' + (p.summary || '')).toLowerCase();

        // 1. Direct tag overlaps (highest priority)
        const matchingTags = activeTags.filter(t => pTags.some(pt => pt === t || pt.includes(t) || t.includes(pt)));
        score += matchingTags.length * 35;

        // 2. Category match
        if (activeCat && pCat && activeCat === pCat) {
          score += 15;
        }

        // 3. Community match
        if (activeComm && pComm && activeComm === pComm) {
          score += 10;
        }

        // 4. Keyword tag overlaps
        for (const w of titleWords) {
          if (pText.includes(w)) {
            score += 3;
          }
        }

        return { post: p, score };
      });

    // Sort by relevance score, with tie-breaker by score/views
    scored.sort((a, b) => b.score - a.score || b.post.score - a.post.score);
    return scored.slice(0, 10).map(s => s.post);
  }, [posts, post]);

  const articleUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard?.writeText(articleUrl);
    setIsCopied(true);
    showToast('Article link copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`${post.title} - Read on Bloggr: ${articleUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(post.title);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(articleUrl)}&via=BloggrNews`, '_blank');
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`, '_blank');
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(post.title);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(articleUrl)}&text=${text}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`, '_blank');
  };

  const handleShareReddit = () => {
    window.open(`https://reddit.com/submit?url=${encodeURIComponent(articleUrl)}&title=${encodeURIComponent(post.title)}`, '_blank');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(post.title);
    const body = encodeURIComponent(`Check out this story on Bloggr:\n\n"${post.title}"\n\nRead here: ${articleUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.summary || post.title,
          url: articleUrl,
        });
      } catch {
        // User cancelled or unsupported
      }
    } else {
      handleCopyLink();
    }
  };

  // Font size class mapper - optimized for reading legibility
  const bodyTextClass = {
    normal: 'text-sm sm:text-base leading-relaxed sm:leading-[1.75]',
    large: 'text-base sm:text-lg leading-relaxed sm:leading-[1.8]',
    xl: 'text-lg sm:text-xl leading-relaxed sm:leading-[1.85]',
  }[fontSize];

  return (
    <div className="w-full bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden animate-in fade-in duration-200 relative">
      {/* Sticky Reading Depth Progress Bar */}
      <div className="sticky top-0 z-40 w-full h-1 bg-neutral-100 dark:bg-neutral-800">
        <div
          className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* 1. TOP MINIMAL NAVIGATION */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-2 border-b border-neutral-100 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 py-1 text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-orange-500" />
          <span>Back to Feed</span>
        </button>

        <button
          onClick={onClose}
          className="p-1 rounded-full text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
          title="Close article"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. ARTICLE READER CONTENT (No excessive top margin) */}
      <div className="px-3 sm:px-8 md:px-12 pt-2 sm:pt-4 pb-6 space-y-4 sm:space-y-6">
        
        {/* Article Headline */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-neutral-900 dark:text-white leading-tight sm:leading-snug">
          {post.title}
        </h1>

        {/* Title Byline: Author, Verified Badge, Follow, Date, Read Time (Zoom removed) */}
        <div className="flex items-center justify-between flex-wrap gap-2.5 sm:gap-3 py-1.5 text-xs border-b border-neutral-100 dark:border-neutral-800/60 pb-3">
          <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
            <div
              onClick={() => openUserProfile(post.author)}
              className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white group cursor-pointer hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              <div className="relative flex-shrink-0">
                <img
                  src={post.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={authorFirstName}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-orange-500/20"
                />
                {isAuthorAccredited && (
                  <span className="w-3.5 h-3.5 rounded-full bg-orange-500 text-white flex items-center justify-center absolute -bottom-0.5 -right-0.5 ring-1.5 ring-white dark:ring-neutral-900 shadow-xs">
                    <Check className="w-2 h-2 stroke-[3]" />
                  </span>
                )}
              </div>
              <span className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100">{authorFirstName}</span>
              <VerifiedBadge isVerified={isAuthorAccredited} role={post.authorRole} size="xs" />
            </div>

            {!isSelf && (
              <button
                onClick={() => toggleFollowAuthor(post.author)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isFollowing
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700'
                    : 'bg-orange-600 hover:bg-orange-500 text-white shadow-xs'
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-3 h-3" />
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

            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">{post.createdAt}</span>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">{post.readTimeMinutes || 3} min read</span>
          </div>
        </div>

        {/* Interactive Audio Dispatch Narrator Bar */}
        <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={handlePlayAudio}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0 cursor-pointer shadow-xs ${
                isPlayingAudio
                  ? 'bg-orange-500 text-white animate-pulse'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
              title={isPlayingAudio ? 'Pause narration' : 'Listen to story (Audio Narrator)'}
            >
              {isPlayingAudio ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-orange-500" />
                  <span>Audio Dispatch Narrator</span>
                </span>
                {isPlayingAudio && (
                  <span className="flex items-center gap-0.5 h-3">
                    <span className="w-0.5 bg-orange-500 rounded-full animate-eq-1"></span>
                    <span className="w-0.5 bg-orange-500 rounded-full animate-eq-2"></span>
                    <span className="w-0.5 bg-orange-500 rounded-full animate-eq-3"></span>
                    <span className="w-0.5 bg-orange-500 rounded-full animate-eq-4"></span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                {isPlayingAudio ? 'Narrating article...' : isPausedAudio ? 'Playback paused' : `Listen to ${post.readTimeMinutes || 3} min narration`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleCycleSpeed}
              className="px-2 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-[11px] font-mono font-bold text-neutral-700 dark:text-neutral-200 transition-colors"
              title="Change speech rate"
            >
              {audioSpeed}x
            </button>
            {(isPlayingAudio || isPausedAudio) && (
              <button
                onClick={handleStopAudio}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                title="Stop narration"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Lead Image & Credit */}
        {post.imageUrl && (
          <div className="space-y-1">
            <div className="overflow-hidden rounded-xl sm:rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800">
              <img
                src={post.imageUrl}
                alt={post.title}
                referrerPolicy="no-referrer"
                className="w-full aspect-[21/9] object-cover"
                loading="eager"
              />
            </div>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 italic text-center px-2">
              Photo credit: Bloggr / {post.communityId} Special Reporting Dispatch
            </p>
          </div>
        )}

        {/* MAIN ARTICLE TEXT WITH GOOGLE AD INJECTION */}
        <div className={`prose dark:prose-invert max-w-none text-neutral-800 dark:text-neutral-200 ${bodyTextClass} space-y-2.5 sm:space-y-3`}>
          {contentParagraphs.length > 0 ? (
            <div className="space-y-4">
              {contentParagraphs.map((para, idx) => {
                const pNum = idx + 1;
                // Inject Google Ad after P2, and after every 3 paragraphs thereafter: P2, P5, P8...
                const shouldInjectAd = pNum === 2 || (pNum > 2 && (pNum - 2) % 3 === 0);

                return (
                  <React.Fragment key={idx}>
                    <div className={`markdown-body ${idx === 0 ? 'first-letter:text-4xl first-letter:font-editorial first-letter:font-bold first-letter:float-left first-letter:mr-2.5 first-letter:text-orange-500 first-letter:leading-none' : ''}`}>
                      <Markdown>{para}</Markdown>
                    </div>

                    {shouldInjectAd && (
                      <div className="my-6">
                        <GoogleAd
                          slotId={`article-ad-${post.id}-p${pNum}`}
                          format="in-article"
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          ) : (
            <div className="markdown-body">
              <Markdown>{post.content || 'Article details and reporting notes loading...'}</Markdown>
            </div>
          )}

          {/* Pull quote */}
          <blockquote className="border-l-4 border-orange-500 pl-4 py-2 my-5 italic text-neutral-700 dark:text-neutral-300 bg-orange-50/40 dark:bg-orange-950/20 rounded-r-xl">
            "{post.title}"
            <footer className="mt-2 text-xs font-bold text-neutral-500 dark:text-neutral-400 not-italic">
              — {authorFirstName}, Special Correspondent
            </footer>
          </blockquote>
        </div>

        {/* COMMUNITY SENTIMENTS & MICRO-REACTIONS */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-900 dark:text-white">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>Community Sentiment: How do you react to this report?</span>
            </span>
            <span className="text-[11px] text-neutral-400 font-normal hidden sm:inline">Tap to react</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {[
              { key: 'fire', emoji: '🔥', label: 'Breaking' },
              { key: 'insight', emoji: '💡', label: 'Insightful' },
              { key: 'clap', emoji: '👏', label: 'Well Reported' },
              { key: 'mindblown', emoji: '⚡', label: 'Impactful' },
              { key: 'heart', emoji: '❤️', label: 'Inspiring' },
            ].map(item => {
              const isActive = Boolean(userReactions[item.key]);
              const count = reactionCounts[item.key] || 0;

              return (
                <button
                  key={item.key}
                  onClick={() => handleToggleReaction(item.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-orange-500/15 border-orange-500 text-orange-600 dark:text-orange-400 scale-105 shadow-xs'
                      : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-orange-300 dark:hover:border-orange-800 hover:scale-[1.02]'
                  }`}
                >
                  <span className="text-sm">{item.emoji}</span>
                  <span>{item.label}</span>
                  <span className="font-mono text-[10px] text-neutral-400 font-semibold">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. ARTICLE ENGAGEMENT & REACTION BAR */}
        <div className="pt-5 sm:pt-6 border-t border-neutral-200 dark:border-neutral-800 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Left: Helpful voting pill + Report button grouped and aligned */}
            <div className="flex items-center justify-between sm:justify-start gap-2.5">
              {/* Helpful / Upvote & Downvote Counter */}
              <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-full p-1 border border-neutral-200 dark:border-neutral-700">
                <button
                  onClick={() => votePost(post.id, 'up')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs transition-colors cursor-pointer ${
                    isUpvoted
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-300 hover:text-orange-600'
                  }`}
                  title="Upvote as Helpful"
                >
                  <ArrowBigUp className="w-4 h-4" />
                  <span>Helpful ({post.score})</span>
                </button>

                <button
                  onClick={() => votePost(post.id, 'down')}
                  className={`p-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                    isDownvoted
                      ? 'bg-blue-600 text-white'
                      : 'text-neutral-400 hover:text-blue-500'
                  }`}
                  title="Downvote"
                >
                  <ArrowBigDown className="w-4 h-4" />
                </button>
              </div>

              {/* Report Button */}
              <button
                onClick={() => openReportModal(post)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  isReported
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40'
                    : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-neutral-200 dark:border-neutral-700'
                }`}
                title="Report this article"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{isReported ? 'Reported' : 'Report'}</span>
              </button>
            </div>

            {/* Right: Share Items (WhatsApp, Facebook, Copy Link - all 100% visible and well-aligned on mobile) */}
            <div className="grid grid-cols-3 sm:flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
              {/* 1. WhatsApp */}
              <button
                onClick={handleShareWhatsApp}
                className="justify-center px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl sm:rounded-full text-xs font-bold bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                title="Share on WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">WhatsApp</span>
              </button>

              {/* 2. Facebook */}
              <button
                onClick={handleShareFacebook}
                className="justify-center px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl sm:rounded-full text-xs font-bold bg-[#1877F2] hover:bg-[#166fe5] active:scale-95 text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                title="Share on Facebook"
              >
                <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Facebook</span>
              </button>

              {/* 3. Copy Link */}
              <button
                onClick={handleCopyLink}
                className={`justify-center px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border ${
                  isCopied
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 border-neutral-200 dark:border-neutral-700'
                }`}
                title="Copy direct story link"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-white flex-shrink-0" /> : <Copy className="w-3.5 h-3.5 flex-shrink-0" />}
                <span className="truncate">{isCopied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Editorial Disclaimer */}
          <div className="p-3 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/40 text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed border border-neutral-200/50 dark:border-neutral-700/50">
            <strong>Editorial Disclaimer:</strong> The views and opinions expressed in this article are solely those of the author (u/{post.author}) and do not necessarily reflect the official policy or position of Bloggr.
          </div>

          {/* Next Up Continuous Reading Card */}
          {nextPost && (
            <div
              onClick={() => {
                setActivePost(nextPost);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="p-4 rounded-2xl border border-orange-200 dark:border-orange-900/60 bg-gradient-to-r from-orange-50/60 to-white dark:from-neutral-900 dark:to-orange-950/20 flex items-center justify-between gap-4 cursor-pointer hover:border-orange-500 transition-all group"
            >
              <div className="space-y-1 min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  Next Story · {nextPost.category || 'News'}
                </span>
                <h4 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white group-hover:text-orange-600 transition-colors line-clamp-1">
                  {nextPost.title}
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  By {nextPost.author} · {nextPost.readTimeMinutes || 3} min read
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs group-hover:bg-orange-500 transition-colors flex-shrink-0 shadow-xs">
                <span>Read Next</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>

        {/* 4. RELATED ARTICLES (Scrollable grid up to 10 articles based on similar tags) */}
        {relatedArticles.length > 0 && (
          <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-4 bg-orange-500 rounded-full" />
                  Related Articles
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Stories matching {post.flair ? `#${post.flair}` : post.category || 'News'} tags
                </p>
              </div>

              {/* Grid Scroll Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    if (relatedScrollRef.current) {
                      relatedScrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
                    }
                  }}
                  className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors"
                  title="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (relatedScrollRef.current) {
                      relatedScrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
                    }
                  }}
                  className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors"
                  title="Scroll right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Grid Container */}
            <div
              ref={relatedScrollRef}
              className="flex gap-3.5 overflow-x-auto pb-3 pt-1 px-0.5 scroll-smooth snap-x scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {relatedArticles.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setActivePost(item);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex-shrink-0 w-[240px] sm:w-[280px] snap-start p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-850 hover:border-orange-500/60 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    {item.imageUrl ? (
                      <div className="overflow-hidden rounded-lg aspect-[21/9] sm:aspect-video mb-2.5 bg-neutral-100 dark:bg-neutral-800">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="rounded-lg aspect-[21/9] sm:aspect-video mb-2.5 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 flex items-center justify-center text-orange-500 text-xs font-bold">
                        {item.flair || item.category || 'Dispatch'}
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      {item.flair && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-900/40">
                          #{item.flair}
                        </span>
                      )}
                      <span className="text-[10px] text-neutral-400 font-medium truncate max-w-[110px]">
                        {item.category || item.communityId}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h4>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
                    <div className="flex items-center gap-1 truncate max-w-[130px]">
                      <span className="truncate">u/{item.author}</span>
                      <VerifiedBadge isVerified={Boolean(item.authorVerified || isAuthorVerified(item.author))} size="xs" />
                    </div>
                    <div className="flex items-center gap-1 font-medium">
                      <span>{item.createdAt}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. DISCUSSION & COMMENTS SECTION */}
        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-base text-neutral-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-orange-600" />
              <span>Reader Community Reactions ({post.commentsCount})</span>
            </h3>
            <span className="text-xs text-neutral-400 font-medium">Live Reader Discussion</span>
          </div>

          <CommentTree post={post} />
        </div>
      </div>
    </div>
  );
};
