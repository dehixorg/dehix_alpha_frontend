'use client';
import { GraduationCap } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import EmptyState from '@/components/shared/EmptyState';
// import CurrentInterviews from '@/components/freelancer/scheduleInterview/CurrentInterviews';
// import BidedInterviews from '@/components/freelancer/scheduleInterview/BidedInterviews';

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
              <EmptyState
                title="No project interviews scheduled"
                description="Once an interview is scheduled for a project, it will appear here."
                icon={
                  <GraduationCap className="h-12 w-12 text-muted-foreground" />
                }
                className="bg-transparent border-dashed"
              />
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
