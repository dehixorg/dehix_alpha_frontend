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
import { RootState } from '@/lib/store';

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

// Define the props for the SkillDialog component
interface SkillDialogProps {
  skills: Skill[];
  onSubmitSkill: (data: SkillDomainData) => void; // Use SkillDomainData type
}

const skillSchema = z.object({
  label: z.string().nonempty('Please select a domain'),
  skillId: z.string().nonempty('Domain ID is required'), // Validation for skillId
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
      description: '',
      visible: false,
      status: 'ADDED',
    },
  });

  const onSubmit = async (data: SkillDomainData) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(`/business/hire-dehixtalent`, {
        skillId: data.skillId, // This should now be set
        skillName: data.label,
        businessId: user.uid,
        experience: data.experience,
        description: data.description,
        status: data.status,
        visible: data.visible,
      });

      if (response.status === 200) {
        // Assuming the response contains the newly created talent data including UID
        if (response?.data?.data) {
          const newTalent = response.data.data; // Adjust based on your response structure
          onSubmitSkill({
            ...data,
            uid: newTalent._id, // Update this line to use the UID from the response
          });
          reset();
          setOpen(false); // Close the dialog after successful submission
          toast({
            title: 'Talent Added',
            description: 'The Hire Talent has been successfully added.',
          });
        } else {
          throw new Error('Failed to add hire talen');
        }
      }
    } catch (error) {
      console.error('Error submitting skill data', error);
      reset();
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add hire talent. Please try again.',
      });
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
                    // Find the selected skill by label
                    const selectedDomain = skills.find(
                      (skill) => skill.label === selectedLabel,
                    );

                    // Set label and domainId in form
                    field.onChange(selectedLabel); // Set label
                    setValue('skillId', selectedDomain?._id || ''); // Set domainId
                  }}
                >
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
          {errors.label && (
            <p className="text-red-600">{errors.label.message}</p>
          )}
          <div className="mb-3">
            <Controller
              control={control}
              name="experience"
              render={({ field }) => (
                <div className="col-span-3 relative">
                  <input
                    type="number"
                    placeholder="Experience (years)"
                    min={0}
                    max={50}
                    step={0.1} //Allow decimals
                    {...field}
                    className="border p-2 rounded mt-0 w-full"
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
            name="description"
            render={({ field }) => (
              <input
                type="text"
                placeholder="Description"
                {...field}
                className="border p-2 rounded mt-2 w-full"
              />
            )}
          />
          {errors.description && (
            <p className="text-red-600">{errors.description.message}</p>
          )}
          <DialogFooter className="mt-3">
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Submit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SkillDialog;
