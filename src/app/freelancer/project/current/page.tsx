'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Users,
  MapPin,
  CheckCircle,
  Clock,
  Building2,
} from 'lucide-react';

// Enums
enum StatusEnum {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Interfaces
interface TotalNeedOfFreelancer {
  category?: string;
  needOfFreelancer?: number;
  appliedCandidates?: string[];
  rejected?: string[];
  accepted?: string[];
  status?: string;
}

interface Project {
  _id: string;
  projectName: string;
  description: string;
  email: string;
  verified?: any;
  isVerified?: string;
  companyName: string;
  start?: Date | string;
  end?: Date | string;
  skillsRequired: string[];
  experience?: string;
  role: string;
  projectType: string;
  totalNeedOfFreelancer?: TotalNeedOfFreelancer[];
  status?: StatusEnum;
  team?: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface ProjectCardProps {
  project: Project;
  type: string;
  onCompleteProject: (projectId: string) => Promise<void>;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  type,
  onCompleteProject,
}) => {
  const [isCompleting, setIsCompleting] = useState<boolean>(false);

  const handleCompleteProject = async (): Promise<void> => {
    setIsCompleting(true);
    try {
      await onCompleteProject(project._id);
    } catch (error) {
      console.error('Error completing project:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status?: StatusEnum | string): string => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-900/30 text-green-300 border-green-800/30';
      case 'pending':
        return 'bg-yellow-900/30 text-yellow-300 border-yellow-800/30';
      case 'completed':
        return 'bg-blue-900/30 text-blue-300 border-blue-800/30';
      case 'cancelled':
        return 'bg-red-900/30 text-red-300 border-red-800/30';
      default:
        return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  };

  const isProjectCompleted = (): boolean => {
    return project.status?.toLowerCase() === 'completed';
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-lg hover:shadow-gray-800/20 transition-all duration-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-white line-clamp-2">
          {project.projectName}
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}
        >
          {project.status || 'Active'}
        </span>
      </div>

      {/* Company and Role */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-300">
          <Building2 className="w-4 h-4 mr-2 text-gray-500" />
          <span className="font-medium">{project.companyName}</span>
        </div>
        <div className="flex items-center text-sm text-gray-300">
          <Users className="w-4 h-4 mr-2 text-gray-500" />
          <span>{project.role}</span>
        </div>
      </div>

      {/* Skills Required */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {project.skillsRequired
            ?.slice(0, 4)
            .map((skill: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-900/30 text-blue-300 border border-blue-800/30 rounded-full text-xs font-medium"
              >
                {skill}
              </span>
            ))}
          {project.skillsRequired?.length > 4 && (
            <span className="px-2 py-1 bg-gray-800 text-gray-400 border border-gray-700 rounded-full text-xs">
              +{project.skillsRequired.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-400 mb-4 line-clamp-3">
        {project.description}
      </p>

      {/* Project Details */}
      <div className="space-y-2 mb-4 text-sm text-gray-400">
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2 text-gray-500" />
          <span>Type: {project.projectType}</span>
        </div>
        {project.start && (
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
            <span>Started: {formatDate(project.start)}</span>
          </div>
        )}
        {project.end && (
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
            <span>Deadline: {formatDate(project.end)}</span>
          </div>
        )}
        {project.experience && (
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2 text-gray-500" />
            <span>Experience: {project.experience}</span>
          </div>
        )}
      </div>

      {/* Team Information */}
      {project.team && project.team.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center text-sm text-gray-400">
            <Users className="w-4 h-4 mr-2 text-gray-500" />
            <span>
              Team: {project.team.length} member
              {project.team.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-500">
          Created: {formatDate(project.createdAt)}
        </div>

        {/* Complete Project Button */}
        <button
          onClick={handleCompleteProject}
          disabled={isCompleting || isProjectCompleted()}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${
              isProjectCompleted()
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : isCompleting
                  ? 'bg-green-900/30 text-green-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-500 active:bg-green-700'
            }
          `}
        >
          <CheckCircle className="w-4 h-4" />
          {isCompleting
            ? 'Completing...'
            : isProjectCompleted()
              ? 'Completed'
              : 'Complete Project'}
        </button>
      </div>
    </div>
  );
};

// Demo component showing usage
interface DemoState {
  projects: Project[];
}

const ProjectCardDemo: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([
    {
      _id: '1',
      projectName: 'E-commerce Website Development',
      description:
        'Build a modern, responsive e-commerce website with payment integration, user authentication, and admin dashboard. The project requires expertise in React, Node.js, and MongoDB.',
      email: 'client@example.com',
      companyName: 'TechStart Inc.',
      start: new Date('2024-01-15'),
      end: new Date('2024-04-15'),
      skillsRequired: [
        'React',
        'Node.js',
        'MongoDB',
        'Payment Gateway',
        'REST API',
      ],
      experience: 'Mid-level',
      role: 'Full Stack Developer',
      projectType: 'Web Development',
      status: StatusEnum.ACTIVE,
      team: ['dev1', 'dev2'],
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
    },
    {
      _id: '2',
      projectName: 'Mobile App UI/UX Design',
      description:
        'Design a modern and intuitive mobile application interface for a fitness tracking app. Includes wireframes, prototypes, and final designs.',
      email: 'design@example.com',
      companyName: 'FitLife Studios',
      start: new Date('2024-02-01'),
      end: new Date('2024-03-15'),
      skillsRequired: ['Figma', 'UI/UX Design', 'Prototyping', 'Mobile Design'],
      experience: 'Senior',
      role: 'UI/UX Designer',
      projectType: 'Design',
      status: StatusEnum.ACTIVE,
      team: ['designer1'],
      createdAt: new Date('2024-01-25'),
      updatedAt: new Date('2024-01-25'),
    },
    {
      _id: '3',
      projectName: 'Data Analysis Dashboard',
      description:
        'Create an analytics dashboard for business intelligence. Already completed and delivered to client.',
      email: 'analytics@example.com',
      companyName: 'DataViz Corp',
      start: new Date('2023-12-01'),
      end: new Date('2024-01-30'),
      skillsRequired: ['Python', 'Pandas', 'Plotly', 'Dashboard'],
      experience: 'Expert',
      role: 'Data Analyst',
      projectType: 'Data Analysis',
      status: StatusEnum.COMPLETED,
      team: ['analyst1'],
      createdAt: new Date('2023-11-25'),
      updatedAt: new Date('2024-01-30'),
    },
  ]);

  const handleCompleteProject = async (projectId: string): Promise<void> => {
    // Simulate API call
    await new Promise<void>((resolve) => setTimeout(resolve, 1500));

    // Update project status
    setProjects((prevProjects: Project[]) =>
      prevProjects.map((project: Project) =>
        project._id === projectId
          ? { ...project, status: StatusEnum.COMPLETED, updatedAt: new Date() }
          : project,
      ),
    );

    console.log(`Project ${projectId} completed successfully!`);
  };

  return (
    <div className="p-8 bg-gray-950 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Current Projects</h1>
        <p className="text-gray-400">
          Browse and manage your active freelance projects
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project: Project) => (
          <ProjectCard
            key={project._id}
            project={project}
            type="freelancer"
            onCompleteProject={handleCompleteProject}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectCardDemo;
