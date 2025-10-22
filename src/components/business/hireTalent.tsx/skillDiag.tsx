import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSelector } from 'react-redux';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { RootState } from '@/lib/store';
import ConnectsDialog from '@/components/shared/ConnectsDialog';
import SelectTagPicker from '@/components/shared/SelectTagPicker'; // Import your picker
import { Input } from '@/components/ui/input';

interface Skill {
  _id: string;
  label: string;
}

interface SkillDomainData {
  uid: string;
  skillId: string;
  label: string;
  experience: string;
  description: string;
  visible: boolean;
  status: string;
}

interface SkillDialogProps {
  skills: Skill[];
  onSubmitSkill: (data: SkillDomainData) => void;
}

const skillSchema = z.object({
  label: z.string().nonempty('Please select a skill'),
  skillId: z.string().nonempty('Skill ID is required'),
  experience: z
    .string()
    .nonempty('Please enter your experience')
    .regex(/^\d+$/, 'Experience must be a number'),
  description: z.string().nonempty('Please enter description'),
  visible: z.boolean(),
  status: z.string(),
});

const SkillDialog: React.FC<SkillDialogProps> = ({ skills, onSubmitSkill }) => {
  const user = useSelector((state: RootState) => state.user);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<SkillDomainData>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      skillId: '',
      label: '',
      experience: '',
      description: '',
      visible: false,
      status: 'ADDED',
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues,
    trigger,
  } = form;

  const onSubmit = async (data: SkillDomainData) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(`/business/hire-dehixtalent`, {
        skillId: data.skillId,
        skillName: data.label,
        businessId: user.uid,
        experience: data.experience,
        description: data.description,
        status: data.status,
        visible: data.visible,
      });

      if (response.status === 200 && response.data?.data) {
        const newTalent = response.data.data;
        onSubmitSkill({ ...data, uid: newTalent._id });
        reset();
        setOpen(false);
        notifySuccess(
          'The Hire Talent has been successfully added.',
          'Talent Added',
        );
        // Server deducts connects; avoid client-side deduction to prevent double counting.
        // If you want immediate UI sync, refresh the user profile/connects from backend here.
      } else {
        throw new Error('Failed to add hire talent');
      }
    } catch (error) {
      console.error('Error submitting skill data', error);
      reset();
      notifyError('Failed to add hire talent. Please try again.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Skill
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Skill</DialogTitle>
          <DialogDescription>
            Select a skill, enter your experience and description.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Skill Selector */}
          <div className="mb-3">
            <Controller
              control={control}
              name="label"
              render={({ field }) => (
                <SelectTagPicker
                  label="Skills"
                  options={skills}
                  selected={field.value ? [{ name: field.value }] : []}
                  onAdd={(val) => {
                    field.onChange(val);
                    const selectedSkill = skills.find((s) => s.label === val);
                    setValue('skillId', selectedSkill?._id || '');
                  }}
                  onRemove={() => {
                    field.onChange('');
                    setValue('skillId', '');
                  }}
                  selectPlaceholder="Select skill"
                  searchPlaceholder="Search skill"
                />
              )}
            />
            {errors.label && (
              <p className="text-red-600">{errors.label.message}</p>
            )}
          </div>

          {/* Experience Input */}
          <div className="mb-3">
            <Controller
              control={control}
              name="experience"
              render={({ field }) => (
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="Experience (years)"
                    min={0}
                    max={50}
                    step={0.1}
                    {...field}
                    className="mt-0 w-full bg-muted/20 dark:bg-muted/20 border border-border"
                  />
                  <span className="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                    YEARS
                  </span>
                </div>
              )}
            />
            {errors.experience && (
              <p className="text-red-600">{errors.experience.message}</p>
            )}
          </div>

          {/* Description Input */}
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <Input
                type="text"
                placeholder="Description"
                {...field}
                className="mt-2 mb-4 w-full bg-muted/20 dark:bg-muted/20 border border-border"
              />
            )}
          />
          {errors.description && (
            <p className="text-red-600">{errors.description.message}</p>
          )}

          {/* ConnectsDialog */}
          <ConnectsDialog
            loading={loading}
            setLoading={setLoading}
            onSubmit={onSubmit}
            isValidCheck={trigger}
            userId={user.uid}
            buttonText="Submit"
            userType="BUSINESS"
            requiredConnects={parseInt(
              process.env.NEXT_PUBLIC__APP_HIRE_TALENT_COST || '0',
              10,
            )}
            data={getValues()}
            skipRedirect={true}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SkillDialog;
