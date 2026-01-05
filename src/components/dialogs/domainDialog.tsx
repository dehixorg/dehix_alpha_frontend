// DomainDialog.tsx
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Clock } from 'lucide-react';

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
import {
  InputGroup,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
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
              render={({ field }) => {
                const selectedDomain = field.value ? [field.value] : [];

                const handleSelect = (domainName: string) => {
                  if (field.value === domainName) {
                    field.onChange(''); // remove if already selected
                  } else {
                    field.onChange(domainName); // select new
                  }
                };

                return (
                  <>
                    <Select value="" onValueChange={handleSelect}>
                      <SelectTrigger className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 w-full">
                        <SelectValue
                          placeholder="Select a domain"
                          className="text-black dark:text-white"
                        >
                          {selectedDomain.length > 0 ? selectedDomain[0] : ''}
                        </SelectValue>
                      </SelectTrigger>

                      <SelectContent className="bg-white dark:bg-black">
                        {domainOptions.length > 0 ? (
                          domainOptions.map((domain) => (
                            <SelectItem
                              key={domain.talentName}
                              value={domain.talentName}
                              className="text-black dark:text-white data-[highlighted]:bg-gray-200 dark:data-[highlighted]:bg-gray-700"
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={field.value === domain.talentName}
                                  readOnly
                                  className="w-4 h-4 border border-gray-400 dark:border-gray-600 rounded-none bg-white dark:bg-black"
                                />
                                <span className="text-black dark:text-white">
                                  {domain.talentName}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <p className="p-2 text-black dark:text-white">
                            No verified Domain.{' '}
                            <span className="text-blue-500">Get verified!</span>
                          </p>
                        )}
                      </SelectContent>
                    </Select>

                    {/* Selected Domain Tag */}
                    {field.value && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        <div className="flex items-center gap-1 rounded px-2 py-1 bg-gray-400 dark:bg-gray-700">
                          <span className="text-black dark:text-white">
                            {field.value}
                          </span>
                          <button
                            type="button"
                            className="text-red-600 font-bold"
                            onClick={() => field.onChange('')}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                );
              }}
            />

            {/* Experience Field */}
            <Controller
              control={control}
              name="experience"
              render={({ field }) => (
                <>
                  <div className="col-span-3">
                    <InputGroup>
                      <InputGroupText>
                        <Clock className="h-4 w-4" />
                      </InputGroupText>
                      <InputGroupInput
                        {...field}
                        placeholder="Years of experience"
                        type="number"
                        min="0"
                        step="0.1"
                        className="w-full"
                      />
                      <InputGroupText>YEARS</InputGroupText>
                    </InputGroup>
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
