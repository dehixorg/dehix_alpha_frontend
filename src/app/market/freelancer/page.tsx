'use client';
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useSelector } from 'react-redux';

import CompanyCard from '@/components/opportunities/company-size/company';
import SkillDom from '@/components/opportunities/skills-domain/skilldom';
import MobileCompany from '@/components/opportunities/mobile-opport/mob-comp/mob-comp';
import MobileSkillDom from '@/components/opportunities/mobile-opport/mob-skills-domain/mob-skilldom';
import SidebarMenu from '@/components/menu/sidebarMenu';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import Breadcrumb from '@/components/shared/breadcrumbList';
import DropdownProfile from '@/components/shared/DropdownProfile';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { axiosInstance } from '@/lib/axiosinstance';
import { RootState } from '@/lib/store';
import JobCard from '@/components/opportunities/jobs/jobs';

interface FilterState {
  location: string[];
  jobType: string[];
  domain: string[];
  skills: string[];
}

interface Project {
  _id: string;
  projectName: string;
  description: string;
  email: string;
  verified?: any;
  isVerified?: string;
  companyName: string;
  start?: Date;
  end?: Date;
  skillsRequired: string[];
  experience?: string;
  role: string;
  projectType: string;
  totalNeedOfFreelancer?: {
    category?: string;
    needOfFreelancer?: number;
    appliedCandidates?: string[];
    rejected?: string[];
    accepted?: string[];
    status?: string;
  }[];
  status?: string;
  team?: string[];
  createdAt: { $date: string };
  updatedAt: { $date: string };
}

const Market: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const [showFilters, setShowFilters] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    location: [],
    jobType: [],
    domain: [],
    skills: [],
  });
  const [jobs, setJobs] = useState<Project[]>([]);
  const handleFilterChange = (filterType: any, selectedValues: any) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: selectedValues,
    }));
  };

  const handleApply = () => {
    console.log('Selected Filters:', filters);
  };

  useEffect(() => {
    setIsClient(true);
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/business/all_project'); // Fetch data from API
        console.log(response.data.data);
        setJobs(response.data.data); // Store all projects initially
      } catch (error) {
        console.error('API Error:', error);
      }
    };
    fetchData();
  }, [user.uid]);

  const handleModalToggle = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Market"
      />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <CollapsibleSidebarMenu
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            active="Dashboard"
          />

          <Breadcrumb
            items={[
              { label: 'Freelancer', link: '/dashboard/freelancer' },
              { label: 'Work', link: '#' },
            ]}
          />
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
          <DropdownProfile />
        </header>
      </div>
      <div className="flex flex-col lg:flex-row lg:space-x-4 ml-4 lg:ml-20 md:ml-20 md:-space-x-3 pr-4 sm:pr-5">
        <div className="hidden lg:block lg:space-y-4 ">
          <Button onClick={handleApply} className="w-[100%]">
            Apply
          </Button>
          <div className="mb-4">
            <SkillDom
              heading="Filter by location"
              checkboxLabels={[
                'All',
                'Banglore',
                'Pune',
                'Noida',
                'Delhi',
                'Gurugram',
              ]}
              selectedValues={filters.location}
              setSelectedValues={(values) =>
                handleFilterChange('location', values)
              }
            />
          </div>
          <div className="mb-4">
            <CompanyCard
              heading="Filter by job type"
              checkboxLabels={['All', 'Full-time', 'Internship']}
              selectedValues={filters.jobType}
              setSelectedValues={(values) =>
                handleFilterChange('jobType', values)
              }
            />
          </div>
          <div className="mb-4">
            <SkillDom
              heading="Filter by domain"
              checkboxLabels={[
                'frontend',
                'backend',
                'database',
                'cloud computing',
                'mobile development',
                'machine learning',
                'data science',
                'devops',
                'cybersecurity',
                'UI/UX design',
                'networking',
                'game development',
                'e-commerce',
                'social media',
                'artificial intelligence',
                'blockchain',
                'IoT (Internet of Things)',
                'big data',
                'web scraping',
                'embedded systems',
              ]}
              selectedValues={filters.domain}
              setSelectedValues={(values) =>
                handleFilterChange('domain', values)
              }
            />
          </div>
          <div className="mb-4">
            <SkillDom
              heading="Filter by skills"
              checkboxLabels={[
                'Python',
                'JavaScript',
                'React',
                'Node.js',
                'TypeScript',
                'Java',
                'Spring Boot',
                'PHP',
                'HTML',
                'CSS',
                'Angular',
                'Vue.js',
                'Express.js',
                'MongoDB',
                'MySQL',
                'PostgreSQL',
                'SQLite',
                'Firebase',
                'AWS',
                'Azure',
                'Docker',
                'Kubernetes',
                'Git',
                'Jenkins',
                'CI/CD',
                'RESTful API',
                'GraphQL',
                'Microservices',
                'Machine Learning',
                'Artificial Intelligence',
                'Blockchain',
                'Cybersecurity',
                'UI/UX Design',
                'Responsive Web Design',
                'Bootstrap',
                'Tailwind CSS',
                'Sass',
                'Less',
                'WordPress',
                'Joomla',
                'Shopify',
                'Magento',
                'React Native',
                'Flutter',
                'Ionic',
                'Swift',
                'Kotlin',
                'C#',
                'ASP.NET',
                'Ruby',
                'Ruby on Rails',
                'Scala',
                'Go',
                'Rust',
                'Perl',
                'C++',
                'Unity',
                'Unreal Engine',
                'Game Development',
                'AR/VR',
                'IoT',
                'Raspberry Pi',
                'Arduino',
                'Embedded Systems',
                'Linux',
                'Windows',
                'MacOS',
                'Android',
                'iOS',
                'Cross-Platform Development',
                'Software Testing',
                'Quality Assurance',
                'DevOps',
                'Agile Methodologies',
                'Scrum',
                'Kanban',
                'Lean',
                'Project Management',
                'Product Management',
                'Business Analysis',
                'Technical Writing',
                'Copywriting',
                'Content Marketing',
                'SEO',
                'SEM',
                'Digital Marketing',
                'Social Media Marketing',
                'Email Marketing',
                'Salesforce',
                'ERP',
                'CRM',
                'Big Data',
                'Data Science',
                'Data Engineering',
                'Data Analytics',
                'Business Intelligence',
                'Deep Learning',
                'Neural Networks',
                'Computer Vision',
                'Natural Language Processing',
                'Quantum Computing',
              ]}
              selectedValues={filters.skills}
              setSelectedValues={(values) =>
                handleFilterChange('skills', values)
              }
            />
          </div>
        </div>
        <div className="mt-4 lg:mt-0 lg:ml-10">
          {jobs.map((job: Project, index: number) => (
            <JobCard key={index} {...job} />
          ))}
        </div>
      </div>

      {isClient && showFilters && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 m-20">
          <div className="bg-white p-4 rounded-lg w-full max-w-screen-lg mx-auto item-center">
            <div className="border-b border-gray-300 pb-4">
              <Button onClick={handleApply} className="w-[100%]">
                Apply
              </Button>
              a
              <MobileSkillDom
                heading="Filter by location"
                checkboxLabels={[
                  'All',
                  'Banglore',
                  'Pune',
                  'Noida',
                  'Delhi',
                  'Gurugram',
                ]}
                selectedValues={filters.location}
                setSelectedValues={(values) =>
                  handleFilterChange('location', values)
                }
              />
            </div>

            <div className="border-b border-gray-300 pb-4">
              <MobileCompany
                heading="Filter by job type"
                checkboxLabels={['All', 'Full-time', 'Internship']}
                selectedValues={filters.jobType}
                setSelectedValues={(values) =>
                  handleFilterChange('jobType', values)
                }
              />
            </div>

            {/* <div className="border-b border-gray-300 pb-4">
                <MobileSkillDom
                  heading="Filter by domain"
                  checkboxLabels={[
                    'frontend',
                    'backend',
                    'database',
                    'cloud computing',
                    'mobile development',
                    'machine learning',
                    'data science',
                    'devops',
                    'cybersecurity',
                    'UI/UX design',
                    'networking',
                    'game development',
                    'e-commerce',
                    'social media',
                    'artificial intelligence',
                    'blockchain',
                    'IoT (Internet of Things)',
                    'big data',
                    'web scraping',
                    'embedded systems',
                  ]}
                  selectedValues={filters.domain}
            setSelectedValues={(values) => handleFilterChange('domain', values)}
                />
              </div> */}

            <div className="border-b border-gray-300 pb-4">
              <MobileSkillDom
                heading="Filter by skills"
                checkboxLabels={[
                  'Python',
                  'JavaScript',
                  'React',
                  'Node.js',
                  'TypeScript',
                  'Java',
                  'Spring Boot',
                  'PHP',
                  'HTML',
                  'CSS',
                  'Angular',
                  'Vue.js',
                  'Express.js',
                  'MongoDB',
                  'MySQL',
                  'PostgreSQL',
                  'SQLite',
                  'Firebase',
                  'AWS',
                  'Azure',
                  'Docker',
                  'Kubernetes',
                  'Git',
                  'Jenkins',
                  'CI/CD',
                  'RESTful API',
                  'GraphQL',
                  'Microservices',
                  'Machine Learning',
                  'Artificial Intelligence',
                  'Blockchain',
                  'Cybersecurity',
                  'UI/UX Design',
                  'Responsive Web Design',
                  'Bootstrap',
                  'Tailwind CSS',
                  'Sass',
                  'Less',
                  'WordPress',
                  'Joomla',
                  'Shopify',
                  'Magento',
                  'React Native',
                  'Flutter',
                  'Ionic',
                  'Swift',
                  'Kotlin',
                  'C#',
                  'ASP.NET',
                  'Ruby',
                  'Ruby on Rails',
                  'Scala',
                  'Go',
                  'Rust',
                  'Perl',
                  'C++',
                  'Unity',
                  'Unreal Engine',
                  'Game Development',
                  'AR/VR',
                  'IoT',
                  'Raspberry Pi',
                  'Arduino',
                  'Embedded Systems',
                  'Linux',
                  'Windows',
                  'MacOS',
                  'Android',
                  'iOS',
                  'Cross-Platform Development',
                  'Software Testing',
                  'Quality Assurance',
                  'DevOps',
                  'Agile Methodologies',
                  'Scrum',
                  'Kanban',
                  'Lean',
                  'Project Management',
                  'Product Management',
                  'Business Analysis',
                  'Technical Writing',
                  'Copywriting',
                  'Content Marketing',
                  'SEO',
                  'SEM',
                  'Digital Marketing',
                  'Social Media Marketing',
                  'Email Marketing',
                  'Salesforce',
                  'ERP',
                  'CRM',
                  'Big Data',
                  'Data Science',
                  'Data Engineering',
                  'Data Analytics',
                  'Business Intelligence',
                  'Deep Learning',
                  'Neural Networks',
                  'Computer Vision',
                  'Natural Language Processing',
                  'Quantum Computing',
                ]}
                selectedValues={filters.skills}
                setSelectedValues={(values: any) =>
                  handleFilterChange('skills', values)
                }
              />
            </div>
          </div>
        </div>
      )}
      {isClient && (
        <div className="fixed bottom-0 left-0 right-0 lg:hidden p-4  flex justify-center z-50">
          <button
            className="w-full max-w-xs p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300 ease-in-out"
            onClick={handleModalToggle}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Market;
