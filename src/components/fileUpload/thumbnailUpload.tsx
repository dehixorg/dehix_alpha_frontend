import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';

import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { Button } from '@/components/ui/button';
import { axiosInstance } from '@/lib/axiosinstance';

const allowedImageFormats = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
];
const maxImageSize = 5 * 1024 * 1024; // 5MB

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
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [thumbnailPreviewURL, setThumbnailPreviewURL] = useState<string | null>(
    existingThumbnailUrl || null,
  );
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleThumbnailChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!allowedImageFormats.includes(file.type)) {
      notifyError(
        'Please select a valid image file (PNG, JPG, JPEG, GIF, WebP).',
        'Invalid file type',
      );
      return;
    }

    // Validate file size
    if (file.size > maxImageSize) {
      notifyError('Please select an image smaller than 5MB.', 'File too large');
      return;
    }

    setSelectedThumbnail(file);

    // Create preview URL
    const previewURL = URL.createObjectURL(file);
    setThumbnailPreviewURL(previewURL);
  };

  const handleUploadClick = async () => {
    if (!selectedThumbnail) return;

    const formData = new FormData();
    formData.append('file', selectedThumbnail);

    try {
      setIsUploading(true);
      const postResponse = await axiosInstance.post(
        '/register/upload-image',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );

      const { Location } = postResponse.data.data;

      if (!Location) throw new Error('Failed to upload the thumbnail.');

      // Update preview URL with the uploaded URL
      setThumbnailPreviewURL(Location);
      setSelectedThumbnail(null);

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
    setThumbnailPreviewURL(null);

    if (onThumbnailUpdate) {
      onThumbnailUpdate('');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDivClick = () => {
    if (!thumbnailPreviewURL && !selectedThumbnail) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors ${
          thumbnailPreviewURL ? 'border-solid border-gray-400' : ''
        }`}
        onClick={handleDivClick}
      >
        {thumbnailPreviewURL ? (
          <div className="relative">
            <Image
              src={thumbnailPreviewURL}
              alt="Thumbnail preview"
              width={200}
              height={150}
              className="mx-auto rounded-lg object-cover"
              style={{ maxHeight: '150px', width: 'auto' }}
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveThumbnail();
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <>
            <Upload className="text-muted-foreground w-12 h-12 mb-2 mx-auto" />
            <p className="text-foreground text-center">
              Click to upload project thumbnail
            </p>
            <div className="flex items-center justify-center mt-2">
              <span className="text-muted-foreground text-xs md:text-sm">
                Supported formats: PNG, JPG, JPEG, GIF, WebP (Max 2MB)
              </span>
            </div>
          </>
        )}

        <input
          type="file"
          accept={allowedImageFormats.join(',')}
          onChange={handleThumbnailChange}
          className="hidden"
          ref={fileInputRef}
        />
      </div>

      {selectedThumbnail && !isUploading && (
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
