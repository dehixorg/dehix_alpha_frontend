'use client';
import React, { useCallback, useMemo, useState } from 'react';
import { PackageOpen } from 'lucide-react';

import { CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import WorkExpVerificationCard from '@/components/cards/oracleDashboard/workExpVerificationCard';
import { VerificationStatus } from '@/utils/verificationStatus';
import OracleVerificationLayout from '@/components/freelancer/oracleDashboard/OracleVerificationLayout';
import EmptyState from '@/components/shared/EmptyState';

type FilterOption = 'all' | 'pending' | 'verified' | 'rejected';

interface WorkExperience {
  _id: string;
  jobTitle: string;
  workDescription: string;
  company: string;
  workFrom: string;
  workTo: string;
  referencePersonName: string;
  referencePersonContact: string;
  githubRepoLink: string;
  comments: string;
  verificationStatus: string;
}

interface CombinedData extends WorkExperience {
  verification_id: string;
  document_id: string;
  verification_status: VerificationStatus;
  comment: string;
}

interface WorkExpVerificationProps {
  data: any[];
  loading: boolean;
}

const WorkExpVerification = ({ data, loading }: WorkExpVerificationProps) => {
  const [filter, setFilter] = useState<FilterOption>('all');
  const [localData, setLocalData] = useState<CombinedData[]>([]);
  const [initialized, setInitialized] = useState(false);

  const jobData = useMemo(() => {
    const transformed: CombinedData[] = data
      .map((entry: any) => {
        const expDocs = entry.result?.professionalInfo
          ? (Object.values(entry.result.professionalInfo) as WorkExperience[])
          : [];

        const matchingDoc = expDocs.find(
          (doc) => doc._id === entry.document_id,
        );

        if (!matchingDoc) return null;
        return {
          ...matchingDoc,
          verification_id: entry._id,
          document_id: entry.document_id,
          verification_status: entry.verification_status as VerificationStatus,
          comment: entry.comment,
        } as CombinedData;
      })
      .filter(Boolean) as CombinedData[];

    if (!initialized && transformed.length > 0) {
      setLocalData(transformed);
      setInitialized(true);
    }
    return transformed;
  }, [data, initialized]);

  const displayData = initialized ? localData : jobData;

  const handleFilterChange = (newFilter: FilterOption) => {
    setFilter(newFilter);
  };

  const filteredData = displayData.filter((d) => {
    if (filter === 'all') return true;
    if (filter === 'pending')
      return d.verification_status === VerificationStatus.PENDING;
    if (filter === 'verified')
      return d.verification_status === VerificationStatus.APPROVED;
    if (filter === 'rejected')
      return d.verification_status === VerificationStatus.DENIED;
    return true;
  });

  const updateJobStatus = (documentId: string, newStatus: string) => {
    setLocalData((prev) =>
      prev.map((item) =>
        item.document_id === documentId
          ? { ...item, verification_status: newStatus as VerificationStatus }
          : item,
      ),
    );
  };

  const updateCommentStatus = (documentId: string, newComment: string) => {
    setLocalData((prev) =>
      prev.map((item) =>
        item.document_id === documentId
          ? { ...item, comment: newComment }
          : item,
      ),
    );
  };

  return (
    <OracleVerificationLayout
      title="Experience Verification"
      description="Monitor and manage work experience verification requests."
    >
      <Tabs
        value={filter}
        defaultValue="all"
        onValueChange={(v) => handleFilterChange(v as FilterOption)}
      >
        <div className="border-b px-2 sm:px-6 flex items-center justify-between gap-3 flex-wrap mb-6">
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
              value="verified"
              className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Verified
            </TabsTrigger>
            <TabsTrigger
              value="rejected"
              className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Rejected
            </TabsTrigger>
          </TabsList>
        </div>

        {(['all', 'pending', 'verified', 'rejected'] as FilterOption[]).map(
          (t) => (
            <TabsContent key={t} value={t}>
              <CardContent>
                <div className="grid flex-1 items-start gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="group relative overflow-hidden border border-gray-200 dark:border-gray-800 rounded-xl bg-muted-foreground/20 dark:bg-muted/20"
                      >
                        <div className="pb-3 px-6 pt-6 relative">
                          <div className="absolute top-4 right-4">
                            <Skeleton className="h-9 w-9 rounded-full" />
                          </div>
                          <div className="flex items-center gap-4">
                            <Skeleton className="h-14 w-14 rounded-xl" />
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center w-full gap-2">
                                <Skeleton className="h-6 w-48" />
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                <Skeleton className="h-5 w-20 rounded-full" />
                                <Skeleton className="h-9 w-9 rounded-full" />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="px-6 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-700/50 sm:col-span-2">
                              <Skeleton className="h-3 w-20 mb-2" />
                              <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4 rounded" />
                                <Skeleton className="h-4 w-40" />
                              </div>
                            </div>
                            <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-700/50 sm:col-span-2">
                              <Skeleton className="h-3 w-28 mb-2" />
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Skeleton className="h-4 w-4 rounded" />
                                  <Skeleton className="h-4 w-36" />
                                </div>
                                <div className="flex items-center gap-2">
                                  <Skeleton className="h-4 w-4 rounded" />
                                  <Skeleton className="h-4 w-32" />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4">
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                        </div>
                        <div className="px-6 py-5 border-t border-gray-100 dark:border-gray-800">
                          <div className="space-y-2">
                            <Skeleton className="h-3 w-40" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                          <div className="mt-4">
                            <Skeleton className="h-10 w-full" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : filteredData.length > 0 ? (
                    filteredData.map((data) => (
                      <WorkExpVerificationCard
                        key={data.document_id}
                        _id={data.verification_id}
                        jobTitle={data.jobTitle}
                        company={data.company}
                        startFrom={data.workFrom}
                        endTo={data.workTo}
                        referencePersonName={data.referencePersonName}
                        referencePersonContact={data.referencePersonContact}
                        githubRepoLink={data.githubRepoLink}
                        comments={data.comment}
                        status={data.verification_status}
                        onStatusUpdate={(newStatus) =>
                          updateJobStatus(data.document_id, newStatus)
                        }
                        onCommentUpdate={(newComment) =>
                          updateCommentStatus(data.document_id, newComment)
                        }
                      />
                    ))
                  ) : (
                    <div className="w-full col-span-full">
                      <EmptyState
                        icon={
                          <PackageOpen
                            className="mx-auto text-muted-foreground"
                            size={64}
                          />
                        }
                        title="No work experience verification records found"
                        description="Work experience verification requests will appear here once available."
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
};

export default WorkExpVerification;
