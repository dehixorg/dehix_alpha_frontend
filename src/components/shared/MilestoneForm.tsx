import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

import { MilestoneDatePicker } from './milestoneDatePicker';

import { MilestoneStatus } from '@/utils/types/Milestone';
import { useFormState } from '@/hooks/useFormState';
import { useNestedFormState } from '@/hooks/useNestedFormState';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';

interface MilestoneFormProps {
  projectId: string;
  fetchMilestones: () => void;
  closeDialog: () => void;
}

const MilestoneForm: React.FC<MilestoneFormProps> = ({
  projectId,
  fetchMilestones,
  closeDialog,
}) => {
  const userId = useSelector((state: any) => state.user?.uid);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { formData, setFormData, handleChange, validateForm } = useFormState({
    setErrors,
  });
  const { handleDateChange } = useNestedFormState(formData, setFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await axiosInstance.post('/milestones', {
          ...formData,
          userId,
          projectId,
        });
        notifySuccess('Milestone created successfully!', 'Success');
        fetchMilestones();
      } catch (error) {
        notifyError('Failed to create milestone.', 'Error');
      } finally {
        closeDialog();
      }
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div className="w-full max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="mb-2 block text-sm font-medium">
              Title
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter milestone title"
              required
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {errors.title && (
              <p id="title-error" className="text-xs text-red-500 mt-1">
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label
              htmlFor="description"
              className="mb-2 block text-sm font-medium"
            >
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Briefly describe the milestone goals and scope"
              required
              rows={3}
              aria-describedby={
                errors.description ? 'description-error' : undefined
              }
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Keep it concise and actionable.
            </p>
            {errors.description && (
              <p id="description-error" className="text-xs text-red-500 mt-1">
                {errors.description}
              </p>
            )}
          </div>

          <Separator />

          {/* Amount & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="amount"
                className="mb-2 block text-sm font-medium"
              >
                Amount
              </Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                inputMode="decimal"
                min={0}
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                required
                aria-describedby={errors.amount ? 'amount-error' : undefined}
              />
              {errors.amount && (
                <p id="amount-error" className="text-xs text-red-500 mt-1">
                  {errors.amount}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="status"
                className="mb-2 block text-sm font-medium"
              >
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prevState) => ({ ...prevState, status: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={MilestoneStatus.NOT_STARTED}>
                    Not Started
                  </SelectItem>
                  <SelectItem value={MilestoneStatus.ONGOING}>
                    Ongoing
                  </SelectItem>
                  <SelectItem value={MilestoneStatus.COMPLETED}>
                    Completed
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-xs text-red-500 mt-1">{errors.status}</p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <MilestoneDatePicker
                selected={
                  formData.startDate.expected
                    ? new Date(formData.startDate.expected)
                    : null
                }
                onChange={(date) =>
                  handleDateChange('startDate', 'expected', date)
                }
                placeholderText="Select start date"
                className="w-full text-xs"
              />
            </div>

            <div>
              <MilestoneDatePicker
                selected={
                  formData.endDate.expected
                    ? new Date(formData.endDate.expected)
                    : null
                }
                onChange={(date) =>
                  handleDateChange('endDate', 'expected', date)
                }
                placeholderText="Select end date"
                className="w-full text-xs"
              />
              {errors.endDate && (
                <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full" variant="default">
            Create
          </Button>
        </form>
      </div>
    </div>
  );
};

export default MilestoneForm;
