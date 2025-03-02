import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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
            </div>

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
      projectData={projectData}
      setProjectData={setProjectData}
    />,
    <SkillInfo
      key="skill"
      skillData={skillData}
      setSkillData={setSkillData}
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
    if (element) {
      // Ensure the .resumeContent element is available and cast it to HTMLElement
      const resumeContentElement = element.querySelector(
        '.resumeContent',
      ) as HTMLElement;

      if (resumeContentElement) {
        // Render only the content inside the resume container (exclude buttons and color options)
        const canvas = await html2canvas(resumeContentElement, { scale: 2 }); // Ensure scale is set to 2 for better resolution
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF('portrait', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        // Add the image to the PDF at full size
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('Resume.pdf');
      } else {
        console.error('No .resumeContent element found.');
      }
    } else {
      console.error('Resume element is not available.');
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
