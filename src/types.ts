export type VoteType = 'up' | 'down' | null;

export type PostType = 'text' | 'link' | 'image' | 'poll' | 'video';

export type FeedSort = 'hot' | 'new' | 'top' | 'rising';

export type TopTimeRange = 'today' | 'week' | 'month' | 'year' | 'all';

export type ViewMode = 'card' | 'compact' | 'grid' | 'timeline';

export type TimelineViewLayout = 'timeline' | 'grid' | 'carousel' | 'carousels' | 'list' | 'opera';

export type FeedTab = 'for_you' | 'following' | 'latest';

export type SubmissionStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'published'
  | 'rejected'
  | 'scheduled'
  | 'archived';

export const BLOGGR_DEFAULT_CATEGORIES = [
  'Breaking News',
  'Kenya',
  'Africa',
  'World',
  'Politics',
  'Business',
  'Technology',
  'Sports',
  'Entertainment',
  'Education',
  'Health',
  'Lifestyle',
  'Agriculture',
  'Environment',
  'Religion',
  'Opinion',
] as const;

export type BloggrCategoryName = typeof BLOGGR_DEFAULT_CATEGORIES[number];

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
  order: number;
  count?: number;
  isDefault?: boolean;
}

export interface PlatformBranding {
  siteName: string;
  website: string;
  tagline: string;
  description: string;
  logoText: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  adEnabled: boolean;
  adFrequency: number;
  adCode: string;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  author: string;
  authorAvatar: string;
  authorVerified?: boolean;
  category: string;
  tags: string[];
  views: number;
  likes: number;
  commentsCount: number;
  userLiked?: boolean;
  createdAt: string;
  submissionStatus?: SubmissionStatus;
}

export type NewsCategory =
  | 'NEWS'
  | 'FOOTBALL'
  | 'OPINION'
  | 'Global news'
  | 'Africa News'
  | 'Kenya News'
  | 'Football News'
  | 'Other Sports'
  | 'Opinion'
  | BloggrCategoryName;

export const ARTICLE_CATEGORIES: NewsCategory[] = ['NEWS', 'FOOTBALL', 'OPINION'];

export const ARTICLE_TAGS = [
  'Kenya',
  'Education',
  'Africa',
  'Business',
  'Entertainment',
  'Health',
] as const;

export type ArticleTag = typeof ARTICLE_TAGS[number];

export type NewsCategoryFilter =
  | 'all'
  | 'NEWS'
  | 'FOOTBALL'
  | 'OPINION'
  | 'global'
  | 'africa'
  | 'kenya'
  | 'football'
  | 'other-sports'
  | 'opinion'
  | 'following';

export interface AuthorRecommendation {
  username: string;
  displayName: string;
  avatar: string;
  role: string;
  bio: string;
  followersCount: number;
  category: string;
  verified?: boolean;
}

export type AwardType = 'gold' | 'silver' | 'platinum' | 'helpful' | 'rocket' | 'mindblown';

export interface AwardRecord {
  type: AwardType;
  name: string;
  emoji: string;
  count: number;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  votedUserIds: string[];
}

export interface CommunityRule {
  id: string;
  title: string;
  description: string;
}

export interface Community {
  id: string; // e.g. "b/technology"
  name: string; // "technology"
  displayName: string;
  description: string;
  category: 'Tech & Science' | 'News & Politics' | 'Business & Startups' | 'Design & Creative' | 'Discussions' | 'Gaming & Pop' | 'General';
  membersCount: number;
  onlineCount: number;
  createdAt: string;
  iconEmoji: string;
  bannerUrl: string;
  themeColor: string;
  rules: CommunityRule[];
  moderators: string[];
  flairs: string[];
}

export interface Comment {
  id: string;
  postId: string;
  parentId: string | null;
  author: string;
  authorAvatar: string;
  authorFlair?: string;
  content: string;
  createdAt: string;
  score: number;
  userVote: VoteType;
  awards: AwardRecord[];
  replies?: Comment[];
  isPinned?: boolean;
}

export type MainNavigationTab = 'home' | 'news' | 'football' | 'opinion';

export interface Post {
  id: string;
  category?: NewsCategory;
  categories?: NewsCategory[];
  communityId?: string;
  communityName?: string;
  communityIcon?: string;
  communityColor?: string;
  title: string;
  type: PostType;
  content?: string;
  url?: string;
  domain?: string;
  imageUrl?: string;
  thumbnail?: string;
  pollOptions?: PollOption[];
  pollDurationDays?: number;
  author: string;
  authorAvatar: string;
  authorKarma?: number;
  authorRole?: string;
  authorVerified?: boolean;
  createdAt: string;
  score: number;
  userVote: VoteType;
  commentsCount: number;
  flair?: string;
  tags?: string[];
  isPinned?: boolean;
  awards: AwardRecord[];
  monetaryGiftsTotalKsh?: number;
  views: number;
  isBreaking?: boolean;
  isFeatured?: boolean;
  submissionStatus?: SubmissionStatus;
  location?: string;
  videoUrl?: string;
  additionalImages?: string[];
  moderatorNotes?: string;
  readTimeMinutes?: number;
  summary?: string;
  seoTitle?: string;
  seoDescription?: string;
  scheduledFor?: string;
  photoStoryCaptions?: { url: string; caption: string }[];
}

export type CreatorStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface CreatorApplication {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  category: string;
  bio: string;
  sampleTopic: string;
  portfolioUrl?: string;
  appliedAt: string;
  status: CreatorStatus;
  reviewedBy?: string;
  reviewedAt?: string;
}

export type PolicyPageId =
  | 'privacy'
  | 'terms'
  | 'content-policy'
  | 'user-agreement'
  | 'editorial'
  | 'monetization'
  | 'cookies'
  | null;

export interface CreatorEarningsWallet {
  mpesaPhoneNumber?: string;
  mpesaFullName?: string;
  withdrawnTotalKsh?: number;
  lastPayoutDate?: string;
}

export interface ReadLaterEntry {
  postId: string;
  savedAt: string;
  isRead?: boolean;
}

export interface UserProfile {
  id?: string;
  email?: string;
  username: string;
  displayName: string;
  avatar: string;
  bannerUrl: string;
  bio: string;
  karma: {
    post: number;
    comment: number;
    total: number;
  };
  cakeDay: string;
  joinedCommunities: string[];
  savedPostIds: string[];
  readLaterItems?: ReadLaterEntry[];
  followingAuthors: string[];
  isCreator: boolean;
  creatorStatus: CreatorStatus;
  isVerified?: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  verifiedRole?: string;
  isAdmin?: boolean;
  emailNotifications?: boolean;
  breakingNewsAlerts?: boolean;
  dataSaverMode?: boolean;
  favoriteCategory?: NewsCategory;
  wallet?: CreatorEarningsWallet;
}

export interface AppNotification {
  id: string;
  type: 'upvote' | 'reply' | 'award' | 'mention' | 'welcome';
  title: string;
  message: string;
  timeAgo: string;
  read: boolean;
  postId?: string;
}

export interface MonetaryGift {
  id: string;
  postId: string;
  postTitle: string;
  author: string;
  giver: string;
  awardType: AwardType;
  awardName: string;
  awardEmoji: string;
  grossAmountKsh: number;
  authorShareKsh: number; // 65% author share
  adminShareKsh: number; // 35% site admin share
  message?: string;
  createdAt: string;
}

export const NEWS_CATEGORIES_CONFIG: {
  id: NewsCategoryFilter;
  label: string;
  categoryValue?: NewsCategory;
  emoji: string;
  description: string;
}[] = [
  { id: 'all', label: 'All', emoji: '🌐', description: 'Real-time wire dispatches from all categories' },
  { id: 'NEWS', label: 'NEWS', categoryValue: 'NEWS', emoji: '📰', description: 'Breaking news, national & continental reporting, and local affairs' },
  { id: 'FOOTBALL', label: 'FOOTBALL', categoryValue: 'FOOTBALL', emoji: '⚽', description: 'Premier League, FKF, Champions League, AFCON, and match reports' },
  { id: 'OPINION', label: 'OPINION', categoryValue: 'OPINION', emoji: '✍️', description: 'Editorials, thought leadership, columns, and cultural perspectives' },
];

export const EARNINGS_VIEW_THRESHOLD = 1000;
export const EARNINGS_VIEWS_PER_KSH = 180;
export const AUTHOR_SHARE_RATIO = 0.65;
export const ADMIN_SHARE_RATIO = 0.35;

/**
 * Calculates earnings for articles above 1000 views at 1 KSH per 180 views plus monetary gifts.
 * Rule: Site admin and author share all earnings and gifts 35/65.
 * Verified authors earn 65% author share; Site admin retains 35%.
 */
export function calculateArticleEarnings(
  views: number = 0,
  monetaryGiftsTotalKsh: number | boolean = 0,
  isAuthorVerified: boolean = true
) {
  let giftsKsh = 0;
  let verified = isAuthorVerified;

  if (typeof monetaryGiftsTotalKsh === 'boolean') {
    verified = monetaryGiftsTotalKsh;
    giftsKsh = 0;
  } else {
    giftsKsh = monetaryGiftsTotalKsh || 0;
  }

  const isEligible = verified && views > EARNINGS_VIEW_THRESHOLD;
  const viewsRemaining = isEligible ? 0 : Math.max(0, EARNINGS_VIEW_THRESHOLD + 1 - views);

  // Ad Views Gross Revenue (1 KSH per 180 views if > 1,000 views)
  const grossAdEarningsKsh = isEligible ? Number((views / EARNINGS_VIEWS_PER_KSH).toFixed(2)) : 0;
  
  // Total Monetary Gifts received for this article
  const grossGiftsKsh = Number((giftsKsh || 0).toFixed(2));
  
  // Total Gross
  const grossEarningsKsh = Number((grossAdEarningsKsh + grossGiftsKsh).toFixed(2));

  // 35% Admin / 65% Author Split on all earnings & gifts
  const authorAdEarningsKsh = Number((grossAdEarningsKsh * AUTHOR_SHARE_RATIO).toFixed(2));
  const authorGiftsKsh = Number((grossGiftsKsh * AUTHOR_SHARE_RATIO).toFixed(2));
  const authorEarningsKsh = Number((authorAdEarningsKsh + authorGiftsKsh).toFixed(2));

  const adminAdEarningsKsh = Number((grossAdEarningsKsh * ADMIN_SHARE_RATIO).toFixed(2));
  const adminGiftsKsh = Number((grossGiftsKsh * ADMIN_SHARE_RATIO).toFixed(2));
  const adminEarningsKsh = Number((adminAdEarningsKsh + adminGiftsKsh).toFixed(2));

  return {
    isEligible,
    grossAdEarningsKsh,
    grossGiftsKsh,
    grossEarningsKsh,
    authorEarningsKsh,
    authorAdEarningsKsh,
    authorGiftsKsh,
    adminEarningsKsh,
    adminAdEarningsKsh,
    adminGiftsKsh,
    earningsKsh: authorEarningsKsh, // author net earnings
    viewsRemaining,
    rateText: '1 KSH per 180 views (>1,000 views) & reader gifts (35% Site Admin / 65% Author)',
    thresholdText: 'Above 1,000 views for ad views; gifts active immediately',
    unverifiedReason: verified ? null : 'Author verification required to earn view-based revenue',
  };
}

export interface PlatformPostEarningsBreakdown {
  post: Post;
  author: string;
  views: number;
  giftsKsh: number;
  grossAdKsh: number;
  grossKsh: number;
  authorKsh: number;
  adminKsh: number;
  isEligible: boolean;
}

export interface PlatformFinancials {
  totalViews: number;
  totalMonetaryGiftsKsh: number;
  totalGrossAdEarningsKsh: number;
  totalGrossEarningsKsh: number;
  totalAuthorEarningsKsh: number;
  totalAdminShareKsh: number;
  totalAdminAdShareKsh: number;
  totalAdminGiftsShareKsh: number;
  postsBreakdown: PlatformPostEarningsBreakdown[];
}


