import React from 'react';
import { Calendar, Github, ExternalLink, Wrench } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface ProfessionalExperienceProps {
  professionalInfo: {
    jobTitle?: string;
    company?: string;
    workDescription?: string;
    workFrom?: string;
    workTo?: string;
    githubRepoLink?: string;
  }[];
}

const ProfessionalExperience: React.FC<ProfessionalExperienceProps> = ({
  professionalInfo,
}) => {
  return (
    <section className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Professional Experience</h2>
      <div className="relative ml-4">
        <ScrollArea className="scroll-smooth w-full">
          <div className="flex justify-start items-center ml-0 mb-3 space-x-4">
            {professionalInfo.length > 0 ? (
              professionalInfo.map((item, index) => (
                <div
                  key={index}
                  className="w-[90vw] md:w-[calc(50%-1rem)] flex-shrink-0"
                >
                  <Card className="shadow-lg rounded-lg p-5 hover:shadow-xl transition-shadow">
                    <h3 className="text-xl font-semibold">{item.jobTitle}</h3>
                    <p className="text-md font-medium">{item.company}</p>
                    <p className="text-sm font-medium mt-2">
                      {item.workDescription}
                    </p>
                    <div className="text-sm italic mt-2 flex gap-2 justify-normal items-center">
                      <p>
                        <Calendar className="w-4 h-4" />{' '}
                      </p>
                      <p>
                        {item.workFrom} {'- ' + item.workTo}
                      </p>
                    </div>
                    {item.githubRepoLink && (
                      <p className="text-sm mt-2">
                        GitHub:{' '}
                        <a
                          href={item.githubRepoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-indigo-600"
                        >
                          {item.githubRepoLink.split('/').pop()}
                        </a>
                      </p>
                    )}
                  </Card>
                </div>
              ))
            ) : (
              <p>No professional information available.</p>
            )}
          </div>
          <ScrollBar orientation="horizontal" className="cursor-pointer mt-2" />
        </ScrollArea>
      </div>
    </section>
  );
};

export default ProfessionalExperience;
