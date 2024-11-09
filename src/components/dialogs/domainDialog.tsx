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
  onSubmit: (data: DomainFormData) => void;
  domainOptions: Array<{ label: string }>;
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
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Select {...field} defaultValue={defaultValues?.name}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a domain" />
                  </SelectTrigger>
                  <SelectContent>
                    {domainOptions.map((domain, idx) => (
                      <SelectItem key={idx} value={domain.label}>
                        {domain.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <Input
              {...control}
              name="experience"
              placeholder="Years of experience"
              type="number"
              min="0"
              defaultValue={defaultValues?.experience}
            />
            <Select
              {...control}
              name="level"
              defaultValue={defaultValues?.level}
            >
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
