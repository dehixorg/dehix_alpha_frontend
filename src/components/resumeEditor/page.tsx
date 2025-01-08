import React, { useState, useRef } from 'react';
import SidebarMenu from '@/components/menu/sidebarMenu';
import Header from '@/components/header/header';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/settingsMenuItems';
import { Button } from '../ui/button';
import Link from 'next/link';
import GeneralInfo from '../form/resumeform/GeneralInfo';
import { PersonalInfo } from '../form/resumeform/PersonalInfo';
import EducationInfo from '../form/resumeform/EducationInfo';
import SkillInfo from '../form/resumeform/SkillInfo';
import WorkExperienceInfo from '../form/resumeform/WorkExperienceInfo';
import { ResumePreview } from './ResumePreview';
import SummaryInfo from '../form/resumeform/SummaryInfo';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ResumeEditor() {
  const [currentStep, setCurrentStep] = useState(0);
  const [educationData, setEducationData] = useState([
    {
      degree: '',
      school: '',
      startDate: '',
      endDate: '',
    },
  ]);
  const [workExperienceData, setWorkExperienceData] = useState([
    {
      jobTitle: '',
      company: '',
      startDate: '',
      endDate: '',
      description: '',
    },
  ]);
  const [personalData, setPersonalData] = useState([
    {
      firstName: '',
      lastName: '',
      city: '',
      country: '',
      phoneNumber: '',
      email: '',
      github: '',
      linkedin: '',
    },
  ]);
  const [projectData, setProjectData] = useState([
    {
      title: '',
      description: '',
    },
  ]);
  const [skillData, setSkillData] = useState([
    {
      skillName: '',
    },
  ]);

  const [selectedColor, setSelectedColor] = useState('#000000');

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
    <SkillInfo key="skill" skillData={skillData} setSkillData={setSkillData} />,
    <SummaryInfo key="summary" />,
  ];

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const downloadPDF = async () => {
    const element = resumeRef.current;
    if (element) {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Resume.pdf');
    }
  };

  const colorOptions = ['#000000', '#31572c', '#0077b6', '#9d0208', '#fb8500'];

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

        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid lg:grid-cols-5 xl:grid-cols-4">
          <div className="lg:col-span-2 ml-3">
            <h1 className="text-2xl font-bold mt-5">Design your Resume</h1>
            <p className="text-sm text-muted-foreground mb-5">
              Follow the steps below to create your resume.
            </p>
            {/* left section */}
            <div className="shadow-md rounded-md p-3">{steps[currentStep]}</div>
          </div>

          {/* right section */}
          <div
            ref={resumeRef}
            className="lg:col-span-2 xl:col-span-2 flex-1 shadow-md rounded-md p-3 border-gray-200"
          >
            <ResumePreview
              educationData={educationData}
              workExperienceData={workExperienceData}
              personalData={personalData}
              projectData={projectData}
              skillData={skillData}
              headingColor={selectedColor}
            />
          </div>
        </main>

        <section className="flex justify-start gap-3 py-4 px-6">
          {colorOptions.map((color, index) => (
            <div
              key={index}
              onClick={() => setSelectedColor(color)}
              className="w-8 h-8 rounded-full cursor-pointer"
              style={{ backgroundColor: color }}
            />
          ))}
        </section>

        {/* Footer */}
        <footer className="w-full border-t px-3 py-5">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="p-2"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                onClick={handleNext}
                disabled={currentStep === steps.length - 1}
                className="p-2"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button>
                <Link href="/settings/resume">Close</Link>
              </Button>
              <p className="text-muted-foreground opacity-0">Saving...</p>
            </div>

            <div className="flex items-center">
              <Button onClick={downloadPDF} className="p-2">
                Download PDF
              </Button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
