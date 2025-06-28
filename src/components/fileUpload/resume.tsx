import React, { useState, useRef, useEffect } from 'react';
import { X, UploadCloud, FileText, Download, Trash2 } from 'lucide-react';

import { Button } from '../ui/button';

import { toast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/lib/axiosinstance';

const allowedResumeFormats = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const maxResumeSize = 5 * 1024 * 1024; // 5MB

interface ResumeUploadProps {
  onResumeUpdate?: () => void;
  refreshTrigger?: number; // Add this to trigger refresh from parent
  userId?: string; // Add userId to ensure we fetch the correct user's data
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({
  onResumeUpdate,
  refreshTrigger,
  userId,
}) => {
  const [selectedResume, setSelectedResume] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [resumePreviewURL, setResumePreviewURL] = useState<string | null>(null);
  const [existingResumeUrl, setExistingResumeUrl] = useState<string | null>(
    null,
  );
  const [isRemoving, setIsRemoving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const truncateFileName = (fileName?: string) => {
    if (!fileName) return ''; // Handle undefined values
    const maxLength = 20;
    const extension = fileName.includes('.')
      ? fileName.substring(fileName.lastIndexOf('.'))
      : ''; // Handle files without extension
    return fileName.length > maxLength
      ? `${fileName.substring(0, maxLength - extension.length)}...${extension}`
      : fileName;
  };

  const extractFileNameFromUrl = (url: string) => {
    try {
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      // Remove query parameters if any
      return fileName.split('?')[0] || 'resume.pdf';
    } catch {
      return 'resume.pdf';
    }
  };

  const handleRemoveResume = async () => {
    try {
      setIsRemoving(true);
      await axiosInstance.put(`/freelancer`, {
        resume: null,
      });

      setExistingResumeUrl(null);
      setUploadedFileName(null);
      setResumePreviewURL(null);

      toast({
        title: 'Success',
        description: 'Resume removed successfully!',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove resume. Please try again.',
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (allowedResumeFormats.includes(file.type)) {
        if (file.size <= maxResumeSize) {
          setSelectedResume(file);
          setUploadedFileName(file.name);

          // Create a preview URL only for PDFs
          if (file.type === 'application/pdf') {
            const fileURL = URL.createObjectURL(file);
            setResumePreviewURL(fileURL);
          } else {
            setResumePreviewURL(null);
          }
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
          description: 'Supported formats: PDF, DOCX.',
        });
      }
    }
  };

  const handleUploadClick = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedResume) {
      toast({
        variant: 'destructive',
        title: 'No Resume Selected',
        description: 'Please select a resume before uploading.',
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

      if (!Location) throw new Error('Failed to upload the resume.');

      const putResponse = await axiosInstance.put(`/freelancer`, {
        resume: Location,
      });

      if (putResponse.status === 200) {
        setExistingResumeUrl(Location);
        setUploadedFileName(selectedResume.name);
        setSelectedResume(null);
        setResumePreviewURL(Location);

        // Notify parent component if callback provided
        if (onResumeUpdate) {
          onResumeUpdate();
        }

        toast({
          title: 'Success',
          description: 'Resume uploaded successfully!',
        });
      } else {
        throw new Error('Failed to update resume.');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };
  useEffect(() => {
    const fetchResume = async () => {
      try {
        // Use the same endpoint as the profile form for consistency
        const endpoint = userId ? `/freelancer/${userId}` : '/freelancer';
        const response = await axiosInstance.get(endpoint);

        // Check if response has the expected structure
        const resumeUrl = response.data?.data?.resume || response.data?.resume;

        if (resumeUrl && resumeUrl.trim() !== '') {
          setExistingResumeUrl(resumeUrl);
          setUploadedFileName(extractFileNameFromUrl(resumeUrl));
          setResumePreviewURL(resumeUrl); // Set the preview URL
        } else {
          // Clear states if no resume
          setExistingResumeUrl(null);
          setUploadedFileName(null);
          setResumePreviewURL(null);
        }
      } catch (error) {
        console.error('Error fetching resume:', error);
      }
    };

    fetchResume();
  }, [userId]);

  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedResume(null);
    setResumePreviewURL(null);
    // If there's an existing resume, don't clear the uploaded filename
    if (!existingResumeUrl) {
      setUploadedFileName(null);
    }
  };

  return (
    <div className="upload-form max-w-md mx-auto rounded shadow-md p-4">
      <div className="space-y-6 flex flex-col items-center">
        {existingResumeUrl && !selectedResume ? (
          // Show existing resume with options to change or remove
          <div className="w-full border border-gray-300 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <FileText className="text-green-600 w-8 h-8" />
                <div>
                  <p className="font-medium text-gray-800">Resume Uploaded</p>
                  <p className="text-sm text-gray-600">
                    {truncateFileName(uploadedFileName || 'resume.pdf')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(existingResumeUrl, '_blank')}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                View
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveResume}
                disabled={isRemoving}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isRemoving ? 'Removing...' : 'Remove'}
              </Button>
            </div>
          </div>
        ) : (
          // Show upload area
          <div
            className="flex flex-col items-center justify-center border-dashed border-2 border-gray-400 rounded-lg p-6 w-full cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {selectedResume ? (
              <div className="w-full flex flex-col items-center gap-4 text-gray-700 text-center">
                <div className="flex flex-1 gap-6">
                  <p className="truncate">
                    {truncateFileName(selectedResume.name)}
                  </p>
                  <button
                    className="bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                    onClick={(e) => handleCancelClick(e)}
                    aria-label="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {/* Preview Section */}
                {resumePreviewURL ? (
                  <iframe
                    src={resumePreviewURL}
                    title="Resume Preview"
                    className="w-full h-40 border rounded"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded">
                    <FileText className="text-gray-500 w-6 h-6" />
                    <span className="text-gray-600 text-sm">
                      {truncateFileName(selectedResume.name)}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <>
                <UploadCloud className="text-gray-500 w-12 h-12 mb-2" />
                <p className="text-gray-700 text-center">
                  {existingResumeUrl
                    ? 'Select a new resume to replace the current one'
                    : 'Drag and drop your resume here or click to upload'}
                </p>
                <div className="flex items-center mt-2">
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
        )}

        {selectedResume && (
          <Button
            onClick={handleUploadClick}
            className="w-full"
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Resume'}
          </Button>
        )}

        {uploadedFileName && (
          <p className="text-center text-gray-600">
            Uploaded:{' '}
            <strong>{truncateFileName(uploadedFileName || '')}</strong>
          </p>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;
