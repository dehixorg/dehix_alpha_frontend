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
import SelectTagPicker from '@/components/shared/SelectTagPicker';
interface SkillFormData {
  name: string;
  experience: number;
  level: string;
}

interface SkillDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SkillFormData) => Promise<void>;
  skillOptions: Array<{ talentName: string }>;
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
                <SelectTagPicker
                  label="Skill"
                  options={skillOptions.map((s) => ({
                    label: s.talentName,
                    _id: s.talentName,
                  }))}
                  selected={field.value ? [{ name: field.value }] : []}
                  onAdd={(val) => field.onChange(val)}
                  onRemove={() => field.onChange('')}
                  className="w-full"
                  optionLabelKey="label"
                  selectedNameKey="name"
                  selectPlaceholder="Select a skill"
                  searchPlaceholder="Search skills..."
                />
              )}
            />
            {/* Experience Field */}
            <Controller
              control={control}
              name="experience"
              render={({ field }) => (
                <>
                  <div className="col-span-3 relative">
                    <Input
                      {...field}
                      placeholder="Years of experience"
                      type="number"
                      min="0"
                      step="0.1" // Allow decimals
                      className="w-full pl-2 pr-1" // Space for the unit
                    />
                    <span className="absolute right-8 top-1/2 transform -translate-y-1/2 text-grey-500 pointer-events-none">
                      YEARS
                    </span>
                  </div>
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
