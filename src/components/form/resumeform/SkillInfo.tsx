import React, { useEffect, useMemo, useState } from 'react';
import { Award } from 'lucide-react';

import SelectTagPicker from '@/components/shared/SelectTagPicker';
import { axiosInstance } from '@/lib/axiosinstance';

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
  const [options, setOptions] = useState<any[]>([]);

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
    const changeEvt = {
      target: { value },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    const emptyIndex = (skillData || []).findIndex((s) => !s.skillName);
    if (emptyIndex >= 0) {
      onSkillChange(changeEvt, emptyIndex);
      return;
    }
    const evt = new MouseEvent('click') as unknown as React.MouseEvent;
    onAddSkill(evt);
    // Defer to allow parent state to append the new row
    setTimeout(() => {
      const newIndex = (skillData || []).length; // new row appended at previous length index
      onSkillChange(changeEvt, newIndex);
    }, 0);
  };

  const handleRemoveByName = (name: string) => {
    const idx = (skillData || []).findIndex((s) => s.skillName === name);
    if (idx >= 0) {
      const evt = new MouseEvent('click') as unknown as React.MouseEvent;
      onRemoveSkill(evt, idx);
    }
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
