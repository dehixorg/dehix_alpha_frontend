'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import EducationVerificationCard from '@/components/cards/oracleDashboard/educationVerificationCard';
import { axiosInstance } from '@/lib/axiosinstance';
import { StatusEnum } from '@/utils/freelancer/enum';
import { notifyError } from '@/utils/toastMessage';
type FilterOption = 'all' | 'current' | 'verified' | 'rejected';
interface EducationData {
  _id: string;
  degree: string;
  universityName: string;
  startDate: string;
  endDate: string;
  grade: string;
  fieldOfStudy: string;
  comments: string;
  verificationStatus: string;
}

const EducationVerification = () => {
  const [educationdata, setEducationData] = useState<EducationData[]>([]);
  const [filter, setFilter] = useState<FilterOption>('all');
  const [loading, setLoading] = useState<boolean>(false);

  const handleFilterChange = useCallback(
    (newFilter: FilterOption) => setFilter(newFilter),
    [],
  );

  const filteredData = useMemo(() => {
    return educationdata.filter((data) => {
      if (filter === 'all') return true;
      if (filter === 'current')
        return data.verificationStatus === StatusEnum.PENDING;
      return data.verificationStatus === filter;
    });
  }, [educationdata, filter]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/verification/oracle?doc_type=education`,
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
      setEducationData(flattenedData);
    } catch (error) {
      notifyError('Something went wrong. Please try again.', 'Error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Log the requesterId state after it updates
  // useEffect(() => {
  //
  // }, [requesterId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateEducationStatus = useCallback(
    (index: number, newStatus: string) => {
      setEducationData((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, verificationStatus: newStatus } : item,
        ),
      );
    },
    [setEducationData],
  );

  const updateCommentStatus = useCallback(
    (index: number, newComment: string) => {
      setEducationData((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, comments: newComment } : item,
        ),
      );
    },
    [setEducationData],
  );

  return (
    <div className="bg-muted-foreground/20 dark:bg-muted/20 rounded-xl border shadow-sm overflow-hidden">
      <div className="flex flex-col gap-2 p-6 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">
          Education Verification
        </h1>
        <p className="text-muted-foreground">
          Monitor the status of your education verifications.
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
            <TabsContent key={t} value={t}>
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
                      <EducationVerificationCard
                        key={index}
                        type="education"
                        _id={data._id}
                        degree={data.degree}
                        location={data.universityName}
                        startFrom={data.startDate}
                        endTo={data.endDate}
                        grade={data.grade}
                        fieldOfStudy={data.fieldOfStudy}
                        comments={data.comments}
                        status={data.verificationStatus}
                        onStatusUpdate={(newStatus) =>
                          updateEducationStatus(index, newStatus)
                        }
                        onCommentUpdate={(newComment) =>
                          updateCommentStatus(index, newComment)
                        }
                      />
                    ))
                  ) : (
                    <div className="text-center w-full col-span-full mt-10 py-10">
                      <p className="text-sm text-muted-foreground">
                        No Education verification found.
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

export default EducationVerification;
