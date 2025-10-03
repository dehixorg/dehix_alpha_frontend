'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import WorkExpVerificationCard from '@/components/cards/oracleDashboard/workExpVerificationCard';
import { axiosInstance } from '@/lib/axiosinstance';
import { StatusEnum } from '@/utils/freelancer/enum';
import { notifyError } from '@/utils/toastMessage';
// Define a union type for the filter options
type FilterOption = 'all' | 'current' | 'verified' | 'rejected';
interface JobData {
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
  onStatusUpdate: (newStatus: string) => void;
  onCommentUpdate: (newComment: string) => void;
}

const WorkExpVerification = () => {
  const [JobData, setJobData] = useState<JobData[]>([]);
  const [filter, setFilter] = useState<FilterOption>('all');
  const [loading, setLoading] = useState<boolean>(false);

  const handleFilterChange = useCallback(
    (newFilter: FilterOption) => setFilter(newFilter),
    [],
  );

  const filteredData = useMemo(() => {
    return JobData.filter((data) => {
      if (filter === 'all') return true;
      if (filter === 'current')
        return data.verificationStatus === StatusEnum.PENDING;
      return data.verificationStatus === filter;
    });
  }, [JobData, filter]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/verification/oracle?doc_type=experience`,
      );
      const result = response.data.data;

      const flattenedData = result.flatMap((entry: any) =>
        entry.result?.projects
          ? Object.values(entry.result.projects).map((project: any) => ({
              ...project,
              verifier_id: entry.verifier_id,
              verifier_username: entry.verifier_username,
            }))
          : [],
      );
      setJobData(flattenedData);
    } catch (error) {
      notifyError('Something went wrong. Please try again.', 'Error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateJobStatus = useCallback((index: number, newStatus: string) => {
    setJobData((prev) => {
      const next = [...prev];
      if (next[index]) next[index].verificationStatus = newStatus;
      return next;
    });
  }, []);

  const updateCommentStatus = useCallback(
    (index: number, newComment: string) => {
      setJobData((prev) => {
        const next = [...prev];
        if (next[index]) next[index].comments = newComment;
        return next;
      });
    },
    [],
  );

  return (
    <div className="bg-muted-foreground/20 dark:bg-muted/20 rounded-xl border shadow-sm overflow-hidden">
      <div className="flex flex-col gap-2 p-6 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">
          Experience Verification
        </h1>
        <p className="text-muted-foreground">
          Stay updated on your work experience verification status.
        </p>
      </div>
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
              value="current"
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

        {(['all', 'current', 'verified', 'rejected'] as FilterOption[]).map(
          (t) => (
            <TabsContent key={t} value={t} className="m-0">
              <CardContent>
                <div className="grid flex-1 items-start gap-4 md:gap-6 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
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
                    filteredData.map((data, index) => (
                      <WorkExpVerificationCard
                        key={index}
                        _id={data._id}
                        jobTitle={data.jobTitle}
                        workDescription={data.workDescription}
                        company={data.company}
                        startFrom={data.workFrom}
                        endTo={data.workTo}
                        referencePersonName={data.referencePersonName}
                        referencePersonContact={data.referencePersonContact}
                        githubRepoLink={data.githubRepoLink}
                        comments={data.comments}
                        status={data.verificationStatus}
                        onStatusUpdate={(newStatus) =>
                          updateJobStatus(index, newStatus)
                        }
                        onCommentUpdate={(newComment) =>
                          updateCommentStatus(index, newComment)
                        }
                      />
                    ))
                  ) : (
                    <div className="text-center w-full col-span-full mt-10 py-10">
                      <p className="text-sm text-muted-foreground">
                        No Work Experience verification found.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </TabsContent>
          ),
        )}
      </Tabs>
    </div>
  );
};

export default WorkExpVerification;
