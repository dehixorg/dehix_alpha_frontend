'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { PackageOpen } from 'lucide-react';

import { CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import WorkExpVerificationCard from '@/components/cards/oracleDashboard/workExpVerificationCard';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError } from '@/utils/toastMessage';
import { VerificationStatus } from '@/utils/verificationStatus';

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

interface VerificationEntry {
  document_id: string;
  verification_status: VerificationStatus;
  comments: string;
  requester_id: string;
  verifier_id: string;
}

interface CombinedData extends WorkExperience, VerificationEntry {}

const WorkExpVerification = () => {
  const [jobData, setJobData] = useState<CombinedData[]>([]);
  const [filter, setFilter] = useState<FilterOption>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const handleFilterChange = (newFilter: FilterOption) => {
    setFilter(newFilter);
  };

  const filteredData = jobData.filter((data) => {
    if (filter === 'all') return true;
    if (filter === 'pending')
      return data.verification_status === VerificationStatus.PENDING;
    if (filter === 'verified')
      return data.verification_status === VerificationStatus.APPROVED;
    if (filter === 'rejected')
      return data.verification_status === VerificationStatus.DENIED;
    return true;
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const verificationResponse = await axiosInstance.get(
        `/verification/oracle?doc_type=experience`,
      );
      const verificationEntries = verificationResponse.data.data;

      if (!verificationEntries || verificationEntries.length === 0) {
        setJobData([]);
        return;
      }

      const transformedDataPromises = verificationEntries.map(
        async (entry: VerificationEntry) => {
          try {
            const workExpResponse = await axiosInstance.get(
              `/freelancer/${entry.requester_id}/experience`,
            );
            const workExpDocuments = workExpResponse.data.data;
            const workExpArray = Object.values(workExpDocuments);
            const matchingWorkExpDoc = workExpArray.find(
              (doc: any) => doc._id === entry.document_id,
            );
            if (matchingWorkExpDoc) {
              return {
                ...matchingWorkExpDoc,
                ...entry,
                verification_status:
                  entry.verification_status as VerificationStatus,
              };
            }
            return null;
          } catch (error) {
            console.error(
              `Failed to fetch work experience for requester ID ${entry.requester_id}:`,
              error,
            );
            return null;
          }
        },
      );

      const combinedData = (await Promise.all(transformedDataPromises)).filter(
        Boolean,
      );
      setJobData(combinedData as CombinedData[]);
    } catch (error) {
      notifyError('Something went wrong. Please try again.', 'Error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateJobStatus = (documentId: string, newStatus: string) => {
    setJobData((prev) =>
      prev.map((item) =>
        item.document_id === documentId
          ? { ...item, verification_status: newStatus as VerificationStatus }
          : item,
      ),
    );
  };

  const updateCommentStatus = (documentId: string, newComment: string) => {
    setJobData((prev) =>
      prev.map((item) =>
        item.document_id === documentId
          ? { ...item, comments: newComment }
          : item,
      ),
    );
  };

  return (
    <div className="bg-muted-foreground/20 dark:bg-muted/20 rounded-xl border shadow-sm overflow-hidden">
      <div className="flex flex-col gap-2 p-6 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">
          Experience Verification
        </h1>
        <p className="text-muted-foreground">
          Monitor and manage work experience verification requests.
        </p>
      </div>

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
                  {filteredData.length > 0 ? (
                    filteredData.map((data) => (
                      <WorkExpVerificationCard
                        key={data.document_id}
                        _id={data._id}
                        jobTitle={data.jobTitle}
                        company={data.company}
                        startFrom={data.workFrom}
                        endTo={data.workTo}
                        referencePersonName={data.referencePersonName}
                        referencePersonContact={data.referencePersonContact}
                        githubRepoLink={data.githubRepoLink}
                        comments={data.comments}
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
                    <div className="text-center w-full col-span-full mt-10 py-10">
                      <PackageOpen
                        className="mx-auto text-gray-500"
                        size={64}
                      />
                      <p className="text-sm text-muted-foreground">
                        No work experience verification records found.
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
