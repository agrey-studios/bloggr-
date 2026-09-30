import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Sparkles,
  Award,
  MessageSquare,
  ArrowBigUp,
  Bookmark,
  FileText,
  CheckCircle2,
  Clock,
  ShieldCheck,
  PenSquare,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Send,
  UserCheck,
  UserX,
  RefreshCw,
  PlusCircle,
  UserPlus,
  Users,
  Settings,
  Bell,
  Mail,
  Zap,
  LogOut,
  LogIn,
  Sliders,
  Radio,
  Eye,
  Globe,
  Coins,
  Wallet,
  TrendingUp,
  Smartphone,
  Check,
  ChevronRight,
  Info,
  Camera,
  Search,
  HeartHandshake,
  BarChart3,
  BookmarkCheck,
  Cloud,
  CheckCheck,
  Trash2,
  Filter,
  BookOpen,
} from 'lucide-react';
import { useBloggr } from '../context/BloggrContext';
import { PostCard } from './PostCard';
import { VerifiedBadge } from './VerifiedBadge';
import { AvatarChangeModal } from './AvatarChangeModal';
import { AuthorPerformanceStats } from './AuthorPerformanceStats';
import {
  NewsCategory,
  NEWS_CATEGORIES_CONFIG,
  calculateArticleEarnings,
  EARNINGS_VIEW_THRESHOLD,
  EARNINGS_VIEWS_PER_KSH,
  AUTHOR_SHARE_RATIO,
  ADMIN_SHARE_RATIO,
} from '../types';

export const ProfilePage: React.FC = () => {
  const {
    closeUserProfile,
    profileTargetUser,
    currentUser,
    posts,
    comments,
    creatorApplications,
    applyForCreator,
    approveCreatorApplication,
    rejectCreatorApplication,
    toggleUserCreatorStatus,
    setIsCreatePostOpen,
    showToast,
    toggleFollowAuthor,
    isFollowingAuthor,
    openUserProfile,
    isAuthenticated,
    logout,
    setIsAuthModalOpen,
    setAuthModalMode,
    updateProfileSettings,
    setActivePost,
    markAuthorVerified,
    isAuthorVerified,
    toggleSavePost,
    markReadLaterStatus,
    clearReadLater,
    syncReadLaterWithFirestore,
    firestoreSyncState,
    lastFirestoreSync,
    profileInitialTab,
  } = useBloggr();

  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'earnings' | 'settings' | 'following' | 'creator' | 'admin' | 'stats'>('posts');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [adminAuthorSearch, setAdminAuthorSearch] = useState('');
  const [customVerifyUsername, setCustomVerifyUsername] = useState('');
  const [customVerifyRole, setCustomVerifyRole] = useState('Senior Correspondent');

  // Profile Settings Form State
  const [editDisplayName, setEditDisplayName] = useState(currentUser.displayName || '');
  const [editBio, setEditBio] = useState(currentUser.bio || '');
  const [editFavoriteCategory, setEditFavoriteCategory] = useState<NewsCategory>(currentUser.favoriteCategory || 'Kenya News');
  const [editEmailNotifications, setEditEmailNotifications] = useState(currentUser.emailNotifications ?? true);
  const [editBreakingAlerts, setEditBreakingAlerts] = useState(currentUser.breakingNewsAlerts ?? true);
  const [editDataSaver, setEditDataSaver] = useState(currentUser.dataSaverMode ?? false);

  // Creator Application Form State
  const [appCategory, setAppCategory] = useState('Kenya News');
  const [appBio, setAppBio] = useState('');
  const [appTopic, setAppTopic] = useState('');
  const [appPortfolio, setAppPortfolio] = useState('');

  const isSelf = !profileTargetUser || profileTargetUser.toLowerCase() === currentUser.username.toLowerCase();
  const targetUsername = profileTargetUser || currentUser.username;

  // Ensure private creator dashboard tabs are strictly unavailable when viewing another user
  useEffect(() => {
    if (!isSelf && (activeTab === 'earnings' || activeTab === 'settings' || activeTab === 'admin' || activeTab === 'saved')) {
      setActiveTab('posts');
    }
  }, [isSelf, activeTab]);

  // Handle external tab requests like opening profile directly with 'saved'
  useEffect(() => {
    if (profileInitialTab) {
      setActiveTab(profileInitialTab as any);
    }
  }, [profileInitialTab]);

  // Read Later List State
  const [readLaterFilter, setReadLaterFilter] = useState<'all' | 'unread' | 'completed'>('all');
  const [readLaterCategory, setReadLaterCategory] = useState<string>('all');
  const [readLaterSort, setReadLaterSort] = useState<'recent' | 'oldest' | 'reading_time_asc' | 'reading_time_desc'>('recent');
  const [readLaterSearch, setReadLaterSearch] = useState('');
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  const isTargetVerified = isSelf ? Boolean(currentUser.isVerified) : isAuthorVerified(targetUsername);
  const targetUserRole = isSelf ? currentUser.verifiedRole : (posts.find(p => p.author.toLowerCase() === targetUsername.toLowerCase())?.authorRole || 'Accredited Journalist');
  const isAuthorAccredited = isSelf ? Boolean(currentUser.isVerified) : isTargetVerified;

  // Filter authored posts
  const userPosts = posts.filter(p => p.author.toLowerCase() === targetUsername.toLowerCase());

  // Saved posts (for self) and Read Later calculations
  const readLaterItems = currentUser.readLaterItems || [];
  const savedPostIds = currentUser.savedPostIds || [];
  const savedPosts = posts.filter(p => savedPostIds.includes(p.id));

  const unreadCount = savedPosts.filter(p => {
    const item = readLaterItems.find(i => i.postId === p.id);
    return !item?.isRead;
  }).length;
  const completedCount = savedPosts.length - unreadCount;

  const totalUnreadReadingMinutes = savedPosts
    .filter(p => !readLaterItems.find(i => i.postId === p.id)?.isRead)
    .reduce((acc, p) => {
      const words = ((p.title || '') + ' ' + (p.content || '')).split(/\s+/).filter(Boolean).length;
      return acc + Math.max(1, Math.ceil(words / 200));
    }, 0);

  const savedCategories = Array.from(new Set(savedPosts.map(p => p.category).filter(Boolean))) as string[];

  const filteredSavedPosts = savedPosts
    .filter(p => {
      const item = readLaterItems.find(i => i.postId === p.id);
      const isCompleted = Boolean(item?.isRead);

      if (readLaterFilter === 'unread' && isCompleted) return false;
      if (readLaterFilter === 'completed' && !isCompleted) return false;

      if (readLaterCategory !== 'all' && p.category !== readLaterCategory) return false;

      if (readLaterSearch.trim()) {
        const query = readLaterSearch.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesAuthor = p.author.toLowerCase().includes(query);
        const matchesCategory = p.category?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesAuthor && !matchesCategory) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const itemA = readLaterItems.find(i => i.postId === a.id);
      const itemB = readLaterItems.find(i => i.postId === b.id);

      if (readLaterSort === 'recent') {
        const timeA = itemA?.savedAt ? new Date(itemA.savedAt).getTime() : 0;
        const timeB = itemB?.savedAt ? new Date(itemB.savedAt).getTime() : 0;
        return timeB - timeA;
      }
      if (readLaterSort === 'oldest') {
        const timeA = itemA?.savedAt ? new Date(itemA.savedAt).getTime() : 0;
        const timeB = itemB?.savedAt ? new Date(itemB.savedAt).getTime() : 0;
        return timeA - timeB;
      }
      const wordsA = ((a.title || '') + ' ' + (a.content || '')).split(/\s+/).filter(Boolean).length;
      const wordsB = ((b.title || '') + ' ' + (b.content || '')).split(/\s+/).filter(Boolean).length;
      if (readLaterSort === 'reading_time_asc') {
        return wordsA - wordsB;
      }
      if (readLaterSort === 'reading_time_desc') {
        return wordsB - wordsA;
      }
      return 0;
    });

  // Pending applications count for admin badge
  const pendingApps = creatorApplications.filter(a => a.status === 'pending');

  // Author Articles & Monetization Ledger (1 KSH per 180 views for articles > 1,000 views + Monetary Gifts, split 35/65)
  const userPostsEarnings = userPosts.map(p =>
    calculateArticleEarnings(p.views || 0, p.monetaryGiftsTotalKsh || 0, isAuthorAccredited)
  );

  const totalViews = userPosts.reduce((acc, p) => acc + (p.views || 0), 0);
  const totalMonetaryGiftsKsh = userPosts.reduce((acc, p) => acc + (p.monetaryGiftsTotalKsh || 0), 0);
  const totalGrossAdEarningsKsh = userPostsEarnings.reduce((acc, e) => acc + e.grossAdEarningsKsh, 0);
  const totalGrossEarningsKsh = totalGrossAdEarningsKsh + totalMonetaryGiftsKsh;

  const totalAuthorEarningsKsh = userPostsEarnings.reduce((acc, e) => acc + e.authorEarningsKsh, 0);
  const totalAdminShareKsh = userPostsEarnings.reduce((acc, e) => acc + e.adminEarningsKsh, 0);
  const authorGiftsShareKsh = totalMonetaryGiftsKsh * AUTHOR_SHARE_RATIO;
  const authorAdShareKsh = totalGrossAdEarningsKsh * AUTHOR_SHARE_RATIO;

  const totalPostInteractions = userPosts.reduce((acc, p) => acc + (p.score || 0) + (p.commentsCount || 0), 0);
  const avgEngagementPerPost = userPosts.length > 0 ? (totalPostInteractions / userPosts.length).toFixed(1) : '0';

  const eligiblePosts = isAuthorAccredited
    ? userPosts.filter(p => (p.views || 0) > EARNINGS_VIEW_THRESHOLD)
    : [];
  const withdrawnKsh = currentUser.wallet?.withdrawnTotalKsh || 0;
  const availableBalanceKsh = isAuthorAccredited ? Math.max(0, totalAuthorEarningsKsh - withdrawnKsh) : 0;

  // M-Pesa Withdrawal Form State
  const [mpesaNumber, setMpesaNumber] = useState(currentUser.wallet?.mpesaPhoneNumber || '0712345678');
  const [mpesaName, setMpesaName] = useState(currentUser.wallet?.mpesaFullName || currentUser.displayName || '');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawalSuccessMessage, setWithdrawalSuccessMessage] = useState<string | null>(null);

  const handleWithdrawMpesa = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid withdrawal amount in KSH.');
      return;
    }
    if (amount > availableBalanceKsh) {
      showToast(`Insufficient balance. Maximum available is KSH ${availableBalanceKsh.toFixed(2)}.`);
      return;
    }
    if (!mpesaNumber.trim()) {
      showToast('Please enter your Safaricom M-Pesa phone number.');
      return;
    }

    setIsWithdrawing(true);
    setTimeout(() => {
      setIsWithdrawing(false);
      const newWithdrawnTotal = (currentUser.wallet?.withdrawnTotalKsh || 0) + amount;
      updateProfileSettings({
        wallet: {
          mpesaPhoneNumber: mpesaNumber.trim(),
          mpesaFullName: mpesaName.trim() || currentUser.displayName,
          withdrawnTotalKsh: newWithdrawnTotal,
          lastPayoutDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        },
      });
      setWithdrawalSuccessMessage(`Dispatched KSH ${amount.toFixed(2)} to M-Pesa ${mpesaNumber.trim()} (${mpesaName || currentUser.displayName}). Safaricom Ref: MP${Date.now().toString().slice(-8)}.`);
      setWithdrawAmount('');
      showToast(`KSH ${amount.toFixed(2)} sent to M-Pesa ${mpesaNumber.trim()}!`);
    }, 1200);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileSettings({
      displayName: editDisplayName.trim() || currentUser.username,
      bio: editBio.trim(),
      favoriteCategory: editFavoriteCategory,
      emailNotifications: editEmailNotifications,
      breakingNewsAlerts: editBreakingAlerts,
      dataSaverMode: editDataSaver,
    });
  };

  const handleCreatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appBio.trim() || !appTopic.trim()) {
      showToast('Please provide your background and a sample news topic.');
      return;
    }
    applyForCreator({
      category: appCategory,
      bio: appBio.trim(),
      sampleTopic: appTopic.trim(),
      portfolioUrl: appPortfolio.trim() || undefined,
    });
  };

  return (
    <div id="user-profile-page" className="w-full max-w-4xl mx-auto space-y-4 pb-20">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between px-1">
        <button
          id="back-to-wire-btn"
          onClick={closeUserProfile}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-white dark:hover:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to News Wire</span>
        </button>

        <div className="flex items-center gap-2">
          {isSelf && isAuthenticated ? (
            <button
              id="profile-sign-out-btn"
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          ) : (
            <button
              id="profile-sign-in-btn"
              onClick={() => {
                setAuthModalMode('login');
                setIsAuthModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 shadow-sm transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        {/* Cover Banner */}
        <div className="h-36 sm:h-48 bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-4 right-4 text-xs font-mono px-2.5 py-1 rounded-full bg-black/40 text-white backdrop-blur-xs flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>Digital News Wire</span>
          </div>
        </div>

        {/* Profile Details Header */}
        <div className="px-5 sm:px-8 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-14 sm:-mt-16 mb-4 gap-3">
            <div className="relative group">
              <img
                src={
                  isSelf
                    ? currentUser.avatar
                    : (posts.find(p => p.author.toLowerCase() === targetUsername.toLowerCase())?.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80')
                }
                alt={targetUsername}
                referrerPolicy="no-referrer"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white dark:border-neutral-900 shadow-lg bg-neutral-200 dark:bg-neutral-800"
              />
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-900 absolute bottom-1 right-1" />

              {isSelf && (
                <button
                  type="button"
                  id="change-avatar-btn"
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1 backdrop-blur-xs cursor-pointer"
                  title="Change Profile Picture"
                >
                  <Camera className="w-5 h-5 text-white" />
                  <span>Change Photo</span>
                </button>
              )}
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2">
              {isSelf ? (
                <>
                  <button
                    id="profile-tab-settings-quick"
                    onClick={() => setActiveTab('settings')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-all"
                  >
                    <Settings className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Settings & Alerts</span>
                  </button>

                  <button
                    id="profile-create-dispatch-btn"
                    onClick={() => setIsCreatePostOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white shadow-sm transition-all"
                  >
                    <PenSquare className="w-3.5 h-3.5" />
                    <span>New Dispatch</span>
                  </button>
                </>
              ) : (
                <button
                  id={`profile-follow-${targetUsername}`}
                  onClick={() => toggleFollowAuthor(targetUsername)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    isFollowingAuthor(targetUsername)
                      ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700'
                      : 'bg-orange-600 hover:bg-orange-500 text-white'
                  }`}
                >
                  {isFollowingAuthor(targetUsername) ? (
                    <>
                      <UserCheck className="w-4 h-4 text-emerald-500" />
                      <span>Following Author</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Follow Author</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* User Bio & Meta */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
                {isSelf ? currentUser.displayName : targetUsername}
              </h1>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                @{targetUsername}
              </span>
              <VerifiedBadge
                isVerified={isTargetVerified}
                role={targetUserRole}
                variant="pill"
                size="sm"
              />
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 max-w-2xl leading-relaxed">
              {isSelf ? currentUser.bio : 'Contributing author & journalist dispatching breaking reports to the wire.'}
            </p>

            {/* Admin Quick Action for this Author */}
            {currentUser.isAdmin && (
              <div className="mt-3 p-3.5 rounded-xl bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/40 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <div>
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">
                      Admin Verification Control:
                    </span>
                    <span className="ml-1.5 text-xs text-neutral-600 dark:text-neutral-300">
                      {isTargetVerified ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          Accredited as {targetUserRole || 'Verified Author'} (Monetization active)
                        </span>
                      ) : (
                        <span className="text-neutral-500">
                          Unverified Author (Cannot monetize content)
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const newStatus = !isTargetVerified;
                      markAuthorVerified(targetUsername, newStatus, newStatus ? targetUserRole : undefined);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                      isTargetVerified
                        ? 'bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {isTargetVerified ? (
                      <>
                        <UserX className="w-3.5 h-3.5" />
                        <span>Revoke Verification</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark as Verified Author</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 pt-1">
              {isSelf && currentUser.email && (
                <div className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{currentUser.email}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <span>Joined {isSelf ? currentUser.cakeDay : 'October 2023'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {isSelf ? currentUser.karma.total.toLocaleString() : (userPosts.length * 420).toLocaleString()} Karma
                </span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <span>{userPosts.length} Published Stories</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Tabs Navigation */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 px-5 sm:px-8 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            id="tab-dispatches"
            onClick={() => setActiveTab('posts')}
            className={`py-3 px-3 border-b-2 text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'posts'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Dispatches ({userPosts.length})</span>
          </button>

          <button
            id="tab-author-stats"
            onClick={() => setActiveTab('stats')}
            className={`py-3 px-3 border-b-2 text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'stats'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-orange-500" />
            <span>Performance & Analytics</span>
          </button>

          {isSelf && (
            <button
              id="tab-saved-stories"
              onClick={() => setActiveTab('saved')}
              className={`py-3 px-3 border-b-2 text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'saved'
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-orange-500" />
              <span>Saved ({savedPosts.length})</span>
            </button>
          )}

          {isSelf && (
            <button
              id="tab-creator-earnings"
              onClick={() => setActiveTab('earnings')}
              className={`py-3 px-3 border-b-2 text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'earnings'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span>Earnings (KSH {availableBalanceKsh.toFixed(0)})</span>
            </button>
          )}

          {isSelf && (
            <button
              id="tab-profile-settings"
              onClick={() => setActiveTab('settings')}
              className={`py-3 px-3 border-b-2 text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Settings & Preferences</span>
            </button>
          )}

          {isSelf && (
            <button
              id="tab-following-authors"
              onClick={() => setActiveTab('following')}
              className={`py-3 px-3 border-b-2 text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'following'
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Following ({currentUser.followingAuthors?.length || 0})</span>
            </button>
          )}

          {isSelf && (
            <button
              id="tab-creator-status"
              onClick={() => setActiveTab('creator')}
              className={`py-3 px-3 border-b-2 text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'creator'
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Journalist Desk</span>
            </button>
          )}

          {isSelf && currentUser.isAdmin && (
            <button
              id="tab-admin-desk"
              onClick={() => setActiveTab('admin')}
              className={`py-3 px-3 border-b-2 text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'admin'
                  ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              <span>Admin Queue {pendingApps.length > 0 && `(${pendingApps.length})`}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="space-y-4">
        {/* 1. DISPATCHES TAB */}
        {activeTab === 'posts' && (
          <div className="space-y-3">
            {/* Quick Author Performance Snapshot Bar */}
            {userPosts.length > 0 && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 dark:from-neutral-900 dark:via-neutral-850 dark:to-neutral-900 border border-orange-200/80 dark:border-neutral-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                        Author Performance Metrics
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-600/10 text-orange-600 dark:text-orange-400">
                        {userPosts.length} stories published
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-600 dark:text-neutral-300 mt-1">
                      <span>
                        <strong className="text-neutral-900 dark:text-white">{totalViews.toLocaleString()}</strong> total views
                      </span>
                      <span>•</span>
                      <span>
                        <strong className="text-neutral-900 dark:text-white">{avgEngagementPerPost}</strong> avg engagement/post
                      </span>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" /> +18.4% reach velocity
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  id="view-full-performance-stats-btn"
                  onClick={() => setActiveTab('stats')}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-xs transition-all flex-shrink-0 cursor-pointer"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>View Full Analytics</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {isSelf && userPosts.length > 0 && (
              <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800/40 flex-shrink-0">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white">
                        Author Monetization Active
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/40">
                        1 KSH / 180 views (&gt;1,000 views)
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                      <strong>{userPosts.length}</strong> stories • <strong>{totalViews.toLocaleString()}</strong> total views • <strong className="text-emerald-600 dark:text-emerald-400">KSH {totalAuthorEarningsKsh.toFixed(2)}</strong> author earnings (65% share)
                    </p>
                  </div>
                </div>

                <button
                  id="posts-to-earnings-tab-btn"
                  onClick={() => setActiveTab('earnings')}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all flex-shrink-0"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Wallet: KSH {availableBalanceKsh.toFixed(2)}</span>
                </button>
              </div>
            )}

            {userPosts.length === 0 ? (
              <div className="p-10 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center space-y-3">
                <FileText className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto" />
                <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                  No published stories yet
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  {isSelf
                    ? 'Start drafting your first breaking news wire report or analysis piece.'
                    : 'This author has not published any stories yet.'}
                </p>
                {isSelf && (
                  <button
                    onClick={() => setIsCreatePostOpen(true)}
                    className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs"
                  >
                    Create Dispatch
                  </button>
                )}
              </div>
            ) : (
              userPosts.map(post => (
                <div key={post.id}>
                  <PostCard post={post} />
                </div>
              ))
            )}
          </div>
        )}

        {/* PERFORMANCE & ANALYTICS TAB */}
        {activeTab === 'stats' && (
          <AuthorPerformanceStats
            authorUsername={targetUsername}
            authorDisplayName={isSelf ? currentUser.displayName : targetUsername}
            authorAvatar={
              isSelf
                ? currentUser.avatar
                : posts.find(p => p.author.toLowerCase() === targetUsername.toLowerCase())?.authorAvatar
            }
            authorRole={targetUserRole}
            isVerified={isTargetVerified}
            userPosts={userPosts}
            onSelectPost={post => setActivePost(post)}
          />
        )}

        {/* 2. READ LATER PERSONAL LIST TAB */}
        {activeTab === 'saved' && (
          <div className="space-y-4">
            {/* Top Cloud Sync & Queue Overview Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800 flex items-center gap-1">
                      <Bookmark className="w-3 h-3 text-orange-500" />
                      <span>Personal Reading List</span>
                    </span>
                    <span className="text-xs text-neutral-400">
                      Cross-Device Sync
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                    Saved Articles (Read Later)
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    Your personal saved and bookmarked articles, synced across all your devices using Cloud Firestore.
                  </p>
                </div>

                {/* Firestore Real-Time Sync Status Box */}
                <div className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-800/60 p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-700/60 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Cloud className={`w-5 h-5 ${
                        firestoreSyncState === 'syncing' || isManualSyncing
                          ? 'text-orange-500 animate-pulse'
                          : firestoreSyncState === 'error'
                          ? 'text-amber-500'
                          : 'text-emerald-500'
                      }`} />
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ${
                        firestoreSyncState === 'syncing' || isManualSyncing
                          ? 'bg-orange-500 animate-ping'
                          : firestoreSyncState === 'error'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`} />
                    </div>
                    <div className="text-left">
                      <div className="text-[11px] font-bold text-neutral-900 dark:text-white flex items-center gap-1">
                        {firestoreSyncState === 'syncing' || isManualSyncing
                          ? 'Syncing with Firestore...'
                          : firestoreSyncState === 'error'
                          ? 'Offline Mode (Local Cache)'
                          : 'Synced to Firestore ☁️'}
                      </div>
                      <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
                        {lastFirestoreSync
                          ? `Last sync ${lastFirestoreSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                          : 'Cloud sync active'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      setIsManualSyncing(true);
                      await syncReadLaterWithFirestore();
                      setIsManualSyncing(false);
                    }}
                    disabled={isManualSyncing}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                    title="Force sync now with Cloud Firestore"
                  >
                    <RefreshCw className={`w-4 h-4 ${isManualSyncing ? 'animate-spin text-orange-500' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Reading Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800">
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">Total Saved</div>
                  <div className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white mt-0.5">
                    {savedPosts.length}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
                  <div className="text-[11px] text-orange-600 dark:text-orange-400 font-medium">Unread Queue</div>
                  <div className="text-lg sm:text-xl font-black text-orange-600 dark:text-orange-400 mt-0.5">
                    {unreadCount}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Completed</div>
                  <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {completedCount}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800">
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">Est. Read Time</div>
                  <div className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white mt-0.5">
                    ~{totalUnreadReadingMinutes} min
                  </div>
                </div>
              </div>
            </div>

            {/* Filter, Sort & Bulk Action Bar */}
            {savedPosts.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                  {/* Status Pills */}
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800/70 text-xs font-bold w-fit">
                    <button
                      onClick={() => setReadLaterFilter('all')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        readLaterFilter === 'all'
                          ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                      }`}
                    >
                      All ({savedPosts.length})
                    </button>
                    <button
                      onClick={() => setReadLaterFilter('unread')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        readLaterFilter === 'unread'
                          ? 'bg-orange-500 text-white shadow-sm'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                      }`}
                    >
                      Unread ({unreadCount})
                    </button>
                    <button
                      onClick={() => setReadLaterFilter('completed')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        readLaterFilter === 'completed'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                      }`}
                    >
                      Completed ({completedCount})
                    </button>
                  </div>

                  {/* Search bar inside list */}
                  <div className="relative flex-1 max-w-xs">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={readLaterSearch}
                      onChange={e => setReadLaterSearch(e.target.value)}
                      placeholder="Search saved articles..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  {/* Sort and Bulk controls */}
                  <div className="flex items-center gap-2">
                    <select
                      value={readLaterSort}
                      onChange={e => setReadLaterSort(e.target.value as any)}
                      aria-label="Sort saved articles"
                      className="text-xs px-2.5 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium focus:outline-none cursor-pointer"
                    >
                      <option value="recent">Recently Saved</option>
                      <option value="oldest">Oldest Saved</option>
                      <option value="reading_time_asc">Shortest Read (&lt; 5m)</option>
                      <option value="reading_time_desc">Longest Read</option>
                    </select>

                    {completedCount > 0 && (
                      <button
                        onClick={() => clearReadLater(true)}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                        title="Clear all completed articles from Read Later"
                      >
                        Clear Read
                      </button>
                    )}
                  </div>
                </div>

                {/* Category filter pills if multiple categories */}
                {savedCategories.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    <span className="text-neutral-400 text-[11px] font-semibold flex items-center gap-1 mr-1">
                      <Filter className="w-3 h-3" />
                      Topic:
                    </span>
                    <button
                      onClick={() => setReadLaterCategory('all')}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                        readLaterCategory === 'all'
                          ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                      }`}
                    >
                      All Topics
                    </button>
                    {savedCategories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setReadLaterCategory(cat)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                          readLaterCategory === cat
                            ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* List of Saved Articles */}
            {savedPosts.length === 0 ? (
              <div className="p-10 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-500 border border-orange-200 dark:border-orange-800/60 flex items-center justify-center mx-auto">
                  <Bookmark className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200">
                    Your Read Later list is empty
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
                    Click the bookmark button on any article headline while browsing. Articles will sync to this personal list across all your devices using Cloud Firestore.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      closeUserProfile();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Explore News Wire</span>
                  </button>
                </div>
              </div>
            ) : filteredSavedPosts.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center space-y-2">
                <Filter className="w-8 h-8 text-neutral-400 mx-auto" />
                <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                  No articles matching your current filter
                </h3>
                <p className="text-xs text-neutral-500">
                  Try changing your status or category filter above.
                </p>
                <button
                  onClick={() => {
                    setReadLaterFilter('all');
                    setReadLaterCategory('all');
                    setReadLaterSearch('');
                  }}
                  className="mt-2 text-xs font-bold text-orange-600 hover:underline cursor-pointer"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSavedPosts.map(post => {
                  const itemMeta = readLaterItems.find(i => i.postId === post.id);
                  const isCompleted = Boolean(itemMeta?.isRead);
                  const wordCount = ((post.title || '') + ' ' + (post.content || '')).split(/\s+/).filter(Boolean).length;
                  const estimatedMin = Math.max(1, Math.ceil(wordCount / 200));

                  return (
                    <div
                      key={post.id}
                      className={`group relative p-4 rounded-2xl bg-white dark:bg-neutral-900 border transition-all ${
                        isCompleted
                          ? 'border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900/50 opacity-80 hover:opacity-100'
                          : 'border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-orange-300 dark:hover:border-orange-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
                        {/* Article Info & Headline */}
                        <div className="flex-1 min-w-0 space-y-2">
                          {/* Metadata row */}
                          <div className="flex flex-wrap items-center gap-2 text-[11px]">
                            {/* Category badge */}
                            <span className="px-2 py-0.5 rounded-full font-black uppercase tracking-wider text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                              {post.category || 'News'}
                            </span>

                            {/* Status badge */}
                            {isCompleted ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Completed</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Unread</span>
                              </span>
                            )}

                            {/* Estimated reading time */}
                            <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                              <BookOpen className="w-3 h-3 text-neutral-400" />
                              <span>{estimatedMin} min read</span>
                            </span>

                            {/* Cloud synced mark */}
                            <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-medium flex items-center gap-0.5 ml-auto sm:ml-0" title="Synced with Cloud Firestore">
                              <Cloud className="w-3 h-3" />
                              <span className="hidden sm:inline">Firestore Synced</span>
                            </span>
                          </div>

                          {/* Headline (click opens reader) */}
                          <h3
                            onClick={() => setActivePost(post)}
                            className={`font-black text-sm sm:text-base leading-snug cursor-pointer transition-colors ${
                              isCompleted
                                ? 'text-neutral-600 dark:text-neutral-400 line-through decoration-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                                : 'text-neutral-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400'
                            }`}
                          >
                            {post.title}
                          </h3>

                          {/* Author Byline & Date */}
                          <div className="flex items-center gap-2 text-xs text-neutral-500">
                            <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                              By {post.author}
                            </span>
                            <span>•</span>
                            <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recently'}</span>
                            {itemMeta?.savedAt && (
                              <>
                                <span>•</span>
                                <span className="text-[11px] text-neutral-400">
                                  Saved {new Date(itemMeta.savedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Thumbnail image if available */}
                        {post.imageUrl && (
                          <div
                            onClick={() => setActivePost(post)}
                            className="w-full sm:w-28 sm:h-20 h-40 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 cursor-pointer"
                          >
                            <img
                              src={post.imageUrl}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                      </div>

                      {/* Action buttons footer */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-3 border-t border-neutral-100 dark:border-neutral-800/80">
                        <div className="flex items-center gap-2">
                          {/* Read Story button */}
                          <button
                            onClick={() => setActivePost(post)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Read Article</span>
                          </button>

                          {/* Toggle Read/Unread Status */}
                          <button
                            onClick={() => markReadLaterStatus(post.id, !isCompleted)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              isCompleted
                                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200'
                                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                            }`}
                            title={isCompleted ? 'Mark as Unread' : 'Mark as Completed'}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{isCompleted ? 'Mark Unread' : 'Mark as Read'}</span>
                          </button>
                        </div>

                        {/* Remove from Read Later */}
                        <button
                          onClick={() => toggleSavePost(post.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs text-neutral-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                          title="Remove from Read Later list"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2.5 CREATOR EARNINGS & MONETIZATION TAB */}
        {activeTab === 'earnings' && isSelf && (
          <div className="space-y-4">
            {/* Top Balance Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 text-white border border-neutral-800 shadow-xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <Coins className="w-3 h-3" />
                      <span>Author Monetization Desk</span>
                    </span>
                    <span className="text-xs text-neutral-400">35% Admin / 65% Author Revenue Split</span>
                  </div>

                  <div className="text-xs font-semibold text-neutral-400">Available M-Pesa Balance (Author 65% Share)</div>
                  <div className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-baseline gap-2 mt-1">
                    <span className="text-emerald-400">KSH</span>
                    <span>{availableBalanceKsh.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 mt-2">
                    <span>Lifetime Author (65%): <strong className="text-emerald-400">KSH {totalAuthorEarningsKsh.toFixed(2)}</strong></span>
                    <span>•</span>
                    <span>Reader Gifts: <strong className="text-amber-400">KSH {totalMonetaryGiftsKsh.toFixed(2)}</strong></span>
                    <span>•</span>
                    <span>Admin Share (35%): <strong className="text-neutral-300">KSH {totalAdminShareKsh.toFixed(2)}</strong></span>
                    <span>•</span>
                    <span>Withdrawn: <strong>KSH {withdrawnKsh.toFixed(2)}</strong></span>
                    {currentUser.wallet?.lastPayoutDate && (
                      <>
                        <span>•</span>
                        <span>Last Payout: <strong>{currentUser.wallet.lastPayoutDate}</strong></span>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:w-auto w-full">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                    <div className="text-[10px] text-neutral-400 uppercase font-semibold">Total Reader Gifts</div>
                    <div className="text-base font-black text-amber-400 mt-0.5">KSH {totalMonetaryGiftsKsh.toLocaleString()}</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">Author share: KSH {authorGiftsShareKsh.toFixed(2)}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                    <div className="text-[10px] text-neutral-400 uppercase font-semibold">Story Views</div>
                    <div className="text-base font-black text-white mt-0.5">{totalViews.toLocaleString()}</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">{eligiblePosts.length} monetized &gt;1k</div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs col-span-2 sm:col-span-1">
                    <div className="text-[10px] text-neutral-400 uppercase font-semibold">Site Admin (35%)</div>
                    <div className="text-base font-black text-neutral-300 mt-0.5">KSH {totalAdminShareKsh.toFixed(2)}</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">Ops &amp; Infra Pool</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Policy & Formula Clarification Card: 35/65 Split */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-neutral-800 dark:text-neutral-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300">
                <HeartHandshake className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>35/65 Revenue Sharing Policy (Reader Gifts &amp; Ad Views)</span>
              </div>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                On Bloggr, the <strong>site admin and author share all earnings and gifts 35/65</strong>. 
                Readers can award direct monetary gifts to your articles using the Award / Gift feature. In addition, articles surpassing the <strong>1,000 views</strong> threshold earn <strong>1 KSH for every 180 views</strong>. 
                You receive <strong>65% of all gifts and view revenues</strong> credited automatically to your available balance, ready for instant Safaricom M-Pesa withdrawal. The remaining <strong>35%</strong> is retained by the site admin to sustain platform operations and hosting.
              </p>
            </div>

            {/* Safaricom M-Pesa Cashout Form */}
            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>Instant Safaricom M-Pesa Withdrawal</span>
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Disburses immediately to your registered Kenyan mobile phone.
                  </p>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                  Instant B2C
                </span>
              </div>

              {withdrawalSuccessMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{withdrawalSuccessMessage}</span>
                </div>
              )}

              <form onSubmit={handleWithdrawMpesa} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      M-Pesa Mobile Number
                    </label>
                    <input
                      id="mpesa-phone-input"
                      type="tel"
                      value={mpesaNumber}
                      onChange={e => setMpesaNumber(e.target.value)}
                      placeholder="e.g. 0712345678"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      M-Pesa Account Name
                    </label>
                    <input
                      id="mpesa-name-input"
                      type="text"
                      value={mpesaName}
                      onChange={e => setMpesaName(e.target.value)}
                      placeholder="e.g. Alex Rider"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Withdraw Amount (KSH)
                    </label>
                    <div className="relative">
                      <input
                        id="mpesa-amount-input"
                        type="number"
                        min="1"
                        max={availableBalanceKsh}
                        step="0.01"
                        value={withdrawAmount}
                        onChange={e => setWithdrawAmount(e.target.value)}
                        placeholder={`Max: ${availableBalanceKsh.toFixed(2)}`}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setWithdrawAmount(availableBalanceKsh.toFixed(2))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        MAX
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-neutral-500">
                    No processing fees. Instant Safaricom Daraja settlement.
                  </div>
                  <button
                    id="submit-mpesa-withdraw-btn"
                    type="submit"
                    disabled={isWithdrawing || availableBalanceKsh <= 0}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-sm transition-all"
                  >
                    {isWithdrawing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Processing M-Pesa...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Disburse to M-Pesa</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Article-by-Article Monetization Ledger */}
            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Article Monetization Ledger ({userPosts.length})
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Transparent earnings breakdown per published dispatch.
                  </p>
                </div>
                <span className="text-xs text-neutral-500 font-mono">
                  {eligiblePosts.length} monetized / {userPosts.length - eligiblePosts.length} pending threshold
                </span>
              </div>

              {userPosts.length === 0 ? (
                <div className="p-8 text-center text-xs text-neutral-500">
                  No articles published yet. Publish articles to begin tracking views and earnings.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {userPosts.map(post => {
                    const info = calculateArticleEarnings(post.views || 0, post.monetaryGiftsTotalKsh || 0, isAuthorAccredited);
                    const giftsKsh = post.monetaryGiftsTotalKsh || 0;
                    return (
                      <div
                        key={post.id}
                        className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 mb-0.5">
                            <span className="text-orange-600 dark:text-orange-400 uppercase">{post.category || 'News Wire'}</span>
                            <span>•</span>
                            <span>{post.createdAt}</span>
                            {giftsKsh > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                                  <Coins className="w-3 h-3" />
                                  <span>Gifts: KSH {giftsKsh.toLocaleString()}</span>
                                </span>
                              </>
                            )}
                          </div>
                          <h4
                            onClick={() => setActivePost(post)}
                            className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white truncate hover:text-orange-600 dark:hover:text-orange-400 cursor-pointer"
                          >
                            {post.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            <span className="flex items-center gap-1 font-mono font-medium">
                              <Eye className="w-3.5 h-3.5 text-neutral-400" />
                              {(post.views || 0).toLocaleString()} views
                            </span>
                            <span>•</span>
                            <span>{post.commentsCount} comments</span>
                            {info.grossAdEarningsKsh > 0 && (
                              <>
                                <span>•</span>
                                <span>Ad views gross: KSH {info.grossAdEarningsKsh.toFixed(2)}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Status & Amount */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-200 dark:border-neutral-700">
                          <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
                            KSH {info.authorEarningsKsh.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                            <span>Author 65%</span>
                            <span>•</span>
                            <span>Admin KSH {info.adminEarningsKsh.toFixed(2)} (35%)</span>
                          </div>
                          {info.isEligible ? (
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40 mt-1">
                              Views &amp; Gifts Active (35/65 Split)
                            </span>
                          ) : giftsKsh > 0 ? (
                            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/40 mt-1">
                              Gifts Active (65% share)
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full border border-neutral-200 dark:border-neutral-700 mt-1">
                              {info.viewsRemaining} views to 1,000 threshold
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. SETTINGS & PREFERENCES TAB */}
        {activeTab === 'settings' && isSelf && (
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Profile & News Delivery Settings
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Configure your public persona, favorite news desk, and real-time alert notifications.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5">
              {/* Profile Avatar Quick Change */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.displayName}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-orange-500/30"
                    />
                    <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-900 absolute -bottom-0.5 -right-0.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <span>Profile Picture & Journalist Avatar</span>
                      {currentUser.isVerified && (
                        <VerifiedBadge isVerified={true} role={currentUser.verifiedRole} size="xs" />
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Upload a custom photo, pick from real press journalist presets, or paste an image URL.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  id="settings-change-avatar-btn"
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0"
                >
                  <Camera className="w-3.5 h-3.5 text-orange-600" />
                  <span>Change Photo</span>
                </button>
              </div>

              {/* Personal Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Display Name
                  </label>
                  <input
                    id="edit-display-name"
                    type="text"
                    value={editDisplayName}
                    onChange={e => setEditDisplayName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Registered Email
                  </label>
                  <input
                    id="edit-email-readonly"
                    type="email"
                    value={currentUser.email || ''}
                    disabled
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800/50 text-neutral-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Reporter Bio & Coverage Beats
                </label>
                <textarea
                  id="edit-bio"
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
                />
              </div>

              {/* Favorite Category */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Default News Category Desk
                </label>
                <select
                  id="edit-fav-category"
                  value={editFavoriteCategory}
                  onChange={e => setEditFavoriteCategory(e.target.value as NewsCategory)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  {NEWS_CATEGORIES_CONFIG.filter(c => c.categoryValue).map(cat => (
                    <option key={cat.id} value={cat.categoryValue}>
                      {cat.emoji} {cat.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-neutral-400 mt-1">
                  This desk will be prioritized when you open the application.
                </p>
              </div>

              <div className="h-px bg-neutral-200 dark:bg-neutral-800" />

              {/* Toggles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-orange-500" />
                      <span>Email Digest Notifications</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Receive weekly editorial summaries and top wire highlights.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="toggle-email-notifications"
                    checked={editEmailNotifications}
                    onChange={e => setEditEmailNotifications(e.target.checked)}
                    className="w-4 h-4 accent-orange-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-amber-500" />
                      <span>Breaking News Alerts</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Instant audio chime and notification bar updates for major breaking stories.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="toggle-breaking-alerts"
                    checked={editBreakingAlerts}
                    onChange={e => setEditBreakingAlerts(e.target.checked)}
                    className="w-4 h-4 accent-orange-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-blue-500" />
                      <span>Data Saver Mode</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Compress high-res hero images and video previews for low-bandwidth connections.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="toggle-data-saver"
                    checked={editDataSaver}
                    onChange={e => setEditDataSaver(e.target.checked)}
                    className="w-4 h-4 accent-orange-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  id="save-profile-settings-btn"
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all"
                >
                  Save Profile Settings
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 4. FOLLOWING AUTHORS TAB */}
        {activeTab === 'following' && isSelf && (
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              Journalists & Correspondents You Follow
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(currentUser.followingAuthors || []).map(author => (
                <div
                  key={author}
                  className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-600 flex items-center justify-center font-bold text-xs">
                      {author.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-900 dark:text-white">
                        {author}
                      </div>
                      <div className="text-[10px] text-neutral-400">Wire Contributor</div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFollowAuthor(author)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40"
                  >
                    Unfollow
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. JOURNALIST / CREATOR DESK TAB */}
        {activeTab === 'creator' && isSelf && (
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
            {currentUser.isCreator ? (
              <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                      Verified Wire Journalist
                    </h3>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      Publishing privileges active across all categories.
                    </p>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  Your submissions are distributed directly to the real-time wire and featured across Kenya News, Africa News, Football News, and Global desks.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                    <div className="text-[11px] text-neutral-400">Published Stories</div>
                    <div className="text-lg font-black text-neutral-900 dark:text-white">{userPosts.length}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                    <div className="text-[11px] text-neutral-400">Post Karma</div>
                    <div className="text-lg font-black text-orange-500">{currentUser.karma.post}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 col-span-2 sm:col-span-1">
                    <div className="text-[11px] text-neutral-400">Wire Access</div>
                    <div className="text-sm font-bold text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Full Access
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreatorSubmit} className="space-y-4">
                <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 text-xs text-orange-800 dark:text-orange-200">
                  Submit an application to obtain verified reporter status and publish reports to the news wire.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Primary News Beat
                  </label>
                  <select
                    value={appCategory}
                    onChange={e => setAppCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  >
                    {NEWS_CATEGORIES_CONFIG.filter(c => c.categoryValue).map(cat => (
                      <option key={cat.id} value={cat.categoryValue}>
                        {cat.emoji} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Journalism Experience & Background
                  </label>
                  <textarea
                    value={appBio}
                    onChange={e => setAppBio(e.target.value)}
                    placeholder="Describe your writing background or beat expertise..."
                    rows={2}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Proposed First Dispatch Topic
                  </label>
                  <input
                    type="text"
                    value={appTopic}
                    onChange={e => setAppTopic(e.target.value)}
                    placeholder="e.g. Analysis of geothermal expansion in the Rift Valley"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs"
                >
                  Submit Application
                </button>
              </form>
            )}
          </div>
        )}

        {/* 6. ADMIN DESK TAB */}
        {activeTab === 'admin' && isSelf && currentUser.isAdmin && (
          <div className="space-y-6">
            {/* Author Accreditation & Verification Manager */}
            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                      Author Verification & Monetization Registry
                    </h2>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Grant or revoke official journalist checkmarks. <strong>Only verified authors</strong> are eligible to monetize their articles and earn 1 KSH per 180 views.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Admin Security Level</span>
                </div>
              </div>

              {/* Quick Verify User Box */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700/80 space-y-3">
                <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-orange-600" />
                  <span>Quick Author Accreditation</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    placeholder="Enter username (e.g. mashack)"
                    value={customVerifyUsername}
                    onChange={e => setCustomVerifyUsername(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  />
                  <select
                    value={customVerifyRole}
                    onChange={e => setCustomVerifyRole(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  >
                    <option value="Senior Correspondent">Senior Correspondent</option>
                    <option value="Investigative Reporter">Investigative Reporter</option>
                    <option value="Staff Journalist">Staff Journalist</option>
                    <option value="Financial Analyst">Financial Analyst</option>
                    <option value="Sports Correspondent">Sports Correspondent</option>
                    <option value="Fact-Checker">Fact-Checker</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      if (!customVerifyUsername.trim()) {
                        showToast('Please enter a valid username');
                        return;
                      }
                      markAuthorVerified(customVerifyUsername.trim(), true, customVerifyRole);
                      setCustomVerifyUsername('');
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Accredit Author</span>
                  </button>
                </div>
              </div>

              {/* Roster of active authors */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Active Authors Roster ({Array.from(new Set(posts.map(p => p.author))).length} Authors)
                  </h3>
                  <div className="relative w-48 sm:w-64">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search authors..."
                      value={adminAuthorSearch}
                      onChange={e => setAdminAuthorSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="divide-y divide-neutral-200 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900">
                  {Array.from(new Set(posts.map(p => p.author)))
                    .filter(author => author.toLowerCase().includes(adminAuthorSearch.toLowerCase()))
                    .map(author => {
                      const isSelfAuthor = author.toLowerCase() === currentUser.username.toLowerCase();
                      const authorPostList = posts.filter(p => p.author.toLowerCase() === author.toLowerCase());
                      const authorVerified = isSelfAuthor ? currentUser.isVerified : isAuthorVerified(author);
                      const authorRole = isSelfAuthor ? currentUser.verifiedRole : (authorPostList[0]?.authorRole || 'Accredited Journalist');
                      const authorAvatar = authorPostList[0]?.authorAvatar || (isSelfAuthor ? currentUser.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80');
                      const totalAuthorViews = authorPostList.reduce((acc, p) => acc + (p.views || 0), 0);

                      return (
                        <div
                          key={author}
                          className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={authorAvatar}
                              alt={author}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                            />
                            <div>
                              <div className="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-white text-xs">
                                <span>u/{author}</span>
                                {isSelfAuthor && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
                                    You
                                  </span>
                                )}
                                <VerifiedBadge isVerified={authorVerified} role={authorRole} size="xs" />
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                                <span>{authorPostList.length} articles</span>
                                <span>•</span>
                                <span>{totalAuthorViews.toLocaleString()} views</span>
                                <span>•</span>
                                {authorVerified ? (
                                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                    Monetization: Active
                                  </span>
                                ) : (
                                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                                    Monetization: Blocked (Unverified)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <button
                              onClick={() => {
                                markAuthorVerified(author, !authorVerified, !authorVerified ? 'Senior Correspondent' : undefined);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                authorVerified
                                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                              }`}
                            >
                              {authorVerified ? (
                                <>
                                  <UserX className="w-3.5 h-3.5" />
                                  <span>Revoke Checkmark</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Mark Verified</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => openUserProfile(author)}
                              className="px-2.5 py-1.5 rounded-lg text-xs border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                              title="View Author Profile"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Reporter Applications Queue */}
            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Reporter Credential Verification Applications ({pendingApps.length})
              </h2>

              {pendingApps.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-500">
                  All creator applications have been reviewed!
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingApps.map(app => (
                    <div
                      key={app.id}
                      className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/40 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-neutral-900 dark:text-white">
                          u/{app.username} ({app.category})
                        </span>
                        <span className="text-[11px] text-neutral-400">{app.appliedAt}</span>
                      </div>
                      <p className="text-neutral-600 dark:text-neutral-300">{app.bio}</p>
                      <div className="font-medium text-orange-600 dark:text-orange-400">
                        Sample: "{app.sampleTopic}"
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => approveCreatorApplication(app.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                        >
                          Approve Reporter
                        </button>
                        <button
                          onClick={() => rejectCreatorApplication(app.id)}
                          className="px-3 py-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Avatar Change Modal */}
      <AvatarChangeModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
      />
    </div>
  );
};
