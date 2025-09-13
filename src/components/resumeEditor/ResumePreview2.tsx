import React, { useRef } from 'react';

// import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
// Add this interface near the top of both files
interface SectionVisibility {
  personal: boolean;
  summary: boolean;
  workExperience: boolean;
  education: boolean;
  projects: boolean;
  skills: boolean;
  achievements: boolean;
}

interface ResumePreviewProps {
  educationData?: {
    degree: string;
    school: string;
    startDate: string;
    endDate: string;
  }[];
  workExperienceData?: {
    jobTitle: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  personalData?: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    github: string;
    linkedin: string;
  }[];
  projectData?: { title: string; description: string }[];
  skillData?: { skillName: string }[];
  achievementData?: { achievementName: string }[];
  summaryData?: string[];
  headingColor?: string;
  sectionVisibility?: SectionVisibility;
}

export const ResumePreview2: React.FC<ResumePreviewProps> = ({
  educationData = [
    {
      degree: 'Bachelor of Science in Computer Science',
      school: 'ABC University',
      startDate: '2015',
      endDate: '2019',
    },
    {
      degree: 'Master of Science in Software Engineering',
      school: 'XYZ University',
      startDate: '2020',
      endDate: '2022',
    },
  ],
  workExperienceData = [
    {
      jobTitle: 'english teacher',
      company: 'TechCorp Solutions',
      startDate: '2019',
      endDate: '2021',
      description:
        'Developed scalable web applications and optimized system performance.',
    },
    {
      jobTitle: 'Sql developer',
      company: 'Innovatech',
      startDate: '2021',
      endDate: '2023',
      description:
        'Led a team of developers to build cloud-based enterprise software.',
    },
  ],
  personalData = [],
  skillData = [],
  achievementData = [],
  projectData = [],
  summaryData = [],
  headingColor = '#1A73E8',
  sectionVisibility = {
    personal: true,
    summary: true,
    workExperience: true,
    education: true,
    projects: true,
    skills: true,
    achievements: true,
  },
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex justify-center w-full h-full py-4">
      <div
        ref={containerRef}
        className="bg-white w-full max-w-[794px] p-4 flex"
        style={{ boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)' }}
      >
        {/* Left Section - Fixed width */}
        <div className="w-1/3 bg-gray-100 p-4 flex flex-col">
          {sectionVisibility.personal &&
            personalData.map((person, index) => (
              <div key={index} className="mb-4">
                <h1
                  className="text-3xl font-bold text-gray-900"
                  style={{ color: headingColor }}
                >
                  {`${person.firstName} ${person.lastName}`}
                </h1>
                <div className="mt-4">
                  <h2
                    className="text-lg font-semibold text-gray-900 mb-2"
                    style={{ color: headingColor }}
                  >
                    Contact Details
                  </h2>
                  <Separator className="my-2" />
                  <p className="text-sm text-gray-800 break-words truncate">
                    {person.email}
                  </p>
                  <p className="text-sm text-gray-800 break-words truncate">
                    {person.phoneNumber}
                  </p>
                  <p className="text-sm text-gray-800 mt-1 break-words truncate">
                    {person.linkedin}
                  </p>
                  <p className="text-sm text-gray-800 break-words truncate">
                    {person.github}
                  </p>
                </div>
              </div>
            ))}

          {sectionVisibility.skills && skillData.length > 0 && (
            <div className="mt-4">
              <h2
                className="text-lg font-semibold text-gray-900"
                style={{ color: headingColor }}
              >
                Skills
              </h2>
              <Separator className="my-2" />
              <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                {skillData.map((skill, index) => (
                  <li key={index}>{skill.skillName}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Section - Flexible width */}
        <div className="w-2/3 p-4 flex flex-col">
          {sectionVisibility.summary && summaryData.length > 0 && (
            <div className="mb-4">
              <h2
                className="text-lg font-bold text-gray-900"
                style={{ color: headingColor }}
              >
                Profile Summary
              </h2>
              <Separator className="my-2" />
              <p className="text-sm text-gray-800">{summaryData.join(' ')}</p>
            </div>
          )}

          {sectionVisibility.workExperience &&
            workExperienceData.length > 0 && (
              <div className="mb-4">
                <h2
                  className="text-lg font-semibold text-gray-900"
                  style={{ color: headingColor }}
                >
                  Experience
                </h2>
                <Separator className="my-2" />
                {workExperienceData.map((item, index) => (
                  <div key={index} className="mb-4">
                    <p className="text-sm font-medium text-gray-900">
                      {item.jobTitle} - {item.company}
                    </p>
                    <p className="text-xs text-gray-700">
                      {item.startDate} to {item.endDate}
                    </p>
                    <p className="text-sm text-gray-800 mt-1 ">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            )}

          {sectionVisibility.projects && projectData.length > 0 && (
            <div className="mb-4">
              <h2
                className="text-lg font-semibold text-gray-900"
                style={{ color: headingColor }}
              >
                Projects
              </h2>
              <Separator className="my-2" />
              {projectData.map((project, index) => (
                <div key={index} className="mb-3">
                  <p className="text-sm font-medium text-gray-900">
                    {project.title}
                  </p>
                  <p className="text-sm text-gray-700">{project.description}</p>
                </div>
              ))}
            </div>
          )}

          {sectionVisibility.education && educationData.length > 0 && (
            <div className="mb-4">
              <h2
                className="text-lg font-semibold text-gray-900"
                style={{ color: headingColor }}
              >
                Education
              </h2>
              <Separator className="my-2" />
              {educationData.map((item, index) => (
                <div key={index} className="mb-2">
                  <p className="text-sm font-medium text-gray-900">
                    {item.degree} - {item.school}
                  </p>
                  <p className="text-xs text-gray-700">
                    {item.startDate} to {item.endDate}
                  </p>
                </div>
              ))}
            </div>
          )}

          {sectionVisibility.achievements && achievementData.length > 0 && (
            <div>
              <h2
                className="text-lg font-semibold text-gray-900"
                style={{ color: headingColor }}
              >
                Achievements
              </h2>
              <Separator className="my-2" />
              <ul className="list-disc list-inside text-sm text-gray-800">
                {achievementData.map((achievement, index) => (
                  <li key={index}>{achievement.achievementName}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
