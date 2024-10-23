import React, { useState, useRef } from 'react';
import { Plus, Loader2 } from 'lucide-react'; // Import Loader2
import Image from 'next/image';

import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { axiosInstance } from '@/lib/axiosinstance';

const allowedImageFormats = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/svg+xml',
];
const maxImageSize = 1 * 1024 * 1024; // 1MB

const ProfilePictureUpload = ({
  user_id,
  profile,
}: {
  user_id: string;
  profile: string;
}) => {
  const [selectedProfilePicture, setSelectedProfilePicture] =
    useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>('/user.png');
  const [isUploading, setIsUploading] = useState<boolean>(false); // For disabling the button
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && allowedImageFormats.includes(file.type)) {
      if (file.size <= maxImageSize) {
        setSelectedProfilePicture(file);
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Image size should not exceed 1MB.',
        });
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: `Please upload a valid image file. Allowed formats: ${allowedImageFormats.join(', ')}`,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProfilePicture) {
      toast({
        variant: 'destructive',
        title: 'No Image Selected',
        description: 'Please select an image before submitting.',
      });
      return;
    }

    setIsUploading(true); // Disable the upload button and show loader

    const formData = new FormData();
    formData.append('profilePicture', selectedProfilePicture);

    try {
      console.log('Uploading image...');
      const postResponse = await axiosInstance.post(
        '/register/upload-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      

      const { Location } = postResponse.data.data;
      const putResponse = await axiosInstance.put(`/freelancer/${user_id}`, {
        profilePicture: Location,
      });


      
      if (putResponse.status === 200) {
        toast({
          title: 'Success',
          description: 'Profile picture uploaded successfully!',
        });
      } else {
        throw new Error('Failed to update profile picture');
      }
    } catch (error) {
      console.error('Error during upload:', error);
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'Image upload failed. Please try again.',
      });
    } finally {
      setIsUploading(false); // Re-enable the upload button
    }
  };

  return (
    <div className="upload-form max-w-md mx-auto rounded shadow-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="file"
          accept={allowedImageFormats.join(',')}
          onChange={handleImageChange}
          className="hidden"
          ref={fileInputRef}
        />

        <div className="relative flex flex-col items-center">
          <label htmlFor="file-input" className="cursor-pointer relative">
            {previewUrl ? (
              <img
                width={28}
                height={28}
                src={previewUrl}
                alt="Avatar Preview"
                className="w-28 h-28 rounded-full object-cover border-2 border-black-300"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gray-700 flex items-center justify-center">
                <Image
                  width={28}
                  height={28}
                  src={profile}
                  alt="Avatar Preview"
                  className="w-28 h-28 rounded-full object-cover border-2 border-black-300"
                />
              </div>
            )}
            <Button
              variant="outline"
              type="button"
              size="icon"
              className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-black border border-black-300 flex items-center justify-center shadow-md"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus className="h-4 w-4 text-gray-400" />
            </Button>
          </label>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={!selectedProfilePicture || isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </>
          ) : (
            'Upload Profile Picture'
          )}
        </Button>
      </form>
    </div>
  );
};

export default ProfilePictureUpload;
