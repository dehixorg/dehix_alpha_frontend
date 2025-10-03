'use client';

import type React from 'react';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

import {
  DialogFooter,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
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
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { StatusEnum } from '@/utils/freelancer/enum';

interface Domain {
  _id: string;
  label: string;
}

interface SkillDomainData {
  uid: string;
  domainId: string;
  label: string;
  experience: string;
  monthlyPay: string;
  activeStatus: boolean;
  status: StatusEnum;
  type: string;
}

interface DomainDialogProps {
  domains: Domain[];
  setDomains: any;
  onSuccess: () => void;
}

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

const DomainDialog: React.FC<DomainDialogProps> = ({ domains, onSuccess }) => {
  const [open, setOpen] = useState(false);
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
      type: 'DOMAIN',
    },
  });

  const onSubmit = async (data: SkillDomainData) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(`/freelancer/dehix-talent`, {
        talentId: data.domainId,
        talentName: data.label,
        experience: data.experience,
        monthlyPay: data.monthlyPay,
        activeStatus: data.activeStatus,
        status: data.status,
        type: 'DOMAIN',
      });
      if (response.status === 200) {
        reset();
        setOpen(false);
        notifySuccess(
          'The Talent has been successfully added.',
          'Talent Added',
        );
        onSuccess(); // Trigger parent to re-fetch
      }
    } catch (error) {
      console.error('Error submitting domain data', error);
      reset();
      notifyError('Failed to add talent. Please try again.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" /> Add Domain
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
                      (domain) => domain.label === selectedLabel,
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
                        <SelectItem key={domain._id} value={domain.label}>
                          {domain.label}
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
            {errors.label && (
              <p className="text-red-600 text-sm mt-1">
                {errors.label.message}
              </p>
            )}
          </div>

          <div className="mb-3">
            <Controller
              control={control}
              name="experience"
              render={({ field }) => (
                <Input
                  type="number"
                  placeholder="Experience (years)"
                  min={0}
                  max={50}
                  step={0.1}
                  {...field}
                />
              )}
            />
            {errors.experience && (
              <p className="text-red-600">{errors.experience.message}</p>
            )}
          </div>

          <div className="mb-3">
            <Controller
              control={control}
              name="monthlyPay"
              render={({ field }) => (
                <Input
                  type="number"
                  placeholder="$ Monthly Pay"
                  min={0}
                  {...field}
                />
              )}
            />
            {errors.monthlyPay && (
              <p className="text-red-600">{errors.monthlyPay.message}</p>
            )}
          </div>

          <DialogFooter className="mt-8">
            <Button type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Submit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DomainDialog;
