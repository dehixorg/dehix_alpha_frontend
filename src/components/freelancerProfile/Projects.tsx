import React from 'react';
import {
  Calendar,
  Tag,
  Layers,
  ChevronDownCircle,
  ChevronUpCircle,
  LucideVerified,
} from 'lucide-react';
import { GitHubLogoIcon } from '@radix-ui/react-icons';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface ProjectsProps {
  projects: {
    _id: string;
    projectName: string;
    description: string;
    role: string;
    techUsed: string[];
    start: string;
    end: string;
    githubLink?: string;
    projectType: string;
    verified: boolean;
  }[];
  visibleProjects: number;
  setVisibleProjects: (count: number) => void;
  setDialog: (project: any) => void;
}

const Projects: React.FC<ProjectsProps> = ({
  projects,
  visibleProjects,
  setVisibleProjects,
  setDialog,
}) => {
  const projectsToShow = projects.slice(0, visibleProjects);

  const truncateDescription = (
    text: string,
    maxLength: number = 50,
  ): string => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + '...';
    }
    return text;
  };

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Projects</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectsToShow.map((project) => (
          <Card
            key={project._id}
            className="relative w-[92vw] md:w-auto rounded-2xl cursor-pointer p-6 shadow-lg"
            onClick={() => setDialog(project)}
          >
            <div className="flex justify-between items-center">
              <div className="flex justify-center items-center gap-2">
                <h3 className="text-xl font-semibold">
                  {truncateDescription(project.projectName, 20)}
                </h3>
                {project.verified && (
                  <LucideVerified className="text-green-600 flex items-center" />
                )}
              </div>
              <a href={project.githubLink} target="_blank" rel="noreferrer">
                <GitHubLogoIcon className="w-5 hover:text-gray-500 h-5" />
              </a>
            </div>

            <p className="text-sm mt-2">
              {truncateDescription(project.description, 40)}
            </p>

            <div className="flex items-center my-2 gap-2">
              {project.projectType && (
                <>
                  <Tag className="w-4 h-4" />
                  <Badge className="text-sm py-0 px-1 mt-2">
                    {project.projectType.toUpperCase()}
                  </Badge>
                </>
              )}
            </div>

            {project.techUsed && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 mt-4"
              >
                <Layers className="w-4 h-4" />
                <ScrollArea className="whitespace-nowrap overflow-x-auto">
                  <div className="flex items-center space-x-2 pb-3">
                    {project.techUsed.map((it, idx) => (
                      <Badge key={idx} className="text-sm mr-2 py-0 px-1">
                        {it.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                  <ScrollBar
                    orientation="horizontal"
                    className="cursor-pointer"
                  />
                </ScrollArea>
              </div>
            )}

            <p className="text-xs flex gap-2 items-center mt-2">
              <Calendar className="w-4 h-4" />{' '}
              {new Date(project.start).toLocaleDateString()}{' '}
              {'- ' + new Date(project.end).toLocaleDateString()}
            </p>
          </Card>
        ))}
      </div>

      {projects && (
        <div className="mt-4 pb-3 flex justify-start items-center gap-4">
          {visibleProjects < Object.keys(projects).length && (
            <button onClick={() => setVisibleProjects(visibleProjects + 3)}>
              <ChevronDownCircle className=" rounded-full" />
            </button>
          )}
          {visibleProjects > 3 && (
            <button onClick={() => setVisibleProjects(3)}>
              <ChevronUpCircle className=" rounded-full" />
            </button>
          )}
        </div>
      )}
    </section>
  );
};

export default Projects;
