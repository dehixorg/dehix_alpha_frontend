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
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RootState } from '@/lib/store';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import ConnectsDialog from '@/components/shared/ConnectsDialog';
import SelectTagPicker from '@/components/shared/SelectTagPicker'; // Import your picker

interface Domain {
  _id: string;
  label: string;
}

interface SkillDomainData {
  uid: string;
  domainId: string;
  label: string;
  experience: string;
  description: string;
  visible: boolean;
  status: string;
}

interface DomainDialogProps {
  domains: Domain[];
  onSubmitDomain: (data: SkillDomainData) => void;
}

const domainSchema = z.object({
  label: z.string().nonempty('Please select a domain'),
  domainId: z.string().nonempty('Domain ID is required'),
  experience: z
    .string()
    .nonempty('Please enter your experience')
    .regex(/^\d+$/, 'Experience must be a number'),
  description: z.string().nonempty('Please enter description'),
  visible: z.boolean(),
  status: z.string(),
});

const DomainDialog: React.FC<DomainDialogProps> = ({
  domains,
  onSubmitDomain,
}) => {
  const user = useSelector((state: RootState) => state.user);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<SkillDomainData>({
    resolver: zodResolver(domainSchema),
    defaultValues: {
      domainId: '',
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
        domainId: data.domainId,
        domainName: data.label,
        businessId: user.uid,
        experience: data.experience,
        description: data.description,
        status: data.status,
        visible: data.visible,
      });

      if (response.status === 200) {
        const newTalent = response.data.data;
        onSubmitDomain({ ...data, uid: newTalent._id });
        reset();
        setOpen(false);
        notifySuccess(
          'The Talent has been successfully added.',
          'Talent Added',
        );

        const connectsCost = parseInt(
          process.env.NEXT_PUBLIC__APP_HIRE_TALENT_COST || '0',
          10,
        );
        const currentConnects =
          Number(localStorage.getItem('DHX_CONNECTS')) || 0;
        const updatedConnects = Math.max(0, currentConnects - connectsCost);
        localStorage.setItem('DHX_CONNECTS', updatedConnects.toString());
        window.dispatchEvent(new Event('connectsUpdated'));
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
        <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Domain
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Domain</DialogTitle>
          <DialogDescription>
            Select a domain, enter your experience and description.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <Controller
              control={control}
              name="label"
              render={({ field }) => (
                <SelectTagPicker
                  label="Domains"
                  options={domains}
                  selected={field.value ? [{ name: field.value }] : []} // Convert to expected format
                  onAdd={(val) => {
                    field.onChange(val); // Update label
                    const selectedDomain = domains.find((d) => d.label === val);
                    setValue('domainId', selectedDomain?._id || '');
                  }}
                  onRemove={() => {
                    field.onChange('');
                    setValue('domainId', '');
                  }}
                  selectPlaceholder="Select domain"
                  searchPlaceholder="Search domain"
                />
              )}
            />
            {errors.label && (
              <p className="text-red-600">{errors.label.message}</p>
            )}
          </div>

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
                    step={0.1}
                    {...field}
                    className="border p-2 rounded mt-0 w-full"
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

          <ConnectsDialog
            form={form}
            loading={loading}
            setLoading={setLoading}
            onSubmit={onSubmit}
            isValidCheck={trigger}
            userId={user.uid}
            buttonText={'Submit'}
            userType={'BUSINESS'}
            requiredConnects={parseInt(
              process.env.NEXT_PUBLIC__APP_HIRE_TALENT_COST || '0',
              10,
            )}
            data={getValues()}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DomainDialog;
