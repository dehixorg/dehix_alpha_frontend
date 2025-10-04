'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { axiosInstance } from '@/lib/axiosinstance';
import { StatusEnum } from '@/utils/freelancer/enum';
import { notifyError } from '@/utils/toastMessage';
import EducationVerificationCard from '@/components/cards/oracleDashboard/educationVerificationCard';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';

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
}

interface VerificationEntry {
  document_id: string;
  verification_status: string;
  comments: string;
  requester_id:string;
  requester: {
   
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  verifier: {
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFilterChange = (newFilter: FilterOption) => {
    setFilter(newFilter);
    setIsDialogOpen(false);
  };

  const filteredData = educationdata.filter((data) => {
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
        `/verification/oracle?doc_type=education`,
      );
      const verificationEntries = verificationResponse.data.data;
      
      if (!verificationEntries || verificationEntries.length === 0) {
        setEducationData([]);
        return;
      }

      const transformedDataPromises = verificationEntries.map(async (entry: VerificationEntry) => {
        try {
          const educationResponse = await axiosInstance.get(
            `/verification/${entry.requester_id}/education`,
          );

          const educationData = educationResponse.data.data && educationResponse.data.data.length > 0
            ? educationResponse.data.data[0].education
            : null;
          
          if (!educationData) {
              return null;
          }

          const educationDocsArray = Object.values(educationData) as EducationData[];

          const matchingEducationDoc = educationDocsArray.find(
            (doc) => doc._id === entry.document_id,
          );

          if (matchingEducationDoc) {
            return {
              ...matchingEducationDoc,
              ...entry,
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
      });

      const combinedData = (await Promise.all(transformedDataPromises)).filter(Boolean);
      setEducationData(combinedData);
    } catch (error) {
      notifyError('Something went wrong. Please try again.', 'Error');
      console.error(error);
    }
}, []);

  const updateEducationStatus = (documentId: string, newStatus: string, newComment: string) => {
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
    <div className="flex min-h-screen w-full flex-col">
      <div className="mb-8 ml-4 flex justify-between mt-8 md:mt-4 items-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Education Verification</h1>
          <p className="text-gray-400 mt-2">
            Monitor the status of your Education verifications.
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
            <DialogTitle>Filter Education Status</DialogTitle>
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
        {filteredData.length > 0 ? (
          filteredData.map((data) => (
        <EducationVerificationCard
  key={data.document_id}
  _id={data.document_id}
  type="education"
  requester={data.requester}
  verifier={data.verifier}
  location={data.universityName}
  degree={data.degree}
  startFrom={data.startDate}
  endTo={data.endDate}
  grade={data.grade}
  fieldOfStudy={data.fieldOfStudy}
  comments={data.comments}
  status={data.verification_status}
  onStatusUpdate={(newStatus: string) => updateEducationStatus(data.document_id, newStatus, data.comments)}
  onCommentUpdate={(newComment) => updateCommentStatus(data.document_id, newComment)}
/>
          ))
        ) : (
          <div className="text-center w-[90vw] px-auto mt-20 py-10">
            <PackageOpen className="mx-auto text-gray-500" size="100" />
            <p className="text-gray-500">
              No Education verification for you now.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default OracleDashboard;