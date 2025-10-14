'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { PackageOpen } from 'lucide-react';

import { CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WorkExpVerificationCard from '@/components/cards/oracleDashboard/workExpVerificationCard';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError } from '@/utils/toastMessage';
import { VerificationStatus } from '@/utils/verificationStatus';

type FilterOption = 'all' | 'pending' | 'approved' | 'denied';

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleFilterChange = (newFilter: FilterOption) => {
    setFilter(newFilter);
  };

  const filteredData = jobData.filter((data) => {
    if (filter === 'all') return true;
    if (filter === 'pending')
      return data.verification_status === VerificationStatus.PENDING;
    if (filter === 'approved')
      return data.verification_status === VerificationStatus.APPROVED;
    if (filter === 'denied')
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
    <div className="flex min-h-screen w-full flex-col">
      {/* Content container - matching business projects layout */}
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-2 md:gap-8">
        {/* Header section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Experience Verification
            </h1>
            <p className="text-muted-foreground mt-2">
              Stay updated on your work experience verification status. Check
              back regularly for any new updates or requirements.
            </p>
          </div>

          {/* Filter button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* View content */}
        {loading ? (
          /* Loading state */
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="h-48 bg-muted animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : filteredData.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-12">
            <PackageOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No work experience verification found
            </p>
          </div>
        ) : (
          /* Data view - Card grid */
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredData.map((data) => (
              <WorkExpVerificationCard
                key={data.document_id}
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
                status={data.verification_status}
                onStatusUpdate={(newStatus) =>
                  updateJobStatus(data.document_id, newStatus)
                }
                onCommentUpdate={(newComment) =>
                  updateCommentStatus(data.document_id, newComment)
                }
              />
            ))}
          </div>
        )}
      </main>

      {/* Filter Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Experience Status</DialogTitle>
          </DialogHeader>
          <RadioGroup
            defaultValue="all"
            value={filter}
            onValueChange={(value: FilterOption) => handleFilterChange(value)}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="filter-all" />
              <label htmlFor="filter-all">All</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="current" id="filter-current" />
              <label htmlFor="filter-current">Pending</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="verified" id="filter-verified" />
              <label htmlFor="filter-verified">Verified</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rejected" id="filter-rejected" />
              <label htmlFor="filter-rejected">Rejected</label>
            </div>
          </RadioGroup>
          <DialogFooter>
            <Button type="button" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkExpVerification;
