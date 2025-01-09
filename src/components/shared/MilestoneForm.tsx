import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useSelector } from 'react-redux';

import { Input } from '../ui/input';
import { Button } from '../ui/button';

import { MilestoneDatePicker } from './milestoneDatePicker';
import { Dropdown } from './DropdownProps';

import { MilestoneStatus, PaymentStatus } from '@/utils/types/Milestone';
import { useFormState } from '@/hooks/useFormState';
import { useNestedFormState } from '@/hooks/useNestedFormState';
import { useStoryFormState } from '@/hooks/useStoryFormState';
import { axiosInstance } from '@/lib/axiosinstance';

const MilestoneForm = () => {
  const userId = useSelector((state: any) => state.user?.uid);
  const [errors, setErrors] = useState<string[]>([]);

  const {
    formData,
    setFormData,
    handleChange,
    validateForm,
    handleDeleteUrl,
    handleDeleteStory,
  } = useFormState({ setErrors });
  const { handleNestedChange, handleDateChange } = useNestedFormState(
    formData,
    setFormData,
  );
  const { handleStoryChange, addImportantUrl, handleUrlChange, addStory } =
    useStoryFormState(formData, setFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);

    if (validateForm()) {
      try {
        const response = await axiosInstance.post('/milestones', {
          ...formData,
          userId,
        });
        console.log('Milestone created successfully:', response.data);
        // Reset form or redirect as needed
      } catch (error) {
        console.error('Error creating milestone:', error);
      }
    }
  };

  return (
    <div className="flex justify-center items-center">
      <form onSubmit={handleSubmit} className="p-6 rounded-lg w-full space-y-6">
        {errors.length > 0 && (
          <div className="bg-red-100 p-4 rounded-lg text-red-700 mb-4">
            <ul>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
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
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Description
          </label>
          <Input
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            className="mt-1 block w-full"
          />
        </div>
        <div className="grid grid-cols-2 w-full space-x-3">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium">
              Start Date
            </label>
            <div>
              <label
                htmlFor="startDateExpected"
                className="block text-sm font-medium"
              >
                (Expected)
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
            </div>
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium">
              End Date
            </label>
            <div>
              <label
                htmlFor="endDateExpected"
                className="block text-sm font-medium"
              >
                (Expected)
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
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium">
            Amount
          </label>
          <Input
            id="amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Amount"
            className="mt-1 block w-full"
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium">
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
        </div>
        {/* Remaining code for Stories and Payment sections */}
      </form>
    </div>
  );
};

export default MilestoneForm;
