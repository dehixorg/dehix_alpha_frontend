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
    <div className="flex justify-center w-full h-full rounded-md">
      <div
        ref={containerRef}
        className="bg-white w-full max-w-[794px] flex rounded-md overflow-hidden"
        style={{
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
          minHeight: '297mm',
          width: '210mm',
          boxSizing: 'border-box',
        }}
      >
        {/* Left Section - Fixed width */}
        <div className="w-1/3 bg-gray-50 p-5 flex flex-col">
          {sectionVisibility.personal &&
            personalData.map((person, index) => (
              <div key={index} className="mb-3">
                <h1
                  className="text-2xl font-bold text-gray-900 mb-2"
                  style={{ color: headingColor }}
                >
                  {`${person.firstName} ${person.lastName}`}
                </h1>
                <div className="mt-3">
                  <h2
                    className="text-base font-semibold text-gray-900 mb-1"
                    style={{ color: headingColor }}
                  >
                    Contact
                  </h2>
                  <Separator className="my-1 h-[1px] bg-gray-300" />
                  <div className="space-y-1 mt-2">
                    <p className="text-xs text-gray-700 break-words">
                      {person.email}
                    </p>
                    <p className="text-xs text-gray-700 break-words">
                      {person.phoneNumber}
                    </p>
                    <p className="text-xs text-gray-700 break-words">
                      {person.linkedin}
                    </p>
                    <p className="text-xs text-gray-700 break-words">
                      {person.github}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          {sectionVisibility.skills && skillData.length > 0 && (
            <div className="mt-4">
              <h2
                className="text-base font-semibold text-gray-900 mb-1"
                style={{ color: headingColor }}
              >
                Skills
              </h2>
              <Separator className="my-1 h-[1px] bg-gray-300" />
              <div className="mt-2">
                {skillData.map((skill, index) => (
                  <div key={index} className="text-xs text-gray-700 mb-1">
                    • {skill.skillName}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Right Section - Flexible width */}
        <div className="w-2/3 p-6 flex flex-col">
          {sectionVisibility.summary && summaryData.length > 0 && (
            <div className="mb-4">
              <h2
                className="text-base font-semibold text-gray-900 mb-1"
                style={{ color: headingColor }}
              >
                SUMMARY
              </h2>
              <Separator className="my-2 h-[1px] bg-gray-300" />
              <p className="text-xs text-gray-700 leading-relaxed">
                {summaryData.join(' ')}
              </p>
            </div>
          )}

          {sectionVisibility.workExperience &&
            workExperienceData.length > 0 && (
              <div className="mb-5">
                <h2
                  className="text-base font-semibold text-gray-900 mb-1"
                  style={{ color: headingColor }}
                >
                  EXPERIENCE
                </h2>
                <Separator className="my-1 h-[1px] bg-gray-300 mb-3" />
                {workExperienceData.map((exp, index) => (
                  <div key={index} className="mb-4 last:mb-0">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {exp.jobTitle}
                      </h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {exp.startDate} - {exp.endDate}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-gray-700 mb-1">
                      {exp.company}
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            )}

          {sectionVisibility.projects && projectData.length > 0 && (
            <div className="mb-5">
              <h2
                className="text-base font-semibold text-gray-900 mb-1"
                style={{ color: headingColor }}
              >
                PROJECTS
              </h2>
              <Separator className="my-1 h-[1px] bg-gray-300 mb-3" />
              {projectData.map((project, index) => (
                <div key={index} className="mb-3 last:mb-0">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {project.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {project.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {sectionVisibility.education && educationData.length > 0 && (
            <div className="mb-5">
              <h2
                className="text-base font-semibold text-gray-900 mb-1"
                style={{ color: headingColor }}
              >
                EDUCATION
              </h2>
              <Separator className="my-1 h-[1px] bg-gray-300 mb-3" />
              {educationData.map((edu, index) => (
                <div key={index} className="mb-3 last:mb-0">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {edu.degree}
                    </h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {edu.startDate} - {edu.endDate}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700">{edu.school}</p>
                </div>
              ))}
            </div>
          )}

          {sectionVisibility.achievements && achievementData.length > 0 && (
            <div className="mb-5">
              <h2
                className="text-base font-semibold text-gray-900 mb-1"
                style={{ color: headingColor }}
              >
                ACHIEVEMENTS
              </h2>
              <Separator className="my-1 h-[1px] bg-gray-300 mb-3" />
              <div className="space-y-2">
                {achievementData.map((achievement, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-xs text-gray-500 mr-2 mt-0.5">•</span>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      {achievement.achievementName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
