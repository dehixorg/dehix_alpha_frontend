'use client';

import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import Link from 'next/link';

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
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { StatusEnum } from '@/utils/freelancer/enum';
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectValue,
  SelectContent,
} from '@/components/ui/select';

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
    // Ensure a skill is selected
    if (!data.skillId || !data.label) {
      notifyError('Please select a skill', 'Error');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(`/freelancer/dehix-talent`, {
        talentId: data.skillId,
        talentName: data.label,
        experience: data.experience,
        monthlyPay: data.monthlyPay,
        activeStatus: data.activeStatus,
        status: data.status,
        type: 'SKILL',
      });
      reset();
      setOpen(false);
      notifySuccess('The Talent has been successfully added.', 'Talent Added');
      onSuccess();
    } catch (error) {
      console.error(error);
      notifyError('Failed to add skill. Please try again.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Add Skill
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Skill</DialogTitle>
          <DialogDescription>
            Select a skill, enter your experience and monthly pay.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <Controller
              control={control}
              name="label"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(selectedLabel) => {
                    const selectedSkill = skills.find(
                      (skill) => skill.label === selectedLabel,
                    );
                    field.onChange(selectedLabel);
                    setValue('skillId', selectedSkill?._id || '');
                    setValue('label', selectedLabel);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {skills.length > 0 ? (
                      skills.map((skill) => (
                        <SelectItem key={skill._id} value={skill.label}>
                          {skill.label}
                        </SelectItem>
                      ))
                    ) : (
                      <Link href="/freelancer/settings/personal-info">
                        <p className="p-4 flex justify-center items-center">
                          No skills to add -{' '}
                          <span className="text-blue-500 ml-2">
                            Add some
                          </span>{' '}
                        </p>
                      </Link>
                    )}
                  </SelectContent>
                </Select>
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
