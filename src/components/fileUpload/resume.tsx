import React, { useState, useRef, useEffect } from 'react';
import { Plus, Image as ImageIcon, UploadCloud } from 'lucide-react'; // Import necessary icons

import { Button } from '../ui/button';

import { toast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/lib/axiosinstance';

const allowedResumeFormats = [
  'application/pdf', // PDF
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'application/vnd.ms-powerpoint', // PPT
];
const maxResumeSize = 5 * 1024 * 1024; // 5MB in bytes (increased for larger files)

interface ResumeUploadProps {
  user_id: string;
  url: string;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ user_id, url }) => {
  const [selectedResume, setSelectedResume] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(url); // Initialize previewUrl with the URL from props
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load the resume URL from localStorage on component mount
  useEffect(() => {
    const storedResumeUrl = localStorage.getItem('uploadedResumeUrl');
    if (storedResumeUrl) {
      setPreviewUrl(storedResumeUrl); // Set the preview URL from localStorage
    }
  }, []);

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && allowedResumeFormats.includes(file.type)) {
      if (file.size <= maxResumeSize) {
        setSelectedResume(file);
        setPreviewUrl(null); // No preview for non-image files
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
    const file = e.dataTransfer.files[0];
    if (file) {
      handleResumeChange({ target: { files: [file] } } as any); // Simulate file input change event
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
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
        setPreviewUrl(Location); // No preview for document files, just set the URL
        toast({
          title: 'Success',
          description: 'Resume uploaded successfully!',
        });

        // Store the URL in localStorage
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
    fileInputRef.current?.click(); // Trigger the file input dialog
  };

  return (
    <div className="upload-form max-w-md mx-auto rounded shadow-md p-4">
      <div className="space-y-6 flex flex-col items-center">
        {/* Drag-and-Drop and Click-to-Upload Area */}
        <div
          className="flex flex-col items-center justify-center border-dashed border-2 border-gray-400 rounded-lg p-6 w-full cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handleDragAreaClick} // Trigger file input on click
        >
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

          {/* Hidden file input for click-to-upload */}
          <input
            type="file"
            accept={allowedResumeFormats.join(',')}
            onChange={handleResumeChange}
            className="hidden"
            ref={fileInputRef} // Using ref to trigger click
          />
        </div>

        {/* File Preview */}
        {previewUrl && (
          <div className="flex items-center justify-center w-full mt-4">
            <div className="flex items-center border rounded p-2 w-full justify-center">
              <ImageIcon className="text-gray-500 w-8 h-8" />
              <span className="text-gray-700 ml-2">{selectedResume?.name}</span>
            </div>
          </div>
        )}

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
