'use client';

import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import SelectTagPicker from '@/components/shared/SelectTagPicker';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { StatusEnum } from '@/utils/freelancer/enum';

interface Skill {
  _id: string;
  label: string;
}

interface SkillDomainData {
  skillId: string;
  label: string;
  experience: string;
  monthlyPay: string;
  activeStatus: boolean;
  status: StatusEnum;
  type: string;
}

interface SkillDialogProps {
  skills: Skill[];
  onSuccess: () => void;
}

const skillSchema = z.object({
  skillId: z.string(),
  label: z.string().nonempty('Please select at least one skill'),
  experience: z
    .string()
    .nonempty('Please enter your experience')
    .regex(/^\d+$/, 'Experience must be a number'),
  monthlyPay: z
    .string()
    .nonempty('Please enter your monthly pay')
    .regex(/^\d+$/, 'Monthly pay must be a number'),
  activeStatus: z.boolean(),
  status: z.string(),
});

const SkillDialog: React.FC<SkillDialogProps> = ({ skills, onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SkillDomainData>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      skillId: '',
      label: '',
      experience: '',
      monthlyPay: '',
      activeStatus: false,
      status: StatusEnum.PENDING,
    },
  });

  const onSubmit = async (data: SkillDomainData) => {
    if (selectedSkills.length === 0) {
      notifyError('Please select at least one skill', 'Error');
      return;
    }

    setLoading(true);
    try {
      for (const skill of selectedSkills) {
        await axiosInstance.post(`/freelancer/dehix-talent`, {
          talentId: skill._id,
          talentName: skill.label,
          experience: data.experience,
          monthlyPay: data.monthlyPay,
          activeStatus: data.activeStatus,
          status: data.status,
          type: 'SKILL',
        });
      }
      reset();
      setSelectedSkills([]);
      setOpen(false);
      notifySuccess('Skills added successfully', 'Success');
      onSuccess();
    } catch (error) {
      console.error(error);
      notifyError('Failed to add skills. Please try again.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add Skill</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Skill</DialogTitle>
          <DialogDescription>
            Select skills, enter your experience and monthly pay.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <Controller
              control={control}
              name="label"
              render={({ field }) => (
                <SelectTagPicker
                  label="Skills"
                  options={skills.map((s) => ({ label: s.label, _id: s._id }))}
                  selected={selectedSkills.map((s) => ({ name: s.label }))}
                  onAdd={(val) => {
                    const skill = skills.find((s) => s.label === val);
                    if (
                      skill &&
                      !selectedSkills.find((s) => s._id === skill._id)
                    ) {
                      setSelectedSkills((prev) => [...prev, skill]);
                      setValue('label', val);
                    }
                  }}
                  onRemove={(val) => {
                    const skill = skills.find((s) => s.label === val);
                    if (skill) {
                      setSelectedSkills((prev) =>
                        prev.filter((s) => s._id !== skill._id),
                      );
                      if (selectedSkills.length === 1) setValue('label', '');
                    }
                  }}
                  className="w-full"
                  optionLabelKey="label"
                  selectedNameKey="name"
                  selectPlaceholder="Select skills"
                  searchPlaceholder="Search skills..."
                />
              )}
            />
            {errors.label && (
              <p className="text-red-600 text-sm mt-1">
                {errors.label.message}
              </p>
            )}
          </div>

          <div className="mb-3">
            <Controller
              control={control}
              name="experience"
              render={({ field }) => (
                <Input
                  type="number"
                  placeholder="Experience (years)"
                  min={0}
                  max={50}
                  step={0.1}
                  {...field}
                />
              )}
            />
            {errors.experience && (
              <p className="text-red-600">{errors.experience.message}</p>
            )}
          </div>

          <div className="mb-3">
            <Controller
              control={control}
              name="monthlyPay"
              render={({ field }) => (
                <Input
                  type="number"
                  placeholder="$ Monthly Pay"
                  min={0}
                  {...field}
                />
              )}
            />
            {errors.monthlyPay && (
              <p className="text-red-600">{errors.monthlyPay.message}</p>
            )}
          </div>

          <DialogFooter className="mt-8">
            <Button type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Submit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SkillDialog;
