import React from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MarketHeaderProps {
  projects: any[];
  selectedProject: string | null;
  onProjectChange: (projectId: string) => void;
}

const MarketHeader: React.FC<MarketHeaderProps> = ({
  projects,
  selectedProject,
  onProjectChange,
}) => {
  return (
    <div className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <h1 className="text-2xl font-bold mb-1">Talent Market</h1>
        <p className="text-muted-foreground">
          Find and invite talented freelancers for your projects
        </p>
      </div>

      <div className="mt-4 md:mt-0 w-full md:w-auto">
        <Select value={selectedProject || ''} onValueChange={onProjectChange}>
          <SelectTrigger className="w-full md:w-[250px]">
            <SelectValue placeholder="Select a project to invite to" />
          </SelectTrigger>
          <SelectContent>
            {projects.length > 0 ? (
              projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.title || `Project #${project.id}`}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-projects" disabled>
                No projects available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default MarketHeader;
