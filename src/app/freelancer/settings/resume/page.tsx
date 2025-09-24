'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Plus } from 'lucide-react';

import SidebarMenu from '@/components/menu/sidebarMenu';
import Header from '@/components/header/header';
import ResumeEditor from '@/components/resumeEditor/editor';
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
  const [showResumeEditor, setShowResumeEditor] = useState(false);
  const [resumeData, setResumeData] = useState<any[]>([]);
  const [selectedResume, setSelectedResume] = useState<any>(null);

  const fetchResumeData = async () => {
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
    }
  };

  useEffect(() => {
    fetchResumeData();
  }, [user.uid]);

  const handleNewResume = () => {
    setSelectedResume(null);
    setShowResumeEditor(true);
  };

  const handleEditResume = (resume: any) => {
    setSelectedResume(resume);
    setShowResumeEditor(true);
  };

  if (showResumeEditor) {
    return (
      <>
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
          <SidebarMenu
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            active="Resume"
            isKycCheck={true}
          />
          <ResumeEditor
            initialResume={selectedResume}
            onCancel={() => {
              setShowResumeEditor(false);
              fetchResumeData(); // Call fetchResumeData when returning from editor
            }}
          />
        </div>
      </>
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
      <div className="flex flex-col sm:gap-4 sm:py-0 sm:pl-14">
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
        <main
          className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 
                grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
        >
          {resumeData.map((resume) => (
            <ResumeInfoCard
              key={resume._id}
              {...resume}
              onClick={() => handleEditResume(resume)}
            />
          ))}
          <Button
            variant="outline"
            size="icon"
            onClick={handleNewResume}
            className="my-auto"
          >
            <Plus className="h-4 w-4" />
          </Button>
          {resumeData.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <p className="text-gray-500 mb-4">No resumes found</p>
              <Button variant="outline" size="icon" onClick={handleNewResume}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
