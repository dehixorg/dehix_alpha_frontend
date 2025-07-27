import React from 'react';
import { PlusCircle, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


interface Skill {
  skillName: string;
}

interface SkillInfoProps {
  skillData: Skill[];
  onAddSkill: (e: React.MouseEvent) => void;
  onRemoveSkill: (e: React.MouseEvent, index: number) => void;
  onSkillChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => void;
  projectData?: { title: string; description: string }[];
}

export const SkillInfo: React.FC<SkillInfoProps> = ({
  skillData,
  onAddSkill,
  onRemoveSkill,
  onSkillChange,
}) => {
  return (
    <div>
      <div className="space-y-1.5 ml-5 mb-5">
        <h2 className="text-2xl">Skills</h2>
        <p className="text-sm text-gray-500">What are you good at?</p>
      </div>

      <div className="space-y-5 mt-5">
        {skillData.map((skill, index) => (
          <div key={index} className="relative space-y-4 p-6 shadow-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold">Skill {index + 1}</h3>
              {index > 0 && (
                <Button
                  variant="outline"
                  onClick={(e) => onRemoveSkill(e, index)}
                  className="p-1 rounded-full"
                  type="button"
                >
                  <X className="h-5 w-5 text-red-500" />
                </Button>
              )}
            </div>
            <div>
              <Label
                htmlFor={`skillName-${index}`}
                className="block text-sm font-medium text-gray-500"
              >
                Skill Name
              </Label>
              <Input
                id={`skillName-${index}`}
                type="text"
                value={skill.skillName}
                onChange={(e) => onSkillChange(e, index)}
                placeholder="e.g., React.js, Node.js, graphic design"
                className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-4">
        <Button
          onClick={onAddSkill}
          className="text-center justify-items-center dark:text-black light:bg-black"
          type="button"
        >
          <PlusCircle />
        </Button>
      </div>
    </div>
  );
};
