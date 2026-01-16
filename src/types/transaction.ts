export interface Transaction {
  _id: string;
  from?: string;
  to?: string;
  amount: number;
  balance?: number;
  type:
    | 'payment'
    | 'referral'
    | 'rewards'
    | 'system_generated'
    | 'streak_reward'
    | 'leaderboard_reward'
    | 'badge_reward';
  from_type: 'system' | 'freelancer' | 'business' | 'admin' | 'verification';
  reference?: string;
  description?: string;
  reference_id?: string;
  status?: 'applied' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface TransactionSummary {
  totalCredits: number;
  totalDebits: number;
  netChange: number;
}

export interface TransactionResponse {
  success: boolean;
  data: {
    transactions: Transaction[];
    summary: TransactionSummary;
  };
}
