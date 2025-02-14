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
  const formatDate = (dateString: any) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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
                  <Card className="p-6 rounded-lg ">
                    <h3 className="text-2xl font-bold mb-1">{item.jobTitle}</h3>
                    <p className="text-lg text-gray-300">{item.company}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {item.workDescription}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-4">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDate(item.workFrom)} - {formatDate(item.workTo)}
                      </span>
                    </div>

                    {item.githubRepoLink && (
                      <p className="text-sm mt-3">
                        GitHub:{' '}
                        <a
                          href={item.githubRepoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-blue-400 hover:text-blue-300"
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
