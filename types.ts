export type Sector = 'PRODUCTION' | 'OFFICE' | 'MARKETING' | 'ADMIN';

export type ImportanceLevel = 'HIGH' | 'MEDIUM' | 'NORMAL';

export interface Employee {
  id: string;
  name: string;
  role: string;
  sector: Sector;
  points: number;
  pin: string; 
  isAdmin?: boolean;
  avatar?: string; // Optional avatar URL
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string; 
  date: string; 
  readBy: string[]; 
  imageUrl: string;
  sector: Sector | 'ALL';
  importance: ImportanceLevel; // New field
  // Mock Stats for Admin
  stats?: {
    views: number;
    likes: number;
    dislikes: number;
    avgTime: number;
  }
}

export interface Reward {
  id: string;
  name: string;
  cost: number;
  icon: string;
  description: string;
  category: 'FOOD' | 'LEISURE' | 'MERCH';
}

export type SuggestionStatus = 'PENDING' | 'REVIEW' | 'ACCEPTED' | 'REJECTED';

export interface Suggestion {
  id: string;
  text: string;
  date: string;
  isAnonymous: boolean;
  authorName?: string;
  status: SuggestionStatus;
}

export interface RedeemedReward {
  id: string;
  rewardName: string;
  cost: number;
  date: string;
  qrToken: string;
  userId: string; // Payer
  giftedTo?: string; // Receiver name if gifted
  isGift?: boolean; // If this specific record is the result of a gift
}

export type AppMode = 'LANDING_SELECTION' | 'KIOSK_MODE' | 'MOBILE_APP_MODE';

export type DashboardTab = 'YOUR_SECTOR' | 'ALL_NEWS' | 'REWARDS' | 'ARTICLE_READ' | 'SUGGESTIONS' | 'ADMIN_DASHBOARD' | 'LEADERBOARD';

export interface AppState {
  appMode: AppMode;
  isAuthenticated: boolean;
  currentUser: Employee | null;
  activeTab: DashboardTab;
  selectedArticleId: string | null;
  employees: Employee[];
  news: NewsArticle[];
  suggestions: Suggestion[];
  redemptionHistory: Record<string, RedeemedReward[]>; // Map userID to history
}

export interface DBSchema {
  employees: Employee[];
  news: NewsArticle[];
  suggestions: Suggestion[];
  redemptions: RedeemedReward[];
}