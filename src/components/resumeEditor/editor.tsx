'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2,
  AlertTriangle,
  Gauge,
  Pencil,
  Loader2,
  Save,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useSelector } from 'react-redux';

import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { PersonalInfo } from '../form/resumeform/PersonalInfo';
import { EducationInfo } from '../form/resumeform/EducationInfo';
import { SkillInfo } from '../form/resumeform/SkillInfo';
import { WorkExperienceInfo } from '../form/resumeform/WorkExperienceInfo';
import { SummaryInfo } from '../form/resumeform/SummaryInfo';
import { AchievementInfo } from '../form/resumeform/Achievement';
import { ProjectInfo } from '../form/resumeform/ProjectInfo';

import { ResumePreview1 } from './ResumePreview1';
import { ResumePreview2 } from './ResumePreview2';
import { AtsScore } from './atsScore';

import { notifyError, notifySuccess } from '@/utils/toastMessage';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/settingsMenuItems';
import { RootState } from '@/lib/store';
import Header from '@/components/header/header';
import SidebarMenu from '@/components/menu/sidebarMenu';
import { axiosInstance } from '@/lib/axiosinstance';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
interface SkillBase {
  _id: string;
  name?: string;
  label: string;
  description?: string;
  createdBy?: string;
  createdById?: string;
  createdAt?: string;
  status?: string;
}

interface SkillOption extends SkillBase {
  // Additional properties specific to SkillOption if needed
}

interface Skill extends SkillBase {
  skillName: string; // For backward compatibility
  [key: string]: any; // Allow additional properties
}

interface ResumeData {
  _id?: string;
  personalInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    country: string;
    linkedin: string;
    github: string;
  };
  workExperience?: Array<{
    jobTitle: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education?: Array<{
    degree: string;
    school: string;
    startDate: string;
    endDate: string;
  }>;
  skills?: Array<string | Skill>;
  achievements?: Array<{
    achievementDescription: string;
  }>;
  projects?: Array<{
    title: string;
    description: string;
  }>;
  professionalSummary?: string;
  selectedTemplate?: string;
  selectedColor?: string;
}

interface ResumeEditorProps {
  initialResume?: ResumeData;
  onCancel: () => void;
}

export default function ResumeEditor({
  initialResume,
  onCancel,
}: ResumeEditorProps) {
  const user = useSelector((state: RootState) => state.user);
  const resumeRef = useRef<HTMLDivElement>(null);

  // Initialize all states with default values for a new resume
  const [personalData, setPersonalData] = useState<any[]>([
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phoneNumber: '123-456-7890',
      city: 'New York',
      country: 'USA',
      github: 'github.com/john',
      linkedin: 'linkedin.com/in/john',
    },
  ]);

  const [workExperienceData, setWorkExperienceData] = useState<any[]>([
    {
      jobTitle: 'Software Engineer',
      company: 'ABC Corp',
      startDate: '2020-01-01',
      endDate: '2023-01-01',
      description: 'Worked on web applications.',
    },
  ]);

  const [educationData, setEducationData] = useState<any[]>([
    {
      degree: 'B.Sc. Computer Science',
      school: 'XYZ University',
      startDate: '2016-01-01',
      endDate: '2020-01-01',
    },
  ]);

  interface Skill {
    skillName: string;
    _id?: string;
    name?: string;
  }
  const [skillData, setSkillData] = useState<Skill[]>([]);
  const [skillOptions, setSkillOptions] = useState<Array<{_id?: string; name: string}>>([]);
  const [achievementData, setAchievementData] = useState<any[]>([
    { achievementName: 'Won Hackathon 2022' },
  ]);
  const [projectData, setProjectData] = useState<any[]>([
    {
      title: 'Portfolio Website',
      description: 'Built a personal portfolio website.',
    },
  ]);
  const [summaryData, setSummaryData] = useState<string[]>([
    'Motivated software engineer with experience in web development.',
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState('ResumePreview2');
  const [selectedColor] = useState('#000000');

  const [currentStep, setCurrentStep] = useState(0);
  const [showAtsScore, setShowAtsScore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch skills for the skill picker
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await axiosInstance.get('/skills');
        setSkillOptions(res?.data?.data || []);
      } catch (e) {
        console.error('Failed to fetch skills:', e);
        setSkillOptions([]);
      }
    };
    fetchSkills();
  }, []);

  // Populate data from savedResume or initialResume
  useEffect(() => {
    const loadResumeData = async () => {
      const resume = initialResume;
      if (!resume) return;
      
      try {
      setPersonalData([
        {
          firstName: resume.personalInfo?.firstName || 'John',
          lastName: resume.personalInfo?.lastName || 'Doe',
          email: resume.personalInfo?.email || '123.doe@example.com',
          phoneNumber: resume.personalInfo?.phone || '123-456-7890',
          city: resume.personalInfo?.city || 'New York',
          country: resume.personalInfo?.country || 'USA',
          github: resume.personalInfo?.github || 'github.com/john',
          linkedin: resume.personalInfo?.linkedin || 'linkedin.com/in/john',
        },
      ]);

      setWorkExperienceData(resume.workExperience || []);
      setEducationData(resume.education || []);
      // First, wait for skills to be loaded
      await new Promise(resolve => {
        if (skillOptions.length > 0) resolve(true);
        const interval = setInterval(() => {
          if (skillOptions.length > 0) {
            clearInterval(interval);
            resolve(true);
          }
        }, 100);
      });

      // First, create a map of all available skills for quick lookup
      const skillMap = new Map<string, Skill>();
      (skillOptions as SkillOption[]).forEach(skill => {
        if (skill._id) {
          skillMap.set(skill._id, {
            ...skill,
            name: skill.label, // Use label as name for display
            skillName: skill.label // For backward compatibility
          });
        }
      });

      // First, get all skill IDs that are strings (not already mapped)
      const skillIds = (resume.skills || []).filter(s => typeof s === 'string');
      
      // If we have skill IDs to look up, fetch them in a batch
      if (skillIds.length > 0) {
        try {
          // Fetch all skills in one request
          const response = await axiosInstance.get('/skills', {
            params: { ids: skillIds.join(',') }
          });
          
          // Update the skill map with the fetched skills
          (response.data?.data || []).forEach((skill: SkillOption) => {
            if (skill?._id) {
              const skillData: Skill = {
                ...skill,
                name: skill.label, // Use label as the name since that's what's displayed
                skillName: skill.label, // For backward compatibility
              };
              skillMap.set(skill._id, skillData);
            }
          });
        } catch (error) {
          console.error('Failed to fetch skills:', error);
        }
      }
      
      // Map all skills, using the skill map for lookups
      const mappedSkills = (resume.skills || []).map(skill => {
        // If it's a string, it's an ID
        if (typeof skill === 'string') {
          return skillMap.get(skill) || {
            _id: skill,
            name: skill,
            skillName: skill,
            label: skill
          };
        }
        
        // If it's an object with an ID, try to enhance it with data from the map
        if (skill?._id) {
          const mappedSkill = skillMap.get(skill._id);
          if (mappedSkill) {
            return {
              ...mappedSkill,
              ...skill // Allow any provided fields to override
            };
          }
        }
        
        // If it's an object without an ID, use it as-is but ensure required fields
        if (typeof skill === 'object') {
          const { _id, name, skillName, label, ...rest } = skill;
          return {
            _id: _id || '',
            name: label || name || '',
            skillName: label || skillName || name || '',
            label: label || name || '',
            ...rest
          };
        }
        
        return null;
      }).filter((s): s is Skill => s !== null); // Remove null entries and ensure type
        setSkillData(mappedSkills);
        setAchievementData(
          resume.achievements?.map((ach) => ({
            achievementName: ach.achievementDescription,
          })) || [],
        );
        setProjectData(resume.projects || []);
        setSummaryData(
          resume.professionalSummary ? [resume.professionalSummary] : [],
        );
        setSelectedTemplate(resume.selectedTemplate || 'ResumePreview2');
      } catch (error) {
        console.error('Error loading resume data:', error);
      }
    };
    
    loadResumeData();
  }, [initialResume, skillOptions]);

  // PDF Optimization
  const optimizePdfContent = () => {
    if (resumeRef.current) {
      const content = resumeRef.current.querySelector('.resumeContent');
      if (content) {
        content.classList.add('pdf-optimized');
      }
    }
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        .pdf-optimized {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .pdf-optimized * {
          font-family: 'Arial', sans-serif !important;
        }
        .pdf-optimized h1, .pdf-optimized h2 {
          margin-bottom: 8px !important;
        }
        .pdf-optimized p {
          margin-bottom: 4px !important;
          line-height: 1.4 !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Steps array
  const steps = [
    <PersonalInfo
      key="personal"
      personalData={personalData}
      setPersonalData={setPersonalData}
    />,
    <WorkExperienceInfo
      key="workexperience"
      workExperienceData={workExperienceData}
      setWorkExperienceData={setWorkExperienceData}
    />,
    <EducationInfo
      key="education"
      educationData={educationData}
      setEducationData={setEducationData}
    />,
    <SkillInfo
      key="skill"
      skillData={skillData}
      onAddSkill={(skillStr) => {
        try {
          // Try to parse the skill if it's a JSON string
          const skill = typeof skillStr === 'string' && skillStr.startsWith('{')
            ? JSON.parse(skillStr)
            : { skillName: skillStr };

          setSkillData((prev) => {
            // Check if skill already exists
            const exists = prev.some(s => 
              s._id === skill._id || 
              s.skillName === skill.skillName || 
              s.name === skill.name
            );
            
            if (exists) return prev;
            
            const newSkill = {
              skillName: skill.name || skill.skillName || skillStr,
              name: skill.name || skill.skillName || skillStr,
              label: skill.label || skill.name || skill.skillName || skillStr,
              ...(skill._id && { _id: skill._id })
            };
            
            return [...prev, newSkill];
          });
        } catch (error) {
          console.error('Error adding skill:', error);
        }
      }}
      onRemoveSkill={(skillId) => {
        setSkillData((prev) => {
          const idx = prev.findIndex((s) => 
            s._id === skillId || 
            s.skillName === skillId || 
            s.name === skillId
          );
          if (idx === -1) return prev;
          return prev.filter((_, i) => i !== idx);
        });
      }}
    />,
    <AchievementInfo
      key="achievement"
      achievementData={achievementData}
      setAchievementData={setAchievementData}
    />,
    <SummaryInfo
      key="summary"
      summaryData={summaryData}
      setSummaryData={setSummaryData}
      workExperienceData={workExperienceData}
    />,
    <ProjectInfo
      key="projects"
      projectData={projectData}
      setProjectData={setProjectData}
    />,
  ];

  const stepLabels = [
    'Personal',
    'Work',
    'Education',
    'Skills',
    'Achievements',
    'Summary',
    'Projects',
  ];

  // Handle Submit
  const handleSubmitResume = async () => {
    setIsSubmitting(true);
    try {
      const formatDateForBackend = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
      };
      const resumeData = {
        userId: user.uid,
        personalInfo: {
          firstName: personalData[0]?.firstName || '',
          lastName: personalData[0]?.lastName || '',
          email: personalData[0]?.email || '',
          phone: personalData[0]?.phoneNumber || '',
          city: personalData[0]?.city || '',
          country: personalData[0]?.country || '',
          linkedin: personalData[0]?.linkedin || '',
          github: personalData[0]?.github || '',
        },
        workExperience: workExperienceData.map((exp) => ({
          jobTitle: exp.jobTitle || '',
          company: exp.company || '',
          startDate: formatDateForBackend(exp.startDate),
          endDate: formatDateForBackend(exp.endDate),
          description: exp.description || '',
        })),
        education: educationData.map((edu) => ({
          degree: edu.degree || '',
          school: edu.school || '',
          startDate: formatDateForBackend(edu.startDate),
          endDate: formatDateForBackend(edu.endDate),
        })),
        // Send skill IDs as strings to match backend schema
        skills: skillData
          .filter(s => s && s._id) // Only include skills with valid IDs
          .map(s => s._id), // Map to just the ID string
        achievements: achievementData.map((ach) => ({
          achievementDescription: ach.achievementName || '',
        })),
        projects: projectData.map((proj) => ({
          title: proj.title || '',
          description: proj.description || '',
        })),
        professionalSummary: summaryData.join(' '),
        selectedTemplate,
        selectedColor,
        status: 'active',
      };

      if (initialResume?._id) {
        await axiosInstance.put(`/resume/${initialResume._id}`, resumeData);
        notifySuccess('Resume updated successfully!', 'Success');
      } else {
        await axiosInstance.post('/resume', resumeData);
        notifySuccess('Resume created successfully!', 'Success');
      }
    } catch (error) {
      console.error('Error saving resume:', error);
      notifyError('Failed to save resume', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Download PDF
  const downloadPDF = async () => {
    if (!resumeRef.current) return;
    setIsGeneratingPDF(true);
    optimizePdfContent();
    try {
      const element = resumeRef.current.querySelector(
        '.resumeContent',
      ) as HTMLElement;
      const canvas = await html2canvas(element, {
        scale: 3,
        backgroundColor: '#FFFFFF',
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: element.offsetWidth,
        height: element.offsetHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: document.documentElement.offsetWidth,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('.resumeContent');
          if (clonedElement) {
            Array.from(clonedElement.querySelectorAll('*')).forEach((el) => {
              if (el instanceof HTMLElement) {
                el.style.margin = window.getComputedStyle(el).margin;
                el.style.padding = window.getComputedStyle(el).padding;
                el.style.fontSize = window.getComputedStyle(el).fontSize;
                el.style.fontFamily = window.getComputedStyle(el).fontFamily;
                el.style.lineHeight = window.getComputedStyle(el).lineHeight;
                el.style.color = window.getComputedStyle(el).color;
                el.style.backgroundColor =
                  window.getComputedStyle(el).backgroundColor;
                el.style.border = window.getComputedStyle(el).border;
              }
            });
          }
        },
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
        precision: 16,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgPdfWidth = imgWidth * ratio;
      const imgPdfHeight = imgHeight * ratio;
      const xOffset = (pdfWidth - imgPdfWidth) / 2;
      const yOffset = 0;

      pdf.addImage(
        imgData,
        'PNG',
        xOffset,
        yOffset,
        imgPdfWidth,
        imgPdfHeight,
        undefined,
        'FAST',
      );

      if (imgPdfHeight > pdfHeight) {
        let heightLeft = imgPdfHeight;
        let position = -pdfHeight;
        while (heightLeft > pdfHeight) {
          position = position - pdfHeight;
          heightLeft = heightLeft - pdfHeight;
          pdf.addPage();
          pdf.addImage(
            imgData,
            'PNG',
            xOffset,
            position,
            imgPdfWidth,
            imgPdfHeight,
            undefined,
            'FAST',
          );
        }
      }

      pdf.save(
        `Resume-${personalData[0]?.firstName || ''}-${personalData[0]?.lastName || ''}-${new Date().toISOString().slice(0, 10)}.pdf`,
      );
      notifySuccess('Resume PDF generated successfully!', 'Success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      notifyError('Failed to generate PDF. Please try again.', 'Error');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Delete resume
  const handleDeleteResume = async () => {
    if (!initialResume?._id) {
      notifyError('No resume to delete', 'Error');
      return;
    }
    setIsDeleting(true);
    try {
      await axiosInstance.put(`/resume/${initialResume._id}`, {
        status: 'inactive',
      });
      notifySuccess('Resume deleted successfully!', 'Success');
      setShowDeleteDialog(false);
      onCancel();
    } catch (error) {
      console.error('Error deleting resume:', error);
      notifyError('Failed to delete resume', 'Error');
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = () => setShowDeleteDialog(true);

  return (
    <div className="flex min-h-screen flex-col">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Resume"
      />
      <div className="flex flex-1 flex-col sm:gap-4 sm:py-0 sm:pl-14">
        <Header
          activeMenu="Resume Editor"
          breadcrumbItems={[
            { label: 'Settings', link: '#' },
            { label: 'Resume Editor', link: '#' },
          ]}
          menuItemsTop={[]}
          menuItemsBottom={[]}
        />

        <main className="flex-1 md:gap-6 lg:grid lg:grid-cols-2">
          <div className="px-6 pt-2">
            <div className="flex justify-between items-center mb-6">
              <Button onClick={onCancel} size="sm" variant="outline">
                <ChevronLeft /> Back
              </Button>
              <Button
                onClick={() => setShowAtsScore(!showAtsScore)}
                size="sm"
                variant="secondary"
              >
                {showAtsScore ? <Pencil /> : <Gauge />}
                {showAtsScore ? 'Edit' : 'Check ATS Score'}
              </Button>
            </div>

            {showAtsScore ? (
              <AtsScore
                name={`${personalData[0]?.firstName} ${personalData[0]?.lastName}`}
                resumeText={JSON.stringify({
                  personalData,
                  workExperienceData,
                  educationData,
                  skills: skillData,
                  achievements: achievementData,
                  summaryData,
                })}
                jobKeywords={[]}
              />
            ) : (
              <>
                <div className="mb-4">
                  <div className="flex items-center gap-2 overflow-x-auto px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&_*::-webkit-scrollbar]:hidden">
                    {stepLabels.map((label, i) => {
                      const isActive = i === currentStep;
                      const isDone = i < currentStep;
                      return (
                        <div key={label} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(i)}
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                              isActive
                                ? 'bg-primary text-primary-foreground border-primary'
                                : isDone
                                  ? 'bg-secondary text-secondary-foreground border-secondary'
                                  : 'bg-background text-foreground/80 border-muted'
                            }`}
                            aria-current={isActive ? 'step' : undefined}
                          >
                            <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/10 dark:bg-white/10 text-[10px]">
                              {i + 1}
                            </span>
                            {label}
                          </button>
                          {i !== stepLabels.length - 1 && (
                            <span
                              className={`h-px w-4 sm:w-8 ${isDone ? 'bg-primary' : 'bg-muted'}`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between mb-4">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentStep((prev) => Math.max(prev - 1, 0))
                    }
                    disabled={currentStep === 0}
                  >
                    <ChevronLeft /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentStep((prev) =>
                        Math.min(prev + 1, steps.length - 1),
                      )
                    }
                    disabled={currentStep === steps.length - 1}
                  >
                    Next <ChevronRight />
                  </Button>
                </div>

                {steps[currentStep]}

                <div className="mt-6 sticky bottom-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex justify-end gap-3">
                  {initialResume?._id && (
                    <Button
                      onClick={openDeleteDialog}
                      disabled={isDeleting || isSubmitting}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  )}
                  <Button
                    onClick={handleSubmitResume}
                    disabled={isSubmitting || isDeleting}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 dark:bg-primary/90 dark:hover:bg-primary/80 w-full"
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Save /> Save
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>

          <div className="px-6 md:pl-0 pt-2">
            <div
              ref={resumeRef}
              className="relative"
              style={{ minHeight: '1100px' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Tabs
                  value={selectedTemplate}
                  onValueChange={(v) =>
                    setSelectedTemplate(v as typeof selectedTemplate)
                  }
                >
                  <TabsList>
                    {[
                      { value: 'ResumePreview1', label: 'Template 1' },
                      { value: 'ResumePreview2', label: 'Template 2' },
                    ].map((t) => (
                      <TabsTrigger key={t.value} value={t.value}>
                        {t.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadPDF}
                  disabled={isGeneratingPDF}
                  className="ml-auto"
                >
                  <Download className="mr-2 h-4 w-4" /> PDF
                </Button>
              </div>

              <div
                className="resumeContent pt-4 rounded-md"
                style={{
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden',
                  width: '100%',
                  maxWidth: '794px',
                  margin: '0 auto',
                }}
              >
                {[
                  {
                    value: 'ResumePreview1',
                    render: (
                      <ResumePreview1
                        personalData={personalData}
                        workExperienceData={workExperienceData}
                        educationData={educationData}
                        skillData={skillData}
                        achievementData={achievementData}
                        projectData={projectData}
                        summaryData={summaryData}
                        headingColor={selectedColor}
                      />
                    ),
                  },
                  {
                    value: 'ResumePreview2',
                    render: (
                      <ResumePreview2
                        personalData={personalData}
                        workExperienceData={workExperienceData}
                        educationData={educationData}
                        skillData={skillData}
                        achievementData={achievementData}
                        projectData={projectData}
                        summaryData={summaryData}
                        headingColor={selectedColor}
                      />
                    ),
                  },
                ].find((t) => t.value === selectedTemplate)?.render || null}
              </div>
            </div>
          </div>
        </main>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 py-4">
              <AlertTriangle className="h-5 w-5" /> Delete Resume
            </DialogTitle>
            <DialogDescription className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete the resume for{' '}
              {personalData[0]?.firstName} {personalData[0]?.lastName}?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteResume}
              disabled={isDeleting}
              className="flex-1 bg-white text-black"
            >
              {isDeleting ? (
                'Deleting...'
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
