'use client';

import type React from 'react';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectValue,
  SelectContent,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { axiosInstance } from '@/lib/axiosinstance';
import { toast } from '@/components/ui/use-toast';
import { StatusEnum } from '@/utils/freelancer/enum';

interface Skill {
  _id: string;
  name: string;
}

interface SkillDomainData {
  uid: string;
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
  onSubmitSkill: (data: SkillDomainData) => boolean;
  setSkills: any;
}

const skillSchema = z.object({
  skillId: z.string(),
  label: z.string().nonempty('Please select a skill'),
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

const SkillDialog: React.FC<SkillDialogProps> = ({ skills, onSubmitSkill }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
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
    setLoading(true);

    // Check for duplicate before making API call
    const isUnique = onSubmitSkill({
      ...data,
      uid: '', // Will be set after API call
      type: 'SKILL',
    });

    if (!isUnique) {
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post(`/freelancer/dehix-talent`, {
        talentId: data.skillId,
        talentName: data.label,
        experience: data.experience,
        monthlyPay: data.monthlyPay,
        activeStatus: data.activeStatus,
        status: data.status,
        type: 'SKILL',
      });

      if (response.status === 200) {
        reset();
        setOpen(false);
        toast({
          title: 'Talent Added',
          description: 'The Talent has been successfully added.',
        });
      }
    } catch (error) {
      console.error('Error submitting skill data', error);
      reset();
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add talent. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
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
                      (skill) => skill.name === selectedLabel,
                    );
                    field.onChange(selectedLabel);
                    setValue('skillId', selectedSkill?._id || '');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {skills.length > 0 ? (
                      skills.map((skill: Skill) => (
                        <SelectItem key={skill._id} value={skill.name}>
                          {skill.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-4 flex justify-center items-center">
                        No skills to add -{' '}
                        <Link
                          href="/freelancer/settings/personal-info"
                          className="text-blue-500 ml-2"
                        >
                          Add some
                        </Link>
                      </div>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {errors.label && (
            <p className="text-red-600">{errors.label.message}</p>
          )}
          <div className="mb-3">
            <Controller
              control={control}
              name="experience"
              render={({ field }) => (
                <div className="col-span-3 relative">
                  <Input
                    type="number"
                    placeholder="Experience (years)"
                    min={0}
                    max={50}
                    step={0.1}
                    {...field}
                    className="mt-2 w-full"
                  />
                  <span className="absolute right-10 top-1/2 transform -translate-y-1/2 text-grey-500 pointer-events-none">
                    YEARS
                  </span>
                </div>
              )}
            />
          </div>
          {errors.experience && (
            <p className="text-red-600">{errors.experience.message}</p>
          )}
          <Controller
            control={control}
            name="monthlyPay"
            render={({ field }) => (
              <div className="col-span-3 relative">
                <Input
                  type="number"
                  placeholder="$ Monthly Pay"
                  min={0}
                  {...field}
                  className="mt-2 w-full"
                />
                <span className="absolute right-10 top-1/2 transform -translate-y-1/2 text-grey-500 pointer-events-none">
                  $
                </span>
              </div>
            )}
          />
          {errors.monthlyPay && (
            <p className="text-red-600">{errors.monthlyPay.message}</p>
          )}
          <DialogFooter className="mt-3">
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
