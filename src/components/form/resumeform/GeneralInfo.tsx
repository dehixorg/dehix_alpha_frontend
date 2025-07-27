import React from 'react';
import { PlusCircle, X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface ProjectInfo {
  title: string;
  description: string;
}

interface GeneralInfoProps {
  projectData: ProjectInfo[];
  onAddProject: (e: React.MouseEvent) => void;
  onRemoveProject: (e: React.MouseEvent, index: number) => void;
  onProjectChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    field: keyof ProjectInfo,
  ) => void;
}

export const GeneralInfo: React.FC<GeneralInfoProps> = ({
  projectData,
  onAddProject,
  onRemoveProject,
  onProjectChange,
}) => {
  return (
    <div>
      <div className="space-y-1.5 ml-5 mb-5">
        <h2 className="text-2xl">Project Info</h2>
        <p className="text-sm text-gray-500">
          This will not appear on your resume.
        </p>
      </div>

      <div className="space-y-5">
        {projectData.map((project, index) => (
          <div key={index} className="relative space-y-4 p-6 shadow-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold">Project {index + 1}</h3>
              {index > 0 && (
                <Button
                  variant="outline"
                  onClick={(e) => onRemoveProject(e, index)}
                  className="p-1 rounded-full"
                  type="button"
                >
                  <X className="h-5 w-5 text-red-500" />
                </Button>
              )}
            </div>

            <div>
              <Label htmlFor={`project-title-${index}`}>Project Name</Label>
              <Input
                id={`project-title-${index}`}
                name="title"
                value={project.title}
                onChange={(e) => onProjectChange(e, index, 'title')}
                placeholder="My cool project"
                className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>

            <div>
              <Label htmlFor={`project-description-${index}`}>
                Describe what this project is for.
              </Label>

              <Input
                id={`project-description-${index}`}
                name="description"
                value={project.description}
                onChange={(e) => onProjectChange(e, index, 'description')}
                placeholder="A project for learning purposes"
                className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-4">
        <Button
          onClick={onAddProject}
          className="text-center justify-items-center dark:text-black light:bg-black"
          type="button"
        >
          <PlusCircle />
        </Button>
      </div>
    </div>
  );
};
