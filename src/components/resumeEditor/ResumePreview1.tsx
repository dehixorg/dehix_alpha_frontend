import React, { useRef } from 'react';
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';

// import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

// Define SectionVisibility interface
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

export const ResumePreview1: React.FC<ResumePreviewProps> = ({
  educationData = [],
  workExperienceData = [],
  personalData = [],
  projectData = [],
  skillData = [],
  achievementData = [],
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
        className="bg-white w-[900px] p-10 shadow-lg flex flex-col rounded-md border border-gray-300"
        style={{
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          width: '210mm',
          minHeight: '297mm',
          padding: '15mm',
          boxSizing: 'border-box',
        }}
      >
        <div className="w-full text-center mb-2">
          {sectionVisibility.personal &&
            personalData.map((person, index) => (
              <div key={index}>
                <h1
                  className="text-2xl font-bold text-gray-900 mb-1"
                  style={{ color: headingColor }}
                >
                  {`${person.firstName} ${person.lastName}`}
                </h1>
                <p className="text-sm text-gray-800 leading-tight">
                  {person.email} • {person.phoneNumber}
                </p>
                <p className="text-sm text-gray-800 leading-tight">
                  {person.github} • {person.linkedin}
                </p>
              </div>
            ))}
        </div>

        <Separator className="bg-gray-300 my-2" />

        {sectionVisibility.summary && summaryData.length > 0 && (
          <div className="mb-3">
            <h2
              className="text-lg font-semibold text-gray-900 mb-1"
              style={{ color: headingColor }}
            >
              Summary
            </h2>
            <Separator className="mb-2 bg-gray-300" />
            <p className="text-sm text-gray-800 leading-relaxed">
              {summaryData.join(' ')}
            </p>
          </div>
        )}

        {sectionVisibility.workExperience && workExperienceData.length > 0 && (
          <div className="mb-3">
            <h2
              className="text-lg font-semibold text-gray-900 mb-2"
              style={{ color: headingColor }}
            >
              Work Experience
            </h2>
            <Separator className="mb-2 bg-gray-300" />
            {workExperienceData.map((item, index) => (
              <div key={index} className="mb-3">
                <p className="text-sm font-medium text-gray-900">
                  {item.jobTitle} - {item.company}
                </p>
                <p className="text-xs text-gray-700">
                  {item.startDate} to {item.endDate}
                </p>
                <p className="text-sm text-gray-800 leading-relaxed mt-1">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {sectionVisibility.education && educationData.length > 0 && (
          <div className="mb-4">
            <h2
              className="text-lg font-semibold text-gray-900 mb-2"
              style={{ color: headingColor }}
            >
              Education
            </h2>
            <Separator className="mb-2 bg-gray-300" />
            {educationData.map((item, index) => (
              <div key={index} className="mb-3">
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

        {sectionVisibility.projects && projectData.length > 0 && (
          <div className="mb-4">
            <h2
              className="text-lg font-semibold text-gray-900 mb-2"
              style={{ color: headingColor }}
            >
              Projects
            </h2>
            <Separator className="mb-2 bg-gray-300" />
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

        {sectionVisibility.skills && skillData.length > 0 && (
          <div className="mb-4">
            <h2
              className="text-lg font-semibold text-gray-900 mb-2"
              style={{ color: headingColor }}
            >
              Skills
            </h2>
            <Separator className="mb-2 bg-gray-300" />
            <ul className="list-disc list-inside text-sm text-gray-800">
              {skillData.map((skill, index) => (
                <li key={index}>{skill.skillName}</li>
              ))}
            </ul>
          </div>
        )}

        {sectionVisibility.achievements && achievementData.length > 0 && (
          <div className="mb-4">
            <h2
              className="text-lg font-semibold text-gray-900 mb-2"
              style={{ color: headingColor }}
            >
              Achievements
            </h2>
            <Separator className="mb-2 bg-gray-300" />
            <ul className="list-disc list-inside text-sm text-gray-800">
              {achievementData.map((achievement, index) => (
                <li key={index}>{achievement.achievementName}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
