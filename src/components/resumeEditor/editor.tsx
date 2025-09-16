'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2,
  AlertTriangle,
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
import { toast } from '../ui/use-toast';

import { ResumePreview1 } from './ResumePreview1';
import { ResumePreview2 } from './ResumePreview2';
import { AtsScore } from './atsScore';

import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/settingsMenuItems';
import { RootState } from '@/lib/store';
import Header from '@/components/header/header';
import SidebarMenu from '@/components/menu/sidebarMenu';
import { axiosInstance } from '@/lib/axiosinstance';
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
  skills?: string[];
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

  // Saved resume from backend
  const [savedResume, setSavedResume] = useState<ResumeData | null>(null);

  useEffect(() => {
    const fetchResume = async () => {
      if (!user.uid) return;
      try {
        const response = await axiosInstance.get(`/resume/user/${user.uid}`);
        if (response.data && response.data.resume) {
          setSavedResume(response.data.resume);
        }
      } catch (error) {
        console.error('Error fetching saved resume:', error);
      }
    };
    fetchResume();
  }, [user.uid]);

  // Initialize all states empty
  const [personalData, setPersonalData] = useState<any[]>([]);
  const [workExperienceData, setWorkExperienceData] = useState<any[]>([]);
  const [educationData, setEducationData] = useState<any[]>([]);
  const [skillData, setSkillData] = useState<any[]>([]);
  const [achievementData, setAchievementData] = useState<any[]>([]);
  const [projectData, setProjectData] = useState<any[]>([]);
  const [summaryData, setSummaryData] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('ResumePreview2');
  const [selectedColor] = useState('#000000');

  const [currentStep, setCurrentStep] = useState(0);
  const [showAtsScore, setShowAtsScore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Populate data from savedResume or initialResume
  useEffect(() => {
    const resume = savedResume || initialResume;
    if (resume) {
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
      setSkillData(resume.skills?.map((skill) => ({ skillName: skill })) || []);
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
    }
  }, [savedResume, initialResume]);

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
      onAddSkill={(e) => {
        e.preventDefault();
        setSkillData([...skillData, { skillName: '' }]);
      }}
      onRemoveSkill={(e, index) => {
        e.preventDefault();
        setSkillData(skillData.filter((_, i) => i !== index));
      }}
      onSkillChange={(e, index) => {
        const newSkills = [...skillData];
        newSkills[index].skillName = e.target.value;
        setSkillData(newSkills);
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
        skills: skillData.map((skill) => skill.skillName).filter(Boolean),
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
        toast({
          title: 'Success',
          description: 'Resume updated successfully!',
        });
      } else {
        await axiosInstance.post('/resume', resumeData);
        toast({
          title: 'Success',
          description: 'Resume created successfully!',
        });
      }
    } catch (error) {
      console.error('Error saving resume:', error);
      toast({
        title: 'Error',
        description: 'Failed to save resume',
        variant: 'destructive',
      });
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
      toast({
        title: 'Success',
        description: 'Resume PDF generated successfully!',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Delete resume
  const handleDeleteResume = async () => {
    if (!initialResume?._id) {
      toast({
        title: 'Error',
        description: 'No resume to delete',
        variant: 'destructive',
      });
      return;
    }
    setIsDeleting(true);
    try {
      await axiosInstance.put(`/resume/${initialResume._id}`, {
        status: 'inactive',
      });
      toast({ title: 'Success', description: 'Resume deleted successfully!' });
      setShowDeleteDialog(false);
      onCancel();
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete resume',
        variant: 'destructive',
      });
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = () => setShowDeleteDialog(true);

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Resume Editor"
      />
      <div className="flex flex-1 flex-col sm:gap-8 sm:py-0 sm:pl-14">
        <Header
          activeMenu="Resume Editor"
          breadcrumbItems={[
            { label: 'Settings', link: '#' },
            { label: 'Resume Building', link: '#' },
            { label: 'Resume Editor', link: '#' },
          ]}
          menuItemsTop={[]}
          menuItemsBottom={[]}
        />

        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-6 lg:grid lg:grid-cols-2">
          <div className="p-6 relative">
            <div className="flex justify-between items-center mb-6">
              <Button onClick={onCancel}>← Back to Resumes</Button>
              <Button onClick={() => setShowAtsScore(!showAtsScore)}>
                {showAtsScore ? 'Back to Editor' : 'Check ATS Score'}
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
                <div className="flex justify-between mb-4">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentStep((prev) => Math.max(prev - 1, 0))
                    }
                    disabled={currentStep === 0}
                  >
                    <ChevronLeft className="mr-2" />
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
                    <ChevronRight className="ml-2" />
                  </Button>
                </div>

                {steps[currentStep]}

                <div className="mt-6 flex justify-end gap-3">
                  {initialResume?._id && (
                    <Button
                      onClick={openDeleteDialog}
                      disabled={isDeleting || isSubmitting}
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Resume
                    </Button>
                  )}
                  <Button
                    onClick={handleSubmitResume}
                    disabled={isSubmitting || isDeleting}
                    className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Resume'}
                  </Button>
                </div>
              </>
            )}
          </div>

          <div className="relative p-6">
            <div
              ref={resumeRef}
              className="relative mt-10"
              style={{ minHeight: '1100px' }}
            >
              <div className="absolute -top-8 right-6 z-10 flex gap-2 bg-white p-2 rounded shadow-md">
                <Button
                  size="sm"
                  variant={
                    selectedTemplate === 'ResumePreview1'
                      ? 'default'
                      : 'outline'
                  }
                  onClick={() => setSelectedTemplate('ResumePreview1')}
                >
                  Template 1
                </Button>
                <Button
                  size="sm"
                  variant={
                    selectedTemplate === 'ResumePreview2'
                      ? 'default'
                      : 'outline'
                  }
                  onClick={() => setSelectedTemplate('ResumePreview2')}
                >
                  Template 2
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadPDF}
                  disabled={isGeneratingPDF}
                >
                  <Download className="mr-2 h-4 w-4" /> PDF
                </Button>
              </div>

              <div
                className="resumeContent pt-4"
                style={{
                  backgroundColor: 'white',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden',
                  width: '100%',
                  maxWidth: '794px',
                  margin: '0 auto',
                }}
              >
                {selectedTemplate === 'ResumePreview1' ? (
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
                ) : (
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
                )}
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
