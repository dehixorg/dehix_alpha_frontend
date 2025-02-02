import { useState } from 'react';

import {
  Milestone,
  MilestoneStatus,
  PaymentStatus,
} from '@/utils/types/Milestone';

export const useFormState = ({
  setErrors,
}: {
  setErrors: (errors: { [key: string]: string }) => void;
}) => {
  const [formData, setFormData] = useState<Milestone>({
    title: '',
    description: '',
    startDate: {
      expected: '',
    },
    endDate: {
      expected: '',
    },
    amount: undefined,
    status: MilestoneStatus.NOT_STARTED,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required.';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required.';
    }
    if (
      new Date(formData.startDate.expected) >
      new Date(formData.endDate.expected)
    ) {
      newErrors.startDate = 'Start date cannot be after end date.';
    }
    if ((formData.amount ?? 0) < 0) {
      newErrors.amount = 'Amount must be a positive number.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return {
    formData,
    setFormData,
    handleChange,
    validateForm,
  };
};
