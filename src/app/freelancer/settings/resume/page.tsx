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
// import { axiosInstance } from '@/lib/axiosinstance';

export default function Resume() {
  const user = useSelector((state: RootState) => state.user);
  const [refresh, setRefresh] = useState(false);
  const [showResumeEditor, setShowResumeEditor] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const response = await axiosInstance.get(`/freelancer/${user.uid}`);
      } catch (error) {
        console.error('API Error:', error);
      }
    };

    fetchData();
  }, [user.uid, refresh]);

  if (showResumeEditor) {
    return <ResumeEditor />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Resume"
      />
      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Resume"
          breadcrumbItems={[
            { label: 'Settings', link: '#' },
            { label: 'Resume Building', link: '#' },
          ]}
        />
        <div className="flex flex-col h-screen">
          <h1 className="text-2xl font-bold mb-6 mt-5 ml-8">
            Start Building Your Resume
          </h1>
          <div className="ml-10">
            <button
              onClick={() => setShowResumeEditor(true)}
              className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:bg-gray-200"
            >
              <span className="text-4xl text-gray-600">+</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
