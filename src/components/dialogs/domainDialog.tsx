// DomainDialog.tsx
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Dialog,
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
import { Input } from '@/components/ui/input';

interface DomainFormData {
  name: string;
  experience: string;
  level: string;
}

interface DomainDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: DomainFormData) => Promise<void>;
  domainOptions: Array<{ talentName: string }>;
  levels: string[];
  defaultValues?: DomainFormData;
  loading: boolean;
}

const DomainSchema = z.object({
  name: z.string().min(1, 'Domain is required'),
  experience: z.preprocess(
    (val) => parseFloat(val as string),
    z
      .number()
      .min(0, 'Experience must be a non-negative number')
      .max(50, "Experience can't exceed 50"),
  ),
  level: z.string().min(1, 'Level is required'),
});

const DomainDialog: React.FC<DomainDialogProps> = ({
  open,
  onClose,
  onSubmit,
  domainOptions,
  levels,
  defaultValues,
  loading,
}) => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<DomainFormData>({
    resolver: zodResolver(DomainSchema),
    defaultValues,
  });

  const handleFormSubmit = (data: DomainFormData) => {
    onSubmit(data);
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {defaultValues ? 'Edit Domain' : 'Add Domain'}
          </DialogTitle>
          <DialogDescription>
            Select a domain and provide your experience and level.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-4">
            {/* Name Field */}
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {domainOptions.length > 0 ? (
                        domainOptions.map((domain, idx) => (
                          <SelectItem key={idx} value={domain.talentName}>
                            {domain.talentName}
                          </SelectItem>
                        ))
                      ) : (
                        <p className="p-2">
                          No verified Domain.{' '}
                          <span className="text-blue-500">Get verified !</span>
                        </p>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.name && (
                    <p className="text-red-500 text-sm">
                      {errors.name.message}
                    </p>
                  )}
                </>
              )}
            />

            {/* Experience Field */}
            <Controller
              control={control}
              name="experience"
              render={({ field }) => (
                <>
                  <div className="col-span-3 relative">
                    <Input
                      {...field}
                      placeholder="Years of experience"
                      type="number"
                      min="0"
                      step="0.1" // Allow decimals
                      className="w-full pl-2 pr-1" // Space for the unit
                    />
                    <span className="absolute right-8 top-1/2 transform -translate-y-1/2 text-grey-500 pointer-events-none">
                      YEARS
                    </span>
                  </div>
                  {errors.experience && (
                    <p className="text-red-500 text-sm">
                      {errors.experience.message}
                    </p>
                  )}
                </>
              )}
            />

            {/* Level Field */}
            <Controller
              control={control}
              name="level"
              render={({ field }) => (
                <>
                  <Select onValueChange={field.onChange} value={field.value}>
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
                  {errors.level && (
                    <p className="text-red-500 text-sm">
                      {errors.level.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>
          <DialogFooter>
            <Button className="mt-3" type="submit" disabled={loading}>
              {defaultValues ? 'Update' : 'Add'} Domain
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DomainDialog;
