'use client';
import React, { useCallback, useMemo, useState } from 'react';

import { CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import EducationVerificationCard from '@/components/cards/oracleDashboard/educationVerificationCard';
import OracleVerificationLayout from '@/components/freelancer/oracleDashboard/OracleVerificationLayout';
import EmptyState from '@/components/shared/EmptyState';

type FilterOption = 'all' | 'pending' | 'verified' | 'rejected';

interface EducationData {
  _id: string;
  degree: string;
  universityName: string;
  startDate: string;
  endDate: string;
  grade: string;
  fieldOfStudy: string;
  comments: string;
}

interface CombinedData extends EducationData {
  verification_id: string;
  document_id: string;
  verification_status: string;
  comment: string;
}

interface EducationVerificationProps {
  data: any[];
  loading: boolean;
}

const OracleDashboard = ({ data, loading }: EducationVerificationProps) => {
  const [filter, setFilter] = useState<FilterOption>('all');
  const [localData, setLocalData] = useState<CombinedData[]>([]);
  const [initialized, setInitialized] = useState(false);

  const educationData = useMemo(() => {
    const transformed: CombinedData[] = data
      .map((entry: any) => {
        const educationDocs = entry.result?.education
          ? (Object.values(entry.result.education) as EducationData[])
          : [];

        const matchingDoc = educationDocs.find(
          (doc) => doc._id === entry.document_id,
        );

        if (!matchingDoc) return null;
        return {
          ...matchingDoc,
          verification_id: entry._id,
          document_id: entry.document_id,
          verification_status: entry.verification_status,
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

  const displayData = initialized ? localData : educationData;

  const handleFilterChange = useCallback((newFilter: FilterOption) => {
    setFilter(newFilter);
  }, []);

  const filteredData = displayData.filter((d) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return d.verification_status === 'PENDING';
    if (filter === 'verified') return d.verification_status === 'APPROVED';
    if (filter === 'rejected') return d.verification_status === 'DENIED';
    return true;
  });

  const updateEducationStatus = (
    documentId: string,
    newStatus: string,
    newComment: string,
  ) => {
    setLocalData((prev) =>
      prev.map((item) =>
        item.document_id === documentId
          ? { ...item, verification_status: newStatus, comment: newComment }
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
      title="Education Verification"
      description="Monitor and manage education verification requests."
    >
      <Tabs
        value={filter}
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
                                <Skeleton className="h-6 w-40" />
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                <Skeleton className="h-5 w-20 rounded-full" />
                              </div>
                              <div className="mt-3">
                                <Skeleton className="h-4 w-28" />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="px-6 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
                              <Skeleton className="h-3 w-24 mb-2" />
                              <Skeleton className="h-4 w-32" />
                            </div>
                            <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
                              <Skeleton className="h-3 w-16 mb-2" />
                              <Skeleton className="h-4 w-24" />
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
                      <EducationVerificationCard
                        key={data.document_id}
                        _id={data.verification_id}
                        type="education"
                        location={data.universityName}
                        degree={data.degree}
                        startFrom={data.startDate}
                        endTo={data.endDate}
                        grade={data.grade}
                        fieldOfStudy={data.fieldOfStudy}
                        comments={data.comment}
                        status={data.verification_status}
                        onStatusUpdate={(newStatus: string) =>
                          updateEducationStatus(
                            data.document_id,
                            newStatus,
                            data.comment,
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
                        title="No education verification records found"
                        description="Education verification requests will show up here once they are submitted."
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

export default OracleDashboard;
