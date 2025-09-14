// src/components/ProjectComponent.tsx

import React from 'react';
import { MapPinned } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ProjectProps {
  project_name: string;
  project_id: string;
  location?: string;
  description: string;
  email: string;
  company_name: string;
  start?: string | Date;
  end?: string | Date;
  skills_required: string[];
  experience?: string;
  role: string;
  project_type: string;
}

const formatDate = (date?: string | Date) => {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
};

const ProjectComponent: React.FC<ProjectProps> = ({
  project_name,
  project_id,
  location,
  description,
  email,
  company_name,
  start,
  end,
  skills_required,
  experience,
  role,
  project_type,
}) => {
  return (
    <div className="p-4 shadow-md">
      <div className="max-w-4xl ml-20 mb-5">
        <h1 className="sm:text-5xl md:text-6xl">{company_name}</h1>
      </div>

      <div className="max-w-4xl mb-2 flex">
        <div className="max-w-4xl ml-20 mb-2 flex">
          <MapPinned color="grey" size={20} className="mr-3" />
          <p className="text-gray-400">{location || 'N/A'}</p>
        </div>
        <div className="ml-20">
          <p className="text-gray-400">
            <strong>Id: </strong> {project_id}
          </p>
        </div>
      </div>

      <div className="mb-4 max-w-4xl">
        <Separator className="bg-white" />
      </div>

      <div className="max-w-3xl ml-20">
        <div className="mb-4">
          <p className="font-bold">
            <strong>Project Name:</strong> {project_name}
          </p>
        </div>

        <p className="text-sm text-gray-400">
          <strong>Description:</strong> {description || 'N/A'}
        </p>

        <div className="mb-2">
          <p className="text-sm font-bold">
            <strong>Role:</strong> {role || 'N/A'}
          </p>
        </div>

        <div className="mb-2">
          <p className="text-sm text-gray-400">
            <strong>Project Type:</strong> {project_type || 'N/A'}
          </p>
        </div>

        <div className="mb-2">
          <p className="text-sm text-gray-400">
            <strong>Start Date:</strong> {formatDate(start)}
          </p>
        </div>

        <div className="mb-2">
          <p className="text-sm text-gray-400">
            <strong>End Date:</strong> {formatDate(end)}
          </p>
        </div>

        <div className="mb-2">
          <p className="text-sm font-bold">
            <strong>Skills Required:</strong>{' '}
            {skills_required.length > 0 ? skills_required.join(', ') : 'N/A'}
          </p>
        </div>

        <div className="mb-2">
          <p className="text-sm text-gray-400">
            <strong>Experience:</strong> {experience || 'N/A'}
          </p>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-400">
            <strong>Email:</strong> {email || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectComponent;
