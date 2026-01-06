import React, { useEffect, useMemo, useState } from 'react';
import { Award } from 'lucide-react';

import SelectTagPicker from '@/components/shared/SelectTagPicker';
import { axiosInstance } from '@/lib/axiosinstance';

interface Skill {
  skillName: string;
  _id?: string;
  name?: string;
  label?: string;
}

// SkillOption type is now defined inline in the state

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
  const [options, setOptions] = useState<
    Array<{ _id: string; name: string; label: string; skillName: string }>
  >([]);

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

  const selectedTags = useMemo(() => {
    return (skillData || [])
      .map((s) => {
        if (!s) return null;

        // If it's a string, it's just an ID
        if (typeof s === 'string') {
          // Try to find the full skill in options
          const found = options.find((opt) => opt._id === s);
          if (found) {
            return {
              name: found.name || found.skillName || s,
              id: found._id || s,
              label: found.label || found.name || found.skillName || s,
            };
          }
          return null; // Skip if we can't find the skill
        }

        // It's a skill object
        const name = s.name || s.skillName || '';
        const id = s._id || '';
        const label = s.label || name;

        // If we have an ID but no name, try to find the full skill in options
        if (id && !name) {
          const found = options.find((opt) => opt._id === id);
          if (found) {
            return {
              name: found.name || found.skillName || id,
              id,
              label: found.label || found.name || found.skillName || id,
            };
          }
        }

        return name
          ? {
              name,
              id: id || name,
              label: label || name,
            }
          : null;
      })
      .filter(Boolean) as { name: string; id: string; label: string }[];
  }, [skillData, options]);

  const handleAddByValue = (value: string) => {
    // Find the full skill object from options if it exists
    const skill = options.find(
      (opt) =>
        opt.name === value ||
        opt._id === value ||
        opt.label === value ||
        opt.skillName === value,
    );

    if (skill) {
      onAddSkill(
        JSON.stringify({
          _id: skill._id,
          name: skill.name || skill.skillName || skill.label,
          label: skill.label || skill.name || skill.skillName,
          skillName: skill.skillName || skill.name || skill.label,
        }),
      );
    } else {
      onAddSkill(
        JSON.stringify({
          name: value,
          label: value,
          skillName: value,
        }),
      );
    }
  };

  const handleRemoveByName = (name: string) => {
    const skill = skillData.find((s) => {
      if (!s) return false;
      return (
        s.name === name ||
        s.skillName === name ||
        s._id === name ||
        s.label === name
      );
    });

    if (skill) {
      onRemoveSkill(
        skill._id || skill.name || skill.skillName || skill.label || '',
      );
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
          options={options.map((opt) => ({
            ...opt,
            label: opt.label || opt.name || opt.skillName || opt._id,
            name: opt.name || opt.skillName || opt.label || opt._id,
          }))}
          selected={selectedTags}
          onAdd={handleAddByValue}
          onRemove={handleRemoveByName}
          optionLabelKey="label"
          selectedNameKey="name"
          selectPlaceholder="Select skill"
          searchPlaceholder="Search skills"
        />
      </div>
    </div>
  );
};
