import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
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
import SelectTagPicker from '@/components/shared/SelectTagPicker';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

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
    .regex(/^\d+$/, 'Experience must be a number')
    .refine(
      (val) => parseInt(val) <= 40,
      'Maximum 40 years of experience allowed',
    ),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters'),
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

  const { control, handleSubmit, reset, setValue, getValues, trigger } = form;

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
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Skill
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl">Add New Skill</DialogTitle>
          <DialogDescription>
            Select a skill and provide details about your experience
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <CardContent className="p-0 space-y-4">
              {/* Skill Selection */}
              <FormField
                control={control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <SelectTagPicker
                        label="Skill"
                        options={skills}
                        selected={field.value ? [{ name: field.value }] : []}
                        onAdd={(val) => {
                          field.onChange(val);
                          const selectedSkill = skills.find(
                            (s) => s.label === val,
                          );
                          setValue('skillId', selectedSkill?._id || '');
                        }}
                        onRemove={() => {
                          field.onChange('');
                          setValue('skillId', '');
                        }}
                        selectPlaceholder="Select a skill"
                        searchPlaceholder="Search skills..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Experience */}
              <FormField
                control={control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience (Years)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="e.g. 5"
                          min={0}
                          max={40}
                          step={0.1}
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (
                              value === '' ||
                              (parseInt(value) <= 40 && parseInt(value) >= 0)
                            ) {
                              field.onChange(value);
                            }
                          }}
                          className="pl-3 pr-16"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-muted-foreground text-sm">
                            {field.value ? 'years' : ''}
                          </span>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your experience with this skill..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-between">
                      <FormMessage />
                      <span
                        className={`text-xs ${
                          field.value?.length > 500
                            ? 'text-destructive'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {field.value?.length || 0}/500
                      </span>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>

            <div className="flex justify-end space-x-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <ConnectsDialog
                loading={loading}
                setLoading={setLoading}
                onSubmit={onSubmit}
                isValidCheck={trigger}
                userId={user.uid}
                buttonText="Add Skill"
                userType="BUSINESS"
                requiredConnects={parseInt(
                  process.env.NEXT_PUBLIC__APP_HIRE_TALENT_COST || '20',
                  10,
                )}
                data={getValues()}
                skipRedirect={true}
              />
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SkillDialog;
