import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSelector } from 'react-redux';
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
import { Input } from '@/components/ui/input'; // Import ShadCN Input component
import { RootState } from '@/lib/store';
import { axiosInstance } from '@/lib/axiosinstance';
import { toast } from '@/components/ui/use-toast';
import { StatusEnum } from '@/utils/freelancer/enum';

// Define the type for a domain
interface Domain {
  _id: string;
  name: string;
}

// Define SkillDomainData based on your form data structure
interface SkillDomainData {
  uid: string;
  domainId: string;
  label: string;
  experience: string;
  monthlyPay: string;
  activeStatus: boolean;
  status: StatusEnum;
}

// Define the props for the DomainDialog component
interface DomainDialogProps {
  domains: Domain[];
  onSubmitDomain: (data: SkillDomainData) => void; // Update this type based on your actual data structure
  setDomains: any;
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
  setDomains,
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
      status: StatusEnum.PENDING,
    },
  });

  const onSubmit = async (data: SkillDomainData) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        `/freelancers/dehix-talent`,
        {
          talentId: data.domainId,
          talentName: data.label,
          experience: data.experience,
          monthlyPay: data.monthlyPay,
          activeStatus: data.activeStatus,
          status: data.status,
          type: 'DOMAIN',
        },
      );

      if (response.status === 200) {
        const newTalent = response.data.data; // Adjust based on your response structure
        onSubmitDomain({
          ...data,
          uid: newTalent._id, // Use the UID from the response
        });
        setDomains((prevSkills: any) =>
          prevSkills.filter((domain: any) => domain._id !== data.domainId),
        );
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
    } finally {
      setLoading(false);
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
                    const selectedDomain = domains.find(
                      (domain) => domain.name === selectedLabel,
                    );
                    field.onChange(selectedLabel);
                    setValue('domainId', selectedDomain?._id || '');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a domain" />
                  </SelectTrigger>
                  <SelectContent>
                    {domains.length > 0 ? (
                      domains.map((domain) => (
                        <SelectItem key={domain._id} value={domain.name}>
                          {domain.name}
                        </SelectItem>
                      ))
                    ) : (
                      <Link href="/freelancer/settings/personal-info">
                        <p className="p-4 flex justify-center items-center">
                          No domains to add -{' '}
                          <span className="text-blue-500 ml-2">Add some</span>{' '}
                        </p>
                      </Link>
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
                    step={0.1} //Allow decimals
                    {...field}
                    className="w-full mt-2"
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

          <div className="mb-3">
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
                    className="w-full mt-2"
                  />
                  <span className="absolute right-10 top-1/2 transform -translate-y-1/2 text-grey-500 pointer-events-none">
                    $
                  </span>
                </div>
              )}
            />
          </div>
          {errors.monthlyPay && (
            <p className="text-red-600">{errors.monthlyPay.message}</p>
          )}

          <DialogFooter className="mt-3">
            <Button type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DomainDialog;
