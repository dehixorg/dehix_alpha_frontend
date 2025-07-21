import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import axios from 'axios';
import { useSelector } from 'react-redux';

import { Button } from '../ui/button';
import { GeneralInfo } from '../form/resumeform/GeneralInfo';
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
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/settingsMenuItems';
import Header from '@/components/header/header';
import SidebarMenu from '@/components/menu/sidebarMenu';

export default function ResumeEditor() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('ResumePreview2');
  const [showAtsScore, setShowAtsScore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const user = useSelector((state: RootState) => state.user);

  const handleSubmitResume = async () => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Prepare the data in the format your backend expects
      const resumeData = {
        userId: user.uid, // You'll need to get this from your auth system
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
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
          description: exp.description || '',
        })),
        education: educationData.map((edu) => ({
          degree: edu.degree || '',
          school: edu.school || '',
          startDate: edu.startDate || '',
          endDate: edu.endDate || '',
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
      };

      // Make the API call to your backend
      const response = await axios.post(
        'http://127.0.0.1:8080/resume',
        resumeData,
      );

      console.log('Resume saved successfully:', response.data);
      // You might want to show a success message to the user here
    } catch (error) {
      console.error('Error saving resume:', error);
      setSubmitError('Failed to save resume. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [educationData, setEducationData] = useState([
    {
      degree: 'Bachelor of Science in Computer Science',
      school: 'ABC University',
      startDate: '2023-12-31',
      endDate: '2023-12-31', //grade
    },
    {
      degree: 'Master of Science in Software Engineering',
      school: 'XYZ University',
      startDate: '2023-12-31',
      endDate: '2023-12-31',
    },
  ]);
  const [workExperienceData, setWorkExperienceData] = useState([
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
  ]);
  const [personalData, setPersonalData] = useState([
    {
      firstName: 'John',
      lastName: 'Doe',
      city: 'New York',
      country: 'USA',
      phoneNumber: '123-456-7890',
      email: '123.doe@example.com',
      github: 'github.com/john',
      linkedin: 'linkedin.com/in/john',
    },
  ]);
  const [projectData, setProjectData] = useState([
    {
      title: 'AI-Powered Resume Builder',
      description:
        'Developed a full-stack platform integrating OpenAI’s GPT-4 to dynamically generate personalized resume content. Implemented secure authentication and cloud data management using Firebase.',
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
  ]);
  const [skillData, setSkillData] = useState([
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
  ]);
  const [achievementData, setAchievementData] = useState([
    {
      achievementName:
        'Published Research on AI-Powered Automation in a Peer-Reviewed Journal',
    },
    {
      achievementName:
        'Delivered Keynote Speech on Emerging Tech Trends at a Global Conference',
    },
  ]);
  const [summaryData, setSummaryData] = useState([
    'Results-driven software engineer with a passion for building scalable, high-performance applications while ensuring security, efficiency, and a seamless user experience.',
  ]);

  const handleAddSkill = (e: React.MouseEvent) => {
    e.preventDefault();
    setSkillData([...skillData, { skillName: '' }]);
  };

  const handleRemoveSkill = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    const newSkills = [...skillData];
    newSkills.splice(index, 1);
    setSkillData(newSkills);
  };

  const handleSkillChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const newSkills = [...skillData];
    newSkills[index].skillName = e.target.value;
    setSkillData(newSkills);
  };

  // Project handlers
  const handleAddProject = (e: React.MouseEvent) => {
    e.preventDefault();
    setProjectData([...projectData, { title: '', description: '' }]);
  };

  const handleRemoveProject = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    const newProjects = [...projectData];
    newProjects.splice(index, 1);
    setProjectData(newProjects);
  };

  const handleProjectChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    field: keyof { title: string; description: string },
  ) => {
    const newProjects = [...projectData];
    newProjects[index][field] = e.target.value;
    setProjectData(newProjects);
  };

  const [selectedColor, setSelectedColor] = useState('#000000');

  const resumeData = `
  ${personalData[0]?.firstName || ''} ${personalData[0]?.lastName || ''}
  ${summaryData.join(' ')}

  Work Experience:
  ${workExperienceData.map((exp) => `${exp.jobTitle} at ${exp.company}. ${exp.description}`).join('\n')}

  Education:
  ${educationData.map((edu) => `${edu.degree} from ${edu.school}`).join('\n')}

  Skills: ${skillData.map((skill) => skill.skillName).join(', ')}
  Achievements: ${achievementData.map((ach) => ach.achievementName).join(', ')}
  Projects:
  ${projectData.map((proj) => `${proj.title}: ${proj.description}`).join('\n')}
`.trim();

  const renderContent = () => {
    return (
      <div className="relative">
        {showAtsScore ? (
          <AtsScore
            name={
              `${personalData[0]?.firstName} ${personalData[0]?.lastName}`.trim() ||
              'Your Name'
            }
            resumeText={resumeData}
            jobKeywords={['React', 'JavaScript', 'Developer']} // Pass keywords if needed
          />
        ) : (
          <>
            {/* Navigation Buttons at the Top-Right */}
            <div className="absolute top-0 right-0 flex mb-5 p-2 space-x-2">
              <Button
                onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
                disabled={currentStep === 0}
                className="p-2"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                onClick={() =>
                  setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
                }
                disabled={currentStep === steps.length - 1}
                className="p-2"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
              {/* Add Submit Button */}
              <Button
                onClick={handleSubmitResume}
                disabled={isSubmitting}
                className="p-2 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? 'Saving...' : 'Save Resume'}
              </Button>
            </div>

            {/* Show error message if there's an error */}
            {submitError && (
              <div className="text-red-500 text-sm mt-2">{submitError}</div>
            )}

            {/* Render the Current Step Content */}
            {steps[currentStep]}
          </>
        )}
      </div>
    );
  };

  const resumeRef = useRef<HTMLDivElement | null>(null);

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
    <GeneralInfo
      key="general"
      onAddProject={handleAddProject}
      onRemoveProject={handleRemoveProject}
      onProjectChange={handleProjectChange}
      projectData={projectData}
    />,
    <SkillInfo
      key="skill"
      skillData={skillData}
      onAddSkill={handleAddSkill}
      onRemoveSkill={handleRemoveSkill}
      onSkillChange={handleSkillChange}
      projectData={projectData}
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
  ];

  const handleTemplateChange = (page: number) => {
    setSelectedTemplate(page === 1 ? 'ResumePreview1' : 'ResumePreview2');
  };

  const downloadPDF = async () => {
    const element = resumeRef.current;
    if (!element) {
      console.error('Resume element is not available.');
      return;
    }

    const resumeContentElement = element.querySelector(
      '.resumeContent',
    ) as HTMLElement;
    if (!resumeContentElement) {
      console.error('No .resumeContent element found.');
      return;
    }

    try {
      // Temporary styling for PDF generation
      const originalStyles = {
        width: resumeContentElement.style.width,
        height: resumeContentElement.style.height,
        overflow: resumeContentElement.style.overflow,
      };

      // Set explicit dimensions for Template1
      if (selectedTemplate === 'ResumePreview1') {
        resumeContentElement.style.width = '210mm';
        resumeContentElement.style.height = 'auto';
        resumeContentElement.style.overflow = 'visible';
      }

      // Capture with adjusted scale based on template
      const scale = selectedTemplate === 'ResumePreview1' ? 1.5 : 2;
      const canvas = await html2canvas(resumeContentElement, {
        scale,
        logging: true, // Enable for debugging
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
      });

      // Restore original styles
      resumeContentElement.style.width = originalStyles.width;
      resumeContentElement.style.height = originalStyles.height;
      resumeContentElement.style.overflow = originalStyles.overflow;

      // Create PDF
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Adjust positioning for Template1
      if (selectedTemplate === 'ResumePreview1') {
        // Add small margins for Template1
        pdf.addImage(imgData, 'PNG', 5, 5, pdfWidth - 10, pdfHeight - 10);
      } else {
        // Full page for Template2
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save(`Resume-${selectedTemplate}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const colorOptions = ['#000000', '#31572c', '#1e40af', '#9d0208', '#fb8500'];

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      {/* Sidebar */}
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Resume Editor"
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col sm:gap-8 sm:py-0 sm:pl-14">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Resume Editor"
          breadcrumbItems={[
            { label: 'Settings', link: '#' },
            { label: 'Resume Building', link: '#' },
            { label: 'Resume Editor', link: '#' },
          ]}
        />
        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-6 lg:grid lg:grid-cols-2">
          {/* Left section - Form */}
          <div className="p-6">
            <h1 className="text-2xl font-bold">Design your Resume</h1>
            <p className="text-sm text-muted-foreground mb-5">
              Follow the steps below to create your resume.
            </p>

            <div className="mt-5">{renderContent()}</div>
          </div>

          {/* Right section - Resume Preview */}
          <div ref={resumeRef} className="p-6 " style={{ minHeight: '1100px' }}>
            <div className="flex justify-end gap-3 mb-4">
              <Button
                onClick={() => setShowAtsScore(!showAtsScore)}
                className="p-2"
              >
                {showAtsScore ? 'Hide ATS Score' : 'Check ATS Score'}
              </Button>
              <Button onClick={downloadPDF} className="p-2">
                Download PDF
              </Button>
            </div>
            <section className="flex justify-start gap-3">
              {colorOptions.map((color, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedColor(color)}
                  className="w-8 h-8 rounded-full cursor-pointer"
                  style={{ backgroundColor: color }}
                />
              ))}
            </section>

            <div className="resumeContent ">
              {selectedTemplate === 'ResumePreview1' ? (
                <ResumePreview1
                  educationData={educationData}
                  workExperienceData={workExperienceData}
                  personalData={personalData}
                  projectData={projectData}
                  skillData={skillData}
                  achievementData={achievementData}
                  headingColor={selectedColor}
                  summaryData={summaryData}
                />
              ) : (
                <ResumePreview2
                  educationData={educationData}
                  workExperienceData={workExperienceData}
                  personalData={personalData}
                  projectData={projectData}
                  skillData={skillData}
                  achievementData={achievementData}
                  headingColor={selectedColor}
                  summaryData={summaryData}
                />
              )}
            </div>

            <div className="flex justify-center gap-3">
              <Button
                onClick={() => handleTemplateChange(1)}
                className={`p-2 ${selectedTemplate === 'ResumePreview1' ? 'dark:bg-white light:text-black' : 'bg-gray-500 text-white'}`}
              >
                Template 1
              </Button>
              <Button
                onClick={() => handleTemplateChange(2)}
                className={`p-2 ${selectedTemplate === 'ResumePreview2' ? 'dark:bg-white light:text-black' : 'bg-gray-500 text-white'}`}
              >
                Template 2
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
