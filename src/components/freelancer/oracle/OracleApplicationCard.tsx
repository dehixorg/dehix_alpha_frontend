'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { axiosInstance } from '@/lib/axiosinstance';
import { OracleStatusEnum } from '@/utils/enum';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const statusConfig: Record<
  string,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: React.ReactNode;
    description: string;
  }
> = {
  [OracleStatusEnum.NOT_APPLIED]: {
    label: 'Not Applied',
    variant: 'secondary',
    icon: <AlertTriangle className="h-5 w-5 text-muted-foreground" />,
    description: 'You have not applied to become an Oracle yet.',
  },
  [OracleStatusEnum.APPLIED]: {
    label: 'Applied',
    variant: 'outline',
    icon: <Clock className="h-5 w-5 text-yellow-500" />,
    description:
      'Your Oracle application is under review. You will be notified once it is processed.',
  },
  [OracleStatusEnum.APPROVED]: {
    label: 'Approved',
    variant: 'default',
    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    description:
      'You are an approved Oracle! You can verify documents from the Oracle Dashboard.',
  },
  [OracleStatusEnum.FAILED]: {
    label: 'Denied',
    variant: 'destructive',
    icon: <XCircle className="h-5 w-5 text-red-500" />,
    description:
      'Your Oracle application was denied. You can re-apply if you wish.',
  },
  [OracleStatusEnum.STOPPED]: {
    label: 'Stopped',
    variant: 'destructive',
    icon: <XCircle className="h-5 w-5 text-red-500" />,
    description:
      'Your Oracle status was stopped due to inactivity. You can re-apply.',
  },
  [OracleStatusEnum.REAPPLIED]: {
    label: 'Re-applied',
    variant: 'outline',
    icon: <Clock className="h-5 w-5 text-yellow-500" />,
    description:
      'Your re-application is under review. You will be notified once it is processed.',
  },
};

interface OracleApplicationCardProps {
  userId?: string;
  approvedContent?: React.ReactNode;
  showDashboardButtonOnApproved?: boolean;
  dashboardPath?: string;
}

export default function OracleApplicationCard({
  userId,
  approvedContent,
  showDashboardButtonOnApproved = false,
  dashboardPath = '/freelancer/oracleDashboard/business',
}: OracleApplicationCardProps) {
  const router = useRouter();
  const [oracleStatus, setOracleStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchOracleStatus = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/freelancer/${userId}`);
      const status =
        res.data?.data?.oracleStatus ?? OracleStatusEnum.NOT_APPLIED;
      setOracleStatus(status);
    } catch {
      notifyError('Failed to fetch Oracle status.', 'Error');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchOracleStatus();
  }, [fetchOracleStatus]);

  const handleApply = async () => {
    if (!userId) return;
    try {
      setSubmitting(true);
      const newStatus =
        oracleStatus === OracleStatusEnum.FAILED ||
        oracleStatus === OracleStatusEnum.STOPPED
          ? OracleStatusEnum.REAPPLIED
          : OracleStatusEnum.APPLIED;

      await axiosInstance.put('/freelancer/oracle-status', {
        oracleStatus: newStatus,
      });
      setOracleStatus(newStatus);
      notifySuccess('Oracle application submitted successfully!');
    } catch {
      notifyError('Failed to submit Oracle application.', 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const canApply =
    oracleStatus === OracleStatusEnum.NOT_APPLIED ||
    oracleStatus === OracleStatusEnum.FAILED ||
    oracleStatus === OracleStatusEnum.STOPPED;

  if (
    !loading &&
    oracleStatus === OracleStatusEnum.APPROVED &&
    approvedContent
  ) {
    return <>{approvedContent}</>;
  }

  const config = oracleStatus
    ? (statusConfig[oracleStatus] ?? statusConfig[OracleStatusEnum.NOT_APPLIED])
    : statusConfig[OracleStatusEnum.NOT_APPLIED];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6" />
          <div>
            <CardTitle>Oracle Program</CardTitle>
            <CardDescription>
              Oracles verify education, experience, project, and business
              documents submitted by other freelancers on the platform.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-40" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">
                Current Status:
              </span>
              <Badge variant={config.variant} className="gap-1.5">
                {config.icon}
                {config.label}
              </Badge>
            </div>

            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="text-sm text-muted-foreground">
                {config.description}
              </p>
            </div>

            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="text-sm font-semibold">What does an Oracle do?</h3>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                <li>
                  Verify education, experience, and project documents of other
                  freelancers
                </li>
                <li>Verify business profiles for legitimacy</li>
                <li>
                  Earn rewards (connects) for each successful verification
                </li>
                <li>Help maintain trust and quality on the platform</li>
              </ul>
            </div>

            {canApply && (
              <Button
                onClick={handleApply}
                disabled={submitting}
                className="w-full sm:w-auto"
              >
                {submitting
                  ? 'Submitting...'
                  : oracleStatus === OracleStatusEnum.NOT_APPLIED
                    ? 'Apply as Oracle'
                    : 'Re-apply as Oracle'}
              </Button>
            )}

            {oracleStatus === OracleStatusEnum.APPROVED &&
              showDashboardButtonOnApproved && (
                <Button
                  variant="outline"
                  onClick={() => router.push(dashboardPath)}
                  className="w-full sm:w-auto"
                >
                  Go to Oracle Dashboard
                </Button>
              )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
