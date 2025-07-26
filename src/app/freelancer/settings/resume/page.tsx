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

export default function Resume() {
  const user = useSelector((state: RootState) => state.user);
  const [refresh] = useState(false);
  const [showResumeEditor, setShowResumeEditor] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchResumeData = async () => {
      console.log(user);
      // if (!user?.uid || !user?.resume) return;
      
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(`/resume/${user.resume}`);
        
        setResumeData(response.data);
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
  }, [user.uid, user.resume, refresh]);

  if (showResumeEditor) {
    return <ResumeEditor />;
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
        <div className="flex flex-col h-screen">
          <h1 className="text-2xl font-bold mb-6 mt-5 ml-8">
            {resumeData ? 'Your Resume' : 'Start Building Your Resume'}
          </h1>
          <div className="ml-10">
            {isLoading ? (
              <div>Loading resume data...</div>
            ) : (
              <>
                <button
                  onClick={() => setShowResumeEditor(true)}
                  className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:bg-gray-200"
                >
                  <span className="text-4xl text-gray-600">+</span>
                </button>
                {resumeData && (
                  <div className="mt-4">
                    <p className="text-gray-600 mb-2">You have a saved resume.</p>
                    <button 
                      onClick={() => setShowResumeEditor(true)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit Resume
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}