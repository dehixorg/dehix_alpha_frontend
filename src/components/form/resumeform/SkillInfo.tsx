import React, { useEffect, useMemo, useState } from 'react';
import { Award } from 'lucide-react';

import SelectTagPicker from '@/components/shared/SelectTagPicker';
import { axiosInstance } from '@/lib/axiosinstance';

interface Skill {
  skillName: string;
}

interface SkillInfoProps {
  skillData: Skill[];
  onAddSkill: (skillName: string) => void;
  onRemoveSkill: (skillName: string) => void;
  projectData?: { title: string; description: string }[];
}

export const SkillInfo: React.FC<SkillInfoProps> = ({
  skillData,
  onAddSkill,
  onRemoveSkill,
}) => {
  interface SkillOption {
    name: string;
    // Add other fields from API response
  }

  const [options, setOptions] = useState<SkillOption[]>([]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await axiosInstance.get('/skills');
        setOptions(res?.data?.data || []);
      } catch (e) {
        // silent fail; picker will just not show options
        setOptions([]);
      }
    };
    fetchSkills();
  }, []);

  const selectedTags = useMemo(
    () =>
      (skillData || [])
        .map((s) => ({ name: s.skillName }))
        .filter((s) => s.name),
    [skillData],
  );

  const handleAddByValue = (value: string) => {
    onAddSkill(value);
  };

  const handleRemoveByName = (name: string) => {
    onRemoveSkill(name);
  };

  return (
    <div>
      <div className="mb-5">
        <div className="rounded-xl border bg-gradient p-4 sm:p-5 flex items-start gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 my-auto">
            <Award className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">Skills</h2>
            <p className="text-sm text-muted-foreground">
              What are you good at?
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 mt-5">
        <SelectTagPicker
          label="Select skills"
          options={options}
          selected={selectedTags}
          onAdd={handleAddByValue}
          onRemove={handleRemoveByName}
          selectPlaceholder="Select skill"
          searchPlaceholder="Search skills"
        />
      </div>
    </div>
  );
};
