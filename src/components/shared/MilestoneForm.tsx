import React, { useState } from 'react';
import { MilestoneStatus, PaymentStatus } from '@/utils/types/Milestone';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { MilestoneDatePicker } from './milestoneDatePicker';
import { Dropdown } from './DropdownProps';
import { useFormState } from '@/hooks/useFormState';
import { useNestedFormState } from '@/hooks/useNestedFormState';
import { useStoryFormState } from '@/hooks/useStoryFormState';
import { X } from 'lucide-react';
import { axiosInstance } from '@/lib/axiosinstance';
import { useSelector } from 'react-redux';

const MilestoneForm = () => {

    const userId = useSelector((state: any) => state.user?.uid);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errors, setErrors] = useState<string[]>([]);

    const { formData, setFormData, handleChange, validateForm, handleDeleteUrl, handleDeleteStory } = useFormState({ setErrors });
    const { handleNestedChange, handleDateChange } = useNestedFormState(formData, setFormData);
    const { handleStoryChange, addImportantUrl, handleUrlChange, addStory } = useStoryFormState(formData, setFormData);



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log(formData);

        if (validateForm()) {
            setIsSubmitting(true);
            try {
                const response = await axiosInstance.post('/milestones', { ...formData, userId });
                console.log('Milestone created successfully:', response.data);
                // Reset form or redirect as needed
            } catch (error) {
                console.error('Error creating milestone:', error);
            } finally {
                setIsSubmitting(false);
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
                    <label htmlFor="title" className="block text-sm font-medium">Title</label>
                    <Input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Title"
                        required
                        className="mt-1 block w-full"
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium">Description</label>
                    <Input
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Description"
                        className="mt-1 block w-full"
                    />
                </div>
                <div className='grid grid-cols-2 w-full space-x-3' >
                    <div>
                        <label className="block text-sm font-medium">Start Date</label>
                        <div className="">
                            <div>
                                <label className="block text-sm font-medium">(Expected)</label>
                                <MilestoneDatePicker
                                    selected={formData.startDate.expected ? new Date(formData.startDate.expected) : null}
                                    onChange={(date) => handleDateChange('startDate', 'expected', date)}
                                    placeholderText="Start Date (Expected)"
                                    className="mt-1 block text-xs w-full"
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">End Date</label>
                        <div className="">
                            <div>
                                <label className="block text-sm font-medium">(Expected)</label>
                                <MilestoneDatePicker
                                    selected={formData.endDate.expected ? new Date(formData.endDate.expected) : null}
                                    onChange={(date) => handleDateChange('endDate', 'expected', date)}
                                    placeholderText="End Date (Expected)"
                                    className="mt-1 block text-xs w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium">Amount</label>
                    <Input
                        name="amount"
                        type="number"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="Amount"
                        className="mt-1 block w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Status</label>
                    <Dropdown
                        options={[
                            { label: 'Not Started', value: MilestoneStatus.NOT_STARTED },
                            { label: 'Ongoing', value: MilestoneStatus.ONGOING },
                            { label: 'Completed', value: MilestoneStatus.COMPLETED },
                        ]}
                        value={formData.status}
                        onChange={(value: any) => setFormData((prevState) => ({ ...prevState, status: value }))}
                    />
                </div>
                <h3 className="text-xl font-bold">Stories</h3>
                {formData.stories.map((story, storyIndex) => (
                    <div key={storyIndex} className="relative flex flex-col gap-2 border p-4 mb-4 rounded-lg">
                        {storyIndex !== 0 && <X
                            className="h-4 w-4 absolute cursor-pointer right-2 top-2"
                            onClick={() => handleDeleteStory(storyIndex)}
                        />}
                        <div>
                            <label className="block text-sm font-medium">Summary</label>
                            <Input
                                value={story.summary}
                                onChange={(e) => handleStoryChange(storyIndex, 'summary', e.target.value)}
                                placeholder="Summary"
                                required
                                className="mt-1 block w-full"
                            />
                        </div>
                        {story.importantUrl.map((url, urlIndex) => (
                            <div key={urlIndex} className="relative">
                                <label className="block text-sm font-medium">Important URL {urlIndex + 1}</label>
                                <Input
                                    type='url'
                                    value={url}
                                    onChange={(e) => handleUrlChange(storyIndex, urlIndex, e.target.value)}
                                    placeholder={`Important URL ${urlIndex + 1}`}
                                    className="mt-1 block w-full pr-10"
                                />
                                <X
                                    className="h-4 w-4 absolute cursor-pointer  right-2 top-[60%]"
                                    onClick={() => handleDeleteUrl(storyIndex, urlIndex)}
                                />
                            </div>
                        ))}
                        <Button type="button" onClick={() => addImportantUrl(storyIndex)} className="mt-2">
                            Add URL
                        </Button>
                        <div>
                            <label className="block text-sm font-medium">Title</label>
                            <Input
                                value={story.title}
                                onChange={(e) => handleStoryChange(storyIndex, 'title', e.target.value)}
                                placeholder="Title"
                                required
                                className="mt-1 block w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Task Status</label>
                            <Dropdown
                                options={[
                                    { label: 'Not Started', value: MilestoneStatus.NOT_STARTED },
                                    { label: 'Ongoing', value: MilestoneStatus.ONGOING },
                                    { label: 'Completed', value: MilestoneStatus.COMPLETED },
                                ]}
                                value={story.taskStatus}
                                onChange={(value) => handleStoryChange(storyIndex, 'taskStatus', value)}
                            />
                        </div>
                    </div>
                ))}
                <Button type="button" onClick={addStory} className="mb-4">
                    Add Story
                </Button>
                <h3 className="text-xl font-bold">Payment</h3>
                <div>
                    <label htmlFor="payment.amount" className="block text-sm font-medium">Payment Amount</label>
                    <Input
                        name="payment.amount"
                        type="number"
                        value={formData.payment.amount}
                        onChange={(e) => handleNestedChange('payment', 'amount', e.target.value)}
                        placeholder="Payment Amount"
                        className="mt-1 block w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Payment Status</label>
                    <Dropdown
                        options={[
                            { label: 'Pending', value: PaymentStatus.PENDING },
                            { label: 'Paid', value: PaymentStatus.PAID },
                        ]}
                        value={formData.payment.status}
                        onChange={(value) => handleNestedChange('payment', 'status', value)}
                    />
                </div>
                <Button type="submit" className="w-full">
                    Submit
                </Button>
            </form>
        </div>
    );
};

export default MilestoneForm;