import { format } from 'date-fns';

import { Transaction } from '@/types/transaction';

export const getTransactionType = (
  transaction: Transaction,
): 'credit' | 'debit' => {
  return transaction.amount >= 0 ? 'credit' : 'debit';
};

export const getTransactionDescription = (transaction: Transaction): string => {
  const ref = transaction.reference?.toLowerCase() || '';

  if (transaction.type === 'payment') {
    if (ref.includes('project')) return 'Project Creation';
    if (ref.includes('bid')) return 'Bid Placement';
    if (ref.includes('hire')) return 'Talent Hiring';
    return 'Payment';
  }

  if (transaction.type === 'referral') {
    return transaction.reference || 'Referral Bonus';
  }

  if (transaction.type === 'rewards') {
    return transaction.reference || 'Reward';
  }

  if (transaction.type === 'streak_reward') {
    return 'Streak Reward';
  }

  if (transaction.type === 'leaderboard_reward') {
    return 'Leaderboard Reward';
  }

  if (transaction.type === 'badge_reward') {
    return 'Badge Reward';
  }

  if (transaction.type === 'system_generated') {
    return transaction.reference || 'System Credit';
  }

  return transaction.reference || 'Transaction';
};

export const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  } catch {
    return dateString;
  }
};

export const formatTransactionDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), 'MMM dd');
  } catch {
    return dateString;
  }
};
