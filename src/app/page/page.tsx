"use client"
import React from 'react';
import { ProjectSidebar } from '@/components/project-page/project-page'; // Adjust import path as per your project structure

const ProjectPage = () => {
  return (
    <div className="flex">
      <div className=" md:block md:w-80">
        <ProjectSidebar />
      </div>
    </div>
  );
};

export default ProjectPage;
