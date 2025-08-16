'use client';
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, GraduationCap } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
// import CurrentInterviews from '@/components/freelancer/scheduleInterview/CurrentInterviews';
// import BidedInterviews from '@/components/freelancer/scheduleInterview/BidedInterviews';

const AccordionSection = ({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-[#374151] rounded-lg overflow-hidden mb-4">
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-10 bg-[#151518] hover:bg-[#1f1f23] rounded-lg shadow-sm transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-[#2c2c38] rounded-full p-2 flex items-center justify-center">
            {React.isValidElement(title) && title.props.children
              ? title.props.children[0]
              : null}
          </div>
          <span className="font-semibold text-white text-lg">
            {React.isValidElement(title) && title.props.children
              ? title.props.children[1]
              : null}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp size={20} color="white" />
        ) : (
          <ChevronDown size={20} color="white" />
        )}
      </button>

      {/* Accordion Body */}
      {isOpen && <div className="p-4 bg-[#151518] text-white">{children}</div>}
    </div>
  );
};

export default function InterviewsPage() {
  return (
    <div className="max-w-3/4 mx-auto p-6">
      {/* <h1 className="text-2xl font-bold mb-6">Interviews</h1> */}

      {/* Current Interview Section */}
      <Accordion type="single" collapsible>
        <AccordionItem value="current-interviews-upskill">
          <AccordionTrigger className="text-xl font-semibold hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Current Interview
              </h2>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                No current interviews scheduled.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Bided Interview Section
      <AccordionSection title="Bided Interview">
        <div className="space-y-2">
        <BidedInterviews/>
        </div>
      </AccordionSection> */}
    </div>
  );
}
