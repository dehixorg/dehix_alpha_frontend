import React, { useState, useRef } from 'react';
import { X, UploadCloud, Image as ImageIcon } from 'lucide-react';

import { Button } from '../ui/button';

import { toast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/lib/axiosinstance';

const allowedResumeFormats = [
  'application/pdf', // PDF
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
];
const maxResumeSize = 5 * 1024 * 1024; // 5MB in bytes

interface ResumeUploadProps {
  user_id: string;
  url: string;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ user_id, url }) => {
  const [selectedResume, setSelectedResume] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const truncateFileName = (fileName: string) => {
    const maxLength = 20;
    const extension = fileName.substring(fileName.lastIndexOf('.'));
    if (fileName.length > maxLength) {
      return `${fileName.substring(0, maxLength - extension.length)}...${extension}`;
    }
    return fileName;
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (allowedResumeFormats.includes(file.type)) {
        if (file.size <= maxResumeSize) {
          setSelectedResume(file);
        } else {
          toast({
            variant: 'destructive',
            title: 'File too large',
            description: 'Resume size should not exceed 5MB.',
          });
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid file type',
          description: `Allowed formats: PDF, DOCX.`,
        });
      }
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

      const { Location } = postResponse.data?.data || {};

      if (!Location) {
        throw new Error('Failed to upload the resume.');
      }

      const putResponse = await axiosInstance.put(`/freelancer/${user_id}`, {
        resume: Location,
      });

      if (putResponse.status === 200) {
        setUploadedFileName(selectedResume.name);
        setSelectedResume(null);

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
        description:
          error instanceof Error
            ? error.message
            : 'File upload failed. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelClick = () => {
    setSelectedResume(null);
  };

  return (
    <div className="upload-form max-w-md mx-auto rounded shadow-md p-4">
      <div className="space-y-6 flex flex-col items-center">
        {/* Drag-and-Drop and Click-to-Upload Area */}
        <div
          className="flex flex-col items-center justify-center border-dashed border-2 border-gray-400 rounded-lg p-6 w-full cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          {selectedResume ? (
            <div className="w-full flex justify-center items-center gap-4 text-gray-700 text-center">
              <p className="truncate">
                {truncateFileName(selectedResume.name)}
              </p>
              <button
                className="bg-red-600 text-white rounded-full "
                onClick={handleCancelClick}
                aria-label="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <UploadCloud className="text-gray-500 w-12 h-12 mb-2" />
              <p className="text-gray-700 text-center">
                Drag and drop your resume here or click to upload
              </p>
              <div className="flex items-center mt-2">
                <ImageIcon className="text-gray-500 w-5 h-5 mr-1" />
                <span className="text-gray-600 text-xs md:text-sm">
                  Supported formats: PDF, DOCX.
                </span>
              </div>
              <input
                type="file"
                accept={allowedResumeFormats.join(',')}
                onChange={handleResumeChange}
                className="hidden"
                ref={fileInputRef}
              />
            </>
          )}
        </div>

        {/* Upload Button */}
        {selectedResume && (
          <Button
            onClick={handleUploadClick}
            className="w-full"
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Resume'}
          </Button>
        )}

        {/* Display Uploaded File Name */}
        {uploadedFileName && (
          <p className="text-center text-gray-600">
            Uploaded: <strong>{uploadedFileName}</strong>
          </p>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;
