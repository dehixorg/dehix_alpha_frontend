import React, { useRef } from 'react';

import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

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
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex justify-center w-full h-full py-10">
      <div
        ref={containerRef}
        className="bg-white w-[900px] p-6 shadow-lg flex"
        style={{ boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}
      >
        {/* Left Section: Header and Details */}
        <div className="w-1/3 bg-gray-200 dark:bg-gray-200 text-black p-6 flex flex-col">
          {personalData.map((person, index) => (
            <div key={index} className="mb-6">
              <h1
                className="text-3xl font-bold"
                style={{ color: headingColor }}
              >{`${person.firstName} ${person.lastName}`}</h1>

              {summaryData.length > 0 && (
                <div className="mb-6">
                  <h2
                    className="text-xl font-semibold text-blue-800 mt-4"
                    style={{ color: headingColor }}
                  >
                    Profile Summary
                  </h2>
                  <Separator className="mb-2" />
                  <p className="text-sm leading-relaxed">
                    {summaryData.join(' ')}
                  </p>
                </div>
              )}

              <div className="mt-6">
                <h2
                  className="text-xl font-semibold text-blue-800 "
                  style={{ color: headingColor }}
                >
                  Contact Details
                </h2>
                <Separator className="mb-2" />
                <p className="text-sm mt-2">{person.email}</p>
                <p className="text-sm">{person.phoneNumber}</p>
                <p className="text-sm mt-2">{person.linkedin}</p>
                <p className="text-sm">{person.github}</p>
              </div>
            </div>
          ))}
          {/* <Separator className='mb-4'/> */}
          {/* Skills Section */}
          {skillData.length > 0 && (
            <div className="mb-6">
              <h2
                className="text-xl font-semibold text-blue-800 "
                style={{ color: headingColor }}
              >
                Skills
              </h2>
              <Separator className="mb-2" />
              <ul className="list-disc list-inside text-sm">
                {skillData.map((skill, index) => (
                  <li key={index}>{skill.skillName}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Section: Experience and Education */}
        <div className="w-2/3 p-6">
          {/* Work Experience Section */}
          {workExperienceData.length > 0 && (
            <div className="mb-6">
              <h2
                className="text-xl font-semibold text-blue-800 mb-2"
                style={{ color: headingColor }}
              >
                Experience
              </h2>
              <Separator className="mb-2" />
              {workExperienceData.map((item, index) => (
                <div key={index} className="mb-4">
                  <p className="text-sm font-medium text-black">
                    {item.jobTitle} - {item.company}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.startDate} to {item.endDate}
                  </p>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Projects Section */}
          {projectData.length > 0 && (
            <div className="mt-6">
              <h3
                className="text-xl font-semibold text-blue-800  mb-2"
                style={{ color: headingColor }}
              >
                Projects
              </h3>
              <Separator className="mb-2" />
              <div>
                {projectData.map((project, index) => (
                  <div key={index} className="space-y-1 mb-4">
                    <p className="text-sm font-medium text-black ">
                      {project.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {project.description}
                    </p>
                  </div>
                ))}
                {/* Education Section */}
                {educationData.length > 0 && (
                  <div>
                    <h2
                      className="text-xl font-semibold text-blue-800 mb-2"
                      style={{ color: headingColor }}
                    >
                      Education
                    </h2>
                    <Separator className="mb-2" />
                    {educationData.map((item, index) => (
                      <div key={index} className="mb-4">
                        <p className="text-sm font-medium text-black">
                          {item.degree} - {item.school}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.startDate} to {item.endDate}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {achievementData.length > 0 && (
                  <div className="mb-6">
                    <h2
                      className="text-xl font-semibold text-blue-800 "
                      style={{ color: headingColor }}
                    >
                      Achievements
                    </h2>
                    <Separator className="mb-2" />
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {achievementData.map((achievement, index) => (
                        <li key={index}>{achievement.achievementName}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
