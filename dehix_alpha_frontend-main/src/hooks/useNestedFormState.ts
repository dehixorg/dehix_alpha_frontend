import { Milestone } from '@/utils/types/Milestone';

export const useNestedFormState = (
  formData: Milestone,
  setFormData: React.Dispatch<React.SetStateAction<Milestone>>,
) => {
  const handleNestedChange = (field: string, key: string, value: string) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: {
        ...(prevState[field as keyof Milestone] as any),
        [key]: value,
      },
    }));
  };

  const handleDateChange = (field: string, key: string, date: Date | null) => {
    handleNestedChange(field, key, date ? date.toISOString() : '');
  };

  return { handleNestedChange, handleDateChange };
};
