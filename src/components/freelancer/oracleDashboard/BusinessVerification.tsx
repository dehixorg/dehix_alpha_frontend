'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError } from '@/utils/toastMessage';
import BusinessVerificationCard from '@/components/cards/oracleDashboard/businessVerificationCard';
import { VerificationStatus } from '@/utils/verificationStatus';
import OracleVerificationLayout from '@/components/freelancer/oracleDashboard/OracleVerificationLayout';
import EmptyState from '@/components/shared/EmptyState';

type FilterOption = 'all' | 'pending' | 'approved' | 'denied';

const STATUS = VerificationStatus;

export default function BusinessVerification() {
  const [businessdata, setBusinessData] = useState<any[]>([]);
  const [filter, setFilter] = useState<FilterOption>('all');
  const [loading, setLoading] = useState<boolean>(false);

  const handleFilterChange = useCallback(
    (newFilter: FilterOption) => setFilter(newFilter),
    [],
  );

  const filteredData = useMemo(() => {
    return businessdata.filter((data) => {
      if (filter === 'all') return true;
      const status = data.verificationStatus as VerificationStatus;
      if (filter === 'pending') return status === STATUS.PENDING;
      if (filter === 'approved') return status === STATUS.APPROVED;
      if (filter === 'denied') return status === STATUS.DENIED;
      return true;
    });
  }, [businessdata, filter]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/verification/oracle?doc_type=business`,
      );
      const result = response.data.data;

      const flattenedData = result.flatMap((entry: any) =>
        entry.result?.projects
          ? Object.values(entry.result.projects).map((project: any) => ({
              ...project,
              // canonical status on each item
              verificationStatus: toVerificationStatus(
                project.verificationStatus ||
                  project.status ||
                  project.verification_status ||
                  STATUS.PENDING,
              ),
              verifier_id: entry.verifier_id,
              verifier_username: entry.verifier_username,
            }))
          : [],
      );

      setBusinessData(flattenedData);
    } catch (error) {
      console.error('Error in getting verification data:', error);
      notifyError('Something went wrong. Please try again.', 'Error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateBusinessStatus = useCallback(
    (index: number, newStatus: VerificationStatus) => {
      setBusinessData((prev: any[]) => {
        const next = [...prev];
        if (next[index]) next[index].status = newStatus;
        return next;
      });
    },
    [],
  );

  const updateCommentStatus = useCallback(
    (index: number, newComment: string) => {
      setBusinessData((prev: any[]) => {
        const next = [...prev];
        if (next[index]) next[index].comments = newComment;
        return next;
      });
    },
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
                <div className="grid flex-1 items-start gap-4 md:gap-6 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 mb-6">
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
                    filteredData.map((data: any, index: number) => (
                      <BusinessVerificationCard
                        key={index}
                        _id={data._id}
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
                        comments={data.comments}
                        status={data.verificationStatus}
                        onStatusUpdate={(newStatus) =>
                          updateBusinessStatus(
                            index,
                            newStatus as VerificationStatus,
                          )
                        }
                        onCommentUpdate={(newComment) =>
                          updateCommentStatus(index, newComment)
                        }
                      />
                    ))
                  ) : (
                    <div className="w-full col-span-full mt-10">
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
