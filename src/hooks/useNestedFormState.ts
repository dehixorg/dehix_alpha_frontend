import { MilestoneFormData } from '@/utils/types/Milestone';

export const useNestedFormState = (formData: MilestoneFormData, setFormData: React.Dispatch<React.SetStateAction<MilestoneFormData>>) => {
    const handleNestedChange = (field: string, key: string, value: string) => {
        setFormData((prevState) => ({
            ...prevState,
            [field]: {
                ...(prevState[field as keyof MilestoneFormData] as any),
                [key]: value,
            },
        }));
    };

    const handleDateChange = (field: string, key: string, date: Date | null) => {
        handleNestedChange(field, key, date ? date.toISOString() : '');
    };

    return { handleNestedChange, handleDateChange };
};