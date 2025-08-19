'use client';
import * as React from 'react';

import ScheduleInterviewNavbar from '@/components/freelancer/scheduleInterview/ScheduleInterviewNavbar';

export default function UpskillInterviewPage() {
  return (
    <div className="flex min-h-screen w-full">
      <ScheduleInterviewNavbar />
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Upskill Interview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Enhance your skills through specialized interviews
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Upskill Interview Coming Soon
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              This feature will help you enhance your skills through specialized
              interviews with industry experts. This feature will help you
              enhance your skills through specialized interviews with industry
              experts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
