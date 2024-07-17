'use client';
import React, { useState, useEffect } from 'react';
import { Search, UserIcon } from 'lucide-react';

import CompanyCard from '@/components/opportunities/company-size/company';
import SkillDom from '@/components/opportunities/skills-domain/skilldom';
import Jobs from '@/components/opportunities/jobs/jobs';
import MobileCompany from '@/components/opportunities/mobile-opport/mob-comp/mob-comp';
import MobileSkillDom from '@/components/opportunities/mobile-opport/mob-skills-domain/mob-skilldom';
import SidebarMenu from '@/components/menu/sidebarMenu';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
import Breadcrumb from '@/components/shared/breadcrumbList';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

const jobData = {
  heading: 'Arya.ai Data Scientist',
  content:
    'Arya is an autonomous AI operating platform for banks, insurers, and financial service providers that simplifies buildout and manages the...',
  skills: ['Generative AI', 'Python', 'NLP', 'PyTorch', 'Transformers'],
  location: 'Mumbai',
  founded: '2013',
  employees: '10-50 employees',
};

interface FilterState {
  location: string[];
  jobType: string[];
  domain: string[];
  skills: string[];
}

const Market: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    location: [],
    jobType: [],
    domain: [],
    skills: [],
  });

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // Adjust the delay

    return () => clearTimeout(timer);
  }, []);

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
  }, []);

  const handleModalToggle = () => {
    setShowFilters(!showFilters);
  };

  return (
    <section className="p-4 relative">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Market"
      />
      <CollapsibleSidebarMenu menuItems={menuItemsTop} active="Dashboard" />
      <div className="ml-12">
        <div className="mb-6 mt-4 ">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background  sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Breadcrumb
              items={[
                { label: 'Dashboard', link: '/dashboard/business' },
                { label: 'Freelancers Marketplace', link: '#' },
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="overflow-hidden rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/user.png" alt="@shadcn" />
                    <AvatarFallback>
                      <UserIcon size={16} />{' '}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>user</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-screen bg-muted/40">
            <Spinner size="large">Loading...</Spinner>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row lg:space-x-10 ml-6">
            <div className="hidden lg:block lg:space-y-4">
              <Button onClick={handleApply} className="w-[100%]">
                Apply
              </Button>

              <div className="mb-4">
                <CompanyCard
                  heading="Filter by Experience"
                  checkboxLabels={['0-2', '3-6', '7+']}
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
              <Jobs {...jobData} />
            </div>
          </div>
        )}
      </div>

      {isClient && showFilters && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 m-20">
          <div className="bg-white p-4 rounded-lg w-full max-w-screen-lg mx-auto item-center">
            <div className="border-b border-gray-300 pb-4">
              <Button onClick={handleApply} className="w-[100%]">
                Apply
              </Button>

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
                heading="Filter by Experience"
                checkboxLabels={['0-2', '3-6', '7+']}
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
    </section>
  );
};

export default Market;
