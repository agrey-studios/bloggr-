import React, { useState, useMemo } from 'react';
import {
  X,
  Home,
  Newspaper,
  Flame,
  Trophy,
  MessageSquareQuote,
  PenSquare,
  Bookmark,
  Bell,
  Shield,
  Sparkles,
  Award,
  Globe,
  User,
  LogIn,
  LogOut,
  ChevronRight,
  CheckCircle2,
  UserPlus,
  UserCheck,
  ExternalLink,
  Mail,
  ArrowRight,
  Sun,
  Moon,
  Compass,
  Users,
  FileText,
  Scale,
  Cookie,
  Play,
  Share2,
} from 'lucide-react';
import { useBloggr } from '../context/BloggrContext';
import { RECOMMENDED_AUTHORS } from '../data/seedData';
import { VerifiedBadge } from './VerifiedBadge';
import { FontAwesomeIcon, faStar } from './FontAwesomeIcon';
import { PolicyPageId } from '../types';

export const MobileSideNav: React.FC = () => {
  const {
    isMobileSideNavOpen,
    closeMobileSideNav,
    theme,
    toggleTheme,
    currentUser,
    isAuthenticated,
    openUserProfile,
    closeUserProfile,
    setIsAuthModalOpen,
    setAuthModalMode,
    logout,
    openCreatePostModal,
    mainNavTab,
    setMainNavTab,
    activeFeed,
    setActiveFeed,
    feedTab,
    setFeedTab,
    timelineFilter,
    setTimelineFilter,
    categoriesList,
    openPolicyPage,
    openPolicyModal,
    setIsAuthorDirectoryOpen,
    isAuthorVerified,
    toggleFollowAuthor,
    isFollowingAuthor,
    setIsAdminDashboardOpen,
    showToast,
    platformBranding,
    setActivePost,
    setIsReelsOpen,
    notifications,
  } = useBloggr();

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [activeTab, setActiveTab] = useState<'sidebar' | 'footer'>('sidebar');

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      showToast('Please enter a valid email address');
      return;
    }
    setNewsletterSubscribed(true);
    showToast('Subscribed to the Bloggr Morning Wire!');
    setNewsletterEmail('');
  };

  const handleSelectNav = (tab: 'home' | 'news' | 'football' | 'opinion') => {
    closeUserProfile();
    setActivePost(null);
    setMainNavTab(tab);
    closeMobileSideNav();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (catSlug: string) => {
    closeUserProfile();
    setActivePost(null);
    setMainNavTab('news');
    setTimelineFilter(catSlug as any);
    closeMobileSideNav();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPolicy = (policyId: PolicyPageId) => {
    closeMobileSideNav();
    if (openPolicyModal) {
      openPolicyModal(policyId);
    } else {
      openPolicyPage(policyId);
    }
  };

  if (!isMobileSideNavOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={closeMobileSideNav}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Slide-out Sheet Panel */}
      <aside
        id="mobile-side-nav-drawer"
        className="relative z-10 w-[88vw] max-w-sm h-full bg-white dark:bg-[#121316] text-neutral-900 dark:text-neutral-100 flex flex-col shadow-2xl border-l border-neutral-200 dark:border-neutral-800 animate-in slide-in-from-right duration-250 ease-out"
        role="dialog"
        aria-label="Mobile Navigation & Platform Directory"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-[#121316]/95 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white flex items-baseline">
              {platformBranding.logoText || 'bloggr'}
              <span className="text-orange-500 font-black text-3xl ml-0.5 leading-none select-none">.</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50">
              Directory
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-600" />}
            </button>

            {/* Close Button */}
            <button
              onClick={closeMobileSideNav}
              className="p-2 rounded-full text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Section Tabs: Sidebar vs Footer */}
        <div className="flex items-center border-b border-neutral-200 dark:border-neutral-800 px-4 pt-2 bg-neutral-50 dark:bg-neutral-900/50">
          <button
            onClick={() => setActiveTab('sidebar')}
            className={`flex-1 pb-2.5 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'sidebar'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Sidebar & Feeds</span>
          </button>
          <button
            onClick={() => setActiveTab('footer')}
            className={`flex-1 pb-2.5 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'footer'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Footer & Policies</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-thin">
          
          {/* USER CARD / AUTH STRIP */}
          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div
                onClick={() => {
                  closeMobileSideNav();
                  openUserProfile(currentUser.username);
                }}
                className="flex items-center gap-2.5 cursor-pointer min-w-0"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.username}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-500/20"
                />
                <div className="min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white truncate">
                    {currentUser.displayName || currentUser.username}
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <span>@{currentUser.username}</span>
                    <span>•</span>
                    <span className="text-orange-500 font-semibold flex items-center gap-0.5">
                      <FontAwesomeIcon icon={faStar} className="w-2.5 h-2.5 text-amber-500" />
                      {(currentUser.karma?.total ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {isAuthenticated ? (
                <button
                  onClick={async () => {
                    await logout();
                    closeMobileSideNav();
                  }}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    closeMobileSideNav();
                    setAuthModalMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-orange-600 text-white font-bold text-xs hover:bg-orange-500 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Quick Profile & Saved Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  closeMobileSideNav();
                  openUserProfile(currentUser.username, 'articles');
                }}
                className="py-1.5 px-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:text-orange-500 flex items-center justify-center gap-1.5 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-neutral-500" />
                <span>My Profile</span>
              </button>

              <button
                onClick={() => {
                  closeMobileSideNav();
                  openUserProfile(currentUser.username, 'saved');
                }}
                className="py-1.5 px-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:text-orange-500 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Bookmark className="w-3.5 h-3.5 text-orange-500" />
                <span>Saved ({currentUser.savedPostIds?.length || 0})</span>
              </button>
            </div>
          </div>

          {/* CREATE STORY PROMINENT ACTION */}
          <button
            onClick={() => {
              closeMobileSideNav();
              openCreatePostModal('article');
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 active:scale-98 transition-all cursor-pointer"
          >
            <PenSquare className="w-4 h-4" />
            <span>Publish Article or Short Story</span>
          </button>

          {/* TAB CONTENT: SIDEBAR ITEMS */}
          {activeTab === 'sidebar' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* 1. Core Navigation Feeds */}
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase font-black tracking-wider text-neutral-400 dark:text-neutral-500 px-1">
                  Main News Hubs
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleSelectNav('home')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                      mainNavTab === 'home'
                        ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/60'
                        : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <Home className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span>Home Feed</span>
                  </button>

                  <button
                    onClick={() => handleSelectNav('news')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                      mainNavTab === 'news'
                        ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60'
                        : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <Newspaper className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span>News Wire</span>
                  </button>

                  <button
                    onClick={() => handleSelectNav('football')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                      mainNavTab === 'football'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                        : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <Trophy className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Football</span>
                  </button>

                  <button
                    onClick={() => handleSelectNav('opinion')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                      mainNavTab === 'opinion'
                        ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60'
                        : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <MessageSquareQuote className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span>Opinion</span>
                  </button>
                </div>
              </div>

              {/* 2. Content Filters & Formats */}
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase font-black tracking-wider text-neutral-400 dark:text-neutral-500 px-1">
                  Discover Formats
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      closeMobileSideNav();
                      setFeedTab('latest');
                      setActiveFeed('home');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <Flame className="w-4 h-4 text-amber-500" />
                      <span>Latest Breaking Wire</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                  </button>

                  <button
                    onClick={() => {
                      closeMobileSideNav();
                      setIsReelsOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <Play className="w-4 h-4 text-rose-500" />
                      <span>Video Shorts & Reels</span>
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                      Watch
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      closeMobileSideNav();
                      setFeedTab('following');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span>Followed Writers Stream</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                  </button>
                </div>
              </div>

              {/* 3. Channels / Topics (Shifted from Sidebar) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] uppercase font-black tracking-wider text-neutral-400 dark:text-neutral-500">
                    Topics & Channels
                  </span>
                  <span className="text-[10px] font-bold text-orange-500">{categoriesList.length} categories</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {categoriesList.slice(0, 10).map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat.slug)}
                      className="px-2.5 py-1.5 rounded-lg bg-neutral-100/80 dark:bg-neutral-800/60 hover:bg-orange-50 dark:hover:bg-orange-950/40 text-neutral-700 dark:text-neutral-300 hover:text-orange-600 dark:hover:text-orange-400 text-xs font-semibold truncate transition-colors text-left flex items-center justify-between"
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="text-[10px] text-neutral-400">›</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Popular Writers (Shifted from Sidebar) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] uppercase font-black tracking-wider text-neutral-400 dark:text-neutral-500">
                    Accredited Journalists
                  </span>
                  <button
                    onClick={() => {
                      closeMobileSideNav();
                      setIsAuthorDirectoryOpen(true);
                    }}
                    className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-2">
                  {RECOMMENDED_AUTHORS.slice(0, 4).map(author => {
                    const isFollowed = isFollowingAuthor(author.username);
                    return (
                      <div
                        key={author.username}
                        className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60"
                      >
                        <div
                          onClick={() => {
                            closeMobileSideNav();
                            openUserProfile(author.username);
                          }}
                          className="flex items-center gap-2 cursor-pointer min-w-0"
                        >
                          <img
                            src={author.avatar}
                            alt={author.displayName}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1 font-bold text-xs text-neutral-900 dark:text-white truncate">
                              <span className="truncate">{author.displayName}</span>
                              <VerifiedBadge isVerified={author.verified} size="xs" />
                            </div>
                            <div className="text-[10px] text-neutral-400 truncate">
                              {author.followersCount} followers
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleFollowAuthor(author.username)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer flex-shrink-0 ${
                            isFollowed
                              ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200'
                              : 'bg-orange-600 hover:bg-orange-500 text-white'
                          }`}
                        >
                          {isFollowed ? 'Following' : 'Follow'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Admin Dashboard shortcut */}
              {(currentUser.isAdmin || currentUser.isCreator) && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      closeMobileSideNav();
                      setIsAdminDashboardOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-neutral-900 text-white dark:bg-neutral-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-orange-400" />
                      <span>Admin & Editorial Hub</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: FOOTER & POLICIES (Shifted from Footer) */}
          {activeTab === 'footer' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Daily Intelligence Newsletter (Shifted from Footer) */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-neutral-900 dark:to-orange-950/30 border border-orange-200/80 dark:border-orange-900/50 space-y-2.5">
                <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 text-xs font-black">
                  <Mail className="w-3.5 h-3.5" />
                  <span>The Bloggr Morning Wire</span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-snug">
                  Get curated investigative reports, African market insights, and top creator essays directly to your inbox.
                </p>
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={e => setNewsletterEmail(e.target.value)}
                    placeholder="yourname@domain.com"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    {newsletterSubscribed ? 'Subscribed ✓' : 'Subscribe Free'}
                  </button>
                </form>
              </div>

              {/* Trust, Editorial & Legal Policies (Shifted from Footer) */}
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase font-black tracking-wider text-neutral-400 dark:text-neutral-500 px-1">
                  Trust, Ethics & Legal Policies
                </div>
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-900">
                  <button
                    onClick={() => handleOpenPolicy('editorial')}
                    className="w-full flex items-center justify-between p-3 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-500" />
                      <span className="font-semibold">Editorial Guidelines & Fact-Checking</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                  </button>

                  <button
                    onClick={() => handleOpenPolicy('monetization')}
                    className="w-full flex items-center justify-between p-3 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
                  >
                    <span className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span className="font-semibold">Monetization & 65/35 Creator Split</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                  </button>

                  <button
                    onClick={() => handleOpenPolicy('privacy')}
                    className="w-full flex items-center justify-between p-3 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
                  >
                    <span className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-500" />
                      <span className="font-semibold">Privacy Policy</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                  </button>

                  <button
                    onClick={() => handleOpenPolicy('terms')}
                    className="w-full flex items-center justify-between p-3 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
                  >
                    <span className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold">Terms of Service</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                  </button>

                  <button
                    onClick={() => handleOpenPolicy('content-policy')}
                    className="w-full flex items-center justify-between p-3 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
                  >
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-500" />
                      <span className="font-semibold">Content Standards & Moderation</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                  </button>

                  <button
                    onClick={() => handleOpenPolicy('cookies')}
                    className="w-full flex items-center justify-between p-3 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
                  >
                    <span className="flex items-center gap-2">
                      <Cookie className="w-4 h-4 text-amber-600" />
                      <span className="font-semibold">Cookie Policy & Preferences</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                  </button>
                </div>
              </div>

              {/* Media Network & Bureaus (Shifted from Footer) */}
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
                <div className="flex items-center gap-1.5 text-neutral-900 dark:text-white font-bold text-xs">
                  <Globe className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Bloggr Media Network Bureaus</span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Independent journalistic news wire combining accredited field dispatches, real-time sports coverage, and community-driven essays across Africa, the UK, and global capitals.
                </p>
                <div className="flex items-center gap-2 pt-1 text-[10px] font-mono text-neutral-400">
                  <span>Nairobi</span> • <span>London</span> • <span>Cape Town</span> • <span>Lagos</span>
                </div>
              </div>

              {/* Copyright & Disclaimer */}
              <div className="text-center space-y-1 text-[11px] text-neutral-400 pt-2 pb-6">
                <div>© 2026 Bloggr Media Network Ltd.</div>
                <div>All rights reserved. Verified independent reporting.</div>
              </div>
            </div>
          )}

        </div>
      </aside>
    </div>
  );
};
