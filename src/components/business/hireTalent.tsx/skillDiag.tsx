import React, { useState } from 'react';
import { Plus, Award, Gauge, Clock, FileText } from 'lucide-react';
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
import { Slider } from '@/components/ui/slider';

interface Skill {
  _id: string;
  label: string;
}

interface SkillDomainData {
  uid: string;
  skillId: string;
  label: string;
  level: string;
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
  level: z.string().nonempty('Please select a level'),
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
      level: '',
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
        level: data.level,
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/40 px-2">
              <Award className="h-5 w-5 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <DialogTitle className="text-xl">Add Dehix Skill</DialogTitle>
              <DialogDescription className="mt-1 text-sm">
                Select a skill from your shortlist and describe the experience
                you expect for this role.
              </DialogDescription>
            </div>
          </div>
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

              {/* Level slider */}
              <FormField
                control={control}
                name="level"
                render={({ field }) => {
                  const levels = [
                    'BEGINNER',
                    'INTERMEDIATE',
                    'ADVANCED',
                    'EXPERT',
                  ];
                  const currentIndex = (() => {
                    const idx = levels.indexOf(field.value || '');
                    return idx >= 0 ? idx : 0;
                  })();

                  return (
                    <FormItem>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            <Gauge className="h-3 w-3" />
                            <span>Seniority level</span>
                          </div>
                          {field.value && (
                            <span className="text-[11px] font-medium text-muted-foreground">
                              {field.value}
                            </span>
                          )}
                        </div>
                        <FormControl>
                          <Slider
                            min={0}
                            max={3}
                            step={1}
                            value={[currentIndex]}
                            onValueChange={([val]) => {
                              const next = levels[val] ?? levels[0];
                              field.onChange(next);
                            }}
                          />
                        </FormControl>
                        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                          <span>Beginner</span>
                          <span>Intermediate</span>
                          <span>Advanced</span>
                          <span>Expert</span>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {/* Experience */}
              <FormField
                control={control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      <Clock className="h-3 w-3" />
                      <span>Experience</span>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="Years of experience"
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
                    <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      <FileText className="h-3 w-3" />
                      <span>Role description</span>
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the kind of experience you expect with this skill..."
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
