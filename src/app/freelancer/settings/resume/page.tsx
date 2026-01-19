'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Plus } from 'lucide-react';

import FreelancerSettingsLayout from '../../../../components/layout/FreelancerSettingsLayout';

import ResumeEditor from '@/components/resumeEditor/editor';
import { RootState } from '@/lib/store';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { axiosInstance } from '@/lib/axiosinstance';
import ResumeInfoCard from '@/components/cards/resumeInfoCard';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/shared/EmptyState';

export default function Resume() {
  const user = useSelector((state: RootState) => state.user);
  const [showResumeEditor, setShowResumeEditor] = useState(false);
  const [resumeData, setResumeData] = useState<any[]>([]);
  const [selectedResume, setSelectedResume] = useState<any>(null);
  const [, setIsDeleting] = useState(false);

  const fetchResumeData = useCallback(
    async (isMounted?: boolean) => {
      if (!user.uid) return;

      try {
        const res = await axiosInstance.get(`/resume?userId=${user.uid}`);
        if (isMounted === undefined || isMounted) {
          setResumeData(res.data.resumes || []);
        }
      } catch (error) {
        notifyError('Failed to fetch resume data. Please try again.');
        console.error('API Error:', error);
      }
    },
    [user.uid],
  );

  useEffect(() => {
    let isMounted = true;
    fetchResumeData(isMounted);
    return () => {
      isMounted = false;
    };
  }, [fetchResumeData]);

  const handleNewResume = () => {
    setSelectedResume(null);
    setShowResumeEditor(true);
  };

  const handleEditResume = (resume: any) => {
    setSelectedResume(resume);
    setShowResumeEditor(true);
  };

  const handleDeleteResume = async (resumeId: string) => {
    if (!resumeId) return;

    try {
      setIsDeleting(true);
      await axiosInstance.delete(`/resume/${resumeId}`);

      // Update the UI by removing the deleted resume
      setResumeData((prevData) =>
        prevData.filter((resume) => resume._id !== resumeId),
      );
      notifySuccess('Resume deleted successfully');
    } catch (error) {
      console.error('Error deleting resume:', error);
      notifyError('Failed to delete resume. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (showResumeEditor) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <ResumeEditor
          initialResume={selectedResume}
          onCancel={() => {
            setShowResumeEditor(false);
            fetchResumeData(); // Call fetchResumeData when returning from editor
          }}
        />
      </div>
    );
  }

  return (
    <FreelancerSettingsLayout
      active="Resume"
      activeMenu="Resume"
      breadcrumbItems={[
        { label: 'Settings', link: '#' },
        { label: 'Resume Building', link: '#' },
      ]}
      isKycCheck={true}
      contentClassName="flex flex-col sm:gap-4 sm:py-0 sm:pl-14"
      mainClassName="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 
                grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
    >
      {resumeData.map((resume) => (
        <ResumeInfoCard
          key={resume._id}
          {...resume}
          onClick={() => handleEditResume(resume)}
          onDelete={handleDeleteResume}
        />
      ))}

      {resumeData.length > 0 && (
        <Button
          variant="outline"
          size="icon"
          onClick={handleNewResume}
          className="my-auto"
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}
      {resumeData.length === 0 && (
        <div className="col-span-full">
          <EmptyState
            icon={<Plus className="h-12 w-12 text-muted-foreground/80" />}
            title="No resumes found"
            description="Create your first resume to get started."
            actions={
              <Button variant="outline" size="icon" onClick={handleNewResume}>
                <Plus className="h-4 w-4" />
              </Button>
            }
            className="py-8"
          />
        </div>
      )}
    </FreelancerSettingsLayout>
  );
}
