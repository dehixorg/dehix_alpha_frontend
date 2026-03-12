'use client';
import React, { useCallback, useMemo, useState } from 'react';

import { CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import BusinessVerificationCard from '@/components/cards/oracleDashboard/businessVerificationCard';
import { VerificationStatus } from '@/utils/verificationStatus';
import OracleVerificationLayout from '@/components/freelancer/oracleDashboard/OracleVerificationLayout';
import EmptyState from '@/components/shared/EmptyState';

type FilterOption = 'all' | 'pending' | 'approved' | 'denied';

const STATUS = VerificationStatus;

interface BusinessVerificationProps {
  data: any[];
  loading: boolean;
}

export default function BusinessVerification({
  data,
  loading,
}: BusinessVerificationProps) {
  const [filter, setFilter] = useState<FilterOption>('all');
  const [localData, setLocalData] = useState<any[]>([]);
  const [initialized, setInitialized] = useState(false);

  const handleFilterChange = useCallback(
    (newFilter: FilterOption) => setFilter(newFilter),
    [],
  );

  const toVerificationStatus = (s: any): VerificationStatus => {
    switch (s) {
      case 'APPROVED':
        return VerificationStatus.APPROVED;
      case 'DENIED':
        return VerificationStatus.DENIED;
      case 'PENDING':
      default:
        return VerificationStatus.PENDING;
    }
  };

  const businessData = useMemo(() => {
    const transformed = data
      .map((entry: any) => {
        if (!entry.result) return null;
        return {
          ...entry.result,
          verification_id: entry._id,
          document_id: entry.document_id,
          verificationStatus: toVerificationStatus(
            entry.verification_status || STATUS.PENDING,
          ),
          comment: entry.comment,
        };
      })
      .filter(Boolean);

    if (!initialized && transformed.length > 0) {
      setLocalData(transformed);
      setInitialized(true);
    }
    return transformed;
  }, [data, initialized]);

  const displayData = initialized ? localData : businessData;

  const filteredData = useMemo(() => {
    return displayData.filter((d: any) => {
      if (filter === 'all') return true;
      const status = d.verificationStatus as VerificationStatus;
      if (filter === 'pending') return status === STATUS.PENDING;
      if (filter === 'approved') return status === STATUS.APPROVED;
      if (filter === 'denied') return status === STATUS.DENIED;
      return true;
    });
  }, [displayData, filter]);

  const updateBusinessStatus = useCallback(
    (documentId: string, newStatus: VerificationStatus) => {
      setLocalData((prev: any[]) =>
        prev.map((item) =>
          item.document_id === documentId
            ? { ...item, verificationStatus: newStatus }
            : item,
        ),
      );
    },
    [],
  );

  const updateCommentStatus = useCallback(
    (documentId: string, newComment: string) => {
      setLocalData((prev: any[]) =>
        prev.map((item) =>
          item.document_id === documentId
            ? { ...item, comments: newComment }
            : item,
        ),
      );
    },
    [],
  );

  return (
    <OracleVerificationLayout
      title="Business Verification"
      description="Monitor and manage business verification requests."
    >
      <Tabs
        value={filter}
        onValueChange={(v) => handleFilterChange(v as FilterOption)}
      >
        <div className="border-b px-2 sm:px-6 flex items-center justify-between gap-3 flex-wrap">
          <TabsList className="bg-transparent h-12 p-0">
            <TabsTrigger
              value="all"
              className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Pending
            </TabsTrigger>
            <TabsTrigger
              value="approved"
              className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Approved
            </TabsTrigger>
            <TabsTrigger
              value="denied"
              className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Denied
            </TabsTrigger>
          </TabsList>
        </div>

        {(['all', 'pending', 'approved', 'denied'] as FilterOption[]).map(
          (t) => (
            <TabsContent key={t} value={t}>
              <CardContent>
                <div className="grid flex-1 items-start gap-4 md:gap-6 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 mt-6">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-2 w-full">
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-5/6 mb-2" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    ))
                  ) : filteredData.length > 0 ? (
                    filteredData.map((data: any) => (
                      <BusinessVerificationCard
                        key={data.verification_id}
                        _id={data.verification_id}
                        firstName={data.firstName}
                        lastName={data.lastName}
                        email={data.email}
                        phone={data.phone}
                        companyName={data.companyName}
                        companySize={data.companySize}
                        referenceEmail={data.referenceEmail}
                        websiteLink={data.websiteLink}
                        linkedInLink={data.linkedInLink}
                        githubLink={data.githubLink}
                        comments={data.comment}
                        status={data.verificationStatus}
                        onStatusUpdate={(newStatus) =>
                          updateBusinessStatus(
                            data.document_id,
                            newStatus as VerificationStatus,
                          )
                        }
                        onCommentUpdate={(newComment) =>
                          updateCommentStatus(data.document_id, newComment)
                        }
                      />
                    ))
                  ) : (
                    <div className="w-full col-span-full">
                      <EmptyState
                        title="No business verification records found"
                        description="Once there are business verification requests, they will appear here."
                        className="py-10"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </TabsContent>
          ),
        )}
      </Tabs>
    </OracleVerificationLayout>
  );
}
