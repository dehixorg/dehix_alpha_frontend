import { useState } from 'react';

import {
  Milestone,
  MilestoneStatus,
  PaymentStatus,
} from '@/utils/types/Milestone';

export const useFormState = ({
  setErrors,
}: {
  setErrors: (errors: string[]) => void;
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
    const newErrors: string[] = [];

    if (!formData.title.trim()) {
      newErrors.push('Title is required.');
    }
    if (!formData.description.trim()) {
      newErrors.push('Description is required.');
    }
    if (
      new Date(formData.startDate.expected) >
      new Date(formData.endDate.expected)
    ) {
      newErrors.push('Start date cannot be after end date.');
    }
    if ((formData.amount ?? 0) < 0) {
      newErrors.push('Amount must be a positive number.');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  return {
    formData,
    setFormData,
    handleChange,
    validateForm,
  };
};
