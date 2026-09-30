import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Post,
  Community,
  Comment,
  UserProfile,
  AppNotification,
  VoteType,
  FeedSort,
  TopTimeRange,
  ViewMode,
  AwardType,
  AwardRecord,
  CreatorApplication,
  PolicyPageId,
  TimelineViewLayout,
  NewsCategoryFilter,
  MainNavigationTab,
  AUTHOR_SHARE_RATIO,
  ADMIN_SHARE_RATIO,
  calculateArticleEarnings,
  PlatformFinancials,
  CategoryItem,
  PlatformBranding,
  VideoItem,
  FeedTab,
  SubmissionStatus,
  ReadLaterEntry,
} from '../types';
import {
  INITIAL_COMMUNITIES,
  INITIAL_POSTS,
  INITIAL_COMMENTS,
  INITIAL_USER,
  ADMIN_USER,
  DEMO_ALEX_USER,
  INITIAL_NOTIFICATIONS,
  INITIAL_CREATOR_APPLICATIONS,
  RECOMMENDED_AUTHORS,
  INITIAL_PLATFORM_BRANDING,
  INITIAL_BLOGGR_CATEGORIES,
  INITIAL_VIDEOS,
} from '../data/seedData';
import {
  db,
  auth,
  testFirebaseConnection,
  collection,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  onSnapshot,
  GoogleAuthProvider,
  signInWithPopup,
} from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

const LOCAL_STORAGE_KEYS = {
  POSTS: 'bloggr_posts_v1',
  COMMUNITIES: 'bloggr_communities_v1',
  COMMENTS: 'bloggr_comments_v1',
  USER: 'bloggr_user_v1',
  NOTIFICATIONS: 'bloggr_notifications_v1',
  THEME: 'bloggr_theme_v1',
  VIEW_MODE: 'bloggr_view_mode_v1',
  CREATOR_APPLICATIONS: 'bloggr_creator_apps_v1',
  AUTH: 'bloggr_auth_v1',
  BRANDING: 'bloggr_branding_v1',
  CATEGORIES: 'bloggr_categories_v1',
  VIDEOS: 'bloggr_videos_v1',
};

interface BloggrContextType {
  // State
  posts: Post[];
  communities: Community[];
  comments: Record<string, Comment[]>;
  currentUser: UserProfile;
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  creatorApplications: CreatorApplication[];
  activeFeed: string; // 'home' | 'popular' | 'all' | 'saved' | 'b/technology' etc.
  feedSort: FeedSort;
  topTimeRange: TopTimeRange;
  viewMode: ViewMode;
  searchQuery: string;
  selectedFlair: string | null;
  theme: 'dark' | 'light';
  activePost: Post | null;
  isCreatePostOpen: boolean;
  createPostInitialMode: 'article' | 'video' | 'photo_story' | 'short_update';
  setCreatePostInitialMode: (mode: 'article' | 'video' | 'photo_story' | 'short_update') => void;
  openCreatePostModal: (mode?: 'article' | 'video' | 'photo_story' | 'short_update') => void;
  isCreateCommunityOpen: boolean;
  isUserProfileOpen: boolean;
  profileTargetUser: string | null;
  awardModalTarget: { type: 'post' | 'comment'; id: string; postId: string; author: string } | null;
  toastMessage: string | null;
  isReelsOpen: boolean;
  policyModalPage: PolicyPageId;
  timelineFilter: NewsCategoryFilter;
  timelineLayout: TimelineViewLayout;
  isFirebaseConnected: boolean;
  isAppLoading: boolean;
  setIsAppLoading: (loading: boolean) => void;

  // Bloggr Platform Branding & Customization (Admin)
  platformBranding: PlatformBranding;
  updatePlatformBranding: (data: Partial<PlatformBranding>) => void;

  // Category Management (Admin & Explore)
  categoriesList: CategoryItem[];
  addCategory: (cat: Omit<CategoryItem, 'id'>) => void;
  updateCategory: (id: string, cat: Partial<CategoryItem>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (categories: CategoryItem[]) => void;

  // Videos List & Interaction
  videosList: VideoItem[];
  addVideo: (vid: Omit<VideoItem, 'id' | 'views' | 'likes' | 'commentsCount' | 'createdAt'>) => void;
  likeVideo: (videoId: string) => void;

  // Navigation, Feed Tabs & Sidebar Layout
  feedTab: FeedTab;
  setFeedTab: (tab: FeedTab) => void;
  sidebarCollapsed: boolean;
  toggleSidebarCollapse: () => void;
  isAdminDashboardOpen: boolean;
  setIsAdminDashboardOpen: (open: boolean) => void;
  isMessagesOpen: boolean;
  setIsMessagesOpen: (open: boolean) => void;
  isMobileSideNavOpen: boolean;
  setIsMobileSideNavOpen: (open: boolean) => void;
  toggleMobileSideNav: () => void;
  closeMobileSideNav: () => void;

  // Content Approval & Publishing Workflow
  updatePostStatus: (postId: string, status: SubmissionStatus, notes?: string) => void;
  toggleFeaturePost: (postId: string) => void;
  deletePost: (postId: string) => void;

  // Auth State & Actions
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  setIsAuthModalOpen: (open: boolean) => void;
  setAuthModalMode: (mode: 'login' | 'register') => void;
  login: (emailOrUsername: string, password?: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (data: { username: string; displayName: string; email: string; password?: string; bio?: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfileSettings: (settings: Partial<UserProfile>) => void;

  // Setters & Nav
  mainNavTab: MainNavigationTab;
  setMainNavTab: (tab: MainNavigationTab) => void;
  setActiveFeed: (feed: string) => void;
  setFeedSort: (sort: FeedSort) => void;
  setTopTimeRange: (range: TopTimeRange) => void;
  setViewMode: (mode: ViewMode) => void;
  setTimelineFilter: (filter: NewsCategoryFilter) => void;
  setTimelineLayout: (layout: TimelineViewLayout) => void;
  toggleFollowAuthor: (authorUsername: string) => void;
  isFollowingAuthor: (authorUsername: string) => boolean;
  setSearchQuery: (query: string) => void;
  setSelectedFlair: (flair: string | null) => void;
  toggleTheme: () => void;
  setActivePost: (post: Post | null) => void;
  setIsCreatePostOpen: (open: boolean) => void;
  setIsCreateCommunityOpen: (open: boolean) => void;
  setIsReelsOpen: (open: boolean) => void;
  openUserProfile: (username?: string, initialTab?: string) => void;
  closeUserProfile: () => void;
  profileInitialTab: string | null;
  setProfileInitialTab: (tab: string | null) => void;
  openAwardModal: (target: { type: 'post' | 'comment'; id: string; postId: string; author: string }) => void;
  closeAwardModal: () => void;
  showToast: (msg: string) => void;
  openPolicyPage: (page: PolicyPageId) => void;
  openPolicyModal: (page?: PolicyPageId) => void;
  closePolicyPage: () => void;
  isAuthorDirectoryOpen: boolean;
  setIsAuthorDirectoryOpen: (open: boolean) => void;

  // Report Feature
  reportedPostIds: string[];
  reportModalPost: Post | null;
  openReportModal: (post: Post) => void;
  closeReportModal: () => void;
  submitReport: (postId: string, reason: string, details?: string) => Promise<boolean>;
  isPostReported: (postId: string) => boolean;

  // Creator & Admin Actions
  applyForCreator: (data: { category: string; bio: string; sampleTopic: string; portfolioUrl?: string }) => void;
  approveCreatorApplication: (applicationId: string) => void;
  rejectCreatorApplication: (applicationId: string) => void;
  toggleUserCreatorStatus: () => void;
  markAuthorVerified: (username: string, isVerified: boolean, role?: string) => Promise<void>;
  isAuthorVerified: (authorUsername: string) => boolean;

  // Actions
  votePost: (postId: string, direction: 'up' | 'down') => void;
  voteComment: (commentId: string, postId: string, direction: 'up' | 'down') => void;
  addComment: (postId: string, content: string, parentId?: string | null) => void;
  createPost: (postData: Partial<Post>) => Post;
  createCommunity: (data: {
    name: string;
    displayName: string;
    description: string;
    category: Community['category'];
    iconEmoji: string;
    themeColor: string;
  }) => Community;
  toggleJoinCommunity: (communityId: string) => void;
  toggleSavePost: (postId: string) => void;
  markReadLaterStatus: (postId: string, isRead: boolean) => Promise<void>;
  clearReadLater: (onlyCompleted?: boolean) => Promise<void>;
  syncReadLaterWithFirestore: () => Promise<void>;
  firestoreSyncState: 'idle' | 'syncing' | 'synced' | 'error';
  lastFirestoreSync: Date | null;
  giveAward: (awardType: AwardType, customKsh?: number) => void;
  votePoll: (postId: string, optionId: string) => void;
  markNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  activeNotification: AppNotification | null;
  setActiveNotification: (notif: AppNotification | null) => void;
  openNotification: (notif: AppNotification) => void;
  resetToDefaults: () => void;
}

const BloggrContext = createContext<BloggrContextType | undefined>(undefined);

export const BloggrProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme initialization
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.THEME);
    if (saved === 'dark' || saved === 'light') return saved;
    return 'dark'; // Reddit dark theme default for modern high-contrast look
  });

  // Apply dark mode class to root document element and body
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Posts State
  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.POSTS);
      return saved ? JSON.parse(saved) : INITIAL_POSTS;
    } catch {
      return INITIAL_POSTS;
    }
  });

  // Communities State
  const [communities, setCommunities] = useState<Community[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.COMMUNITIES);
      return saved ? JSON.parse(saved) : INITIAL_COMMUNITIES;
    } catch {
      return INITIAL_COMMUNITIES;
    }
  });

  // Comments State
  const [comments, setComments] = useState<Record<string, Comment[]>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.COMMENTS);
      return saved ? JSON.parse(saved) : INITIAL_COMMENTS;
    } catch {
      return INITIAL_COMMENTS;
    }
  });

  // Current User State
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed.followingAuthors)) {
          parsed.followingAuthors = INITIAL_USER.followingAuthors || ['QuantumEngineer', 'IndieHacker_Sarah'];
        }
        return parsed;
      }
      return INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  // Timeline Layout & Filtering State
  const [timelineFilter, setTimelineFilterState] = useState<NewsCategoryFilter>('all');
  const [mainNavTab, setMainNavTabState] = useState<MainNavigationTab>('home');
  const [timelineLayout, setTimelineLayout] = useState<TimelineViewLayout>('opera');
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 750);
    return () => clearTimeout(timer);
  }, []);

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });
  const [activeNotification, setActiveNotification] = useState<AppNotification | null>(null);

  // View Mode
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    return (localStorage.getItem(LOCAL_STORAGE_KEYS.VIEW_MODE) as ViewMode) || 'card';
  });

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    localStorage.setItem(LOCAL_STORAGE_KEYS.VIEW_MODE, mode);
  };

  // Creator Applications State (Admins manually approve)
  const [creatorApplications, setCreatorApplications] = useState<CreatorApplication[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CREATOR_APPLICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_CREATOR_APPLICATIONS;
    } catch {
      return INITIAL_CREATOR_APPLICATIONS;
    }
  });

  // Policy Modal Page (Privacy Policy, Terms, Content Policy, User Agreement)
  const [policyModalPage, setPolicyModalPage] = useState<PolicyPageId>(null);

  const openPolicyPage = (page: PolicyPageId) => {
    setPolicyModalPage(page);
  };

  const openPolicyModal = (page?: PolicyPageId) => {
    setPolicyModalPage(page || 'privacy');
  };

  const closePolicyPage = () => {
    setPolicyModalPage(null);
  };

  // Feed & Navigation State
  const [activeFeed, setActiveFeedState] = useState<string>('home');
  const [feedSort, setFeedSort] = useState<FeedSort>('hot');
  const [topTimeRange, setTopTimeRange] = useState<TopTimeRange>('today');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFlair, setSelectedFlair] = useState<string | null>(null);

  // Modals & Panels
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [createPostInitialMode, setCreatePostInitialMode] = useState<
    'article' | 'video' | 'photo_story' | 'short_update'
  >('article');

  const openCreatePostModal = (mode: 'article' | 'video' | 'photo_story' | 'short_update' = 'article') => {
    setCreatePostInitialMode(mode);
    setIsCreatePostOpen(true);
  };
  const [isCreateCommunityOpen, setIsCreateCommunityOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [profileTargetUser, setProfileTargetUser] = useState<string | null>(null);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isMobileSideNavOpen, setIsMobileSideNavOpen] = useState(false);

  const toggleMobileSideNav = () => setIsMobileSideNavOpen(prev => !prev);
  const closeMobileSideNav = () => setIsMobileSideNavOpen(false);

  // Platform Branding State (Admin configurable)
  const [platformBranding, setPlatformBranding] = useState<PlatformBranding>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.BRANDING);
      return saved ? JSON.parse(saved) : INITIAL_PLATFORM_BRANDING;
    } catch {
      return INITIAL_PLATFORM_BRANDING;
    }
  });

  const updatePlatformBranding = (data: Partial<PlatformBranding>) => {
    setPlatformBranding(prev => {
      const next = { ...prev, ...data };
      localStorage.setItem(LOCAL_STORAGE_KEYS.BRANDING, JSON.stringify(next));
      return next;
    });
    showToast('Platform branding settings updated.');
  };

  // Categories List State (Admin configurable + explore navigation)
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : INITIAL_BLOGGR_CATEGORIES;
    } catch {
      return INITIAL_BLOGGR_CATEGORIES;
    }
  });

  const addCategory = (cat: Omit<CategoryItem, 'id'>) => {
    const newCat: CategoryItem = {
      ...cat,
      id: `cat-${Date.now()}`,
    };
    setCategoriesList(prev => {
      const next = [...prev, newCat];
      localStorage.setItem(LOCAL_STORAGE_KEYS.CATEGORIES, JSON.stringify(next));
      return next;
    });
    showToast(`Category "${cat.name}" added successfully.`);
  };

  const updateCategory = (id: string, catData: Partial<CategoryItem>) => {
    setCategoriesList(prev => {
      const next = prev.map(c => (c.id === id ? { ...c, ...catData } : c));
      localStorage.setItem(LOCAL_STORAGE_KEYS.CATEGORIES, JSON.stringify(next));
      return next;
    });
    showToast('Category updated.');
  };

  const deleteCategory = (id: string) => {
    setCategoriesList(prev => {
      const next = prev.filter(c => c.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEYS.CATEGORIES, JSON.stringify(next));
      return next;
    });
    showToast('Category deleted.');
  };

  const reorderCategories = (newCategories: CategoryItem[]) => {
    setCategoriesList(newCategories);
    localStorage.setItem(LOCAL_STORAGE_KEYS.CATEGORIES, JSON.stringify(newCategories));
  };

  // Bloggr Short Videos State
  const [videosList, setVideosList] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.VIDEOS);
      return saved ? JSON.parse(saved) : INITIAL_VIDEOS;
    } catch {
      return INITIAL_VIDEOS;
    }
  });

  const addVideo = (vidData: Omit<VideoItem, 'id' | 'views' | 'likes' | 'commentsCount' | 'createdAt'>) => {
    const newVideo: VideoItem = {
      ...vidData,
      id: `vid-${Date.now()}`,
      views: 1,
      likes: 0,
      commentsCount: 0,
      createdAt: 'Just now',
      submissionStatus: currentUser.isAdmin ? 'published' : 'submitted',
    };
    setVideosList(prev => {
      const next = [newVideo, ...prev];
      localStorage.setItem(LOCAL_STORAGE_KEYS.VIDEOS, JSON.stringify(next));
      return next;
    });
    showToast(currentUser.isAdmin ? 'Video published to Bloggr Videos!' : 'Video submitted for moderation review.');
  };

  const likeVideo = (videoId: string) => {
    setVideosList(prev => {
      const next = prev.map(v => {
        if (v.id === videoId) {
          const isLiked = v.userLiked;
          return {
            ...v,
            userLiked: !isLiked,
            likes: isLiked ? Math.max(0, v.likes - 1) : v.likes + 1,
          };
        }
        return v;
      });
      localStorage.setItem(LOCAL_STORAGE_KEYS.VIDEOS, JSON.stringify(next));
      return next;
    });
  };

  // Feed Tab (For You | Following | Latest)
  const [feedTab, setFeedTab] = useState<FeedTab>('for_you');

  // Sidebar Collapsed Mode (Expanded 260px vs Collapsed 72px)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('bloggr_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('bloggr_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Content Approval Workflow & Article Moderation
  const updatePostStatus = (postId: string, status: SubmissionStatus, notes?: string) => {
    setPosts(prev => {
      const next = prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            submissionStatus: status,
            moderatorNotes: notes || p.moderatorNotes,
          };
        }
        return p;
      });
      localStorage.setItem(LOCAL_STORAGE_KEYS.POSTS, JSON.stringify(next));
      return next;
    });
    showToast(`Story status updated to "${status.replace('_', ' ')}".`);
  };

  const toggleFeaturePost = (postId: string) => {
    setPosts(prev => {
      let isNowFeatured = false;
      const next = prev.map(p => {
        if (p.id === postId) {
          isNowFeatured = !p.isFeatured;
          return { ...p, isFeatured: isNowFeatured };
        }
        return p;
      });
      localStorage.setItem(LOCAL_STORAGE_KEYS.POSTS, JSON.stringify(next));
      showToast(isNowFeatured ? 'Article featured on homepage!' : 'Article removed from featured stories.');
      return next;
    });
  };

  const deletePost = (postId: string) => {
    setPosts(prev => {
      const next = prev.filter(p => p.id !== postId);
      localStorage.setItem(LOCAL_STORAGE_KEYS.POSTS, JSON.stringify(next));
      return next;
    });
    showToast('Article deleted.');
  };

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const authFlag = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH);
      return authFlag !== 'false';
    } catch {
      return true;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [firestoreSyncState, setFirestoreSyncState] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastFirestoreSync, setLastFirestoreSync] = useState<Date | null>(null);
  const [profileInitialTab, setProfileInitialTab] = useState<string | null>(null);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setIsAuthenticated(true);
          localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH, 'true');
          setCurrentUser(prev => ({
            ...prev,
            email: user.email || prev.email,
            displayName: user.displayName || prev.displayName,
            avatar: user.photoURL || prev.avatar,
          }));
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Auth state listener notice:', e);
    }
  }, []);

  const [awardModalTarget, setAwardModalTarget] = useState<{
    type: 'post' | 'comment';
    id: string;
    postId: string;
    author: string;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isReelsOpen, setIsReelsOpen] = useState(false);
  const [isAuthorDirectoryOpen, setIsAuthorDirectoryOpen] = useState(false);

  // Article Reporting State
  const [reportModalPost, setReportModalPost] = useState<Post | null>(null);
  const [reportedPostIds, setReportedPostIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bloggr_reported_posts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const openReportModal = (post: Post) => {
    setReportModalPost(post);
  };

  const closeReportModal = () => {
    setReportModalPost(null);
  };

  const submitReport = async (postId: string, reason: string, details?: string): Promise<boolean> => {
    setReportedPostIds(prev => {
      const updated = Array.from(new Set([...prev, postId]));
      localStorage.setItem('bloggr_reported_posts', JSON.stringify(updated));
      return updated;
    });

    // Optionally record to Firestore if connected
    try {
      if (isFirebaseConnected && db) {
        addDoc(collection(db, 'reports'), {
          postId,
          reporterUsername: currentUser.username,
          reason,
          details: details || '',
          timestamp: new Date().toISOString(),
          status: 'pending_moderation',
        }).catch(() => {});
      }
    } catch {}

    setReportModalPost(null);
    showToast('Report submitted. Thank you for keeping Bloggr safe and truthful.');
    return true;
  };

  const isPostReported = (postId: string): boolean => {
    return reportedPostIds.includes(postId);
  };

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.POSTS, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.COMMUNITIES, JSON.stringify(communities));
  }, [communities]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CREATOR_APPLICATIONS, JSON.stringify(creatorApplications));
  }, [creatorApplications]);

  // Keep active post updated if posts state changes (e.g. upvotes, comment counts)
  useEffect(() => {
    if (activePost) {
      const refreshed = posts.find(p => p.id === activePost.id);
      if (refreshed) {
        setActivePost(refreshed);
      }
    }
  }, [posts]);

  // Persist user profile and Read Later list to Cloud Firestore
  const persistUserDataToFirestore = useCallback(async (user: UserProfile) => {
    setFirestoreSyncState('syncing');
    try {
      const userKey = (auth.currentUser?.uid || user.username || 'reader').toLowerCase();
      const userDocRef = doc(db, 'users', userKey);
      await setDoc(
        userDocRef,
        {
          username: user.username,
          displayName: user.displayName,
          email: user.email,
          savedPostIds: user.savedPostIds || [],
          readLaterItems: user.readLaterItems || [],
          followingAuthors: user.followingAuthors || [],
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      setFirestoreSyncState('synced');
      setLastFirestoreSync(new Date());
    } catch (err) {
      console.warn('Firestore sync note:', err);
      setFirestoreSyncState('error');
    }
  }, []);

  // Firebase Real-time Posts Collection Listener & Health Ping
  useEffect(() => {
    let unsubscribePosts: (() => void) | undefined;

    async function initFirebase() {
      const isOnline = await testFirebaseConnection();
      setIsFirebaseConnected(isOnline);

      try {
        // Real-time Posts Collection Listener
        const postsCol = collection(db, 'posts');
        unsubscribePosts = onSnapshot(
          postsCol,
          snapshot => {
            if (!snapshot.empty) {
              const remotePosts: Post[] = [];
              snapshot.forEach(docSnap => {
                remotePosts.push(docSnap.data() as Post);
              });

              if (remotePosts.length > 0) {
                setPosts(prev => {
                  const map = new Map<string, Post>();
                  remotePosts.forEach(p => map.set(p.id, p));
                  prev.forEach(p => {
                    if (!map.has(p.id)) map.set(p.id, p);
                  });
                  return Array.from(map.values());
                });
              }
            } else {
              // Initial seeding if Firestore is empty
              INITIAL_POSTS.forEach(p => {
                setDoc(doc(db, 'posts', p.id), p).catch(() => {});
              });
            }
          },
          err => {
            console.warn('Firestore posts snapshot listener note:', err);
          }
        );
      } catch (err) {
        console.warn('Firebase sync setup note:', err);
      }
    }

    initFirebase();

    return () => {
      if (unsubscribePosts) unsubscribePosts();
    };
  }, []);

  // Real-time Current User Profile & Read Later Listener across devices
  useEffect(() => {
    let unsubscribeUser: (() => void) | undefined;
    const userKey = (auth.currentUser?.uid || currentUser.username || 'reader').toLowerCase();

    try {
      const userRef = doc(db, 'users', userKey);
      unsubscribeUser = onSnapshot(
        userRef,
        docSnap => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            let hasChanged = false;
            let updatedSaved = currentUser.savedPostIds || [];
            let updatedReadLater = currentUser.readLaterItems || [];
            let updatedFollowing = currentUser.followingAuthors || [];

            if (Array.isArray(data.savedPostIds)) {
              if (JSON.stringify(data.savedPostIds) !== JSON.stringify(currentUser.savedPostIds)) {
                updatedSaved = data.savedPostIds;
                hasChanged = true;
              }
            }

            if (Array.isArray(data.readLaterItems)) {
              if (JSON.stringify(data.readLaterItems) !== JSON.stringify(currentUser.readLaterItems)) {
                updatedReadLater = data.readLaterItems;
                hasChanged = true;
              }
            } else if (Array.isArray(data.savedPostIds) && (!currentUser.readLaterItems || currentUser.readLaterItems.length === 0)) {
              updatedReadLater = (data.savedPostIds as string[]).map(id => ({
                postId: id,
                savedAt: new Date().toISOString(),
                isRead: false,
              }));
              hasChanged = true;
            }

            if (Array.isArray(data.followingAuthors)) {
              if (JSON.stringify(data.followingAuthors) !== JSON.stringify(currentUser.followingAuthors)) {
                updatedFollowing = data.followingAuthors;
                hasChanged = true;
              }
            }

            if (hasChanged) {
              setCurrentUser(prev => {
                const nextUser: UserProfile = {
                  ...prev,
                  savedPostIds: updatedSaved,
                  readLaterItems: updatedReadLater,
                  followingAuthors: updatedFollowing,
                };
                localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(nextUser));
                return nextUser;
              });
              setFirestoreSyncState('synced');
              setLastFirestoreSync(new Date());
            }
          } else {
            // First time this user doc is seen on Firestore, push initial state if user has data
            if ((currentUser.savedPostIds && currentUser.savedPostIds.length > 0) || (currentUser.followingAuthors && currentUser.followingAuthors.length > 0)) {
              setDoc(
                userRef,
                {
                  username: currentUser.username,
                  displayName: currentUser.displayName,
                  email: currentUser.email,
                  savedPostIds: currentUser.savedPostIds || [],
                  readLaterItems: currentUser.readLaterItems || [],
                  followingAuthors: currentUser.followingAuthors || [],
                  updatedAt: new Date().toISOString(),
                },
                { merge: true }
              ).catch(() => {});
            }
          }
        },
        err => {
          console.warn('Firestore user doc snapshot note:', err);
          setFirestoreSyncState('error');
        }
      );
    } catch (err) {
      console.warn('Firebase user sync listener error:', err);
    }

    return () => {
      if (unsubscribeUser) unsubscribeUser();
    };
  }, [currentUser.username, auth.currentUser?.uid]);

  // Explicit Manual Sync with Firestore
  const syncReadLaterWithFirestore = async () => {
    setFirestoreSyncState('syncing');
    try {
      const userKey = (auth.currentUser?.uid || currentUser.username || 'reader').toLowerCase();
      const userDocRef = doc(db, 'users', userKey);
      let docSnap;
      try {
        docSnap = await getDocFromServer(userDocRef);
      } catch {
        docSnap = await getDoc(userDocRef);
      }

      if (docSnap && docSnap.exists()) {
        const data = docSnap.data();
        const remoteSaved: string[] = Array.isArray(data.savedPostIds) ? data.savedPostIds : [];
        const remoteReadLater: ReadLaterEntry[] = Array.isArray(data.readLaterItems) ? data.readLaterItems : [];

        // Merge remote and local to preserve any saved items across devices
        const combinedSavedSet = new Set([...(currentUser.savedPostIds || []), ...remoteSaved]);
        const combinedSaved = Array.from(combinedSavedSet);

        // Merge readLaterItems
        const itemMap = new Map<string, ReadLaterEntry>();
        (currentUser.readLaterItems || []).forEach(item => itemMap.set(item.postId, item));
        remoteReadLater.forEach(item => {
          if (!itemMap.has(item.postId)) {
            itemMap.set(item.postId, item);
          } else {
            const local = itemMap.get(item.postId)!;
            itemMap.set(item.postId, {
              ...local,
              isRead: local.isRead || item.isRead,
            });
          }
        });
        combinedSaved.forEach(id => {
          if (!itemMap.has(id)) {
            itemMap.set(id, { postId: id, savedAt: new Date().toISOString(), isRead: false });
          }
        });

        const mergedItems = Array.from(itemMap.values());
        const mergedUser: UserProfile = {
          ...currentUser,
          savedPostIds: combinedSaved,
          readLaterItems: mergedItems,
        };

        setCurrentUser(mergedUser);
        localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(mergedUser));

        await setDoc(
          userDocRef,
          {
            username: mergedUser.username,
            displayName: mergedUser.displayName,
            email: mergedUser.email,
            savedPostIds: combinedSaved,
            readLaterItems: mergedItems,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        setFirestoreSyncState('synced');
        setLastFirestoreSync(new Date());
        showToast('Read Later list synced with Cloud Firestore ☁️');
      } else {
        await persistUserDataToFirestore(currentUser);
        setFirestoreSyncState('synced');
        setLastFirestoreSync(new Date());
        showToast('Read Later list uploaded to Cloud Firestore ☁️');
      }
    } catch (err) {
      console.warn('Manual sync with Firestore note:', err);
      setFirestoreSyncState('error');
      showToast('Could not sync with Firestore. Saved locally for offline access.');
    }
  };

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  // Follow / Unfollow Author Action
  const toggleFollowAuthor = useCallback(
    async (authorUsername: string) => {
      if (!authorUsername || authorUsername.toLowerCase() === currentUser.username.toLowerCase()) {
        showToast('You cannot follow your own profile.');
        return;
      }

      const currentList = currentUser.followingAuthors || [];
      const isFollowing = currentList.some(a => a.toLowerCase() === authorUsername.toLowerCase());
      const nextList = isFollowing
        ? currentList.filter(a => a.toLowerCase() !== authorUsername.toLowerCase())
        : [...currentList, authorUsername];

      // Optimistic update
      setCurrentUser(prev => ({
        ...prev,
        followingAuthors: nextList,
      }));

      showToast(
        isFollowing
          ? `Unfollowed u/${authorUsername}`
          : `Following u/${authorUsername}! News updates will appear in your Following timeline.`
      );

      // Persist to Firestore backend
      try {
        await setDoc(
          doc(db, 'users', currentUser.username),
          {
            username: currentUser.username,
            followingAuthors: nextList,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Firebase follow sync error:', err);
      }
    },
    [currentUser.username, currentUser.followingAuthors, showToast]
  );

  const isFollowingAuthor = useCallback(
    (authorUsername: string): boolean => {
      if (!authorUsername) return false;
      return (currentUser.followingAuthors || []).some(
        a => a.toLowerCase() === authorUsername.toLowerCase()
      );
    },
    [currentUser.followingAuthors]
  );

  const setTimelineFilter = (filter: NewsCategoryFilter) => {
    setTimelineFilterState(filter);
    const filterLower = String(filter).toLowerCase();
    if (filterLower === 'all') {
      setMainNavTabState('home');
    } else if (
      filterLower === 'news' ||
      filterLower === 'kenya' ||
      filterLower === 'africa' ||
      filterLower === 'global'
    ) {
      setMainNavTabState('news');
    } else if (filterLower === 'football') {
      setMainNavTabState('football');
    } else if (filterLower === 'opinion') {
      setMainNavTabState('opinion');
    }
  };

  const setMainNavTab = (tab: MainNavigationTab) => {
    setMainNavTabState(tab);
    setIsUserProfileOpen(false);
    setActivePost(null);
    setSelectedFlair(null);
    if (tab === 'home') {
      setTimelineFilterState('all');
      setActiveFeedState('home');
    } else if (tab === 'news') {
      setTimelineFilterState('NEWS');
      setActiveFeedState('news');
    } else if (tab === 'football') {
      setTimelineFilterState('FOOTBALL');
      setActiveFeedState('football');
    } else if (tab === 'opinion') {
      setTimelineFilterState('OPINION');
      setActiveFeedState('opinion');
    }
  };

  const setActiveFeed = (feed: string) => {
    setActiveFeedState(feed);
    setSelectedFlair(null);
    const lower = feed.toLowerCase();
    if (lower === 'home' || lower === 'popular' || lower === 'all') {
      setMainNavTabState('home');
      setTimelineFilterState('all');
    } else if (lower === 'news') {
      setMainNavTabState('news');
      setTimelineFilterState('NEWS');
    } else if (lower === 'football') {
      setMainNavTabState('football');
      setTimelineFilterState('FOOTBALL');
    } else if (lower === 'opinion') {
      setMainNavTabState('opinion');
      setTimelineFilterState('OPINION');
    }
  };

  // Authentication Methods
  const login = async (emailOrUsername: string, password?: string): Promise<boolean> => {
    try {
      if (password && emailOrUsername.includes('@')) {
        try {
          await signInWithEmailAndPassword(auth, emailOrUsername, password);
        } catch (fbErr: any) {
          console.warn('Firebase Auth sign in notice (fallback to local session):', fbErr?.message);
        }
      }
      let loggedInUser: UserProfile;
      const lower = emailOrUsername.trim().toLowerCase();
      if (lower === 'bloggr' || lower === 'info@bloggr.org') {
        loggedInUser = {
          ...ADMIN_USER,
          email: 'info@bloggr.org',
          username: 'Bloggr',
          displayName: 'Bloggr',
          isAdmin: true,
          isVerified: true,
          isCreator: true,
        };
      } else if (lower === 'alexrider' || lower === 'alex.rider@bloggr.news') {
        loggedInUser = DEMO_ALEX_USER;
      } else {
        const displayName = emailOrUsername.includes('@') ? emailOrUsername.split('@')[0] : emailOrUsername;
        loggedInUser = {
          ...currentUser,
          username: displayName.replace(/[^a-zA-Z0-9_]/g, '') || 'reader',
          displayName: displayName,
          email: emailOrUsername.includes('@') ? emailOrUsername : `${displayName.toLowerCase()}@bloggr.news`,
        };
      }
      setCurrentUser(loggedInUser);
      setIsAuthenticated(true);
      localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH, 'true');
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(loggedInUser));
      setIsAuthModalOpen(false);
      showToast(`Welcome back, ${loggedInUser.displayName}!`);
      return true;
    } catch (e: any) {
      showToast(e?.message || 'Login failed. Please try again.');
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const user = res.user;
      const cleanUsername = (user.displayName || user.email?.split('@')[0] || 'reader')
        .toLowerCase()
        .replace(/[^a-zA-Z0-9_]/g, '') || 'reader';

      const loggedInUser: UserProfile = {
        ...currentUser,
        username: cleanUsername,
        displayName: user.displayName || cleanUsername,
        email: user.email || `${cleanUsername}@bloggr.news`,
        avatar: user.photoURL || currentUser.avatar,
        isCreator: true,
        creatorStatus: 'approved',
      };

      setCurrentUser(loggedInUser);
      setIsAuthenticated(true);
      localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH, 'true');
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(loggedInUser));
      setIsAuthModalOpen(false);
      showToast(`Signed in with Google as ${loggedInUser.displayName}!`);
      return true;
    } catch (err: any) {
      console.warn('Google Sign-In notice:', err);
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        showToast('Google Sign-In window closed.');
        return false;
      }
      showToast(err?.message || 'Google Sign-In could not complete.');
      return false;
    }
  };

  const register = async (data: {
    username: string;
    displayName: string;
    email: string;
    password?: string;
    bio?: string;
  }): Promise<boolean> => {
    try {
      if (data.password && data.email) {
        try {
          await createUserWithEmailAndPassword(auth, data.email, data.password);
        } catch (fbErr: any) {
          console.warn('Firebase Auth register notice (fallback to local session):', fbErr?.message);
        }
      }
      const cleanUsername = data.username.replace(/[^a-zA-Z0-9_]/g, '') || 'reader';
      const newUser: UserProfile = {
        username: cleanUsername,
        displayName: data.displayName || cleanUsername,
        email: data.email,
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
        bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        bio: data.bio || 'News wire reader & reporter.',
        karma: { post: 15, comment: 10, total: 25 },
        cakeDay: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        joinedCommunities: [],
        savedPostIds: [],
        followingAuthors: ['ElenaVance', 'QuantumEngineer'],
        isCreator: true,
        creatorStatus: 'approved',
        isAdmin: false,
        emailNotifications: true,
        breakingNewsAlerts: true,
        dataSaverMode: false,
        favoriteCategory: 'Kenya News',
      };
      setCurrentUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH, 'true');
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(newUser));
      setIsAuthModalOpen(false);
      showToast(`Account created! Welcome, ${newUser.displayName}!`);
      return true;
    } catch (e: any) {
      showToast(e?.message || 'Registration failed. Please try again.');
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth).catch(() => {});
    } catch (e) {}
    setIsAuthenticated(false);
    localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH, 'false');
    const guestUser: UserProfile = {
      username: 'GuestReader',
      displayName: 'Guest Reader',
      email: '',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      bio: 'Exploring digital news wire dispatches across Kenya, Africa, and global sports.',
      karma: { post: 0, comment: 0, total: 0 },
      cakeDay: 'Today',
      joinedCommunities: [],
      savedPostIds: [],
      followingAuthors: [],
      isCreator: false,
      creatorStatus: 'none',
      isAdmin: false,
      emailNotifications: false,
      breakingNewsAlerts: false,
      dataSaverMode: false,
      favoriteCategory: 'Global news',
    };
    setCurrentUser(guestUser);
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(guestUser));
    showToast('You have been signed out.');
  };

  const updateProfileSettings = (settings: Partial<UserProfile>) => {
    setCurrentUser(prev => {
      const updated = { ...prev, ...settings };
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(updated));
      return updated;
    });

    // If avatar was changed, update all existing posts authored by this user
    if (settings.avatar) {
      setPosts(prev =>
        prev.map(p =>
          p.author.toLowerCase() === currentUser.username.toLowerCase()
            ? { ...p, authorAvatar: settings.avatar! }
            : p
        )
      );
    }

    // Sync to Firestore users collection
    try {
      setDoc(
        doc(db, 'users', currentUser.username),
        {
          ...settings,
          username: currentUser.username,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      ).catch(() => {});
    } catch (e) {}

    showToast(settings.avatar ? 'Profile picture updated!' : 'Profile & alert preferences updated.');
  };

  // Admin marks author as verified or revokes verification
  const markAuthorVerified = async (username: string, isVerified: boolean, role?: string) => {
    const verifiedRole = role || 'Accredited Journalist';
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // 1. Update currentUser if matching
    if (currentUser.username.toLowerCase() === username.toLowerCase()) {
      setCurrentUser(prev => {
        const updated: UserProfile = {
          ...prev,
          isVerified,
          isCreator: true,
          creatorStatus: isVerified ? 'approved' : prev.creatorStatus,
          verifiedRole: isVerified ? verifiedRole : undefined,
          verifiedAt: isVerified ? dateStr : undefined,
          verifiedBy: currentUser.displayName || currentUser.username,
        };
        localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(updated));
        return updated;
      });
    }

    // 2. Update all posts in memory matching this author
    setPosts(prev =>
      prev.map(p => {
        if (p.author.toLowerCase() === username.toLowerCase()) {
          return {
            ...p,
            authorVerified: isVerified,
            authorRole: isVerified ? (p.authorRole || verifiedRole) : undefined,
          };
        }
        return p;
      })
    );

    // 3. Update any creator applications
    setCreatorApplications(prev =>
      prev.map(a => {
        if (a.username.toLowerCase() === username.toLowerCase()) {
          return {
            ...a,
            status: isVerified ? 'approved' : a.status,
            reviewedBy: `${currentUser.displayName || currentUser.username} (Admin)`,
            reviewedAt: 'Just now',
          };
        }
        return a;
      })
    );

    // 4. Sync to Firestore backend
    try {
      await setDoc(
        doc(db, 'users', username),
        {
          username,
          isVerified,
          verifiedRole: isVerified ? verifiedRole : null,
          verifiedAt: isVerified ? dateStr : null,
          verifiedBy: currentUser.username,
          isCreator: true,
          creatorStatus: isVerified ? 'approved' : 'none',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Firestore verification update note:', e);
    }

    if (isVerified) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
      showToast(`Accredited Journalist badge granted to @${username}!`);
    } else {
      showToast(`Verification status revoked for @${username}.`);
    }
  };

  const isAuthorVerified = (authorUsername: string): boolean => {
    if (!authorUsername) return false;
    const lower = authorUsername.toLowerCase();
    if (currentUser.username.toLowerCase() === lower) {
      return Boolean(currentUser.isVerified);
    }
    const match = posts.find(p => p.author.toLowerCase() === lower);
    if (match && match.authorVerified !== undefined) {
      return Boolean(match.authorVerified);
    }
    const rec = RECOMMENDED_AUTHORS.find(a => a.username.toLowerCase() === lower);
    if (rec && rec.verified !== undefined) {
      return Boolean(rec.verified);
    }
    return false;
  };

  const openUserProfile = (username?: string, initialTab?: string) => {
    setProfileTargetUser(username || currentUser.username);
    if (initialTab) {
      setProfileInitialTab(initialTab);
    }
    setIsUserProfileOpen(true);
    setIsReelsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeUserProfile = () => {
    setIsUserProfileOpen(false);
    setProfileTargetUser(null);
    setProfileInitialTab(null);
  };

  const openAwardModal = (target: { type: 'post' | 'comment'; id: string; postId: string; author: string }) => {
    setAwardModalTarget(target);
  };

  const closeAwardModal = () => {
    setAwardModalTarget(null);
  };

  // Vote Post (Reddit karma logic)
  const votePost = (postId: string, direction: 'up' | 'down') => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id !== postId) return post;

        let scoreDelta = 0;
        let newVote: VoteType = null;

        if (post.userVote === direction) {
          // Revert vote
          scoreDelta = direction === 'up' ? -1 : 1;
          newVote = null;
        } else if (post.userVote === null) {
          // New vote
          scoreDelta = direction === 'up' ? 1 : -1;
          newVote = direction;
        } else {
          // Flip vote (e.g. from down to up or up to down)
          scoreDelta = direction === 'up' ? 2 : -2;
          newVote = direction;
        }

        // If current user is author, adjust karma
        if (post.author === currentUser.username) {
          setCurrentUser(u => ({
            ...u,
            karma: {
              ...u.karma,
              post: u.karma.post + scoreDelta,
              total: u.karma.total + scoreDelta,
            },
          }));
        }

        const updatedPost = {
          ...post,
          score: post.score + scoreDelta,
          userVote: newVote,
        };

        // Sync vote update to Firestore backend
        try {
          updateDoc(doc(db, 'posts', postId), {
            score: updatedPost.score,
          }).catch(() => {});
        } catch (e) {}

        return updatedPost;
      })
    );
  };

  // Vote Comment
  const updateCommentVoteRecursive = (list: Comment[], targetId: string, direction: 'up' | 'down'): Comment[] => {
    return list.map(c => {
      if (c.id === targetId) {
        let scoreDelta = 0;
        let newVote: VoteType = null;

        if (c.userVote === direction) {
          scoreDelta = direction === 'up' ? -1 : 1;
          newVote = null;
        } else if (c.userVote === null) {
          scoreDelta = direction === 'up' ? 1 : -1;
          newVote = direction;
        } else {
          scoreDelta = direction === 'up' ? 2 : -2;
          newVote = direction;
        }

        return {
          ...c,
          score: c.score + scoreDelta,
          userVote: newVote,
        };
      }

      if (c.replies && c.replies.length > 0) {
        return {
          ...c,
          replies: updateCommentVoteRecursive(c.replies, targetId, direction),
        };
      }

      return c;
    });
  };

  const voteComment = (commentId: string, postId: string, direction: 'up' | 'down') => {
    setComments(prev => {
      const currentList = prev[postId] || [];
      return {
        ...prev,
        [postId]: updateCommentVoteRecursive(currentList, commentId, direction),
      };
    });
  };

  // Add Comment (recursive insertion if parentId exists)
  const insertReplyRecursive = (list: Comment[], parentId: string, newReply: Comment): Comment[] => {
    return list.map(c => {
      if (c.id === parentId) {
        return {
          ...c,
          replies: [...(c.replies || []), newReply],
        };
      }
      if (c.replies && c.replies.length > 0) {
        return {
          ...c,
          replies: insertReplyRecursive(c.replies, parentId, newReply),
        };
      }
      return c;
    });
  };

  const addComment = (postId: string, content: string, parentId?: string | null) => {
    if (!content.trim()) return;

    const newComment: Comment = {
      id: `c-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      postId,
      parentId: parentId || null,
      author: currentUser.username,
      authorAvatar: currentUser.avatar,
      authorFlair: undefined,
      content: content.trim(),
      createdAt: 'Just now',
      score: 1,
      userVote: 'up',
      awards: [],
      replies: [],
    };

    setComments(prev => {
      const postComments = prev[postId] || [];
      if (parentId) {
        return {
          ...prev,
          [postId]: insertReplyRecursive(postComments, parentId, newComment),
        };
      } else {
        return {
          ...prev,
          [postId]: [newComment, ...postComments],
        };
      }
    });

    // Update post commentsCount
    setPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p))
    );

    // Increase current user comment karma
    setCurrentUser(u => ({
      ...u,
      karma: {
        ...u.karma,
        comment: u.karma.comment + 1,
        total: u.karma.total + 1,
      },
    }));

    showToast('Comment posted successfully!');
  };

  // Apply to become a creator (User Dashboard)
  const applyForCreator = (data: { category: string; bio: string; sampleTopic: string; portfolioUrl?: string }) => {
    const newApp: CreatorApplication = {
      id: `app-${Date.now()}`,
      username: currentUser.username,
      displayName: currentUser.displayName,
      avatar: currentUser.avatar,
      category: data.category,
      bio: data.bio,
      sampleTopic: data.sampleTopic,
      portfolioUrl: data.portfolioUrl,
      appliedAt: 'Just now',
      status: 'pending',
    };

    setCreatorApplications(prev => [newApp, ...prev.filter(a => a.username !== currentUser.username)]);
    setCurrentUser(prev => ({
      ...prev,
      creatorStatus: 'pending',
    }));

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      type: 'welcome',
      title: 'Creator Application Submitted',
      message: 'Your application has been received! Bloggr Admins will review your portfolio and grant posting privileges.',
      timeAgo: 'Just now',
      read: false,
    };
    setNotifications(prev => [notif, ...prev]);
    showToast('Creator application submitted! Pending Admin manual approval.');
  };

  // Admin approves creator manually
  const approveCreatorApplication = (applicationId: string) => {
    let approvedUsername = '';
    setCreatorApplications(prev =>
      prev.map(app => {
        if (app.id === applicationId) {
          approvedUsername = app.username;
          return {
            ...app,
            status: 'approved',
            reviewedBy: `${currentUser.username} (Admin)`,
            reviewedAt: 'Just now',
          };
        }
        return app;
      })
    );

    if (approvedUsername === currentUser.username || !approvedUsername) {
      setCurrentUser(prev => ({
        ...prev,
        isCreator: true,
        creatorStatus: 'approved',
      }));
    }

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      type: 'award',
      title: 'Creator Privileges Approved!',
      message: 'Your creator application was approved by an Admin! You can now publish posts on Bloggr.',
      timeAgo: 'Just now',
      read: false,
    };
    setNotifications(prev => [notif, ...prev]);
    showToast('Creator approved! User can now publish posts on Bloggr.');
  };

  // Admin rejects creator
  const rejectCreatorApplication = (applicationId: string) => {
    let rejectedUsername = '';
    setCreatorApplications(prev =>
      prev.map(app => {
        if (app.id === applicationId) {
          rejectedUsername = app.username;
          return {
            ...app,
            status: 'rejected',
            reviewedBy: `${currentUser.username} (Admin)`,
            reviewedAt: 'Just now',
          };
        }
        return app;
      })
    );

    if (rejectedUsername === currentUser.username) {
      setCurrentUser(prev => ({
        ...prev,
        isCreator: false,
        creatorStatus: 'rejected',
      }));
    }
    showToast('Application marked as rejected.');
  };

  // Toggle user creator status (handy for testing)
  const toggleUserCreatorStatus = () => {
    setCurrentUser(prev => {
      const nextIsCreator = !prev.isCreator;
      showToast(nextIsCreator ? 'Creator mode enabled! You can now post.' : 'Creator mode disabled.');
      return {
        ...prev,
        isCreator: nextIsCreator,
        creatorStatus: nextIsCreator ? 'approved' : 'none',
      };
    });
  };

  // Create Post supporting content moderation workflow (Draft -> Submitted -> Under Review -> Approved -> Published)
  const createPost = (postData: Partial<Post>): Post => {
    const assignedCategory = postData.category || 'NEWS';
    const isEditorial = currentUser.isAdmin || currentUser.isCreator;
    const initialStatus: SubmissionStatus =
      postData.submissionStatus || (isEditorial ? 'published' : 'submitted');

    const newPost: Post = {
      id: `post-${Date.now()}`,
      category: assignedCategory,
      categories: postData.categories && postData.categories.length > 0 ? postData.categories : [assignedCategory],
      title: postData.title || 'Untitled Post',
      type: postData.type || 'text',
      content: postData.content,
      url: postData.url,
      domain: postData.url ? new URL(postData.url.startsWith('http') ? postData.url : `https://${postData.url}`).hostname.replace('www.', '') : undefined,
      imageUrl: postData.imageUrl || postData.thumbnail,
      thumbnail: postData.thumbnail || postData.imageUrl,
      pollOptions: postData.pollOptions,
      pollDurationDays: postData.pollDurationDays || 3,
      author: currentUser.username,
      authorAvatar: currentUser.avatar,
      authorKarma: currentUser.karma.total,
      authorRole: currentUser.verifiedRole || (currentUser.isVerified ? 'Accredited Journalist' : 'Community Writer'),
      authorVerified: Boolean(currentUser.isVerified),
      createdAt: 'Just now',
      score: 1,
      userVote: 'up',
      commentsCount: 0,
      tags: postData.tags || (postData.flair ? [postData.flair] : ['Kenya']),
      flair: postData.flair || (postData.tags && postData.tags[0]) || undefined,
      isPinned: false,
      isFeatured: postData.isFeatured || false,
      location: postData.location,
      videoUrl: postData.videoUrl,
      additionalImages: postData.additionalImages || [],
      submissionStatus: initialStatus,
      awards: [],
      monetaryGiftsTotalKsh: 0,
      views: 1,
      isBreaking: postData.isBreaking || false,
      readTimeMinutes: postData.readTimeMinutes || 3,
      summary: postData.summary || (postData.content ? postData.content.slice(0, 160) + '...' : undefined),
    };

    setPosts(prev => [newPost, ...prev]);

    // Persist new post to Firestore backend
    try {
      setDoc(doc(db, 'posts', newPost.id), newPost).catch(e => {
        console.warn('Firestore createPost offline write:', e);
      });
    } catch (e) {}

    // Increase user post karma
    setCurrentUser(u => ({
      ...u,
      karma: {
        ...u.karma,
        post: u.karma.post + 1,
        total: u.karma.total + 1,
      },
    }));

    if (initialStatus === 'submitted') {
      showToast('Article submitted for editorial review! 📋');
    } else if (initialStatus === 'draft') {
      showToast('Draft saved successfully! 💾');
    } else {
      showToast(`Published to ${assignedCategory}! 📰`);
    }
    setIsCreatePostOpen(false);
    return newPost;
  };

  // Create Community
  const createCommunity = (data: {
    name: string;
    displayName: string;
    description: string;
    category: Community['category'];
    iconEmoji: string;
    themeColor: string;
  }): Community => {
    const cleanName = data.name.toLowerCase().replace(/[^a-z0-9_]/g, '');
    const id = `b/${cleanName}`;

    const newCommunity: Community = {
      id,
      name: cleanName,
      displayName: data.displayName,
      description: data.description,
      category: data.category,
      membersCount: 1,
      onlineCount: 1,
      createdAt: 'Just now',
      iconEmoji: data.iconEmoji || '💬',
      bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      themeColor: data.themeColor || '#ea580c',
      rules: [
        { id: 'r1', title: 'Be respectful & adhere to topic', description: 'Treat fellow community members with courtesy.' },
      ],
      moderators: [currentUser.username],
      flairs: ['Discussion', 'General', 'Question', 'News'],
    };

    setCommunities(prev => [newCommunity, ...prev]);
    // Auto join creator to the community
    setCurrentUser(u => ({
      ...u,
      joinedCommunities: [...u.joinedCommunities, id],
    }));

    setIsCreateCommunityOpen(false);
    setActiveFeed(id);
    showToast(`Community ${id} created!`);
    return newCommunity;
  };

  // Toggle Join Community
  const toggleJoinCommunity = (communityId: string) => {
    const isJoined = currentUser.joinedCommunities.includes(communityId);

    setCurrentUser(u => ({
      ...u,
      joinedCommunities: isJoined
        ? u.joinedCommunities.filter(id => id !== communityId)
        : [...u.joinedCommunities, communityId],
    }));

    setCommunities(prev =>
      prev.map(c =>
        c.id === communityId
          ? { ...c, membersCount: c.membersCount + (isJoined ? -1 : 1) }
          : c
      )
    );

    showToast(isJoined ? `Left ${communityId}` : `Joined ${communityId}!`);
  };

  // Toggle Save Post / Bookmark into personal 'Saved' list with Cloud Firestore Sync
  const toggleSavePost = (postId: string) => {
    const isSaved = (currentUser.savedPostIds || []).includes(postId);
    const newSaved = isSaved
      ? (currentUser.savedPostIds || []).filter(id => id !== postId)
      : [...(currentUser.savedPostIds || []), postId];

    const existingItems = currentUser.readLaterItems || [];
    const newReadLaterItems = isSaved
      ? existingItems.filter(item => item.postId !== postId)
      : [{ postId, savedAt: new Date().toISOString(), isRead: false }, ...existingItems];

    const updatedUser: UserProfile = {
      ...currentUser,
      savedPostIds: newSaved,
      readLaterItems: newReadLaterItems,
    };

    setCurrentUser(updatedUser);
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(updatedUser));

    showToast(isSaved ? 'Article removed from Saved list' : "Saved to your personal 'Saved' list (Synced with Firestore) 🔖");

    // 1. Sync updated profile arrays to Firestore
    persistUserDataToFirestore(updatedUser).catch(() => {});

    // 2. Sync to subcollection /users/{userId}/savedPosts/{postId} for granular querying
    try {
      const userKey = (auth.currentUser?.uid || currentUser.username || 'reader').toLowerCase();
      const savedDocRef = doc(db, 'users', userKey, 'savedPosts', postId);
      if (isSaved) {
        deleteDoc(savedDocRef).catch(() => {});
      } else {
        setDoc(savedDocRef, {
          postId,
          savedAt: new Date().toISOString(),
          isRead: false,
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('Firestore savedPosts subcollection sync notice:', e);
    }
  };

  const markReadLaterStatus = async (postId: string, isRead: boolean) => {
    const existingItems = currentUser.readLaterItems || [];
    let found = false;
    const newItems = existingItems.map(item => {
      if (item.postId === postId) {
        found = true;
        return { ...item, isRead };
      }
      return item;
    });

    if (!found) {
      newItems.unshift({ postId, savedAt: new Date().toISOString(), isRead });
    }

    const updatedUser: UserProfile = {
      ...currentUser,
      readLaterItems: newItems,
    };

    setCurrentUser(updatedUser);
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    showToast(isRead ? 'Marked article as completed ✓' : 'Marked article as unread');

    await persistUserDataToFirestore(updatedUser);
  };

  const clearReadLater = async (onlyCompleted = false) => {
    let newReadLaterItems: ReadLaterEntry[] = [];
    let newSavedPostIds: string[] = [];

    if (onlyCompleted) {
      newReadLaterItems = (currentUser.readLaterItems || []).filter(item => !item.isRead);
      newSavedPostIds = newReadLaterItems.map(item => item.postId);
      showToast('Cleared completed articles from Read Later');
    } else {
      newReadLaterItems = [];
      newSavedPostIds = [];
      showToast('Cleared all articles from Read Later');
    }

    const updatedUser: UserProfile = {
      ...currentUser,
      savedPostIds: newSavedPostIds,
      readLaterItems: newReadLaterItems,
    };

    setCurrentUser(updatedUser);
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(updatedUser));

    await persistUserDataToFirestore(updatedUser);
  };

  // Give Award
  const awardConfig: Record<AwardType, { name: string; emoji: string; karmaBonus: number }> = {
    gold: { name: 'Gold', emoji: '🥇', karmaBonus: 100 },
    silver: { name: 'Silver', emoji: '🥈', karmaBonus: 30 },
    platinum: { name: 'Platinum', emoji: '💎', karmaBonus: 250 },
    helpful: { name: 'Helpful', emoji: '🤝', karmaBonus: 20 },
    rocket: { name: 'Rocket', emoji: '🚀', karmaBonus: 50 },
    mindblown: { name: 'Mind Blown', emoji: '🤯', karmaBonus: 60 },
  };

  const addAwardToRecords = (existingAwards: AwardRecord[] = [], type: AwardType): AwardRecord[] => {
    const found = existingAwards.find(a => a.type === type);
    const info = awardConfig[type];
    if (found) {
      return existingAwards.map(a => (a.type === type ? { ...a, count: a.count + 1 } : a));
    }
    return [...existingAwards, { type, name: info.name, emoji: info.emoji, count: 1 }];
  };

  const awardGiftKshValues: Record<AwardType, number> = {
    silver: 200,
    helpful: 350,
    rocket: 500,
    mindblown: 1000,
    gold: 2500,
    platinum: 5000,
  };

  const giveAward = (awardType: AwardType, customKsh?: number) => {
    if (!awardModalTarget) return;

    // Trigger celebratory confetti blast
    confetti({
      particleCount: 65,
      spread: 70,
      origin: { y: 0.6 },
    });

    const info = awardConfig[awardType];
    const monetaryGiftKsh = customKsh || awardGiftKshValues[awardType] || 250;
    const authorSplitKsh = monetaryGiftKsh * AUTHOR_SHARE_RATIO; // 65%
    const adminSplitKsh = monetaryGiftKsh * ADMIN_SHARE_RATIO; // 35%

    if (awardModalTarget.type === 'post') {
      setPosts(prev =>
        prev.map(p => {
          if (p.id === awardModalTarget.id) {
            return {
              ...p,
              score: p.score + 10,
              awards: addAwardToRecords(p.awards, awardType),
              monetaryGiftsTotalKsh: (p.monetaryGiftsTotalKsh || 0) + monetaryGiftKsh,
            };
          }
          return p;
        })
      );
    } else {
      // Awarding comment
      const addAwardToCommentsRecursive = (list: Comment[]): Comment[] => {
        return list.map(c => {
          if (c.id === awardModalTarget.id) {
            return {
              ...c,
              awards: addAwardToRecords(c.awards, awardType),
            };
          }
          if (c.replies && c.replies.length > 0) {
            return {
              ...c,
              replies: addAwardToCommentsRecursive(c.replies),
            };
          }
          return c;
        });
      };

      setComments(prev => {
        const postComments = prev[awardModalTarget.postId] || [];
        return {
          ...prev,
          [awardModalTarget.postId]: addAwardToCommentsRecursive(postComments),
        };
      });
    }

    // Add notification
    const newNotification: AppNotification = {
      id: `notif-${Date.now()}`,
      type: 'award',
      title: 'Monetary Gift Award Sent!',
      message: `You gifted ${info.emoji} ${info.name} (KSh ${monetaryGiftKsh.toLocaleString()}) to u/${awardModalTarget.author}! Author receives 65% (KSh ${authorSplitKsh.toFixed(2)}), Site Admin receives 35% (KSh ${adminSplitKsh.toFixed(2)}).`,
      timeAgo: 'Just now',
      read: false,
      postId: awardModalTarget.postId,
    };
    setNotifications(prev => [newNotification, ...prev]);

    if (awardModalTarget.author.toLowerCase() === currentUser.username.toLowerCase()) {
      showToast(`Awarded ${info.emoji} ${info.name}! KSh ${authorSplitKsh.toFixed(2)} (65% share) added to your author earnings.`);
    } else {
      showToast(`Awarded ${info.emoji} ${info.name} (KSh ${monetaryGiftKsh.toLocaleString()})! u/${awardModalTarget.author} receives KSh ${authorSplitKsh.toFixed(2)} (65%).`);
    }

    closeAwardModal();
  };

  // Vote on Poll
  const votePoll = (postId: string, optionId: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId || !p.pollOptions) return p;

        // Check if user already voted in this poll
        const alreadyVotedOption = p.pollOptions.find(o =>
          o.votedUserIds.includes(currentUser.username)
        );

        if (alreadyVotedOption) {
          showToast('You have already cast your vote in this poll.');
          return p;
        }

        const updatedOptions = p.pollOptions.map(opt => {
          if (opt.id === optionId) {
            return {
              ...opt,
              votes: opt.votes + 1,
              votedUserIds: [...opt.votedUserIds, currentUser.username],
            };
          }
          return opt;
        });

        return {
          ...p,
          pollOptions: updatedOptions,
        };
      })
    );
    showToast('Vote recorded!');
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (activeNotification?.id === id) {
      setActiveNotification(null);
    }
    showToast('Notification deleted');
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setActiveNotification(null);
    showToast('All notifications cleared');
  };

  const openNotification = (notif: AppNotification) => {
    // Mark as read
    setNotifications(prev => prev.map(n => (n.id === notif.id ? { ...n, read: true } : n)));
    setActiveNotification(notif);

    if (notif.postId) {
      const targetPost = posts.find(p => p.id === notif.postId);
      if (targetPost) {
        setActivePost(targetPost);
        setIsUserProfileOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const resetToDefaults = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.POSTS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.COMMUNITIES);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.COMMENTS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.NOTIFICATIONS);
    setPosts(INITIAL_POSTS);
    setCommunities(INITIAL_COMMUNITIES);
    setComments(INITIAL_COMMENTS);
    setCurrentUser(INITIAL_USER);
    setNotifications(INITIAL_NOTIFICATIONS);
    showToast('Reset sample data to fresh defaults.');
  };

  return (
    <BloggrContext.Provider
      value={{
        posts,
        communities,
        comments,
        currentUser,
        notifications,
        unreadNotificationsCount: notifications.filter(n => !n.read).length,
        creatorApplications,
        activeFeed,
        feedSort,
        topTimeRange,
        viewMode,
        searchQuery,
        selectedFlair,
        theme,
        activePost,
        isCreatePostOpen,
        isCreateCommunityOpen,
        isUserProfileOpen,
        profileTargetUser,
        awardModalTarget,
        toastMessage,
        isReelsOpen,
        policyModalPage,
        timelineFilter,
        timelineLayout,
        mainNavTab,
        setMainNavTab,
        isFirebaseConnected,
        isAppLoading,
        setIsAppLoading,
        isAuthorDirectoryOpen,

        // Platform Branding & Administration
        platformBranding,
        updatePlatformBranding,
        categoriesList,
        addCategory,
        updateCategory,
        deleteCategory,
        reorderCategories,
        videosList,
        addVideo,
        likeVideo,
        feedTab,
        setFeedTab,
        sidebarCollapsed,
        toggleSidebarCollapse,
        isAdminDashboardOpen,
        setIsAdminDashboardOpen,
        isMessagesOpen,
        setIsMessagesOpen,
        isMobileSideNavOpen,
        setIsMobileSideNavOpen,
        toggleMobileSideNav,
        closeMobileSideNav,
        updatePostStatus,
        toggleFeaturePost,
        deletePost,

        // Auth
        isAuthenticated,
        isAuthModalOpen,
        authModalMode,
        setIsAuthModalOpen,
        setAuthModalMode,
        login,
        loginWithGoogle,
        register,
        logout,
        updateProfileSettings,

        setActiveFeed,
        setFeedSort,
        setTopTimeRange,
        setViewMode,
        setTimelineFilter,
        setTimelineLayout,
        toggleFollowAuthor,
        isFollowingAuthor,
        setSearchQuery,
        setSelectedFlair,
        toggleTheme,
        setActivePost,
        createPostInitialMode,
        setCreatePostInitialMode,
        openCreatePostModal,
        setIsCreatePostOpen,
        setIsCreateCommunityOpen,
        setIsReelsOpen,
        openUserProfile,
        closeUserProfile,
        profileInitialTab,
        setProfileInitialTab,
        openAwardModal,
        closeAwardModal,
        showToast,
        openPolicyPage,
        openPolicyModal,
        closePolicyPage,
        setIsAuthorDirectoryOpen,

        // Report feature
        reportedPostIds,
        reportModalPost,
        openReportModal,
        closeReportModal,
        submitReport,
        isPostReported,

        applyForCreator,
        approveCreatorApplication,
        rejectCreatorApplication,
        toggleUserCreatorStatus,
        markAuthorVerified,
        isAuthorVerified,

        votePost,
        voteComment,
        addComment,
        createPost,
        createCommunity,
        toggleJoinCommunity,
        toggleSavePost,
        markReadLaterStatus,
        clearReadLater,
        syncReadLaterWithFirestore,
        firestoreSyncState,
        lastFirestoreSync,
        giveAward,
        votePoll,
        markNotificationsAsRead,
        deleteNotification,
        clearAllNotifications,
        activeNotification,
        setActiveNotification,
        openNotification,
        resetToDefaults,
      }}
    >
      {children}
    </BloggrContext.Provider>
  );
};

export const useBloggr = () => {
  const context = useContext(BloggrContext);
  if (!context) {
    throw new Error('useBloggr must be used within a BloggrProvider');
  }
  return context;
};
