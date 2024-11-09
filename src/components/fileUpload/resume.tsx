import React, { useState } from 'react';

import { Button } from '../ui/button';

import { toast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/lib/axiosinstance';
import Image from 'next/image';

const allowedResumeFormats = ['application/pdf', 'image/png'];
const maxResumeSize = 2 * 1024 * 1024; // 2MB in bytes

interface ResumeUploadProps {
  user_id: string;
  url: string;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ user_id, url }) => {
  const [selectedResume, setSelectedResume] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(url); // Initialize previewUrl with the URL from props
  const [isUploading, setIsUploading] = useState(false);

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && allowedResumeFormats.includes(file.type)) {
      if (file.size <= maxResumeSize) {
        setSelectedResume(file);
        setPreviewUrl(
          file.type === 'image/png' ? URL.createObjectURL(file) : null,
        );
      } else {
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Resume size should not exceed 2MB.',
        });
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: `Allowed formats: ${allowedResumeFormats.join(', ')}`,
      });
    }
  };

  const handleUploadClick = async () => {
    if (!selectedResume) {
      toast({
        variant: 'destructive',
        title: 'No Resume Selected',
        description: 'Please select a resume before submitting.',
      });
      return;
    }

    const formData = new FormData();
    formData.append('resume', selectedResume);

    try {
      setIsUploading(true);

      const postResponse = await axiosInstance.post(
        '/register/upload-image',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );
      const { Location } = postResponse.data.data;

      const putResponse = await axiosInstance.put(`/freelancer/${user_id}`, {
        resume: Location,
      });

      if (putResponse.status === 200) {
        setPreviewUrl(
          selectedResume.type === 'image/png'
            ? URL.createObjectURL(selectedResume)
            : Location,
        ); // Update previewUrl based on file type
        toast({
          title: 'Success',
          description: 'Resume uploaded successfully!',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Update failed',
          description: 'Failed to update resume. Please try again.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'File upload failed. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-form max-w-md mx-auto rounded shadow-md p-4">
      <div className="space-y-6 flex flex-col items-center">
        <div className="flex items-center justify-center w-full">
          {previewUrl ? (
            <Image
              src={previewUrl}
              width={160} // Updated width and height for clearer preview size
              height={128}
              alt="Resume Preview"
              className="w-40 h-32 object-cover border rounded"
            />
          ) : (
            <div className="flex items-center border rounded p-2 w-full justify-center">
              <Image
                src={url}
                alt="PDF Icon"
                width={160} // Updated width and height for clearer preview size
                height={128}
                className="w-8 h-8"
              />
              <span className="text-gray-700 ml-2">{selectedResume?.name}</span>
            </div>
          )}
        </div>

        <input
          type="file"
          accept={allowedResumeFormats.join(',')}
          onChange={handleResumeChange}
          className="border-2 border-gray-400 rounded p-2 w-full"
          id="resume-input"
        />

        <Button
          onClick={handleUploadClick}
          className="w-full"
          disabled={!selectedResume || isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload Resume'}
        </Button>
      </div>
    </div>
  );
};

export default ResumeUpload;
