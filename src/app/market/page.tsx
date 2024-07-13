'use client';
import React, { useState, useEffect } from 'react';

import CompanyCard from '@/components/opportunities/company-size/company';
import SkillDom from '@/components/opportunities/skills-domain/skilldom';
import Jobs from '@/components/opportunities/jobs/jobs';
import MobileCompany from '@/components/opportunities/mobile-opport/mob-comp/mob-comp';
import MobileSkillDom from '@/components/opportunities/mobile-opport/mob-skills-domain/mob-skilldom';

const jobData = {
  heading: 'Arya.ai Data Scientist',
  content:
    'Arya is an autonomous AI operating platform for banks, insurers, and financial service providers that simplifies buildout and manages the...',
  skills: ['Generative AI', 'Python', 'NLP', 'PyTorch', 'Transformers'],
  location: 'Mumbai',
  founded: '2013',
  employees: '10-50 employees',
};

const Market: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleModalToggle = () => {
    setShowFilters(!showFilters);
  };

  return (
    <section className="p-4 relative">
      <div className="flex flex-col lg:flex-row lg:space-x-10">
        <div className="hidden lg:block lg:space-y-4">
          <div className="mb-4">
            <CompanyCard
              heading="Filter by company size"
              checkboxLabels={['All', 'Large', 'Small']}
            />
          </div>
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
            />
          </div>
          <div className="mb-4">
            <CompanyCard
              heading="Filter by experience"
              checkboxLabels={['All', 'Fresher', 'Experienced']}
            />
          </div>
          <div className="mb-4">
            <CompanyCard
              heading="Filter by job type"
              checkboxLabels={['All', 'Full-time', 'Internship']}
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
            />
          </div>
        </div>
        <div className="mt-4 lg:mt-0 lg:ml-10">
          <Jobs {...jobData} />
        </div>
      </div>

      {isClient && showFilters && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg w-full max-w-screen-lg mx-auto item-center">
            <div className="space-y-4">
              <div className="border-b border-gray-300 pb-4">
                <MobileCompany
                  heading="Filter by company size"
                  checkboxLabels={['All', 'Large', 'Small']}
                />
              </div>
              <div className="border-b border-gray-300 pb-4">
                <MobileCompany
                  heading="Filter by location"
                  checkboxLabels={[
                    'All',
                    'Banglore',
                    'Pune',
                    'Noida',
                    'Delhi',
                    'Gurugram',
                  ]}
                />
              </div>
              <div className="border-b border-gray-300 pb-4">
                <MobileCompany
                  heading="Filter by experience"
                  checkboxLabels={['All', 'Fresher', 'Experienced']}
                />
              </div>
              <div className="border-b border-gray-300 pb-4">
                <MobileCompany
                  heading="Filter by job type"
                  checkboxLabels={['All', 'Full-time', 'Internship']}
                />
              </div>
              <div className="border-b border-gray-300 pb-4">
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
                />
              </div>
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
                />
              </div>
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
