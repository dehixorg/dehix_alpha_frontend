'use client';
import React, { useCallback, useEffect, useState } from 'react';

import { CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError } from '@/utils/toastMessage';
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

interface VerificationEntry {
  _id: string;
  document_id: string;
  verification_status: string;
  comments: string;
  requester_id: string;
  Requester: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  Verifier: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface CombinedData extends EducationData, VerificationEntry {}

const OracleDashboard = () => {
  const [educationdata, setEducationData] = useState<CombinedData[]>([]);
  const [filter, setFilter] = useState<FilterOption>('all');
  const [loading, setLoading] = useState<boolean>(false);

  const handleFilterChange = useCallback((newFilter: FilterOption) => {
    setFilter(newFilter);
  }, []);

  const filteredData = educationdata.filter((data) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return data.verification_status === 'PENDING';
    if (filter === 'verified') return data.verification_status === 'APPROVED';
    if (filter === 'rejected') return data.verification_status === 'DENIED';
    return true;
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const verificationResponse = await axiosInstance.get(
        `/verification/oracle?doc_type=education`,
      );
      const verificationEntries = verificationResponse.data.data;
      if (!verificationEntries || verificationEntries.length === 0) {
        setEducationData([]);
        return;
      }

      const transformedDataPromises = verificationEntries.map(
        async (entry: VerificationEntry) => {
          try {
            const educationResponse = await axiosInstance.get(
              `/verification/${entry.requester_id}/education`,
            );

            const list = (educationResponse?.data?.data || []) as any[];
            const allEducationDocs: EducationData[] = list.flatMap((e) =>
              Object.values(e?.education || {}),
            ) as EducationData[];

            if (!allEducationDocs || allEducationDocs.length === 0) return null;

            const matchingEducationDoc = allEducationDocs.find(
              (doc) => doc._id === entry.document_id,
            );

            if (matchingEducationDoc) {
              return {
                ...matchingEducationDoc,
                ...entry,
                requester: entry.Requester,
                verifier: entry.Verifier,
              };
            }
            return null;
          } catch (error) {
            console.error(
              `Failed to fetch education data for requester ID ${entry.requester_id}:`,
              error,
            );
            return null;
          }
        },
      );

      const combinedData = (await Promise.all(transformedDataPromises)).filter(
        Boolean,
      );
      setEducationData(combinedData);
    } catch (error) {
      notifyError('Something went wrong. Please try again.', 'Error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEducationStatus = (
    documentId: string,
    newStatus: string,
    newComment: string,
  ) => {
    setEducationData((prev) =>
      prev.map((item) =>
        item.document_id === documentId
          ? { ...item, verification_status: newStatus, comments: newComment }
          : item,
      ),
    );
  };

  const updateCommentStatus = (documentId: string, newComment: string) => {
    setEducationData((prev) =>
      prev.map((item) =>
        item.document_id === documentId
          ? { ...item, comments: newComment }
          : item,
      ),
    );
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
                        _id={data._id}
                        type="education"
                        location={data.universityName}
                        degree={data.degree}
                        startFrom={data.startDate}
                        endTo={data.endDate}
                        grade={data.grade}
                        fieldOfStudy={data.fieldOfStudy}
                        comments={data.comments}
                        status={data.verification_status}
                        onStatusUpdate={(newStatus: string) =>
                          updateEducationStatus(
                            data.document_id,
                            newStatus,
                            data.comments,
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
