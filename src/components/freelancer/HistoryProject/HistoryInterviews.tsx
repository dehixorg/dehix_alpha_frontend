"use client";
import React, { useState } from "react";
import { ChevronDown, ChevronUp, GraduationCap } from "lucide-react";
import CompletedInterviews from '@/components/freelancer/HistoryProject/CompletedInterviews';
// import BidedInterviews from '@/components/freelancer/dehix-talent-interview/dehixbided';

const AccordionSection = ({ title, children }: { title: React.ReactNode; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-[#374151] rounded-lg overflow-hidden mb-4">
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-10 light:bg-white dark:bg-[#151518]  rounded-lg shadow-sm transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-[#2c2c38] rounded-full p-2 flex items-center justify-center">
            {React.isValidElement(title) && title.props.children ? title.props.children[0] : null}
          </div>
          <span className="font-semibold text-white text-lg">
            {React.isValidElement(title) && title.props.children ? title.props.children[1] : null}
          </span>
        </div>
        {isOpen ? <ChevronUp size={20} color="white" /> : <ChevronDown size={20} color="white" />}
      </button>

      {/* Accordion Body */}
      {isOpen && (
        <div className="p-4 bg-[#151518] text-white">
          {children}
        </div>
      )}
    </div>
  );
};

export default function InterviewsPage() {
  return (
    <div className="max-w-3/4 mx-auto p-6">
      {/* <h1 className="text-2xl font-bold mb-6">Interviews</h1> */}

      {/* Current Interview Section */}
      <AccordionSection title={
        <div className="flex items-center gap-2">
          <GraduationCap size={20} color="white" />
          <span className="text-black dark:text-white">History</span>

        </div>
      }>
        <div className="space-y-2">
        <CompletedInterviews/>
        </div>
      </AccordionSection>

     
    </div>
  );
}
