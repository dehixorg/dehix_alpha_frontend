'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Download, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useSelector } from 'react-redux';

import { Button } from '../ui/button';
import { PersonalInfo } from '../form/resumeform/PersonalInfo';
import { EducationInfo } from '../form/resumeform/EducationInfo';
import { SkillInfo } from '../form/resumeform/SkillInfo';
import { WorkExperienceInfo } from '../form/resumeform/WorkExperienceInfo';
import { SummaryInfo } from '../form/resumeform/SummaryInfo';
import { AchievementInfo } from '../form/resumeform/Achievement.';
import { ResumePreview1 } from './ResumePreview1';
import { ResumePreview2 } from './ResumePreview2';
import { AtsScore } from './atsScore';
import { RootState } from '@/lib/store';
import Header from '@/components/header/header';
import SidebarMenu from '@/components/menu/sidebarMenu';
import { axiosInstance } from '@/lib/axiosinstance';
import { toast } from '../ui/use-toast';

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

export default function ResumeEditor({ initialResume }: { initialResume?: ResumeData }) {
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
  ]
);

const [workExperienceData, setWorkExperienceData] = useState(
  initialResume?.workExperience || [
    {
      jobTitle: 'Software Developer',
      company: 'TechCorp Solutions',
      startDate: '2023-12-31',
      endDate: '2023-12-31',
      description: 'Engineered scalable web solutions, optimized system efficiency, and enhanced software reliability.',
    },
    {
      jobTitle: 'Senior Developer',
      company: 'Innovatech',
      startDate: '2023-12-31',
      endDate: '2023-12-31',
      description: 'Spearheaded the development of cloud-based enterprise platforms, driving innovation and operational excellence.',
    },
  ]
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
  }
]);

const [projectData, setProjectData] = useState(
  initialResume?.projects || [
    {
      title: 'AI-Powered Resume Builder',
      description: "Developed a full-stack platform integrating OpenAI's GPT-4 to dynamically generate personalized resume content. Implemented secure authentication and cloud data management using Firebase.",
    },
    {
      title: 'E-Commerce Platform with Real-Time Analytics',
      description: 'Built a scalable e-commerce platform using Next.js and PostgreSQL. Implemented real-time analytics dashboards with Socket.IO and Chart.js to track user behavior and sales trends. Deployed the application on AWS.',
    },
    {
      title: 'IoT-Based Smart Home Automation System',
      description: 'Designed and implemented an IoT solution for smart home automation using Raspberry Pi, Python, and MQTT protocol. Developed a mobile app with Flutter for remote control and monitoring of home devices.',
    },
  ]
);

const [skillData, setSkillData] = useState(
  initialResume?.skills?.map(skill => ({ skillName: skill })) || [
    {
      skillName: 'Database Engineering (SQL Server, T-SQL), Data Visualization (Kibana, Eclipse Birt), ETL Pipelines',
    },
    {
      skillName: 'Strategic Communication & Cross-Functional Team Collaboration',
    },
    { skillName: 'Advanced SQL Query Optimization & Performance Tuning' },
    { skillName: 'Full-Stack Web Development' },
    { skillName: 'Agile Software Development & DevOps Integration' },
  ]
);

const [achievementData, setAchievementData] = useState(
  initialResume?.achievements?.map(ach => ({
    achievementName: ach.achievementDescription
  })) || [
    {
      achievementName: 'Published Research on AI-Powered Automation in a Peer-Reviewed Journal',
    },
    {
      achievementName: 'Delivered Keynote Speech on Emerging Tech Trends at a Global Conference',
    },
  ]
);

const [summaryData, setSummaryData] = useState(
  initialResume?.professionalSummary 
    ? [initialResume.professionalSummary] 
    : ['Results-driven software engineer with a passion for building scalable, high-performance applications while ensuring security, efficiency, and a seamless user experience.']
);

const [selectedTemplate, setSelectedTemplate] = useState(
  initialResume?.selectedTemplate || 'ResumePreview2'
);

const [selectedColor, setSelectedColor] = useState(
  initialResume?.selectedColor || '#000000'
);

  const [currentStep, setCurrentStep] = useState(0);
  const [showAtsScore, setShowAtsScore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const user = useSelector((state: RootState) => state.user);
  const resumeRef = useRef<HTMLDivElement>(null);

  const steps = [
    <PersonalInfo key="personal" personalData={personalData} setPersonalData={setPersonalData} />,
    <WorkExperienceInfo key="workexperience" workExperienceData={workExperienceData} setWorkExperienceData={setWorkExperienceData} />,
    <EducationInfo key="education" educationData={educationData} setEducationData={setEducationData} />,
    <SkillInfo key="skill" skillData={skillData} setSkillData={setSkillData} />,
    <AchievementInfo key="achievement" achievementData={achievementData} setAchievementData={setAchievementData} />,
    <SummaryInfo key="summary" summaryData={summaryData} setSummaryData={setSummaryData} workExperienceData={[]} />,
  ];

  const handleSubmitResume = async () => {
  setIsSubmitting(true);
  setSubmitError('');

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
      workExperience: workExperienceData.map(exp => ({
        jobTitle: exp.jobTitle || '',
        company: exp.company || '',
        startDate: formatDateForBackend(exp.startDate),
        endDate: formatDateForBackend(exp.endDate),
        description: exp.description || '',
      })),
      education: educationData.map(edu => ({
        degree: edu.degree || '',
        school: edu.school || '',
        startDate: formatDateForBackend(edu.startDate),
        endDate: formatDateForBackend(edu.endDate),
      })),
      skills: skillData.map(skill => skill.skillName).filter(Boolean),
      achievements: achievementData.map(ach => ({
        achievementDescription: ach.achievementName || '',
      })),
      projects: projectData.map(proj => ({
        title: proj.title || '',
        description: proj.description || '',
      })),
      professionalSummary: summaryData.join(' '),
      selectedTemplate,
      selectedColor,
    };

    if (initialResume?._id) {
      await axiosInstance.put(`/resume/${initialResume._id}`, resumeData);
      toast({ title: 'Success', description: 'Resume updated successfully!' });
    } else {
      await axiosInstance.post('/resume', resumeData);
      toast({ title: 'Success', description: 'Resume created successfully!' });
    }
  } catch (error) {
    setSubmitError('Failed to save resume. Please try again.');
    console.error('Error saving resume:', error);
    toast({
      title: 'Error',
      description: 'Failed to save resume',
      variant: 'destructive'
    });
  } finally {
    setIsSubmitting(false);
  }
};

  const downloadPDF = async () => {
    if (!resumeRef.current) return;
    setIsGeneratingPDF(true);

    try {
      const canvas = await html2canvas(resumeRef.current.querySelector('.resumeContent') as HTMLElement, {
        scale: selectedTemplate === 'ResumePreview1' ? 1.5 : 2,
        backgroundColor: '#FFFFFF'
      });

      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Resume-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <SidebarMenu menuItemsTop={[]} menuItemsBottom={[]} active="Resume Editor" />
      
      <div className="flex flex-1 flex-col sm:gap-8 sm:py-0 sm:pl-14">
        <Header activeMenu="Resume Editor" breadcrumbItems={[
          { label: 'Settings', link: '#' },
          { label: 'Resume Building', link: '#' },
          { label: 'Resume Editor', link: '#' },
        ]} menuItemsTop={[]} menuItemsBottom={[]} />

        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-6 lg:grid lg:grid-cols-2">
          {/* Form Section */}
          <div className="p-6 relative">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold">
                  {initialResume?._id ? 'Edit Resume' : 'Create New Resume'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {initialResume?._id ? 'Update your resume details' : 'Fill in your resume details'}
                </p>
              </div>
              
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
                  summaryData
                })} jobKeywords={[]}              />
            ) : (
              <>
                <div className="flex justify-between mb-4">
                  <Button 
                    onClick={() => setCurrentStep(prev => Math.max(prev - 1, 0))}
                    disabled={currentStep === 0}
                  >
                    <ChevronLeft className="mr-2" /> Back
                  </Button>
                  
                  <Button 
                    onClick={() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))}
                    disabled={currentStep === steps.length - 1}
                  >
                    Next <ChevronRight className="ml-2" />
                  </Button>
                </div>

                {steps[currentStep]}

                <div className="mt-6 flex justify-end">
                  <Button 
                    onClick={handleSubmitResume}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Resume'}
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Preview Section */}
          <div className="relative p-6">
            <div ref={resumeRef} className="relative" style={{ minHeight: '1100px' }}>
              <div className="absolute top-2 right-2 z-10 flex gap-2 bg-white p-2 rounded shadow">
                <Button
                  size="sm"
                  variant={selectedTemplate === 'ResumePreview1' ? 'default' : 'outline'}
                  onClick={() => setSelectedTemplate('ResumePreview1')}
                >
                  Template 1
                </Button>
                <Button
                  size="sm"
                  variant={selectedTemplate === 'ResumePreview2' ? 'default' : 'outline'}
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
                  <Download className="mr-2" /> PDF
                </Button>
              </div>

              <div className="resumeContent">
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
    </div>
  );
}