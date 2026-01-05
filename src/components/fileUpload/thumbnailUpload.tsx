import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { Button } from '@/components/ui/button';
import { axiosInstance } from '@/lib/axiosinstance';
import ImageUploader from '@/components/fileUpload/ImageUploader';
import { compressImageFile } from '@/utils/imageCompression';

interface ThumbnailUploadProps {
  onThumbnailUpdate?: (thumbnailUrl: string) => void;
  existingThumbnailUrl?: string;
  className?: string;
}

const ThumbnailUpload: React.FC<ThumbnailUploadProps> = ({
  onThumbnailUpdate,
  existingThumbnailUrl,
  className = '',
}) => {
  const [selectedThumbnail, setSelectedThumbnail] = useState<
    File | string | null
  >(existingThumbnailUrl || null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleUploadClick = async () => {
    if (!selectedThumbnail || typeof selectedThumbnail === 'string') return;

    const file = await compressImageFile(selectedThumbnail, {
      maxBytes: 5 * 1024 * 1024,
    });

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      const postResponse = await axiosInstance.post(
        '/register/upload-image',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );

      const { Location } = postResponse.data.data;

      if (!Location) throw new Error('Failed to upload the thumbnail.');

      // Update to uploaded URL
      setSelectedThumbnail(Location);

      // Notify parent component if callback provided
      if (onThumbnailUpdate) {
        onThumbnailUpdate(Location);
      }

      notifySuccess('Thumbnail uploaded successfully!', 'Success');
    } catch (error) {
      console.error('Upload error:', error);
      notifyError(
        'Failed to upload thumbnail. Please try again.',
        'Upload failed',
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveThumbnail = () => {
    setSelectedThumbnail(null);

    if (onThumbnailUpdate) {
      onThumbnailUpdate('');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <ImageUploader
        label="Project Thumbnail"
        value={selectedThumbnail}
        onChange={setSelectedThumbnail}
        accept={{
          'image/png': ['.png'],
          'image/jpeg': ['.jpg', '.jpeg'],
          'image/gif': ['.gif'],
          'image/webp': ['.webp'],
        }}
        maxSize={5 * 1024 * 1024}
        previewHeight={200}
      />

      {selectedThumbnail &&
        selectedThumbnail instanceof File &&
        !isUploading && (
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleUploadClick}
              className="flex-1"
              disabled={isUploading}
            >
              Upload Thumbnail
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleRemoveThumbnail}
            >
              Cancel
            </Button>
          </div>
        )}

      {isUploading && (
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Uploading thumbnail...</span>
        </div>
      )}
    </div>
  );
};

export default ThumbnailUpload;
