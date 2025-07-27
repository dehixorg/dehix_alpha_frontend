'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import SidebarMenu from '@/components/menu/sidebarMenu';
import Header from '@/components/header/header';
import ResumeEditor from '@/components/resumeEditor/page';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/settingsMenuItems';
import { RootState } from '@/lib/store';
import { toast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/lib/axiosinstance';
import ResumeInfoCard from '@/components/cards/resumeInfoCard';
import { Button } from '@/components/ui/button';

export default function Resume() {
  const user = useSelector((state: RootState) => state.user);
  const [refresh, setRefresh] = useState(false);
  const [showResumeEditor, setShowResumeEditor] = useState(false);
  const [resumeData, setResumeData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedResume, setSelectedResume] = useState<any>(null);

  useEffect(() => {
    const fetchResumeData = async () => {
      setIsLoading(true);
      try {
        const res = await axiosInstance.get(`/resume?userId=${user.uid}`);
        setResumeData(res.data.resumes || []);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch resume data. Please try again.',
        });
        console.error('API Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResumeData();
  }, [user.uid, refresh]);

  const handleNewResume = () => {
    setSelectedResume(null);
    setShowResumeEditor(true);
  };

  const handleEditResume = (resume: any) => {
    setSelectedResume(resume);
    setShowResumeEditor(true);
  };

  const handleResumeSaved = () => {
    setRefresh((prev) => !prev);
    setShowResumeEditor(false);
  };

  if (showResumeEditor) {
    return (
      <ResumeEditor
        initialResume={selectedResume}
        onCancel={() => setShowResumeEditor(false)}
      />
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Resume"
        isKycCheck={true}
      />
      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14 mb-8">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Resume"
          breadcrumbItems={[
            { label: 'Freelancer', link: '/dashboard/freelancer' },
            { label: 'Settings', link: '#' },
            { label: 'Resume Building', link: '#' },
          ]}
        />
        <div className="flex flex-col">
          <div className="flex justify-between items-center mx-8 mt-5 mb-6">
            <h1 className="text-2xl font-bold">
              {resumeData.length > 0
                ? 'Your Resumes'
                : 'Start Building Your Resume'}
            </h1>
            <Button onClick={handleNewResume} className="ml-4">
              + New Resume
            </Button>
          </div>
          <div className="mx-8">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading resume data...</p>
              </div>
            ) : (
              <div className="grid flex-1 items-start gap-4 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {resumeData.map((resume) => (
                  <ResumeInfoCard
                    key={resume._id}
                    {...resume}
                    onClick={() => handleEditResume(resume)}
                  />
                ))}
                {resumeData.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-12">
                    <p className="text-gray-500 mb-4">No resumes found</p>
                    <Button onClick={handleNewResume}>
                      Create Your First Resume
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
