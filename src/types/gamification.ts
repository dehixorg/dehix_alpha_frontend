// Base interface for gamification items
export interface GamificationItemBase {
  _id?: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  type?: 'LEVEL' | 'BADGE';
  priority?: number;
  earnedAt?: string;
  level_id?: string;
  badge_id?: string;
  baseReward?: number;
  rewardMultiplier?: number;
  criteria?: {
    profileComplete?: boolean;
    minProjects?: number;
    minSuccessfulProjects?: number;
    minRating?: number;
    verificationRequired?: boolean;
    oracleRequired?: boolean;
    minStreak?: number;
    minConnectsPurchased?: number;
    minProjectApplications?: number;
    minVerifiedDehixTalent?: number;
    minVerifiedInterviewTalents?: number;
    minInterviewsTaken?: number;
    minTalentHiring?: number;
    minBids?: number;
    minLongestStreak?: number;
    requiresVerifiedProfile?: boolean;
    requiresOracle?: boolean;
  };
}

// Interface for level items
export interface LevelItem extends GamificationItemBase {
  level_id: string;
  priority: number;
  type: 'LEVEL';
  rewardMultiplier?: number;
}

// Interface for badge items
export interface BadgeItem extends GamificationItemBase {
  badge_id: string;
  type: 'BADGE';
  earnedAt?: string;
  isActive?: boolean;
  baseReward?: number;
  priority?: number;
  imageUrl?: string;
}

// Badge eligibility response
export interface BadgeEligibilityResponse {
  eligible: boolean;
  badge: BadgeItem;
  reason?: string;
  missingCriteria?: Record<string, any>;
}

// Response type for gamification status
export interface GamificationStatusResponse {
  data?: {
    currentLevel?: LevelItem | null;
    badges?: BadgeItem[];
    progress?: number | null;
  };
  currentLevel?: LevelItem | null;
  badges?: BadgeItem[];
  progress?: number | null;
}

// Response type for gamification eligible
export interface GamificationEligibleResponse {
  data?: {
    badges?: BadgeItem[];
    levels?: LevelItem[];
  };
  badges?: BadgeItem[];
  levels?: LevelItem[];
}

// Response type for gamification info
export interface GamificationInfoResponse {
  badges: BadgeItem[];
  levels: LevelItem[];
}
