'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TransactionSummary } from '@/types/transaction';

interface TransactionSummaryProps {
  summary: TransactionSummary;
  isLoading?: boolean;
}

export const TransactionSummaryComponent: React.FC<TransactionSummaryProps> = ({
  summary,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="h-4 bg-muted rounded w-20"></div>
              <div className="h-8 w-8 bg-muted rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-24 mb-2"></div>
              <div className="h-3 bg-muted rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Total Credits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="group relative overflow-hidden border border-green-200 dark:border-green-800/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 hover:border-green-300 dark:hover:border-green-700 bg-gradient-to-br from-green-50/50 via-white to-green-50/30 dark:from-green-950/20 dark:via-green-950/10 dark:to-green-950/5">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Animated corner decoration */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-100/20 to-transparent dark:from-green-800/10 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500"></div>

          <CardHeader className="flex flex-row items-center justify-between pb-3 relative">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300">
                Total Credits
              </CardTitle>
              <div className="flex items-center gap-1 text-xs text-green-600/60 dark:text-green-400/60">
                <ArrowUpRight className="h-3 w-3" />
                <span>Incoming transactions</span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl scale-150 group-hover:scale-175 transition-transform duration-500"></div>
              <div className="relative p-3 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/50 dark:to-green-900/30 rounded-xl border border-green-200/50 dark:border-green-700/50">
                <ArrowUpCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-green-600 dark:text-green-400 tracking-tight">
                  +{summary.totalCredits.toFixed(2)}
                </span>
                <span className="text-xs text-green-500 dark:text-green-500 font-medium">
                  CONNECTS
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-green-600/70 dark:text-green-400/70">
                  <TrendingUp className="h-3 w-3" />
                  <span>Received</span>
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></div>
              </div>
            </div>
          </CardContent>

          {/* Hover effect border */}
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-green-500/20 dark:group-hover:border-green-400/20 rounded-xl pointer-events-none transition-all duration-300"></div>
        </Card>
      </motion.div>

      {/* Total Debits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="group relative overflow-hidden border border-red-200 dark:border-red-800/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10 hover:border-red-300 dark:hover:border-red-700 bg-gradient-to-br from-red-50/50 via-white to-red-50/30 dark:from-red-950/20 dark:via-red-950/10 dark:to-red-950/5">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Animated corner decoration */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-100/20 to-transparent dark:from-red-800/10 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500"></div>

          <CardHeader className="flex flex-row items-center justify-between pb-3 relative">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold text-red-700 dark:text-red-300">
                Total Debits
              </CardTitle>
              <div className="flex items-center gap-1 text-xs text-red-600/60 dark:text-red-400/60">
                <ArrowDownRight className="h-3 w-3" />
                <span>Outgoing transactions</span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl scale-150 group-hover:scale-175 transition-transform duration-500"></div>
              <div className="relative p-3 bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/50 dark:to-red-900/30 rounded-xl border border-red-200/50 dark:border-red-700/50">
                <ArrowDownCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-red-600 dark:text-red-400 tracking-tight">
                  -{summary.totalDebits.toFixed(2)}
                </span>
                <span className="text-xs text-red-500 dark:text-red-500 font-medium">
                  CONNECTS
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-red-600/70 dark:text-red-400/70">
                  <TrendingDown className="h-3 w-3" />
                  <span>Spent</span>
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse"></div>
              </div>
            </div>
          </CardContent>

          {/* Hover effect border */}
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-red-500/20 dark:group-hover:border-red-400/20 rounded-xl pointer-events-none transition-all duration-300"></div>
        </Card>
      </motion.div>

      {/* Net Change */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card
          className={`group relative overflow-hidden border rounded-xl transition-all duration-300 hover:shadow-lg ${
            summary.netChange >= 0
              ? 'border-emerald-200 dark:border-emerald-800/50 hover:shadow-emerald-500/10 hover:border-emerald-300 dark:hover:border-emerald-700 bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/30 dark:from-emerald-950/20 dark:via-emerald-950/10 dark:to-emerald-950/5'
              : 'border-orange-200 dark:border-orange-800/50 hover:shadow-orange-500/10 hover:border-orange-300 dark:hover:border-orange-700 bg-gradient-to-br from-orange-50/50 via-white to-orange-50/30 dark:from-orange-950/20 dark:via-orange-950/10 dark:to-orange-950/5'
          }`}
        >
          {/* Subtle gradient overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              summary.netChange >= 0
                ? 'from-emerald-500/5'
                : 'from-orange-500/5'
            } to-transparent`}
          ></div>

          {/* Animated corner decoration */}
          <div
            className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500 ${
              summary.netChange >= 0
                ? 'from-emerald-100/20 dark:from-emerald-800/10'
                : 'from-orange-100/20 dark:from-orange-800/10'
            } to-transparent`}
          ></div>

          <CardHeader className="flex flex-row items-center justify-between pb-3 relative">
            <div className="space-y-1">
              <CardTitle
                className={`text-sm font-semibold ${
                  summary.netChange >= 0
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-orange-700 dark:text-orange-300'
                }`}
              >
                Net Change
              </CardTitle>
              <div
                className={`flex items-center gap-1 text-xs ${
                  summary.netChange >= 0
                    ? 'text-emerald-600/60 dark:text-emerald-400/60'
                    : 'text-orange-600/60 dark:text-orange-400/60'
                }`}
              >
                {summary.netChange >= 0 ? (
                  <>
                    <ArrowUpRight className="h-3 w-3" />
                    <span>Positive balance</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-3 w-3" />
                    <span>Negative balance</span>
                  </>
                )}
              </div>
            </div>
            <div className="relative">
              <div
                className={`absolute inset-0 rounded-full blur-xl scale-150 group-hover:scale-175 transition-transform duration-500 ${
                  summary.netChange >= 0
                    ? 'bg-emerald-500/20'
                    : 'bg-orange-500/20'
                }`}
              ></div>
              <div
                className={`relative p-3 bg-gradient-to-br rounded-xl border ${
                  summary.netChange >= 0
                    ? 'from-emerald-100 to-emerald-50 dark:from-emerald-900/50 dark:to-emerald-900/30 border-emerald-200/50 dark:border-emerald-700/50'
                    : 'from-orange-100 to-orange-50 dark:from-orange-900/50 dark:to-orange-900/30 border-orange-200/50 dark:border-orange-700/50'
                }`}
              >
                <Wallet
                  className={`h-5 w-5 ${
                    summary.netChange >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-orange-600 dark:text-orange-400'
                  }`}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-3xl font-bold tracking-tight ${
                    summary.netChange >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-orange-600 dark:text-orange-400'
                  }`}
                >
                  {summary.netChange >= 0 ? '+' : ''}
                  {summary.netChange.toFixed(2)}
                </span>
                <span
                  className={`text-xs font-medium ${
                    summary.netChange >= 0
                      ? 'text-emerald-500 dark:text-emerald-500'
                      : 'text-orange-500 dark:text-orange-500'
                  }`}
                >
                  CONNECTS
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1 text-xs ${
                    summary.netChange >= 0
                      ? 'text-emerald-600/70 dark:text-emerald-400/70'
                      : 'text-orange-600/70 dark:text-orange-400/70'
                  }`}
                >
                  {summary.netChange >= 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3" />
                      <span>Available</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3" />
                      <span>Deficit</span>
                    </>
                  )}
                </div>
                <div
                  className={`h-1.5 w-1.5 rounded-full animate-pulse ${
                    summary.netChange >= 0 ? 'bg-emerald-400' : 'bg-orange-400'
                  }`}
                ></div>
              </div>
            </div>
          </CardContent>

          {/* Hover effect border */}
          <div
            className={`absolute inset-0 border-2 border-transparent rounded-xl pointer-events-none transition-all duration-300 group-hover:border-${
              summary.netChange >= 0 ? 'emerald' : 'orange'
            }-500/20 dark:group-hover:border-${
              summary.netChange >= 0 ? 'emerald' : 'orange'
            }-400/20`}
          ></div>
        </Card>
      </motion.div>
    </div>
  );
};
