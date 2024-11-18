import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectValue,
  SelectContent,
} from '@/components/ui/select';

// Validation schema using Zod
const SkillSchema = z.object({
  name: z.string().min(1, 'Skill is required'),
  experience: z.preprocess(
    (val) => {
      const parsed = parseFloat(val as string);
      return isNaN(parsed) ? 0 : parsed; // Ensure invalid input is converted to 0
    },
    z
      .number()
      .min(0, 'Experience must be a non-negative number')
      .max(50, "Experience can't exceed 50"),
  ),
  level: z.string().min(1, 'Level is required'),
});

type SkillFormData = z.infer<typeof SkillSchema>;

interface SkillDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SkillFormData) => void;
  skillOptions: Array<{ label: string }>;
  levels: string[];
  defaultValues?: SkillFormData;
  loading: boolean;
}

export const SkillDialog: React.FC<SkillDialogProps> = ({
  open,
  onClose,
  onSubmit,
  skillOptions,
  levels,
  defaultValues,
  loading,
}) => {
  // Initialize the form with react-hook-form and Zod resolver for validation
  const form = useForm<SkillFormData>({
    resolver: zodResolver(SkillSchema),
    defaultValues: defaultValues || { name: '', experience: 0, level: '' },
    mode: 'all',
  });

  // Reset form values if defaultValues change or when dialog is opened
  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  // Handle form submission
  const handleFormSubmit = (data: SkillFormData) => {
    onSubmit(data); // Submit data to parent
    form.reset(); // Reset form fields after submission
    onClose(); // Close the dialog
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {defaultValues ? 'Edit Skill' : 'Add Skill'}
          </DialogTitle>
          <DialogDescription>
            Select a skill, enter your experience, and choose the level.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-6 mt-4"
          >
            {/* Skill Selection and Experience */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Skill</Label>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select {...field}>
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>Experience</Label>
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          step="1"
                          placeholder="Years of experience"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Level Selection */}
            <div className="space-y-2">
              <Label>Level</Label>
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select {...field}>
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <DialogFooter>
              <Button className="w-full" type="submit" disabled={loading}>
                {loading
                  ? 'Loading...'
                  : defaultValues
                    ? 'Update Skill'
                    : 'Add Skill'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
