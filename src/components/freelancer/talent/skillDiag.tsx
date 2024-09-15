import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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
import { axiosInstance } from '@/lib/axiosinstance';
import { toast } from '@/components/ui/use-toast';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';

interface Skill {
  label: string;
}

interface SkillDomainData {
  label: string;
  experience: string;
  monthlyPay: string;
  show: boolean;
  status: string;
}

// Define the props for the SkillDialog component
interface SkillDialogProps {
  skills: Skill[];
  onSubmitSkill: (data: SkillDomainData) => void; // Use SkillDomainData type
}

const skillSchema = z.object({
  label: z.string().nonempty('Please select a skill'),
  experience: z
    .string()
    .nonempty('Please enter your experience')
    .regex(/^\d+$/, 'Experience must be a number'),
  monthlyPay: z
    .string()
    .nonempty('Please enter your monthly pay')
    .regex(/^\d+$/, 'Monthly pay must be a number'),
});

const SkillDialog: React.FC<SkillDialogProps> = ({ skills, onSubmitSkill }) => {
  const user = useSelector((state: RootState) => state.user);
  const [open, setOpen] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SkillDomainData>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      label: '',
      experience: '',
      monthlyPay: '',
      show: false,
      status: 'pending',
    },
  });

  const onSubmit = async (data: SkillDomainData) => {
    try {
      const response = await axiosInstance.post(`/freelancer/${user.uid}/dehix-talent`, {
        skillName: data.label,
        experience: data.experience,
        monthlyPay: data.monthlyPay,
        activeStatus: data.show,
        status: data.status,
      });
      
      if (response.status === 200) {
        console.log('API Response:', response.data);
        onSubmitSkill(data);
        reset();
        setOpen(false); // Close the dialog after successful submission
        toast({
          title: 'Talent Added',
          description: 'The Talent has been successfully added.',
        });
      }
    } catch (error) {
      console.error('Error submitting skill data', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add talent. Please try again.',
      });
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
                <Select {...field} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {skills.map((skill: Skill) => (
                      <SelectItem key={skill.label} value={skill.label}>
                        {skill.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {errors.label && <p className="text-red-600">{errors.label.message}</p>}
          <div className="mb-3">
            <Controller
              control={control}
              name="experience"
              render={({ field }) => (
                <input
                  type="number"
                  placeholder="Experience (years)"
                  {...field}
                  className="border p-2 rounded mt-2 w-full"
                />
              )}
            />
          </div>
          {errors.experience && <p className="text-red-600">{errors.experience.message}</p>}
          <Controller
            control={control}
            name="monthlyPay"
            render={({ field }) => (
              <input
                type="number"
                placeholder="Monthly Pay"
                {...field}
                className="border p-2 rounded mt-2 w-full"
              />
            )}
          />
          {errors.monthlyPay && <p className="text-red-600">{errors.monthlyPay.message}</p>}
          <DialogFooter className="mt-3">
            <Button className="w-full" type="submit">
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SkillDialog;
