import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
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
import { RootState } from '@/lib/store';
import { axiosInstance } from '@/lib/axiosinstance';
import { toast } from '@/components/ui/use-toast';

// Define the type for a domain
interface Domain {
  _id: string;
  label: string;
}

// Define SkillDomainData based on your form data structure
interface SkillDomainData {
  uid: string;
  domainId: string;
  label: string;
  experience: string;
  monthlyPay: string;
  activeStatus: boolean;
  status: string;
}

// Define the props for the DomainDialog component
interface DomainDialogProps {
  domains: Domain[];
  onSubmitDomain: (data: SkillDomainData) => void; // Update this type based on your actual data structure
}

// Define the schema for validation
const domainSchema = z.object({
  domainId: z.string(),
  label: z.string().nonempty('Please select a domain'),
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

const DomainDialog: React.FC<DomainDialogProps> = ({
  domains,
  onSubmitDomain,
}) => {
  const user = useSelector((state: RootState) => state.user);
  const [open, setOpen] = useState(false); // Manage dialog visibility
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<SkillDomainData>({
    resolver: zodResolver(domainSchema),
    defaultValues: {
      domainId: '',
      label: '',
      experience: '',
      monthlyPay: '',
      activeStatus: false,
      status: 'pending',
    },
  });

  const onSubmit = async (data: SkillDomainData) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        `/freelancer/${user.uid}/dehix-talent`,
        {
          domainId: data.domainId,
          domainName: data.label,
          experience: data.experience,
          monthlyPay: data.monthlyPay,
          activeStatus: data.activeStatus,
          status: data.status,
        },
      );

      if (response.status === 200) {
        // Assuming the response contains the newly created talent data including UID
        const newTalent = response.data.data; // Adjust based on your response structure
        onSubmitDomain({
          ...data,
          uid: newTalent._id, // Update this line to use the UID from the response
        });
        reset();
        setOpen(false); // Close the dialog after successful submission
        toast({
          title: 'Talent Added',
          description: 'The Talent has been successfully added.',
        });
      }
    } catch (error) {
      console.error('Error submitting domain data', error);
      reset();
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
          <Plus className="mr-2 h-4 w-4" /> Add Domain
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Domain</DialogTitle>
          <DialogDescription>
            Select a domain, enter your experience and monthly pay.
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
                    // Find the selected domain by label
                    const selectedDomain = domains.find(
                      (domain) => domain.label === selectedLabel,
                    );

                    // Set label and domainId in form
                    field.onChange(selectedLabel); // Set label
                    setValue('domainId', selectedDomain?._id || ''); // Set domainId
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a domain" />
                  </SelectTrigger>
                  <SelectContent>
                    {domains.map((domain) => (
                      <SelectItem key={domain._id} value={domain.label}>
                        {domain.label}
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
                <input
                  type="number"
                  placeholder="Experience (years)"
                  min={0}
                  max={50}
                  {...field}
                  className="border p-2 rounded mt-2 w-full"
                />
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
              <input
                type="number"
                placeholder="Monthly Pay"
                min={0}
                {...field}
                className="border p-2 rounded mt-2 w-full"
              />
            )}
          />
          {errors.monthlyPay && (
            <p className="text-red-600">{errors.monthlyPay.message}</p>
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

export default DomainDialog;
