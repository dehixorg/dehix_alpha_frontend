import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, UploadCloud, FileText } from 'lucide-react';

import { Button } from '../ui/button';

import { toast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/lib/axiosinstance';

const allowedResumeFormats = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
];
const maxResumeSize = 5 * 1024 * 1024;

interface ResumeUploadProps {
  user_id: string;
  url: string;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ user_id, url }) => {
  const [selectedResume, setSelectedResume] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(url);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const storedResumeUrl = localStorage.getItem('uploadedResumeUrl');
    if (storedResumeUrl) {
      setPreviewUrl(storedResumeUrl);
    }
  }, []);

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && allowedResumeFormats.includes(file.type)) {
      if (file.size <= maxResumeSize) {
        setSelectedResume(file);
        setPreviewUrl(URL.createObjectURL(file)); // Generate local preview URL
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
        description: `Allowed formats: ${allowedResumeFormats.join(', ')}`,
      });
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleResumeChange({ target: { files: [file] } } as any);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
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

      if (!postResponse.data?.data?.Location) {
        throw new Error('Failed to upload the resume.');
      }

      const { Location } = postResponse.data.data;

      const putResponse = await axiosInstance.put(`/freelancer/${user_id}`, {
        resume: Location,
      });

      if (putResponse.status === 200) {
        setPreviewUrl(Location);
        toast({
          title: 'Success',
          description: 'Resume uploaded successfully!',
        });

        localStorage.setItem('uploadedResumeUrl', Location);
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

  const handleDragAreaClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="upload-form max-w-md mx-auto rounded shadow-md p-4">
      <div className="space-y-6 flex flex-col items-center">
        {/* Drag-and-Drop and Click-to-Upload Area */}
        <div
          className={`flex flex-col items-center justify-center border-dashed border-2 ${
            isDragging ? 'border-blue-500' : 'border-gray-400'
          } rounded-lg p-6 w-full cursor-pointer`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleDragAreaClick}
        >
          {!selectedResume ? (
            <>
              <UploadCloud className="text-gray-500 w-12 h-12 mb-2" />
              <p className="text-gray-700 text-center">
                Drag and drop your resume here or click to upload
              </p>
              <div className="flex items-center mt-2">
                <ImageIcon className="text-gray-500 w-5 h-5 mr-1" />
                <span className="text-gray-600 text-sm">
                  Supported formats: PDF, DOCX, PPT
                </span>
              </div>
            </>
          ) : (
            // Preview for selected file
            <div className="flex flex-col items-center">
              <FileText className="text-gray-500 w-10 h-10 mb-2" />
              <p className="text-gray-700 text-center text-sm">
                {selectedResume.name}
              </p>
              <p className="text-gray-500 text-xs">
                {Math.round(selectedResume.size / 1024)} KB
              </p>
            </div>
          )}

          <input
            type="file"
            accept={allowedResumeFormats.join(',')}
            onChange={handleResumeChange}
            className="hidden"
            ref={fileInputRef}
          />
        </div>

        {/* Upload Button */}
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
