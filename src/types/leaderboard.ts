export interface LeaderboardEntry {
  rank: number;
  freelancerId: string;
  name: string;
  profilePic: string;
  score: number;
  reward?: { amount: number; title: string };
}

export interface IRewardConfig {
  rank: number;
  title: string;
  baseAmount: number;
}

export interface IScoringWeights {
  projectApplications: { min: number; weight: number };
  verifiedDehixTalents: { min: number; weight: number };
  verifiedInterviewTalents: { min: number; weight: number };
  interviewsTaken: { min: number; weight: number };
  talentsHired: { min: number; weight: number };
  bids: { min: number; weight: number };
  longestStreak: { min: number; weight: number };
  verifiedProfileBonus: number;
  oracleBonus: number;
}

export interface FullLeaderboard {
  _id: string;
  name: string;
  description?: string;
  frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  periodStart: string;
  periodEnd: string;
  status: string;
  eligibility: {
    badgesAllowed: string[];
    levelsAllowed: string[];
  };
  scoringWeights: IScoringWeights;
  rewardConfig: IRewardConfig[];
  rankings: LeaderboardEntry[];
  participants?: string[];
  isJoined?: boolean;
}
