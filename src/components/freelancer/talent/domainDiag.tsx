'use client';

import type React from 'react';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
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
import SelectTagPicker from '@/components/shared/SelectTagPicker';
interface Domain {
  _id: string;
  label: string;
}

interface DomainData {
  domainIds: string[]; // multiple selected domain IDs
  labels: string[]; // multiple selected labels
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
  domainIds: z.array(z.string()).min(1, 'Please select at least one domain'),
  labels: z.array(z.string()),
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
  type: z.string(),
});

const DomainDialog: React.FC<DomainDialogProps> = ({ domains, onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DomainData>({
    resolver: zodResolver(domainSchema),
    defaultValues: {
      domainIds: [],
      labels: [],
      experience: '',
      monthlyPay: '',
      activeStatus: false,
      status: StatusEnum.PENDING,
      type: 'DOMAIN',
    },
  });

  const onSubmit = async (data: DomainData) => {
    setLoading(true);
    try {
      for (let i = 0; i < data.domainIds.length; i++) {
        await axiosInstance.post('/freelancer/dehix-talent', {
          talentId: data.domainIds[i],
          talentName: data.labels[i],
          experience: data.experience,
          monthlyPay: data.monthlyPay,
          activeStatus: data.activeStatus,
          status: data.status,
          type: 'DOMAIN',
        });
      }
      reset();
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
        <Button size="sm">
          <Plus className="h-4 w-4" /> Add Domain
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Domain</DialogTitle>
          <DialogDescription>
            Select domains, enter your experience and monthly pay.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Domain Select */}
          <div className="mb-3">
            <Controller
              control={control}
              name="labels"
              render={({ field }) => (
                <SelectTagPicker
                  label="Domains"
                  options={domains.map((d) => ({ label: d.label, _id: d._id }))}
                  selected={field.value.map((l) => ({ name: l }))}
                  onAdd={(val) => {
                    const domain = domains.find((d) => d.label === val);
                    if (domain) {
                      const newLabels = [...field.value, val];
                      const newIds = [
                        ...(control._formValues.domainIds || []),
                        domain._id,
                      ];
                      field.onChange(newLabels);
                      setValue('domainIds', newIds);
                    }
                  }}
                  onRemove={(val) => {
                    const index = field.value.indexOf(val);
                    const newLabels = field.value.filter((l) => l !== val);
                    const newIds = (control._formValues.domainIds || []).filter(
                      (_, i) => i !== index,
                    );
                    field.onChange(newLabels);
                    setValue('domainIds', newIds);
                  }}
                  className="w-full"
                  optionLabelKey="label"
                  selectedNameKey="name"
                  selectPlaceholder="Select domains"
                  searchPlaceholder="Search domains..."
                />
              )}
            />
            {errors.domainIds && (
              <p className="text-red-600 text-sm mt-1">
                {errors.domainIds.message}
              </p>
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
                    step={0.1}
                    {...field}
                    className="mt-2 w-full"
                  />
                  <span className="absolute right-10 top-1/2 transform -translate-y-1/2 text-grey-500 pointer-events-none">
                    YEARS
                  </span>
                </div>
              )}
            />
            {errors.experience && (
              <p className="text-red-600">{errors.experience.message}</p>
            )}
          </div>

          {/* Monthly Pay Input */}
          <div className="mb-3">
            <Controller
              control={control}
              name="monthlyPay"
              render={({ field }) => (
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="$ Monthly Pay"
                    min={0}
                    {...field}
                    className="mt-2 w-full"
                  />
                  <span className="absolute right-10 top-1/2 transform -translate-y-1/2 text-grey-500 pointer-events-none">
                    $
                  </span>
                </div>
              )}
            />
            {errors.monthlyPay && (
              <p className="text-red-600">{errors.monthlyPay.message}</p>
            )}
          </div>

          <DialogFooter className="mt-3">
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
