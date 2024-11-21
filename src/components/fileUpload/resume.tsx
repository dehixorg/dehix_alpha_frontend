import React, { useState } from 'react';
import Image from 'next/image';
import { Plus, Image as ImageIcon, UploadCloud } from 'lucide-react';

import { Button } from '../ui/button';

import { toast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/lib/axiosinstance';

const allowedResumeFormats = ['application/pdf', 'image/png'];
const maxResumeSize = 2 * 1024 * 1024; // 2MB in bytes

interface ResumeUploadProps {
  user_id: string;
  url: string;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ user_id, url }) => {
  const [selectedResume, setSelectedResume] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(url);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false); // Track if the resume has been uploaded

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && allowedResumeFormats.includes(file.type)) {
      if (file.size <= maxResumeSize) {
        setSelectedResume(file);
        setIsUploaded(false); // Reset upload state when selecting a new file
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
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      const { Location } = postResponse.data.data;

      const putResponse = await axiosInstance.put(`/freelancer/${user_id}`, {
        resume: Location,
      });

      if (putResponse.status === 200) {
        setPreviewUrl(selectedResume.type === 'image/png' ? Location : null);
        setIsUploaded(true); // Set uploaded state to true
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
    <div className="upload-form max-w-md mx-auto rounded-md shadow-md p-6  border-gray-200">
      <div className="space-y-6 flex flex-col items-center">
        <div className="flex items-center justify-center w-full">
          {previewUrl ? (
            selectedResume?.type === 'image/png' ? (
              <Image
                src={previewUrl}
                width={160}
                height={128}
                alt="Resume Preview"
                className="w-40 h-32 object-cover border border-gray-300 rounded-md shadow"
              />
            ) : (
              // Handle non-image file types (e.g., PDFs) with a fallback
              <div className="w-40 h-32 flex items-center justify-center border border-gray-300 rounded-md shadow">
                <span className="text-sm text-gray-500">PDF Preview</span>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center border-dashed border-2 border-gray-400 rounded-lg p-6">
              <UploadCloud className="text-gray-500 w-12 h-12 mb-2" />
              <p className="text-gray-700 text-center">
                Drag and drop your image here or click to upload
              </p>
              <div className="flex items-center mt-2">
                <ImageIcon className="text-gray-500 w-5 h-5 mr-1" />
                <span className="text-gray-600 text-sm">
                  Supported formats: JPG, PNG,JPEG
                </span>
              </div>
              <span className="text-sm text-gray mt-2">
                {isUploaded ? 'Resume Uploaded' : 'Upload'}
              </span>
            </div>
          )}
        </div>

        <input
          type="file"
          accept={allowedResumeFormats.join(',')}
          onChange={handleResumeChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold  file:text-gray-700 hover:file:bg-gray-200"
        />

        <Button
          onClick={handleUploadClick}
          className={`w-full font-medium py-2 rounded-md shadow hover:bg-gray-00 ${!selectedResume || isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!selectedResume || isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload Resume'}
        </Button>
      </div>
    </div>
  );
};

export default ResumeUpload;
