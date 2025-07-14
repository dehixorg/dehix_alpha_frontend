import React from 'react';
import { X } from 'lucide-react';

import { AddButton } from '@/components/ui/AddButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface ProjectInfo {
  title: string;
  description: string;
}

interface GeneralInfoProps {
  projectData: ProjectInfo[];
  setProjectData: React.Dispatch<React.SetStateAction<ProjectInfo[]>>;
}

export const GeneralInfo: React.FC<GeneralInfoProps> = ({
  projectData,
  setProjectData,
}) => {
  const handleInputChange = (
    index: number,
    field: keyof ProjectInfo,
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
      <div className="space-y-1.5 ml-5 mb-5">
        <h2 className="text-2xl">Project Info</h2>
        <p className="text-sm text-gray-500">
          This will not appear on your resume.
        </p>
      </div>

      <form className="space-y-5">
        {projectData.map((project, index) => (
          <div key={index} className="relative space-y-4 p-6 shadow-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold">Project {index + 1}</h3>
              {index > 0 && (
                <Button
                  variant="outline"
                  onClick={() => handleRemoveProject(index)}
                  className="p-1 rounded-full"
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
                onChange={(e) =>
                  handleInputChange(index, 'title', e.target.value)
                }
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
                onChange={(e) =>
                  handleInputChange(index, 'description', e.target.value)
                }
                placeholder="A project for learning purposes"
                className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
          </div>
        ))}
      </form>

      <AddButton onClick={handleAddProject} />
    </div>
  );
};
