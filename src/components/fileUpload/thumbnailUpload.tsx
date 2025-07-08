import React, { useState, useRef } from 'react';
import { X, UploadCloud, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/lib/axiosinstance';

const allowedThumbnailFormats = ['image/jpeg', 'image/png', 'image/webp'];
const maxThumbnailSize = 2 * 1024 * 1024; // 2MB

interface ThumbnailUploadProps {
  projectId: string;
  existingThumbnail?: string;
  onUploadSuccess: (thumbnailUrl: string) => void;
  onRemoveSuccess: () => void;
}

const ThumbnailUpload: React.FC<ThumbnailUploadProps> = ({
  projectId,
  existingThumbnail,
  onUploadSuccess,
  onRemoveSuccess,
}) => {
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (allowedThumbnailFormats.includes(file.type)) {
        if (file.size <= maxThumbnailSize) {
          setSelectedThumbnail(file);
        } else {
          toast({
            variant: 'destructive',
            title: 'Image too large',
            description: 'Thumbnail size should not exceed 2MB.',
          });
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid file type',
          description: 'Supported formats: JPG, PNG, WebP.',
        });
      }
    }
  };

  const handleUploadClick = async () => {
    if (!selectedThumbnail) return;

    const formData = new FormData();
    formData.append('thumbnail', selectedThumbnail);
    formData.append('projectId', projectId);

    try {
      setIsUploading(true);
      const response = await axiosInstance.post(
        '/projects/upload-thumbnail',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );

      onUploadSuccess(response.data.data.Location);
      setSelectedThumbnail(null);
      toast({
        title: 'Success',
        description: 'Thumbnail uploaded successfully!',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to upload thumbnail. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveThumbnail = async () => {
    try {
      setIsRemoving(true);
      await axiosInstance.put(`/projects/${projectId}/thumbnail`, {
        thumbnail: null,
      });
      onRemoveSuccess();
      toast({
        title: 'Success',
        description: 'Thumbnail removed successfully!',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove thumbnail. Please try again.',
      });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="space-y-4">
      {existingThumbnail ? (
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-full h-48 rounded-md overflow-hidden border">
            <img
              src={existingThumbnail}
              alt="Project thumbnail"
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleRemoveThumbnail}
            disabled={isRemoving}
          >
            {isRemoving ? 'Removing...' : 'Remove Thumbnail'}
          </Button>
        </div>
      ) : selectedThumbnail ? (
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-full h-48 rounded-md overflow-hidden border">
            <img
              src={URL.createObjectURL(selectedThumbnail)}
              alt="Selected thumbnail"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedThumbnail(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadClick}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Thumbnail'}
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center border-dashed border-2 border-gray-300 rounded-lg p-6 cursor-pointer hover:border-gray-400 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud className="text-gray-400 w-12 h-12 mb-2" />
          <p className="text-center">
            Drag and drop your thumbnail here or click to upload
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Supported formats: JPG, PNG, WebP (max 2MB)
          </p>
          <input
            type="file"
            accept={allowedThumbnailFormats.join(',')}
            onChange={handleThumbnailChange}
            className="hidden"
            ref={fileInputRef}
          />
        </div>
      )}
    </div>
  );
};

export default ThumbnailUpload;