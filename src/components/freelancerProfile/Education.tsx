import React from 'react';

import { Card } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { GraduationCap } from 'lucide-react';

interface EducationProps {
  education: {
    degree?: string;
    universityName?: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
    grade?: string;
  }[];
}

const Education: React.FC<EducationProps> = ({ education }) => {

  const formatDate = (dateString:any) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Education</h2>
      <div className="relative ml-4">
        <ScrollArea className="scroll-smooth w-full">
          <div className="flex justify-start items-center mb-3 space-x-4">
            {education.length > 0 ? (
              education.map((edu, index) => (
                <div key={index} className="w-[calc(50%-1rem)] flex-shrink-0">
                  <Card className="p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <GraduationCap className="w-6 h-6 text-blue-400" />
                      <h3 className="text-2xl font-semibold">{edu.degree}</h3>
                    </div>
                    <p className="text-lg text-gray-300 mb-2">{edu.universityName}</p>
                    <p className="text-sm italic text-gray-400">
                      {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                    </p>
                    {edu.grade && (
                      <p className="text-sm font-medium text-gray-300 mt-2">
                        Grade: <span className="text-white font-bold">{edu.grade}</span>
                      </p>
                    )}
                  </Card>
                </div>
              ))
            ) : (
              <p>No education data available.</p>
            )}
          </div>
          <ScrollBar orientation="horizontal" className="cursor-pointer mt-2" />
        </ScrollArea>
      </div>
    </section>
  );
};

export default Education;
