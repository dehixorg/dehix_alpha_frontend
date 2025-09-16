import React from 'react';
import { X } from 'lucide-react';

import { AddButton } from '@/components/ui/AddButton';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Project {
  title: string;
  description: string;
}

interface ProjectInfoProps {
  projectData: Project[];
  setProjectData: React.Dispatch<React.SetStateAction<Project[]>>;
}

export const ProjectInfo: React.FC<ProjectInfoProps> = ({
  projectData,
  setProjectData,
}) => {
  const handleInputChange = (
    index: number,
    field: keyof Project,
    value: string,
  ) => {
    const updatedProjects = [...projectData];
    updatedProjects[index] = { ...updatedProjects[index], [field]: value };
    setProjectData(updatedProjects);
  };

  const handleAddProject = () => {
    setProjectData([...projectData, { title: '', description: '' }]);
  };

  const handleRemoveProject = (index: number) => {
    const updatedProjects = projectData.filter((_, i) => i !== index);
    setProjectData(updatedProjects);
  };

  return (
    <div>
      <div className={cn('space-y-1.5 mb-5 ml-5')}>
        <h2 className={cn('text-2xl')}>Projects</h2>
        <p className={cn('text-sm text-gray-500')}>
          Add details about your projects (title and description).
        </p>
      </div>

      <form className={cn('space-y-5')}>
        {projectData.map((project, index) => (
          <div key={index} className={cn('relative space-y-4 p-6 shadow-lg')}>
            <div className={cn('flex justify-between items-center')}>
              <h3 className={cn('text-sm font-semibold')}>
                Project {index + 1}
              </h3>
              {index > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleRemoveProject(index)}
                  className={cn('p-1 rounded-full')}
                >
                  <X className={cn('h-5 w-5 text-red-500')} />
                </Button>
              )}
            </div>

            <div>
              <Label htmlFor={`title-${index}`}>Project Title</Label>
              <Input
                id={`title-${index}`}
                type="text"
                value={project.title}
                onChange={(e) =>
                  handleInputChange(index, 'title', e.target.value)
                }
                placeholder="e.g., AI Resume Builder"
                className={cn(
                  'block w-full border-gray-300 rounded-md shadow-sm sm:text-sm',
                )}
              />
            </div>

            <div>
              <Label htmlFor={`description-${index}`}>Description</Label>
              <Input
                id={`description-${index}`}
                type="text"
                value={project.description}
                onChange={(e) =>
                  handleInputChange(index, 'description', e.target.value)
                }
                placeholder="e.g., Built a resume generator using GPT and Next.js"
                className={cn(
                  'block w-full border-gray-300 rounded-md shadow-sm sm:text-sm',
                )}
              />
            </div>
          </div>
        ))}
      </form>

      <AddButton onClick={handleAddProject} />
    </div>
  );
};
