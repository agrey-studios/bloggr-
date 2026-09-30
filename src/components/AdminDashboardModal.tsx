import React, { useState, useMemo } from 'react';
import {
  X,
  LayoutDashboard,
  FileText,
  Video,
  Users,
  Tag,
  MessageSquare,
  AlertTriangle,
  Megaphone,
  BarChart3,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Trash2,
  Edit3,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Shield,
  Palette,
  ExternalLink,
  Search,
  Check,
  Eye,
  Heart,
  Share2,
} from 'lucide-react';
import { useBloggr } from '../context/BloggrContext';
import { Post, SubmissionStatus, CategoryItem } from '../types';

type AdminTab =
  | 'overview'
  | 'articles'
  | 'videos'
  | 'authors'
  | 'categories'
  | 'comments'
  | 'reports'
  | 'advertisements'
  | 'analytics'
  | 'settings';

export const AdminDashboardModal: React.FC = () => {
  const {
    isAdminDashboardOpen,
    setIsAdminDashboardOpen,
    posts,
    videosList,
    categoriesList,
    platformBranding,
    updatePlatformBranding,
    updatePostStatus,
    toggleFeaturePost,
    addCategory,
    updateCategory,
    deleteCategory,
    deletePost,
    showToast,
    currentUser,
    comments,
  } = useBloggr();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Search queries per tab
  const [articleSearch, setArticleSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // New Category input state
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('📰');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Branding settings form state
  const [brandingForm, setBrandingForm] = useState(platformBranding);

  // Sync brandingForm if platformBranding changes
  React.useEffect(() => {
    setBrandingForm(platformBranding);
  }, [platformBranding]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalArticles = posts.length;
    const pendingSubmissions = posts.filter(
      p => p.submissionStatus === 'submitted' || p.submissionStatus === 'under_review'
    ).length;
    const publishedArticles = posts.filter(
      p => !p.submissionStatus || p.submissionStatus === 'published' || p.submissionStatus === 'approved'
    ).length;
    const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);
    const totalLikes = posts.reduce((acc, p) => acc + (p.score || 0), 0);
    const totalVideos = videosList.length;
    const totalComments = Object.values(comments).reduce((acc, list) => acc + list.length, 0);

    return {
      totalUsers: 14280,
      activeUsers: 3410,
      totalArticles,
      totalVideos,
      pendingSubmissions,
      publishedArticles,
      totalComments: totalComments || 184,
      totalReports: 3,
      totalViews,
      totalLikes,
    };
  }, [posts, videosList, comments]);

  if (!isAdminDashboardOpen) return null;

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlatformBranding(brandingForm);
    showToast('Platform branding & ad settings updated!');
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const slug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    addCategory({
      name: newCatName.trim(),
      slug,
      icon: newCatIcon || '📌',
      order: categoriesList.length + 1,
    });
    setNewCatName('');
    setNewCatDesc('');
    showToast(`Category "${newCatName}" created successfully!`);
  };

  const filteredArticles = posts.filter(p => {
    const matchesSearch =
      p.title.toLowerCase().includes(articleSearch.toLowerCase()) ||
      p.author.toLowerCase().includes(articleSearch.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(articleSearch.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'pending') {
      return (
        matchesSearch &&
        (p.submissionStatus === 'submitted' || p.submissionStatus === 'under_review')
      );
    }
    if (statusFilter === 'published') {
      return (
        matchesSearch &&
        (!p.submissionStatus || p.submissionStatus === 'published' || p.submissionStatus === 'approved')
      );
    }
    if (statusFilter === 'featured') {
      return matchesSearch && p.isFeatured;
    }
    return matchesSearch;
  });

  return (
    <div
      id="admin-dashboard-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        id="admin-dashboard-panel"
        className="w-full max-w-6xl bg-white dark:bg-[#111218] rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#161722]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Bloggr Admin Control Center
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Live Operations
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Manage editorial dispatches, videos, categories, advertising & branding
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAdminDashboardOpen(false)}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
            title="Close Dashboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Body with Left Nav Tabs & Right Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Navigation Bar / Sidebar */}
          <nav className="w-full md:w-60 border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-[#13141d]/70 p-2 md:p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto scrollbar-none flex-shrink-0 text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('articles')}
              className={`flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === 'articles'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                <span>Articles</span>
              </div>
              {stats.pendingSubmissions > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-black">
                  {stats.pendingSubmissions}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('videos')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === 'videos'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Short Videos</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Categories</span>
            </button>

            <button
              onClick={() => setActiveTab('authors')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === 'authors'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Authors & Writers</span>
            </button>

            <button
              onClick={() => setActiveTab('comments')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === 'comments'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Comments</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Reports</span>
              </div>
              {stats.totalReports > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-black">
                  {stats.totalReports}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('advertisements')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === 'advertisements'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>Advertisements</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Platform Settings</span>
            </button>
          </nav>

          {/* Tab Content Area */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
            {/* 1. OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      Total Dispatches
                    </span>
                    <div className="text-2xl font-black text-neutral-900 dark:text-white">
                      {stats.totalArticles}
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold">
                      {stats.publishedArticles} Published
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      Pending Reviews
                    </span>
                    <div className="text-2xl font-black text-amber-500">
                      {stats.pendingSubmissions}
                    </div>
                    <span className="text-[10px] text-amber-600 font-semibold">
                      Requires editorial sign-off
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      Short Videos
                    </span>
                    <div className="text-2xl font-black text-rose-500">
                      {stats.totalVideos}
                    </div>
                    <span className="text-[10px] text-neutral-400">Reels & Clips</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      Cumulative Views
                    </span>
                    <div className="text-2xl font-black text-blue-500">
                      {stats.totalViews.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-blue-600 font-bold">
                      +14.2% this week
                    </span>
                  </div>
                </div>

                {/* Submissions Action Queue */}
                <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span>Pending Editorial Submissions ({stats.pendingSubmissions})</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('articles')}
                      className="text-xs font-bold text-orange-600 hover:underline"
                    >
                      View All Articles →
                    </button>
                  </div>

                  {posts.filter(p => p.submissionStatus === 'submitted' || p.submissionStatus === 'under_review').length === 0 ? (
                    <div className="py-6 text-center text-xs text-neutral-400">
                      ✓ Editorial queue is all caught up! No pending submissions.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {posts
                        .filter(p => p.submissionStatus === 'submitted' || p.submissionStatus === 'under_review')
                        .slice(0, 4)
                        .map(item => (
                          <div
                            key={item.id}
                            className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 uppercase">
                                  {item.submissionStatus?.replace('_', ' ')}
                                </span>
                                <span className="text-xs text-neutral-400">{item.author}</span>
                              </div>
                              <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                                {item.title}
                              </h4>
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <button
                                onClick={() => {
                                  updatePostStatus(item.id, 'approved');
                                  showToast(`Approved "${item.title.slice(0, 30)}..."`);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  updatePostStatus(item.id, 'rejected');
                                  showToast('Submission marked as rejected.');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. ARTICLES (MODERATION & WORKFLOW: Draft -> Submitted -> Under Review -> Approved -> Published) */}
            {activeTab === 'articles' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row gap-2 justify-between items-center">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={articleSearch}
                      onChange={e => setArticleSearch(e.target.value)}
                      placeholder="Search title, author, category..."
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                    {['all', 'pending', 'published', 'featured'].map(filter => (
                      <button
                        key={filter}
                        onClick={() => setStatusFilter(filter)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-colors ${
                          statusFilter === filter
                            ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  {filteredArticles.map(article => (
                    <div
                      key={article.id}
                      className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {article.imageUrl && (
                          <img
                            src={article.imageUrl}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-black uppercase text-orange-600 dark:text-orange-400">
                              {article.category || 'General'}
                            </span>
                            <span className="text-[10px] text-neutral-400">·</span>
                            <span className="text-[10px] text-neutral-400">{article.author}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-bold uppercase">
                              {article.submissionStatus || 'published'}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                            {article.title}
                          </h4>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => {
                            toggleFeaturePost(article.id);
                            showToast(
                              article.isFeatured ? 'Removed from featured' : 'Marked as homepage featured!'
                            );
                          }}
                          className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                            article.isFeatured
                              ? 'bg-amber-500 text-white'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-amber-500'
                          }`}
                          title="Feature on homepage"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            updatePostStatus(article.id, 'approved');
                            showToast('Status updated to Approved/Published');
                          }}
                          className="px-2 py-1 rounded-lg bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600 hover:text-white text-xs font-bold transition-colors"
                          title="Approve & Publish"
                        >
                          Publish
                        </button>

                        <button
                          onClick={() => {
                            updatePostStatus(article.id, 'rejected');
                            showToast('Status updated to Rejected');
                          }}
                          className="px-2 py-1 rounded-lg bg-rose-600/10 text-rose-600 hover:bg-rose-600 hover:text-white text-xs font-bold transition-colors"
                          title="Reject"
                        >
                          Reject
                        </button>

                        <button
                          onClick={() => {
                            deletePost(article.id);
                            showToast('Dispatch deleted from platform');
                          }}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete dispatch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. SHORT VIDEOS */}
            {activeTab === 'videos' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Bloggr Short Videos ({videosList.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {videosList.map(vid => (
                    <div
                      key={vid.id}
                      className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2 shadow-xs"
                    >
                      <div className="relative aspect-[9/16] max-h-48 rounded-xl overflow-hidden bg-black">
                        <img
                          src={vid.thumbnail}
                          alt={vid.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-600 text-white">
                          {vid.category}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-1">
                          {vid.title}
                        </h4>
                        <span className="text-[10px] text-neutral-400">By {vid.author}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {vid.views.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {vid.likes}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. CATEGORIES SYSTEM (Create, Rename, Delete, Reorder) */}
            {activeTab === 'categories' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Add Category Form */}
                <form
                  onSubmit={handleCreateCategory}
                  className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 space-y-3"
                >
                  <h4 className="text-xs font-bold uppercase text-neutral-400 tracking-wider">
                    Add New Category
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={newCatName}
                      onChange={e => setNewCatName(e.target.value)}
                      placeholder="Category name (e.g. Agriculture)"
                      className="px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                      required
                    />
                    <input
                      type="text"
                      value={newCatIcon}
                      onChange={e => setNewCatIcon(e.target.value)}
                      placeholder="Emoji or icon (e.g. 🌾)"
                      className="px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Category</span>
                    </button>
                  </div>
                </form>

                {/* Categories List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Active Platform Categories ({categoriesList.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {categoriesList.map(cat => (
                      <div
                        key={cat.id}
                        className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between gap-2 shadow-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{cat.icon || '📌'}</span>
                          <span className="text-xs font-bold text-neutral-900 dark:text-white">
                            {cat.name}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            deleteCategory(cat.id);
                            showToast(`Deleted category "${cat.name}"`);
                          }}
                          className="p-1 rounded text-neutral-400 hover:text-rose-500"
                          title="Delete category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. ADVERTISEMENTS SETTINGS */}
            {activeTab === 'advertisements' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                        Global Advertisement Status
                      </h4>
                      <p className="text-xs text-neutral-500">
                        Enable or disable display ads across Bloggr feeds and article sidebars.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={brandingForm.adEnabled}
                        onChange={e =>
                          setBrandingForm(prev => ({ ...prev, adEnabled: e.target.checked }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Feed Ad Frequency (Every N articles)
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={12}
                      value={brandingForm.adFrequency}
                      onChange={e =>
                        setBrandingForm(prev => ({
                          ...prev,
                          adFrequency: parseInt(e.target.value) || 4,
                        }))
                      }
                      className="w-32 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Google AdSense / Custom Publisher Code
                    </label>
                    <textarea
                      rows={3}
                      value={brandingForm.adCode || ''}
                      onChange={e =>
                        setBrandingForm(prev => ({ ...prev, adCode: e.target.value }))
                      }
                      placeholder="<!-- Google AdSense ad unit script or ca-pub-xxx -->"
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                    />
                  </div>

                  <button
                    onClick={handleSaveBranding}
                    className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Save Advertisement Settings
                  </button>
                </div>
              </div>
            )}

            {/* 6. PLATFORM SETTINGS & BRANDING */}
            {activeTab === 'settings' && (
              <form onSubmit={handleSaveBranding} className="space-y-4 animate-in fade-in duration-150">
                <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4">
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Platform Branding & Identity
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                        Platform Name
                      </label>
                      <input
                        type="text"
                        value={brandingForm.siteName}
                        onChange={e =>
                          setBrandingForm(prev => ({ ...prev, siteName: e.target.value }))
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                        Website Domain
                      </label>
                      <input
                        type="text"
                        value={brandingForm.website}
                        onChange={e =>
                          setBrandingForm(prev => ({ ...prev, website: e.target.value }))
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                        Primary Brand Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={brandingForm.primaryColor}
                          onChange={e =>
                            setBrandingForm(prev => ({ ...prev, primaryColor: e.target.value }))
                          }
                          className="w-8 h-8 rounded-lg cursor-pointer border-0"
                        />
                        <span className="text-xs font-mono text-neutral-500">
                          {brandingForm.primaryColor}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                        Secondary Brand Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={brandingForm.secondaryColor}
                          onChange={e =>
                            setBrandingForm(prev => ({ ...prev, secondaryColor: e.target.value }))
                          }
                          className="w-8 h-8 rounded-lg cursor-pointer border-0"
                        />
                        <span className="text-xs font-mono text-neutral-500">
                          {brandingForm.secondaryColor}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                      Platform Description
                    </label>
                    <textarea
                      rows={2}
                      value={brandingForm.description}
                      onChange={e =>
                        setBrandingForm(prev => ({ ...prev, description: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Save Platform Settings
                  </button>
                </div>
              </form>
            )}

            {/* 7. ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase">
                      Daily Active Users (DAU)
                    </span>
                    <div className="text-2xl font-black text-neutral-900 dark:text-white">
                      {stats.activeUsers.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold">+22% month-on-month</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase">
                      Engagement Rate
                    </span>
                    <div className="text-2xl font-black text-orange-500">6.8%</div>
                    <span className="text-[10px] text-neutral-400">Likes, shares, comments</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase">
                      East Africa Share
                    </span>
                    <div className="text-2xl font-black text-emerald-500">74%</div>
                    <span className="text-[10px] text-neutral-400">Kenya, Uganda, Tanzania</span>
                  </div>
                </div>

                {/* Popular Categories Breakdown */}
                <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
                  <h4 className="text-xs font-bold uppercase text-neutral-400 tracking-wider">
                    Traffic by Category Desk
                  </h4>
                  <div className="space-y-2">
                    {[
                      { name: 'Kenya & Politics', pct: 38, count: '128k reads' },
                      { name: 'Technology & Economy', pct: 26, count: '89k reads' },
                      { name: 'Sports & Football', pct: 20, count: '67k reads' },
                      { name: 'Opinion & Editorials', pct: 16, count: '54k reads' },
                    ].map(cat => (
                      <div key={cat.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                            {cat.name}
                          </span>
                          <span className="text-neutral-400 font-mono">{cat.count}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                            style={{ width: `${cat.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
