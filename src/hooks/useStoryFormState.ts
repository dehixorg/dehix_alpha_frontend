import { MilestoneFormData, MilestoneStatus } from '@/utils/types/Milestone';

export const useStoryFormState = (formData: MilestoneFormData, setFormData: React.Dispatch<React.SetStateAction<MilestoneFormData>>) => {
    const handleStoryChange = (index: number, field: string, value: string) => {
        const updatedStories = [...formData.stories];
        updatedStories[index] = { ...updatedStories[index], [field]: value };
        setFormData((prevState) => ({ ...prevState, stories: updatedStories }));
    };

    const addImportantUrl = (index: number) => {
        const updatedStories = [...formData.stories];
        updatedStories[index].importantUrl.push('');
        setFormData((prevState) => ({ ...prevState, stories: updatedStories }));
    };

    const handleUrlChange = (index: number, urlIndex: number, value: string) => {
        const updatedStories = [...formData.stories];
        updatedStories[index].importantUrl[urlIndex] = value;
        setFormData((prevState) => ({ ...prevState, stories: updatedStories }));
    };

    const addStory = () => {
        setFormData((prevState) => ({
            ...prevState,
            stories: [
                ...prevState.stories,
                {
                    _id: String(Date.now()),
                    summary: '',
                    importantUrl: [''],
                    title: '',
                    taskStatus: MilestoneStatus.NOT_STARTED,
                },
            ],
        }));
    };

    return { handleStoryChange, addImportantUrl, handleUrlChange, addStory };
};