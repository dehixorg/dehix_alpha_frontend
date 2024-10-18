import React, { useState, useEffect } from 'react';

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

const maxImageSize = 1 * 1024 * 1024;

const ProfilePictureUpload = ({ user_id }: { user_id: string }) => {
  const [selectedProfilePicture, setSelectedProfilePicture] =
    useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
    const formData = new FormData();
    formData.append('profilePicture', selectedProfilePicture);

    try {
      const postResponse = await axiosInstance.post(
        '/register/upload-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      const { Location } = postResponse.data;
      const putResponse = await axiosInstance.put(`/freelancer/${user_id}`, {
        ProfilePicture: Location,
      });

   

      if (putResponse.status === 200) {
        toast({
          title: 'Success',
          description: 'Profile picture uploaded successfully!',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Update failed',
          description: 'Failed to update profile picture. Please try again.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'Image upload failed. Please try again.',
      });
    }
  };

  return (
    <div className="upload-form max-w-md mx-auto p-6 rounded shadow-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="file"
          accept={allowedImageFormats.join(',')}
          onChange={handleImageChange}
          className="hidden"
          id="file-input"
        />

        <div className="relative flex flex-col items-center">
          <label htmlFor="file-input" className="cursor-pointer relative">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Avatar Preview"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
                <Avatar className="w-30 h-30" />
              </div>
            )}
            <div className="absolute bottom-0 right-0 bg-white p-1 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
          </label>
        </div>

        <Button type="submit" className="w-full">
          Upload Profile Picture
        </Button>
      </form>
    </div>
  );
};

export default ProfilePictureUpload;
