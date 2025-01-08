import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface ResumePreviewProps {
  educationData: {
    degree: string;
    school: string;
    startDate: string;
    endDate: string;
  }[];
  workExperienceData: {
    jobTitle: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  personalData: {
    firstName: string;
    lastName: string;
    city: string;
    country: string;
    phoneNumber: string;
    email: string;
    github: string;
    linkedin: string;
  }[];
  projectData: { title: string; description: string }[];
  skillData: { skillName: string }[];
  headingColor?: string;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  educationData,
  workExperienceData,
  personalData,
  projectData,
  skillData,
  headingColor = '#1A73E8',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={cn(
        'flex flex-col items-center w-full border border-gray-200 rounded-lg p-6 bg-white text-black',
      )}
      ref={containerRef}
    >
      <div className="w-full max-w-3xl space-y-6">
        {/* Header Section */}
        {personalData.map((person, index) => (
          <div key={index} className="text-center">
            <h1
              className="text-3xl font-bold mb-3"
              style={{ color: headingColor }}
            >
              {`${person.firstName} ${person.lastName}`}
            </h1>
            <p className="text-sm text-gray-500">{`${person.city}, ${person.country} • ${person.phoneNumber} • ${person.email}`}</p>
            <p className="text-sm text-gray-500">{`${person.github}, ${person.linkedin}`}</p>
          </div>
        ))}

        <Separator className="my-1 border border-gray-400" />

        {/* Summary Section */}
        <h2 className="text-xl font-semibold" style={{ color: headingColor }}>
          Summary
        </h2>
        <p className="text-sm text-gray-600">
          Experienced full-stack developer with expertise in building scalable
          web applications and intuitive user interfaces.
        </p>
        <Separator className="my-1 border border-gray-400" />

        {/* Work Experience Section */}
        <h2 className="text-xl font-semibold" style={{ color: headingColor }}>
          Work Experience
        </h2>
        <div>
          {workExperienceData.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm font-medium">
                <span>{item.jobTitle}</span>
                <span>
                  {item.startDate} - {item.endDate}
                </span>
              </div>
              <p className="text-sm text-gray-500">{item.company}</p>
              <ul className="list-disc pl-5 text-sm text-gray-600">
                <li>{item.description}</li>
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-1 border border-gray-400" />

        {/* Education Section */}
        <h2 className="text-xl font-semibold" style={{ color: headingColor }}>
          Education
        </h2>
        <div className="space-y-4 mt-3">
          {educationData.map((item, index) => (
            <div key={index} className="space-y-1">
              <p className="text-sm font-medium text-black">
                {item.degree} - {item.school}
              </p>
              <p className="text-xs text-gray-600">
                {item.startDate} to {item.endDate}
              </p>
            </div>
          ))}
        </div>

        <Separator className="my-1 border border-gray-400" />

        {/* Projects Section */}
        <h3 className="text-xl font-semibold" style={{ color: headingColor }}>
          Projects
        </h3>
        <div className="space-y-4 mt-3">
          {projectData.map((project, index) => (
            <div key={index} className="space-y-1">
              <p className="text-sm font-medium text-black">{project.title}</p>
              <p className="text-xs text-gray-600">{project.description}</p>
            </div>
          ))}
        </div>

        <Separator className="my-1 border border-gray-400" />

        {/* Skills Section */}
        <h3 className="text-xl font-semibold" style={{ color: headingColor }}>
          Skills
        </h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {skillData.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-white text-black rounded-md border border-gray-300 shadow-sm"
            >
              {skill.skillName}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
