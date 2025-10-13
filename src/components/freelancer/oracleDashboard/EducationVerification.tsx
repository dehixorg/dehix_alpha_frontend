'use client';
import React, { useCallback, useEffect, useState } from 'react';

import { CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError } from '@/utils/toastMessage';
import EducationVerificationCard from '@/components/cards/oracleDashboard/educationVerificationCard';

type FilterOption = 'all' | 'pending' | 'approved' | 'denied';

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

  const handleFilterChange = useCallback((newFilter: FilterOption) => {
    setFilter(newFilter);
  }, []);

  const filteredData = educationdata.filter((data) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return data.verification_status === 'PENDING';
    if (filter === 'approved') return data.verification_status === 'APPROVED';
    if (filter === 'denied') return data.verification_status === 'DENIED';
    return true;
  });

  const fetchData = useCallback(async () => {
    try {
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
    <div className="bg-muted-foreground/20 dark:bg-muted/20 rounded-xl border shadow-sm overflow-hidden">
      <div className="flex flex-col gap-2 p-6 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">
          Education Verification
        </h1>
        <p className="text-muted-foreground">
          Monitor and manage education verification requests.
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
                <div className="grid flex-1 items-start gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredData.length > 0 ? (
                    filteredData.map((data) => (
                      <EducationVerificationCard
                        key={data.document_id}
                        _id={data.document_id}
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
                    <div className="text-center w-full col-span-full mt-10 py-10">
                      <p className="text-sm text-muted-foreground">
                        No education verification records found.
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

export default OracleDashboard;
