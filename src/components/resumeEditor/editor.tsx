'use client';
import React, { useMemo, useState, useRef, useEffect } from 'react';
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

  const [skillData, setSkillData] = useState<Skill[]>([]);
  const [skillOptions, setSkillOptions] = useState<
    Array<{ _id?: string; name: string }>
  >([]);
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
  const [savedResumeId, setSavedResumeId] = useState<string | undefined>(
    initialResume?._id,
  );
  // Sync savedResumeId whenever the editor is reused for a different resume
  useEffect(() => {
    setSavedResumeId(initialResume?._id);
    // Reset load guard when switching resumes
    resumeLoadedRef.current = false;

    if (!initialResume) {
      // Clear data if no resume is provided (New create flow)
      setPersonalData([
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
      setWorkExperienceData([
        {
          jobTitle: 'Software Engineer',
          company: 'ABC Corp',
          startDate: '2020-01-01',
          endDate: '2023-01-01',
          description: 'Worked on web applications.',
        },
      ]);
      setEducationData([
        {
          degree: 'B.Sc. Computer Science',
          school: 'XYZ University',
          startDate: '2016-01-01',
          endDate: '2020-01-01',
        },
      ]);
      setSkillData([]);
      setAchievementData([{ achievementName: 'Won Hackathon 2022' }]);
      setProjectData([
        {
          title: 'Portfolio Website',
          description: 'Built a personal portfolio website.',
        },
      ]);
      setSummaryData([
        'Motivated software engineer with experience in web development.',
      ]);
      setSelectedTemplate('ResumePreview2');
    }
  }, [initialResume?._id]);

  const resumeText = useMemo(
    () =>
      JSON.stringify({
        personalData,
        workExperienceData,
        educationData,
        skills: skillData,
        achievements: achievementData,
        summaryData,
        projectData,
      }),
    [
      personalData,
      workExperienceData,
      educationData,
      skillData,
      achievementData,
      summaryData,
      projectData,
    ],
  );
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const PAGE_W_MM = 210;
  const PAGE_H_MM = 297;
  const PAGE_GAP_MM = 6;
  const [pageCount, setPageCount] = useState(1);
  const [previewScale, setPreviewScale] = useState(1);
  const [pxPerMm, setPxPerMm] = useState(3.78);
  const resumeMeasureRef = useRef<HTMLDivElement>(null);
  const pageHeightMeasureRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);

  // Measure full resume height and compute A4 page count for editor preview.
  useEffect(() => {
    const measure = () => {
      const pageH =
        pageHeightMeasureRef.current?.getBoundingClientRect().height || 0;
      const fullH =
        resumeMeasureRef.current?.getBoundingClientRect().height || 0;
      if (!pageH || !fullH) return;
      const ppMm = pageH / PAGE_H_MM;
      setPxPerMm(ppMm);
      // Full A4 height only — template padding is inside ResumePreview; do not subtract here.
      const pagePerPagePx = PAGE_H_MM * ppMm;
      setPageCount(Math.max(1, Math.ceil(fullH / pagePerPagePx)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (resumeMeasureRef.current) ro.observe(resumeMeasureRef.current);
    if (pageHeightMeasureRef.current) ro.observe(pageHeightMeasureRef.current);
    let mounted = true;
    if ((document as any).fonts?.ready) {
      (document as any).fonts.ready.then(() => {
        if (mounted) measure();
      });
    }
    return () => {
      mounted = false;
      ro.disconnect();
    };
  }, [resumeText, selectedTemplate, selectedColor]);

  // Scale pages to fit the available container width.
  useEffect(() => {
    const wrapper = contentWrapperRef.current;
    const measurer = pageHeightMeasureRef.current;
    if (!wrapper || !measurer) return;
    const compute = () => {
      const ppMm = measurer.getBoundingClientRect().height / PAGE_H_MM;
      if (!ppMm) return;
      const pageWidthPx = PAGE_W_MM * ppMm;
      const available = wrapper.clientWidth;
      const fitScale = available >= pageWidthPx ? 1 : available / pageWidthPx;
      setPreviewScale(Math.min(1, fitScale));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, [selectedTemplate, pageCount]);

  // Fetch skills for the skill picker
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await axiosInstance.get('/skills/all');
        setSkillOptions(res?.data?.data || []);
      } catch (e) {
        console.error('Failed to fetch skills:', e);
        setSkillOptions([]);
      }
    };
    fetchSkills();
  }, []);

  // Track whether initial resume data has been loaded to avoid re-running
  // when skillOptions changes after the first successful load.
  const resumeLoadedRef = useRef(false);

  useEffect(() => {
    // Only load once per initialResume — don't re-run when skillOptions changes
    if (resumeLoadedRef.current) return;
    if (!initialResume) return;

    let cancelled = false;

    const loadResumeData = async () => {
      const resume = initialResume;

      try {
        if (cancelled) return;

        setPersonalData([
          {
            firstName: resume.personalInfo?.firstName ?? '',
            lastName: resume.personalInfo?.lastName ?? '',
            email: resume.personalInfo?.email ?? '',
            phoneNumber: resume.personalInfo?.phone ?? '',
            city: resume.personalInfo?.city ?? '',
            country: resume.personalInfo?.country ?? '',
            github: resume.personalInfo?.github ?? '',
            linkedin: resume.personalInfo?.linkedin ?? '',
          },
        ]);

        setWorkExperienceData(resume.workExperience || []);
        setEducationData(resume.education || []);

        // Create a map of all available skills for quick lookup
        const skillMap = new Map<string, Skill>();
        (skillOptions as SkillOption[]).forEach((skill) => {
          if (skill._id) {
            skillMap.set(skill._id, {
              ...skill,
              name: skill.label || skill.name || '',
              skillName: skill.label || skill.name || '',
            });
          }
        });

        // Get all skill IDs that are strings (not already mapped)
        const skillIds = (resume.skills || []).filter(
          (s) => typeof s === 'string',
        );

        // If we have skill IDs to look up, fetch them in a batch
        if (skillIds.length > 0) {
          try {
            const response = await axiosInstance.get('/skills', {
              params: { ids: skillIds.join(',') },
            });

            (response.data?.data || []).forEach((skill: SkillOption) => {
              if (skill?._id) {
                const skillData: Skill = {
                  ...skill,
                  name: skill.label || skill.name || '',
                  skillName: skill.label || skill.name || '',
                };
                skillMap.set(skill._id, skillData);
              }
            });
          } catch (error) {
            console.error('Failed to fetch skills:', error);
          }
        }

        if (cancelled) return;

        // Map all skills, using the skill map for lookups
        const mappedSkills = (resume.skills || [])
          .map((skill) => {
            if (typeof skill === 'string') {
              return (
                skillMap.get(skill) || {
                  _id: skill,
                  name: skill,
                  skillName: skill,
                  label: skill,
                }
              );
            }

            if (skill?._id) {
              const mappedSkill = skillMap.get(skill._id);
              if (mappedSkill) {
                return {
                  ...mappedSkill,
                  ...skill,
                };
              }
            }

            if (typeof skill === 'object') {
              const { _id, name, skillName, label, ...rest } = skill;
              return {
                _id: _id || '',
                name: label || name || '',
                skillName: label || skillName || name || '',
                label: label || name || '',
                ...rest,
              };
            }

            return null;
          })
          .filter((s): s is Skill => s !== null);
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
        if (!cancelled) {
          resumeLoadedRef.current = true;
        }
      } catch (error) {
        console.error('Error loading resume data:', error);
        if (!cancelled) {
          resumeLoadedRef.current = false;
        }
      }
    };

    loadResumeData();
    return () => {
      cancelled = true;
    };
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
      .resumeContent section,
      .resumeContent .mb-4,
      .resumeContent .mb-3,
      .resumeContent .mb-6 {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      .resumeContent h2 {
        page-break-after: avoid;
      }
      @media print {
        body { margin: 0; }
        .resumeContent {
          box-shadow: none !important;
          margin: 0 !important;
        }
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
          page-break-after: avoid;
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
          const skill =
            typeof skillStr === 'string' && skillStr.startsWith('{')
              ? JSON.parse(skillStr)
              : { skillName: skillStr };

          setSkillData((prev) => {
            // Check if skill already exists
            const exists = prev.some(
              (s) =>
                s._id === skill._id ||
                s.skillName === skill.skillName ||
                s.name === skill.name,
            );

            if (exists) return prev;

            const newSkill = {
              skillName: skill.name || skill.skillName || skillStr,
              name: skill.name || skill.skillName || skillStr,
              label: skill.label || skill.name || skill.skillName || skillStr,
              ...(skill._id && { _id: skill._id }),
            };

            return [...prev, newSkill];
          });
        } catch (error) {
          console.error('Error adding skill:', error);
        }
      }}
      onRemoveSkill={(skillId) => {
        setSkillData((prev) => {
          const idx = prev.findIndex(
            (s) =>
              s._id === skillId ||
              s.skillName === skillId ||
              s.name === skillId,
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
        // If already YYYY-MM-DD, return as-is to avoid timezone shift
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return '';
        return d.toISOString().split('T')[0];
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
          .filter((s) => s && s._id) // Only include skills with valid IDs
          .map((s) => s._id), // Map to just the ID string
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

      const existingId = initialResume?._id || savedResumeId;
      if (existingId) {
        await axiosInstance.put(`/resume/${existingId}`, resumeData);
        notifySuccess('Resume updated successfully!', 'Success');
      } else {
        const res = await axiosInstance.post('/resume', resumeData);
        const newId = res.data?.resume?._id;
        if (newId) setSavedResumeId(newId);
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
      if ((document as any).fonts?.ready) {
        await (document as any).fonts.ready;
      }
      const pageEls = Array.from(
        resumeRef.current.querySelectorAll('.resume-page'),
      ) as HTMLElement[];

      // Preferred path: export each editor page container separately.
      // This prevents spacing/gaps from leaking into the PDF and makes the PDF match the preview slice-by-slice.
      if (pageEls.length) {
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: true,
          precision: 16,
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const safeSchemes = ['https:', 'http:', 'mailto:', 'tel:'];

        for (let i = 0; i < pageEls.length; i++) {
          const pageEl = pageEls[i];
          const canvas = await html2canvas(pageEl, {
            scale: 3,
            backgroundColor: '#FFFFFF',
            logging: false,
            useCORS: true,
            allowTaint: true,
            width: pageEl.offsetWidth,
            height: pageEl.offsetHeight,
            scrollX: 0,
            scrollY: 0,
            windowWidth: document.documentElement.offsetWidth,
            onclone: (clonedDoc) => {
              const sw = clonedDoc.querySelector(
                '[data-scale-wrapper]',
              ) as HTMLElement;
              if (sw) sw.style.transform = 'none';
              const rc = clonedDoc.querySelector(
                '.resumeContent',
              ) as HTMLElement;
              if (rc) {
                rc.style.overflow = 'visible';
                rc.style.maxWidth = 'none';
                rc.style.boxShadow = 'none';
                rc.style.paddingTop = '0';
              }
            },
          });

          const imgData = canvas.toDataURL('image/png', 1.0);
          if (i > 0) pdf.addPage();
          pdf.addImage(
            imgData,
            'PNG',
            0,
            0,
            pdfWidth,
            pdfHeight,
            undefined,
            'FAST',
          );

          // Add clickable links on the correct PDF page.
          const pageRect = pageEl.getBoundingClientRect();
          const domToMmX = pdfWidth / pageRect.width;
          const domToMmY = pdfHeight / pageRect.height;

          pageEl.querySelectorAll('a[href]').forEach((anchor) => {
            const href = anchor.getAttribute('href');
            const normalizedHref = href?.trim();
            if (!normalizedHref || normalizedHref === '#') return;

            let protocol = '';
            try {
              protocol = new URL(
                normalizedHref,
                window.location.origin,
              ).protocol.toLowerCase();
            } catch {
              return;
            }
            if (!safeSchemes.includes(protocol)) return;

            const rect = anchor.getBoundingClientRect();
            if (rect.bottom <= pageRect.top || rect.top >= pageRect.bottom)
              return;

            const relLeft = rect.left - pageRect.left;
            const relTop = rect.top - pageRect.top;

            const x = Math.max(0, relLeft * domToMmX);
            const y = Math.max(0, relTop * domToMmY);
            const w = Math.min(pdfWidth - x, rect.width * domToMmX);
            const h = Math.min(pdfHeight - y, rect.height * domToMmY);

            if (w <= 0 || h <= 0) return;
            pdf.link(x, y, w, h, { url: normalizedHref });
          });
        }

        pdf.save(
          `Resume-${personalData[0]?.firstName || ''}-${personalData[0]?.lastName || ''}-${new Date().toISOString().slice(0, 10)}.pdf`,
        );
        notifySuccess('Resume PDF generated successfully!', 'Success');
        return;
      }

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
          const clonedElement = clonedDoc.querySelector(
            '.resumeContent',
          ) as HTMLElement;
          if (clonedElement) {
            // Remove the visible container styling from the clone before capture
            clonedElement.style.boxShadow = 'none';
            clonedElement.style.margin = '0';
            clonedElement.style.border = 'none';
            clonedElement.style.borderRadius = '0';
            clonedElement.style.paddingTop = '0';
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
      const ratio = pdfWidth / imgWidth;
      const imgPdfWidth = pdfWidth;
      const imgPdfHeight = imgHeight * ratio;
      const xOffset = 0;

      pdf.addImage(
        imgData,
        'PNG',
        xOffset,
        0,
        imgPdfWidth,
        imgPdfHeight,
        undefined,
        'FAST',
      );

      const domToMm = (canvas.width / element.offsetWidth) * ratio;
      const elemRect = element.getBoundingClientRect();
      const links: Array<{
        x: number;
        yAbs: number;
        w: number;
        h: number;
        href: string;
      }> = [];
      element.querySelectorAll('a[href]').forEach((anchor) => {
        const href = anchor.getAttribute('href');
        const normalizedHref = href?.trim();
        // skip empty, fragment, and unsafe links
        const safeSchemes = ['https:', 'http:', 'mailto:', 'tel:'];
        if (!normalizedHref || normalizedHref === '#') return;
        let protocol = '';
        try {
          protocol = new URL(
            normalizedHref,
            window.location.origin,
          ).protocol.toLowerCase();
        } catch {
          return;
        }
        if (!safeSchemes.includes(protocol)) return;
        const rect = anchor.getBoundingClientRect();
        const x = (rect.left - elemRect.left) * domToMm;
        const yAbs = (rect.top - elemRect.top) * domToMm;
        const w = rect.width * domToMm;
        const h = rect.height * domToMm;
        links.push({ x, yAbs, w, h, href: normalizedHref });
      });

      let heightLeft = imgPdfHeight - pdfHeight;
      let position = 0;
      while (heightLeft > 0) {
        position -= pdfHeight;
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
        heightLeft -= pdfHeight;
      }

      // Place each link on its correct PDF page
      const pageHeightMm = pdfHeight;
      const totalPages =
        typeof (pdf as any).getNumberOfPages === 'function'
          ? (pdf as any).getNumberOfPages()
          : Math.max(1, Math.ceil(imgPdfHeight / pageHeightMm));
      links.forEach((l) => {
        const pageIndex = Math.max(0, Math.floor(l.yAbs / pageHeightMm));
        const pageNumber = pageIndex + 1;
        if (pageNumber > totalPages) return;
        if (typeof (pdf as any).setPage === 'function')
          (pdf as any).setPage(pageNumber);
        const yLocal = l.yAbs - pageIndex * pageHeightMm;
        pdf.link(l.x, yLocal, l.w, l.h, { url: l.href });
      });

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
    const deleteId = initialResume?._id || savedResumeId;
    if (!deleteId) {
      notifyError('No resume to delete', 'Error');
      return;
    }
    setIsDeleting(true);
    try {
      await axiosInstance.put(`/resume/${deleteId}`, {
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
    <div className="flex h-auto flex-col overflow-x-hidden">
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

        <main className="flex w-full items-start flex-col lg:flex-row md:gap-6 lg:h-[calc(100vh-88px)] lg:overflow-hidden">
          <div className="w-full lg:w-1/2 flex flex-col px-6 pt-2 min-w-0 lg:min-h-0 lg:h-full lg:overflow-y-auto lg:overflow-x-hidden">
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
                {showAtsScore ? 'Back to Edit' : 'Check ATS Score'}
              </Button>
            </div>

            {showAtsScore ? (
              <AtsScore
                name={`${personalData[0]?.firstName} ${personalData[0]?.lastName}`}
                resumeText={resumeText}
                resumeId={initialResume?._id || savedResumeId}
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
                              className={`h-px w-4 sm:w-8 ${
                                isDone ? 'bg-primary' : 'bg-muted'
                              }`}
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
                  {(initialResume?._id || savedResumeId) && (
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
                    className="bg-primary hover:bg-primary/90 dark:bg-primary/90 dark:hover:bg-primary/80"
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

          <div className="w-full lg:w-1/2 px-6 md:pl-0 pt-2 min-w-0 lg:min-h-0 lg:h-full lg:overflow-y-auto lg:overflow-x-hidden">
            <div ref={resumeRef} className="relative h-auto">
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
                ref={contentWrapperRef}
                className="resumeContent pt-4 rounded-md"
                style={{
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  overflowX: 'hidden',
                  overflowY: 'visible',
                  width: '100%',
                  maxWidth: '794px',
                  minWidth: 0,
                  margin: '0 auto',
                }}
              >
                {(() => {
                  const renderedTemplate =
                    [
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
                    ].find((t) => t.value === selectedTemplate)?.render || null;

                  if (!renderedTemplate) return null;

                  return (
                    <>
                      <div
                        ref={pageHeightMeasureRef}
                        style={{
                          position: 'absolute',
                          visibility: 'hidden',
                          top: 0,
                          left: 0,
                          width: '1px',
                          height: `${PAGE_H_MM}mm`,
                        }}
                      />

                      <div
                        ref={resumeMeasureRef}
                        style={{
                          visibility: 'hidden',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: `${PAGE_W_MM}mm`,
                          pointerEvents: 'none',
                        }}
                      >
                        {renderedTemplate}
                      </div>

                      {(() => {
                        const totalMm =
                          pageCount * PAGE_H_MM +
                          Math.max(0, pageCount - 1) * PAGE_GAP_MM;
                        const scaledH =
                          pxPerMm > 0
                            ? totalMm * pxPerMm * previewScale
                            : undefined;
                        return (
                          <div
                            style={{
                              width: '100%',
                              height: scaledH ? `${scaledH}px` : 'auto',
                              position: 'relative',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                display: 'flex',
                                justifyContent: 'center',
                              }}
                            >
                              <div
                                data-scale-wrapper
                                style={{
                                  width: `${PAGE_W_MM}mm`,
                                  transform: `scale(${previewScale})`,
                                  transformOrigin: 'top center',
                                }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: `${PAGE_GAP_MM}mm`,
                                  }}
                                >
                                  {Array.from({ length: pageCount }).map(
                                    (_, i) => (
                                      <div
                                        key={i}
                                        className="resume-page"
                                        style={{
                                          width: `${PAGE_W_MM}mm`,
                                          height: `${PAGE_H_MM}mm`,
                                          overflow: 'hidden',
                                          background: '#FFFFFF',
                                          boxSizing: 'border-box',
                                          margin: '0 auto',
                                          flex: '0 0 auto',
                                          padding: 0,
                                        }}
                                      >
                                        <div
                                          style={{
                                            height: `${PAGE_H_MM}mm`,
                                            overflow: 'hidden',
                                          }}
                                        >
                                          <div
                                            style={{
                                              transform: `translateY(-${i * PAGE_H_MM}mm)`,
                                              transformOrigin: 'top left',
                                            }}
                                          >
                                            {renderedTemplate}
                                          </div>
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  );
                })()}
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
