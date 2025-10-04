'use client';

import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import SelectTagPicker from '@/components/shared/SelectTagPicker';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { StatusEnum } from '@/utils/freelancer/enum';

interface Domain {
  _id: string;
  label: string;
}

interface DomainData {
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
  onSuccess: () => void;
}

const domainSchema = z.object({
  domainId: z.string(),
  label: z.string().nonempty('Please select at least one domain'),
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
  const [selectedDomains, setSelectedDomains] = useState<Domain[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DomainData>({
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

  const onSubmit = async (data: DomainData) => {
    if (selectedDomains.length === 0) {
      notifyError('Please select at least one domain', 'Error');
      return;
    }

    setLoading(true);
    try {
      for (const domain of selectedDomains) {
        await axiosInstance.post(`/freelancer/dehix-talent`, {
          talentId: domain._id,
          talentName: domain.label,
          experience: data.experience,
          monthlyPay: data.monthlyPay,
          activeStatus: data.activeStatus,
          status: data.status,
          type: 'DOMAIN',
        });
      }
      reset();
      setSelectedDomains([]);
      setOpen(false);
      notifySuccess('Domains added successfully', 'Success');
      onSuccess();
    } catch (error) {
      console.error(error);
      notifyError('Failed to add domains. Please try again.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add Domain</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Domain</DialogTitle>
          <DialogDescription>
            Select domains, enter your experience and monthly pay.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <Controller
              control={control}
              name="label"
              render={() => (
                <SelectTagPicker
                  label="Domains"
                  options={domains.map((d) => ({ label: d.label, _id: d._id }))}
                  selected={selectedDomains.map((d) => ({ name: d.label }))}
                  onAdd={(val) => {
                    const domain = domains.find((d) => d.label === val);
                    if (
                      domain &&
                      !selectedDomains.find((d) => d._id === domain._id)
                    ) {
                      setSelectedDomains((prev) => [...prev, domain]);
                      setValue('label', val);
                    }
                  }}
                  onRemove={(val) => {
                    const domain = domains.find((d) => d.label === val);
                    if (domain) {
                      setSelectedDomains((prev) =>
                        prev.filter((d) => d._id !== domain._id),
                      );
                      if (selectedDomains.length === 1) setValue('label', '');
                    }
                  }}
                  className="w-full"
                  optionLabelKey="label"
                  selectedNameKey="name"
                  selectPlaceholder="Select domains"
                  searchPlaceholder="Search domains..."
                />
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
