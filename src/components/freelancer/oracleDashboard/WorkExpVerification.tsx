'use client';
import { Filter, PackageOpen } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import WorkExpVerificationCard from '@/components/cards/oracleDashboard/workExpVerificationCard';
import { axiosInstance } from '@/lib/axiosinstance';
import { StatusEnum } from '@/utils/freelancer/enum';
import { notifyError } from '@/utils/toastMessage';

type FilterOption = 'all' | 'current' | 'verified' | 'rejected';

// Define the interface for the combined data from both API calls
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
  verification_status: string;
  comments: string;
  requester_id: string;
  verifier_id: string;
}

interface CombinedData extends WorkExperience, VerificationEntry {}

const WorkExpVerification = () => {
  const [jobData, setJobData] = useState<CombinedData[]>([]);
  const [filter, setFilter] = useState<FilterOption>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFilterChange = (newFilter: FilterOption) => {
    setFilter(newFilter);
    setIsDialogOpen(false);
  };

  const filteredData = jobData.filter((data) => {
    if (filter === 'all') {
      return true;
    }
    return (
      data.verification_status === filter ||
      (filter === 'current' && data.verification_status === StatusEnum.PENDING)
    );
  });

  const fetchData = useCallback(async () => {
    try {
      // Step 1: Fetch the list of verification documents
      const verificationResponse = await axiosInstance.get(
        `/verification/oracle?doc_type=experience`,
      );
      const verificationEntries = verificationResponse.data.data;

      if (!verificationEntries || verificationEntries.length === 0) {
        setJobData([]);
        return;
      }

      // Step 2: Make a separate API call for each verification entry
      const transformedDataPromises = verificationEntries.map(async (entry: VerificationEntry) => {
        try {
          // Fetch work experience documents for the specific freelancer
          const workExpResponse = await axiosInstance.get(
            `/freelancer/${entry.requester_id}/experience`,
          );
         const workExpDocuments = workExpResponse.data.data;
          console.log("Work experience documents object:", workExpDocuments);

          // First, convert the object's values into an array
          const workExpArray = Object.values(workExpDocuments);

          // Now, use find on the new array to get the matching document
          const matchingWorkExpDoc = workExpArray.find(
            (doc: any) => doc._id === entry.document_id,
          );

          console.log("Matching work experience document found:", matchingWorkExpDoc);

          if (matchingWorkExpDoc) {
            return {
              ...matchingWorkExpDoc,
              ...entry,
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
      });

      const combinedData = (await Promise.all(transformedDataPromises)).filter(Boolean);
      setJobData(combinedData as CombinedData[]);
    } catch (error) {
      notifyError('Something went wrong. Please try again.', 'Error');
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateJobStatus = (documentId: string, newStatus: string) => {
    setJobData((prev) =>
      prev.map((item) =>
        item.document_id === documentId ? { ...item, verification_status: newStatus } : item,
      ),
    );
  };

  const updateCommentStatus = (documentId: string, newComment: string) => {
    setJobData((prev) =>
      prev.map((item) =>
        item.document_id === documentId ? { ...item, comments: newComment } : item,
      ),
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="mb-8 ml-4 flex justify-between mt-8 md:mt-4 items-center">
        <div className="mb-8 ">
          <h1 className="text-3xl font-bold">Experience Verification</h1>
          <p className="text-gray-400 mt-2">
            Stay updated on your work experience verification status. Check back
            regularly for any new updates or requirements.
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="mr-8 mb-12"
          onClick={() => setIsDialogOpen(true)}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

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

      <main
        className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 
                grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
      >
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
            status={data.verification_status} // Pass the status to the card component
            onStatusUpdate={(newStatus) => updateJobStatus(data.document_id, newStatus)}
            onCommentUpdate={(newComment) =>
              updateCommentStatus(data.document_id, newComment)
            }
          />
        ))}
        {jobData.length == 0 ? (
          <div className="text-center w-[90vw] px-auto mt-20 py-10">
            <PackageOpen className="mx-auto text-gray-500" size="100" />
            <p className="text-gray-500">
              No Work Experience verification for you now.
            </p>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default WorkExpVerification;