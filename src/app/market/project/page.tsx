// src/pages/ProjectPage.tsx

import React from 'react';

import ProjectComponent from '@/components/marketComponents/projectComponents/project-comp';
import ProjectSidebar from '@/components/marketComponents/sidebar-projectComponents/sidebar';
import OtherBits from '@/components/marketComponents/sidebar-projectComponents/otherBids/other-bids';

const ProjectPage: React.FC = () => {
  const project = {
    project_name: 'AI Development Project',
    project_id: '#12345',
    location: 'Delhi,India',
    description: `
      We're looking for an experienced web developer who's really good at making interactive forms. The perfect candidate should know a lot about web development and have a bunch of cool forms they've made before. Your main job will be making forms that people can use easily and that look nice.
    `,
    email: 'contact@aiproject.com',
    company_name: 'Tech Innovators Inc.',
    start: new Date('2023-01-01'),
    end: new Date('2023-12-31'),
    skills_required: ['JavaScript', 'React', 'Python', 'Machine Learning'],
    experience: '2+ years of experience in AI development.',
    role: 'Lead Developer',
    project_type: 'Full-time',
  };
  const usernames = [
    { username: 'Alex004', bitAmount: 100 },
    { username: 'User2', bitAmount: 150 },
    { username: 'alen789', bitAmount: 200 },
  ];

  return (
    <div className="container mx-auto p-4 flex">
      <div className="flex-1 mr-4">
        <ProjectComponent {...project} />
      </div>
      <div className="w-[400px]">
        <ProjectSidebar />
        <div className="mt-10 ml-5">
          <a
            href="link"
            className="text-white  hover:text-blue-500 hover:bg-transparent"
          >
            Request for more connect
          </a>
        </div>

        <div className="mt-10">
          <OtherBits usernames={usernames} />
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
