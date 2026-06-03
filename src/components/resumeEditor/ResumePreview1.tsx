import React, { useRef } from 'react';
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';

// import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

// Normalises a raw string into an openable href
const toHref = (value: string): string => {
  if (!value) return '#';
  const v = value.trim();
  if (/^mailto:/i.test(v) || /^https?:\/\//i.test(v) || /^tel:/i.test(v))
    return v;
  if (/^[\w.+-]+@[\w-]+\.[a-z]{2,}$/i.test(v)) return `mailto:${v}`;
  if (/^\+?[\d\s\-().]{7,}$/.test(v)) return `tel:${v.replace(/\s/g, '')}`;
  // github / linkedin paths or full URLs
  if (/github\.com|linkedin\.com/i.test(v))
    return v.startsWith('http') ? v : `https://${v}`;
  return v.startsWith('http') ? v : `https://${v}`;
};

const ResumeLink: React.FC<{ value: string; label?: string }> = ({
  value,
  label,
}) => {
  if (!value) return null;
  return (
    <a
      href={toHref(value)}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:underline hover:text-blue-600 transition-colors duration-150 cursor-pointer"
      style={{ color: 'inherit' }}
    >
      {label || value}
    </a>
  );
};

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
    city?: string;
    country?: string;
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex justify-center w-full">
      <div
        ref={containerRef}
        className="bg-white p-10 flex flex-col w-full text-black print-exact"
        style={{
          width: '210mm',
          padding: '10mm 15mm 15mm 15mm',
          boxSizing: 'border-box',
        }}
      >
        <div className="w-full text-center mb-4">
          {sectionVisibility.personal &&
            personalData.map((person, index) => (
              <div key={index}>
                <h1
                  className="text-2xl font-bold text-gray-900 mb-1"
                  style={{ color: headingColor }}
                >
                  {`${person.firstName} ${person.lastName}`}
                </h1>
                <p className="text-sm text-gray-800 leading-tight flex flex-wrap justify-center gap-x-2">
                  {[
                    person.email ? (
                      <ResumeLink key="email" value={person.email} />
                    ) : null,
                    person.phoneNumber ? (
                      <span key="phone">{person.phoneNumber}</span>
                    ) : null,
                    person.city || person.country ? (
                      <span key="location">
                        {[person.city, person.country]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    ) : null,
                  ]
                    .filter(Boolean)
                    .reduce<React.ReactNode[]>((acc, el, i) => {
                      if (i > 0)
                        acc.push(
                          <span key={`sep-${i}`} className="select-none">
                            —
                          </span>,
                        );
                      acc.push(el);
                      return acc;
                    }, [])}
                </p>
                <p className="text-sm text-gray-800 leading-tight flex flex-wrap justify-center gap-x-2">
                  {[
                    person.github ? (
                      <ResumeLink
                        key="github"
                        value={person.github}
                        label="GitHub"
                      />
                    ) : null,
                    person.linkedin ? (
                      <ResumeLink
                        key="linkedin"
                        value={person.linkedin}
                        label="LinkedIn"
                      />
                    ) : null,
                  ]
                    .filter(Boolean)
                    .reduce<React.ReactNode[]>((acc, el, i) => {
                      if (i > 0)
                        acc.push(
                          <span key={`sep-${i}`} className="select-none">
                            —
                          </span>,
                        );
                      acc.push(el);
                      return acc;
                    }, [])}
                </p>
              </div>
            ))}
        </div>

        <Separator className="bg-gray-300 my-2" />

        {sectionVisibility.summary && summaryData.length > 0 && (
          <div className="mb-4">
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
          <div className="mb-4">
            <h2
              className="text-lg font-semibold text-gray-900 mb-2"
              style={{ color: headingColor }}
            >
              Work Experience
            </h2>
            <Separator className="mb-3 bg-gray-300" />
            {workExperienceData.map((item, index) => (
              <div key={index} className="mb-3">
                <p className="text-sm font-medium text-gray-900">
                  {item.jobTitle} - {item.company}
                </p>
                <p className="text-xs text-gray-700">
                  {formatDate(item.startDate)} to {formatDate(item.endDate)}
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
                  {formatDate(item.startDate)} to {formatDate(item.endDate)}
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
            <Separator className="mb-3 bg-gray-300" />
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
            <Separator className="mb-3 bg-gray-300" />
            <ul className="list-disc list-inside text-sm text-gray-800 sm:columns-2 sm:gap-x-6 [&>li]:break-inside-avoid">
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
            <Separator className="mb-3 bg-gray-300" />
            <ul className="list-disc list-inside text-sm text-gray-800 sm:columns-2 sm:gap-x-6 [&>li]:break-inside-avoid">
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
