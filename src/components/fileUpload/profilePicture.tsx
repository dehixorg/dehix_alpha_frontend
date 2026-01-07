import React, { useState, useRef } from 'react';
import { Plus, Loader2, Minus, UserCircle } from 'lucide-react';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';

import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { Button } from '@/components/ui/button';
import { axiosInstance } from '@/lib/axiosinstance';
import { setUser } from '@/lib/userSlice';
import { RootState } from '@/lib/store';
import { Type } from '@/utils/enum';
import { compressImageFile } from '@/utils/imageCompression';
import { uploadFileViaSignedUrl } from '@/services/imageSignedUpload';

const allowedImageFormats = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/svg+xml',
];
const maxImageSize = 5 * 1024; // 5MB

const ProfilePictureUpload = ({
  profile,
  entityType,
}: {
  profile: string;
  entityType: Type.BUSINESS | Type.FREELANCER;
}) => {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const [selectedProfilePicture, setSelectedProfilePicture] =
    useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    profile && profile.trim() !== '' ? profile : null,
  );
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !allowedImageFormats.includes(file.type)) {
      notifyError(
        `Please upload a valid image file. Allowed formats: ${allowedImageFormats.join(', ')}`,
        'Invalid file type',
      );
      return;
    }
    console.log('IMAGWE:', file.size, maxImageSize);
    const nextFile =
      file.size > maxImageSize
        ? await compressImageFile(file, { maxBytes: maxImageSize })
        : file;

    setSelectedProfilePicture(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProfilePicture) {
      notifyError(
        'Please select an image before submitting.',
        'No Image Selected',
      );
      return;
    }

    setIsUploading(true);

    try {
      const uid = user?.uid || 'user';
      const extFromType = (selectedProfilePicture.type || '').split('/')[1];
      const ext = (extFromType || 'jpg').split(';')[0];
      const { url } = await uploadFileViaSignedUrl(selectedProfilePicture, {
        key: `profile/${uid}/profile-picture.${ext}`,
        methods: ['upload', 'get'],
      });

      dispatch(setUser({ ...user, photoURL: url }));

      const updateEndpoint =
        entityType === Type.FREELANCER ? `/freelancer` : `/business`;

      const putResponse = await axiosInstance.put(updateEndpoint, {
        profilePic: url,
      });

      if (putResponse.status === 200) {
        notifySuccess('Profile picture uploaded successfully!', 'Success');
      } else {
        throw new Error('Failed to update profile picture');
      }
    } catch (error) {
      console.error('Error during upload:', error);
      notifyError('Image upload failed. Please try again.', 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-form max-w-md mx-auto rounded">
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
              <Image
                width={112}
                height={112}
                src={previewUrl}
                alt="Avatar Preview"
                className="w-28 h-28 rounded-full object-cover border-2 border-black-300"
              />
            ) : profile && profile.trim() !== '' ? (
              <Image
                width={112}
                height={112}
                src={profile}
                alt="Avatar Preview"
                className="w-28 h-28 rounded-full object-cover border-2 border-black-300"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gray-700 flex items-center justify-center">
                <UserCircle className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <Button
              variant="outline"
              type="button"
              size="icon"
              className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-black border border-gray-300 flex items-center justify-center shadow-md"
              onClick={() => {
                if (previewUrl) {
                  setPreviewUrl(null);
                } else {
                  fileInputRef.current?.click();
                }
              }}
            >
              {previewUrl ? (
                <Minus className="h-4 w-4 text-gray-400" />
              ) : (
                <Plus className="h-4 w-4 text-gray-400" />
              )}
            </Button>
          </label>
        </div>

        {previewUrl && (
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
        )}
      </form>
    </div>
  );
};

export default ProfilePictureUpload;
