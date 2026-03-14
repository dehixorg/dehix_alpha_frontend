import React, { useRef } from 'react';

// import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const toHref = (value: string): string => {
  if (!value) return '#';
  const v = value.trim();
  if (/^mailto:/i.test(v) || /^https?:\/\//i.test(v) || /^tel:/i.test(v))
    return v;
  if (/^[\w.+-]+@[\w-]+\.[a-z]{2,}$/i.test(v)) return `mailto:${v}`;
  if (/^\+?[\d\s\-().]{7,}$/.test(v)) return `tel:${v.replace(/\s/g, '')}`;
  if (/github\.com|linkedin\.com/i.test(v))
    return v.startsWith('http') ? v : `https://${v}`;
  return v.startsWith('http') ? v : `https://${v}`;
};

const ResumeLink: React.FC<{ value: string; label?: string }> = ({
  value,
  label,
}) => {
  if (!value) return null;
  const href = toHref(value);
  const isLocal = href.startsWith('mailto:') || href.startsWith('tel:');
  return (
    <a
      href={href}
      {...(!isLocal && { target: '_blank', rel: 'noopener noreferrer' })}
      className="hover:underline hover:text-blue-600 transition-colors duration-150 cursor-pointer"
      style={{ color: 'inherit' }}
    >
      {label || value}
    </a>
  );
};
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
      jobTitle: 'English Teacher',
      company: 'TechCorp Solutions',
      startDate: '2019',
      endDate: '2021',
      description:
        'Developed scalable web applications and optimized system performance.',
    },
    {
      jobTitle: 'SQL Developer',
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    if (/^\d{4}$/.test(dateString.trim())) return dateString.trim();
    const parts = dateString.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const d = parts
      ? new Date(Date.UTC(+parts[1], +parts[2] - 1, +parts[3]))
      : new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    });
  };

  return (
    <div className="flex justify-center w-full">
      <div
        ref={containerRef}
        className="bg-white w-full max-w-[794px] flex flex-row text-slate-900"
        style={{
          width: '210mm',
          minHeight: '297mm',
          boxSizing: 'border-box',
        }}
      >
        {/* Left Section - Fixed width */}
        <div className="w-1/3 bg-slate-50 border-r border-slate-200 p-8 flex flex-col">
          {sectionVisibility.personal &&
            personalData.map((person, index) => (
              <div key={index} className="mb-6">
                <h1
                  className="text-3xl font-bold uppercase tracking-wide text-slate-900 mb-2 leading-tight w-full break-words"
                  style={{ color: headingColor }}
                >
                  {`${person.firstName} ${person.lastName}`}
                </h1>
                <div className="mt-4">
                  <h2
                    className="text-xs font-bold uppercase tracking-widest text-slate-800 mb-1"
                    style={{ color: headingColor }}
                  >
                    Contact
                  </h2>
                  <Separator className="my-2 h-[1px] bg-slate-200" />
                  <div className="space-y-2 mt-3 text-sm font-medium text-slate-600">
                    {person.email && <div className="break-all"><ResumeLink value={person.email} /></div>}
                    {person.phoneNumber && <div>{person.phoneNumber}</div>}
                    {(person.city || person.country) && (
                      <div>
                        {[person.city, person.country]
                          .filter(Boolean)
                          .join(', ')}
                      </div>
                    )}
                    {person.linkedin && <div><ResumeLink value={person.linkedin} label="LinkedIn" /></div>}
                    {person.github && <div><ResumeLink value={person.github} label="GitHub" /></div>}
                  </div>
                </div>
              </div>
            ))}
          {sectionVisibility.skills && skillData.length > 0 && (
            <div className="mt-6">
              <h2
                className="text-xs font-bold uppercase tracking-widest text-slate-800 mb-1"
                style={{ color: headingColor }}
              >
                Skills
              </h2>
              <Separator className="my-2 h-[1px] bg-slate-200" />
              <div className="mt-3 flex flex-col gap-1.5">
                {skillData.map((skill, index) => (
                  <div key={index} className="text-sm font-medium text-slate-700">
                    {skill.skillName}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Right Section - Flexible width */}
        <div className="w-2/3 p-8 pl-10 flex flex-col gap-6">
          {sectionVisibility.summary && summaryData.length > 0 && (
            <section>
              <h2
                className="text-sm font-bold uppercase tracking-widest text-slate-800 mb-2 border-b-2 border-slate-100 pb-1"
                style={{ borderColor: headingColor, color: headingColor }}
              >
                SUMMARY
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed text-justify">
                {summaryData.join(' ')}
              </p>
             </section>
          )}

          {sectionVisibility.workExperience &&
            workExperienceData.length > 0 && (
              <section>
                <h2
                  className="text-sm font-bold uppercase tracking-widest text-slate-800 mb-3 border-b-2 border-slate-100 pb-1"
                  style={{ borderColor: headingColor, color: headingColor }}
                >
                  EXPERIENCE
                </h2>
                <div className="flex flex-col gap-4">
                  {workExperienceData.map((exp, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h3 className="text-sm font-bold text-slate-900">
                          {exp.jobTitle}
                        </h3>
                        <span className="text-xs font-semibold text-slate-500 whitespace-nowrap ml-2">
                          {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-700 italic mb-1.5">
                        {exp.company}
                      </p>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {exp.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

          {sectionVisibility.projects && projectData.length > 0 && (
            <section>
              <h2
                className="text-sm font-bold uppercase tracking-widest text-slate-800 mb-3 border-b-2 border-slate-100 pb-1"
                style={{ borderColor: headingColor, color: headingColor }}
              >
                PROJECTS
              </h2>
              <div className="flex flex-col gap-4">
                {projectData.map((project, index) => (
                  <div key={index}>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">
                      {project.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {sectionVisibility.education && educationData.length > 0 && (
            <section>
              <h2
                className="text-sm font-bold uppercase tracking-widest text-slate-800 mb-3 border-b-2 border-slate-100 pb-1"
                style={{ borderColor: headingColor, color: headingColor }}
              >
                EDUCATION
              </h2>
              <div className="flex flex-col gap-3">
                {educationData.map((edu, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="text-sm font-bold text-slate-900">
                        {edu.degree}
                      </h3>
                      <span className="text-xs font-semibold text-slate-500 whitespace-nowrap ml-2">
                        {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">{edu.school}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {sectionVisibility.achievements && achievementData.length > 0 && (
            <section>
              <h2
                className="text-sm font-bold uppercase tracking-widest text-slate-800 mb-3 border-b-2 border-slate-100 pb-1"
                style={{ borderColor: headingColor, color: headingColor }}
              >
                ACHIEVEMENTS
              </h2>
              <div className="flex flex-col gap-2">
                {achievementData.map((achievement, index) => (
                  <div key={index} className="flex flex-row items-start">
                    <span className="text-slate-400 mr-2">•</span>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {achievement.achievementName}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
