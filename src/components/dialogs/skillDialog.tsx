// SkillDialog.tsx
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Dialog,
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

interface SkillFormData {
  name: string;
  experience: number;
  level: string;
}

interface SkillDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SkillFormData) => Promise<void>;
  skillOptions: Array<{ label: string }>;
  levels: string[];
  defaultValues?: SkillFormData;
  loading: boolean;
}

const SkillSchema = z.object({
  name: z.string().min(1, 'Skill is required'),
  experience: z.preprocess(
    (val) => parseFloat(val as string),
    z
      .number()
      .min(0, 'Experience must be a non-negative number')
      .max(50, "Experience can't exceed 50"),
  ),
  level: z.string().min(1, 'Level is required'),
});

const SkillDialog: React.FC<SkillDialogProps> = ({
  open,
  onClose,
  onSubmit,
  skillOptions,
  levels,
  defaultValues,
  loading,
}) => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<SkillFormData>({
    resolver: zodResolver(SkillSchema),
    defaultValues,
  });

  const handleFormSubmit = (data: SkillFormData) => {
    onSubmit(data);
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {defaultValues ? 'Edit Skill' : 'Add Skill'}
          </DialogTitle>
          <DialogDescription>
            Select a skill and provide your experience and level.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-4">
            {/* Name Field */}
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {skillOptions.map((skill, idx) => (
                        <SelectItem key={idx} value={skill.label}>
                          {skill.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.name && (
                    <p className="text-red-500 text-sm">
                      {errors.name.message}
                    </p>
                  )}
                </>
              )}
            />

            {/* Experience Field */}
            <Controller
              control={control}
              name="experience"
              render={({ field }) => (
                <>
                  <Input
                    {...field}
                    placeholder="Years of experience"
                    type="number"
                    min="0"
                  />
                  {errors.experience && (
                    <p className="text-red-500 text-sm">
                      {errors.experience.message}
                    </p>
                  )}
                </>
              )}
            />

            {/* Level Field */}
            <Controller
              control={control}
              name="level"
              render={({ field }) => (
                <>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((level, idx) => (
                        <SelectItem key={idx} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.level && (
                    <p className="text-red-500 text-sm">
                      {errors.level.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>
          <DialogFooter>
            <Button className="mt-3" type="submit" disabled={loading}>
              {defaultValues ? 'Update' : 'Add'} Skill
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SkillDialog;
