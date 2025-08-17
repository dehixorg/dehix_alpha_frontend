'use client';
import * as React from 'react';

import ScheduleInterviewNavbar from '@/components/freelancer/scheduleInterview/ScheduleInterviewNavbar';

export default function ProjectInterviewPage() {
  return (
    <div className="flex min-h-screen w-full">
      <ScheduleInterviewNavbar />
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Project Interview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Project-based interviews for specific opportunities
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Project Interview Coming Soon
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Connect with clients through project-specific interviews to
              showcase your expertise.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
