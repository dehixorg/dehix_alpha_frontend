import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, X, CheckCircle } from 'lucide-react';

interface Skill {
  skillName: string;
}

interface SkillInfoProps {
  skillData: Skill[];
  setSkillData: React.Dispatch<React.SetStateAction<Skill[]>>;
}

export const SkillInfo: React.FC<SkillInfoProps> = ({
  skillData,
  setSkillData,
}) => {
  const handleSkillChange = (index: number, value: string) => {
    const updatedSkills = [...skillData];
    updatedSkills[index] = { skillName: value };
    setSkillData(updatedSkills);
  };

  const handleAddSkill = () => {
    setSkillData([...skillData, { skillName: '' }]);
  };

  const handleRemoveSkill = (index: number) => {
    const updatedSkills = skillData.filter((_, i) => i !== index);
    setSkillData(updatedSkills);
  };

  return (
    <div>
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl">Skills</h2>
        <p className="text-sm text-gray-500">What are you good at?</p>
      </div>

      <form className="space-y-5">
        {skillData.map((skill, index) => (
          <div
            key={index}
            className="relative space-y-4 p-6 shadow-lg border rounded-lg"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold">Skill {index + 1}</h3>
              {index > 0 && (
                <Button
                  variant="outline"
                  onClick={() => handleRemoveSkill(index)}
                  className="p-1 rounded-full"
                >
                  <X className="h-5 w-5 text-red-500" />
                </Button>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Skill Name
              </label>
              <Input
                type="text"
                value={skill.skillName}
                onChange={(e) => handleSkillChange(index, e.target.value)}
                placeholder="e.g., React.js, Node.js, graphic design"
                className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
          </div>
        ))}
      </form>

      <div className="flex justify-center mt-4">
        <Button
          onClick={handleAddSkill}
          className="text-center justify-items-center text-white bg-gray hover:bg-gray-700"
        >
          <PlusCircle />
        </Button>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold">Skills Preview:</h3>
        <ul className="list-disc list-inside mt-2 text-gray-700">
          {skillData.map((skill, index) => (
            <li key={index}>{skill.skillName || 'No Skill Entered'}</li>
          ))}
        </ul>
      </div>

      <div className="flex justify-center mt-4">
        <Button className="text-center justify-items-center bg-green-500 hover:bg-green-600 text-white">
          <CheckCircle />
        </Button>
      </div>
    </div>
  );
};

export default SkillInfo;
