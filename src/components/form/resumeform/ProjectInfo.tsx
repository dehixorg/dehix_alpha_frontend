import React from 'react';
import { Code2, X, FileText } from 'lucide-react';

import { AddButton } from '@/components/ui/AddButton';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import {
  InputGroup,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';

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
      <div className={cn('mb-5')}>
        <div className="rounded-xl border bg-gradient p-4 sm:p-5 flex items-start gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 my-auto">
            <Code2 className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">Projects</h2>
            <p className="text-sm text-muted-foreground">
              Add details about your projects.
            </p>
          </div>
        </div>
      </div>

      <form className={cn('space-y-5')}>
        {projectData.map((project, index) => (
          <Card key={index} className={cn('relative')}>
            <CardHeader className={cn('pb-2')}>
              <div className={cn('flex justify-between items-center')}>
                <CardDescription>
                  Project title and short description.
                </CardDescription>
                {index > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleRemoveProject(index)}
                    className={cn('rounded-full')}
                    size="icon"
                    aria-label="Remove project"
                  >
                    <X className={cn('h-5 w-5 text-red-500')} />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className={cn('space-y-4')}>
              <div>
                <Label htmlFor={`title-${index}`}>Project Title</Label>
                <InputGroup>
                  <InputGroupText>
                    <Code2 className="h-4 w-4" />
                  </InputGroupText>
                  <InputGroupInput
                    id={`title-${index}`}
                    type="text"
                    value={project.title}
                    onChange={(e) =>
                      handleInputChange(index, 'title', e.target.value)
                    }
                    placeholder="e.g., AI Resume Builder"
                  />
                </InputGroup>
              </div>
              <div>
                <Label htmlFor={`description-${index}`}>Description</Label>
                <InputGroup>
                  <InputGroupText>
                    <FileText className="h-4 w-4" />
                  </InputGroupText>
                  <InputGroupInput
                    id={`description-${index}`}
                    type="text"
                    value={project.description}
                    onChange={(e) =>
                      handleInputChange(index, 'description', e.target.value)
                    }
                    placeholder="e.g., Built a resume generator using GPT and Next.js"
                  />
                </InputGroup>
              </div>
            </CardContent>
          </Card>
        ))}
      </form>

      <AddButton onClick={handleAddProject} />
    </div>
  );
};
