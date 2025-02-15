import { useState } from 'react';

import { Story } from '@/utils/types/Milestone';

export const useMilestoneDialog = (
  {
    setStoryData,
  }: { setStoryData: React.Dispatch<React.SetStateAction<Story>> } = {
    setStoryData: () => {},
  },
) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleStoryInputChange = (
    field: string,
    value: string | { urlName: string; url: string },
    index?: number,
  ) => {
    setStoryData((prev) => {
      if (field === 'importantUrls' && typeof index === 'number') {
        const updatedUrls = [...prev.importantUrls];
        updatedUrls[index] = value as { urlName: string; url: string };
        return { ...prev, importantUrls: updatedUrls };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleAddUrl = () => {
    setStoryData((prev) => ({
      ...prev,
      importantUrls: [...prev.importantUrls, { urlName: '', url: '' }],
    }));
  };

  const handleRemoveUrl = (index: number) => {
    setStoryData((prev) => ({
      ...prev,
      importantUrls: prev.importantUrls.filter((_, i) => i !== index),
    }));
  };

  return {
    isDialogOpen,
    handleOpenDialog,
    handleCloseDialog,
    handleStoryInputChange,
    handleAddUrl,
    handleRemoveUrl,
    setIsDialogOpen,
  };
};
