import { useState } from 'react';
import { MilestoneFormData, MilestoneStatus, PaymentStatus } from '@/utils/types/Milestone';

export const useFormState = ({ setErrors }: { setErrors: (errors: string[]) => void }) => {
    const [formData, setFormData] = useState<MilestoneFormData>({
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
        stories: [
            {
                _id: '1',
                summary: '',
                importantUrl: [''],
                title: '',
                taskStatus: MilestoneStatus.NOT_STARTED,
            },
        ],
        payment: {
            amount: undefined,
            status: PaymentStatus.PENDING,
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
        if (new Date(formData.startDate.expected) > new Date(formData.endDate.expected)) {
            newErrors.push('Start date cannot be after end date.');
        }
        if ((formData.amount ?? 0) < 0) {
            newErrors.push('Amount must be a positive number.');
        }
        if ((formData.payment.amount ?? 0) < 0) {
            newErrors.push('Payment amount must be a positive number.');
        }
        if (!formData.payment.amount) {
            newErrors.push('Payment amount is required.');
        }
        if (!formData.payment.status) {
            newErrors.push('Payment status is required.');
        }
        formData.stories.forEach((story, index) => {
            if (!story.summary.trim()) {
                newErrors.push(`Story ${index + 1} summary is required.`);
            }
            if (!story.title.trim()) {
                newErrors.push(`Story ${index + 1} title is required.`);
            }
            story.importantUrl.forEach((url, urlIndex) => {
                if (!url.trim()) {
                    newErrors.push(`Story ${index + 1} Important URL ${urlIndex + 1} is required.`);
                }
            });
        });

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    const handleDeleteUrl = (storyIndex: number, urlIndex: number) => {
        const updatedStories = [...formData.stories];
        updatedStories[storyIndex].importantUrl.splice(urlIndex, 1);
        setFormData((prevState) => ({ ...prevState, stories: updatedStories }));
    };

    const handleDeleteStory = (storyIndex: number) => {
        const updatedStories = [...formData.stories];
        updatedStories.splice(storyIndex, 1);
        setFormData((prevState) => ({ ...prevState, stories: updatedStories }));
    };

    return { formData, setFormData, handleChange, validateForm, handleDeleteUrl, handleDeleteStory };
};