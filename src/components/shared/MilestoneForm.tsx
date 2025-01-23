import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { Input } from '../ui/input';
import { Button } from '../ui/button';

import { MilestoneDatePicker } from './milestoneDatePicker';
import { Dropdown } from './DropdownProps';

import { MilestoneStatus } from '@/utils/types/Milestone';
import { useFormState } from '@/hooks/useFormState';
import { useNestedFormState } from '@/hooks/useNestedFormState';
import { axiosInstance } from '@/lib/axiosinstance';
import { toast } from '@/components/ui/use-toast';

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
        const response = await axiosInstance.post('/milestones', {
          ...formData,
          userId,
          projectId,
        });
        toast({
          title: 'Success',
          description: 'Milestone created successfully!',
          variant: 'default',
        });
        fetchMilestones();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to create milestone.',
          variant: 'destructive',
        });
      } finally {
        closeDialog();
      }
    }
  };

  return (
    <div className="flex justify-center items-center py-4">
      <div className="w-full max-w-lg shadow-lg">
        <div>
          <h2 className="text-xl font-semibold">Create Milestone</h2>
        </div>
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Title
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Title"
                required
                className="mt-1 block w-full"
              />
              {errors.title && (
                <p className="text-xs text-red-500 mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-2"
              >
                Description
              </label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description"
                required
                className="mt-1 block w-full"
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="startDate"
                  className="block whitespace-nowrap text-sm font-medium mb-2"
                >
                  Start Date (Expected)
                </label>
                <MilestoneDatePicker
                  selected={
                    formData.startDate.expected
                      ? new Date(formData.startDate.expected)
                      : null
                  }
                  onChange={(date) =>
                    handleDateChange('startDate', 'expected', date)
                  }
                  placeholderText="Start Date (Expected)"
                  className="mt-1 block text-xs w-full"
                />
                {errors.startDate && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="endDate"
                  className="block whitespace-nowrap text-sm font-medium mb-2"
                >
                  End Date (Expected)
                </label>
                <MilestoneDatePicker
                  selected={
                    formData.endDate.expected
                      ? new Date(formData.endDate.expected)
                      : null
                  }
                  onChange={(date) =>
                    handleDateChange('endDate', 'expected', date)
                  }
                  placeholderText="End Date (Expected)"
                  className="mt-1 block text-xs w-full"
                />
                {errors.endDate && (
                  <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium mb-2"
              >
                Amount
              </label>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Amount"
                required
                className="mt-1 block w-full"
              />
              {errors.amount && (
                <p className="text-xs text-red-500 mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium mb-2"
              >
                Status
              </label>
              <Dropdown
                options={[
                  { label: 'Not Started', value: MilestoneStatus.NOT_STARTED },
                  { label: 'Ongoing', value: MilestoneStatus.ONGOING },
                  { label: 'Completed', value: MilestoneStatus.COMPLETED },
                ]}
                value={formData.status}
                onChange={(value: any) =>
                  setFormData((prevState) => ({ ...prevState, status: value }))
                }
              />
              {errors.status && (
                <p className="text-xs text-red-500 mt-1">{errors.status}</p>
              )}
            </div>

            <div className="mt-4">
              <Button type="submit" className="w-full py-2" variant="default">
                Create Milestone
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MilestoneForm;
