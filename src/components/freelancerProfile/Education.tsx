import React from 'react';

import { Card } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

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
  return (
    <section className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Education</h2>
      <div className="relative ml-4">
        <ScrollArea className="scroll-smooth w-full">
          <div className="flex justify-start items-center mb-3 space-x-4">
            {education.length > 0 ? (
              education.map((edu, index) => (
                <div key={index} className="w-[calc(50%-1rem)] flex-shrink-0">
                  <Card className="shadow-lg rounded-lg p-5 hover:shadow-xl transition-shadow">
                    <h3 className="text-xl font-semibold">{edu.degree}</h3>
                    <p className="text-md font-medium">{edu.universityName}</p>
                    <p className="text-sm italic">
                      {edu.startDate} - {edu.endDate}
                    </p>
                    {edu.grade && (
                      <p className="text-sm font-medium mt-2">
                        Grade: <span className="font-bold">{edu.grade}</span>
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
