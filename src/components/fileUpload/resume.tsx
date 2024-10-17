import React, { useState } from 'react';

import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { axiosInstance } from '@/lib/axiosinstance';

const allowedResumeFormats = ['application/pdf', 'image/png'];
const maxResumeSize = 2 * 1024 * 1024; // 2MB in bytes

const ResumeUpload = ({ user_id }: { user_id: string }) => {
  const [selectedResume, setSelectedResume] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && allowedResumeFormats.includes(file.type)) {
      if (file.size <= maxResumeSize) {
        setSelectedResume(file);
        if (file.type === 'image/png') {
          setPreviewUrl(URL.createObjectURL(file));
        } else {
          setPreviewUrl(null);
        }
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
        description: `Please upload a valid resume file. Allowed formats: ${allowedResumeFormats.join(', ')}`,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

      const putResponse = await axiosInstance.put('/freelancer/${user_id}', {
        ProfilePicture: Location,
      });
      console.log('API Response:', putResponse.data);

      if (putResponse.status === 200) {
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
      console.error('Error:', error);
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'File upload failed. Please try again.',
      });
    }
  };

  return (
    <div className="upload-form max-w-md mx-auto p-6 rounded shadow-md">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 flex flex-col items-center"
      >
        {selectedResume && (
          <div className="mt-4 flex items-center justify-center w-full">
            {selectedResume.type === 'image/png' ? (
              <img
                src={previewUrl!}
                alt="Resume Preview"
                className="max-w-full h-32 object-cover border rounded"
              />
            ) : (
              <div className="flex items-center border rounded p-2 w-full justify-center">
                <img
                  src="/path-to-your-pdf-icon.svg"
                  alt="PDF Icon"
                  className="w-8 h-8 mr-2"
                />
                <span className="text-gray-700">{selectedResume.name}</span>
              </div>
            )}
          </div>
        )}

        <input
          type="file"
          accept={allowedResumeFormats.join(',')}
          onChange={handleResumeChange}
          className="border border-gray-300 rounded p-2 w-full"
          id="resume-input"
        />

        <Button type="submit" className="w-full">
          Upload Resume
        </Button>
      </form>
    </div>
  );
};

export default ResumeUpload;
