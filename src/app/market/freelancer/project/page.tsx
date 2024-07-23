// src/pages/ProjectPage.tsx

import React from 'react';

import ProjectComponent from '@/components/marketComponents/projectComponents/project-comp';
import ProjectSidebar from '@/components/marketComponents/sidebar-projectComponents/sidebar';
import OtherBits from '@/components/marketComponents/sidebar-projectComponents/otherBids/other-bids';
import dummyData from '@/dummydata.json';

const ProjectPage: React.FC = () => {
  const project = dummyData.marketFreelancerProject;
  const users = dummyData.marketFreelancerProjectOtherBits;

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row">
      <div className="flex-1 mr-4 mb-4 md:mb-0">
        <ProjectComponent
          project_name={project.project_name}
          project_id={project.project_id}
          location={project.location}
          description={project.description}
          email={project.email}
          company_name={project.company_name}
          start={new Date(project.start)}
          end={new Date(project.end)}
          skills_required={project.skills_required}
          experience={project.experience}
          role={project.role}
          project_type={project.project_type}
        />
      </div>
      <div className="w-full md:w-[400px] px-5 md:p-2 lg:p-6">
        <ProjectSidebar />
        <div className="mt-10 ml-5">
          <a
            href="link"
            className="text-white hover:text-blue-500 hover:bg-transparent"
          >
            Request for more connect
          </a>
        </div>

        <div className="mt-10">
          <OtherBits usernames={users} />
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
