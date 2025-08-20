'use client';
import { GraduationCap } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import CurrentInterviews from '@/components/freelancer/dehix-talent-interview/dehixcurrent';
// import BidedInterviews from '@/components/freelancer/dehix-talent-interview/dehixbided';

export default function InterviewsPage() {
  return (
    <div className="max-w-3/4 mx-auto p-6">
      {/* <h1 className="text-2xl font-bold mb-6">Interviews</h1> */}

      {/* Current Interview Section */}
      <div className="bg-white dark:bg-[#151518] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <Accordion type="single" collapsible>
          <AccordionItem
            value="current-interviews-upskill"
            className="border-0"
          >
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
                  <CurrentInterviews />
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
