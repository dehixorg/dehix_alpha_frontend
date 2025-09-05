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
import { AchievementInfo } from '../form/resumeform/Achievement.';
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
  onCancel: () => void; // Only keep the close handler
}

export default function ResumeEditor({
  initialResume,
  onCancel,
}: ResumeEditorProps) {
  // State initialization with default values or from initialResume
  const [educationData, setEducationData] = useState(
    initialResume?.education || [
      {
        degree: 'Bachelor of Science in Computer Science',
        school: 'ABC University',
        startDate: '2023-12-31',
        endDate: '2023-12-31',
      },
      {
        degree: 'Master of Science in Software Engineering',
        school: 'XYZ University',
        startDate: '2023-12-31',
        endDate: '2023-12-31',
      },
    ],
  );

  const [workExperienceData, setWorkExperienceData] = useState(
    initialResume?.workExperience || [
      {
        jobTitle: 'Software Developer',
        company: 'TechCorp Solutions',
        startDate: '2023-12-31',
        endDate: '2023-12-31',
        description:
          'Engineered scalable web solutions, optimized system efficiency, and enhanced software reliability.',
      },
      {
        jobTitle: 'Senior Developer',
        company: 'Innovatech',
        startDate: '2023-12-31',
        endDate: '2023-12-31',
        description:
          'Spearheaded the development of cloud-based enterprise platforms, driving innovation and operational excellence.',
      },
    ],
  );

  const [personalData, setPersonalData] = useState([
    {
      firstName: initialResume?.personalInfo?.firstName || 'John',
      lastName: initialResume?.personalInfo?.lastName || 'Doe',
      city: initialResume?.personalInfo?.city || 'New York',
      country: initialResume?.personalInfo?.country || 'USA',
      phoneNumber: initialResume?.personalInfo?.phone || '123-456-7890',
      email: initialResume?.personalInfo?.email || '123.doe@example.com',
      github: initialResume?.personalInfo?.github || 'github.com/john',
      linkedin: initialResume?.personalInfo?.linkedin || 'linkedin.com/in/john',
    },
  ]);

  const [projectData] = useState(
    initialResume?.projects || [
      {
        title: 'AI-Powered Resume Builder',
        description:
          "Developed a full-stack platform integrating OpenAI's GPT-4 to dynamically generate personalized resume content. Implemented secure authentication and cloud data management using Firebase.",
      },
      {
        title: 'E-Commerce Platform with Real-Time Analytics',
        description:
          'Built a scalable e-commerce platform using Next.js and PostgreSQL. Implemented real-time analytics dashboards with Socket.IO and Chart.js to track user behavior and sales trends. Deployed the application on AWS.',
      },
      {
        title: 'IoT-Based Smart Home Automation System',
        description:
          'Designed and implemented an IoT solution for smart home automation using Raspberry Pi, Python, and MQTT protocol. Developed a mobile app with Flutter for remote control and monitoring of home devices.',
      },
    ],
  );

  const [skillData, setSkillData] = useState(
    initialResume?.skills?.map((skill) => ({ skillName: skill })) || [
      {
        skillName:
          'Database Engineering (SQL Server, T-SQL), Data Visualization (Kibana, Eclipse Birt), ETL Pipelines',
      },
      {
        skillName:
          'Strategic Communication & Cross-Functional Team Collaboration',
      },
      { skillName: 'Advanced SQL Query Optimization & Performance Tuning' },
      { skillName: 'Full-Stack Web Development' },
      { skillName: 'Agile Software Development & DevOps Integration' },
    ],
  );

  const [achievementData, setAchievementData] = useState(
    initialResume?.achievements?.map((ach) => ({
      achievementName: ach.achievementDescription,
    })) || [
      {
        achievementName:
          'Published Research on AI-Powered Automation in a Peer-Reviewed Journal',
      },
      {
        achievementName:
          'Delivered Keynote Speech on Emerging Tech Trends at a Global Conference',
      },
    ],
  );

  const [summaryData, setSummaryData] = useState(
    initialResume?.professionalSummary
      ? [initialResume.professionalSummary]
      : [
          'Results-driven software engineer with a passion for building scalable, high-performance applications while ensuring security, efficiency, and a seamless user experience.',
        ],
  );

  const [selectedTemplate, setSelectedTemplate] = useState(
    initialResume?.selectedTemplate || 'ResumePreview2',
  );

  const [selectedColor] = useState(initialResume?.selectedColor || '#000000');

  const [currentStep, setCurrentStep] = useState(0);
  const [showAtsScore, setShowAtsScore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const user = useSelector((state: RootState) => state.user);
  const resumeRef = useRef<HTMLDivElement>(null);

  // Add optimization for PDF content
  const optimizePdfContent = () => {
    if (resumeRef.current) {
      const content = resumeRef.current.querySelector('.resumeContent');
      if (content) {
        // Apply print-specific styles
        content.classList.add('pdf-optimized');
      }
    }
  };

  // Ensure optimizations are applied before PDF generation
  useEffect(() => {
    // Add a global print stylesheet for PDF generation
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
      workExperienceData={[]}
    />,
  ];

  const handleSubmitResume = async () => {
    setIsSubmitting(true);
    try {
      const formatDateForBackend = (dateString: string) => {
        if (!dateString) return '';
        // Convert from "YYYY-MM-DD" to ISO format if needed
        return new Date(dateString).toISOString().split('T')[0]; // Returns "YYYY-MM-DD"
        // OR if backend expects full ISO string:
        // return new Date(dateString).toISOString();
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

  const downloadPDF = async () => {
    if (!resumeRef.current) return;
    setIsGeneratingPDF(true);

    // Apply optimization before PDF generation
    optimizePdfContent();

    try {
      // Get the resume content element
      const element = resumeRef.current.querySelector(
        '.resumeContent',
      ) as HTMLElement;

      // Apply better PDF generation settings
      const canvas = await html2canvas(element, {
        scale: 3, // Higher scale for better quality
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
          // Ensure styles are properly applied in the cloned document
          const clonedElement = clonedDoc.querySelector('.resumeContent');
          if (clonedElement) {
            // Force all elements to render with correct styles and layout
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

      // Create PDF with better quality settings
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
        precision: 16,
      });

      const imgData = canvas.toDataURL('image/png', 1.0); // Use maximum quality
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate the aspect ratio to maintain proportions
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

      const imgPdfWidth = imgWidth * ratio;
      const imgPdfHeight = imgHeight * ratio;

      // Center the image on the page
      const xOffset = (pdfWidth - imgPdfWidth) / 2;
      const yOffset = 0;

      // Add image to the PDF with better positioning
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

      // Handle multiple pages if content is too long
      if (imgPdfHeight > pdfHeight) {
        let heightLeft = imgPdfHeight;
        let position = -pdfHeight; // Start position for the second page

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
      // Instead of deleting, update the status to 'inactive'
      await axiosInstance.put(`/resume/${initialResume._id}`, {
        status: 'inactive',
      });
      toast({
        title: 'Success',
        description: 'Resume deleted successfully!',
      });
      setShowDeleteDialog(false);
      // Navigate back to resumes list
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

  const openDeleteDialog = () => {
    setShowDeleteDialog(true);
  };

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
          {/* Form Section */}
          <div className="p-6 relative">
            <div className="flex justify-between items-center mb-6">
              <div>
                <Button onClick={onCancel}>← Back to Resumes</Button>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setShowAtsScore(!showAtsScore)}>
                  {showAtsScore ? 'Back to Editor' : 'Check ATS Score'}
                </Button>
              </div>
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
                    className="mt-2"
                    onClick={() =>
                      setCurrentStep((prev) => Math.max(prev - 1, 0))
                    }
                    disabled={currentStep === 0}
                  >
                    <ChevronLeft className="mr-2" />
                  </Button>

                  <Button
                    variant="outline"
                    className="mt-2"
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

          {/* Preview Section */}
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
                  maxWidth: '794px', // A4 width in pixels at 96 DPI
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

      {/* Delete Confirmation Dialog - Inline Implementation */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 py-4">
              <AlertTriangle className="h-5 w-5" />
              Delete Resume
            </DialogTitle>
            <DialogDescription className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete the resume for `
              {personalData[0]?.firstName} {personalData[0]?.lastName}`?
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
