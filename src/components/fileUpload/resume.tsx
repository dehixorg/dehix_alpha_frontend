import React, { useState, useRef, useEffect } from 'react';
import { X, UploadCloud, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/lib/axiosinstance';

const allowedResumeFormats = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const maxResumeSize = 5 * 1024 * 1024; // 5MB

const ResumeUpload: React.FC = () => {
  const [selectedResume, setSelectedResume] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [resumePreviewURL, setResumePreviewURL] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const truncateFileName = (fileName?: string) => {
    if (!fileName) return ''; // Handle undefined values
    const maxLength = 20;
    const extension = fileName.includes('.') ? fileName.substring(fileName.lastIndexOf('.')) : ''; // Handle files without extension
    return fileName.length > maxLength
      ? `${fileName.substring(0, maxLength - extension.length)}...${extension}`
      : fileName;
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
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const { Location } = postResponse.data.data;
      
      if (!Location) throw new Error('Failed to upload the resume.');

      const putResponse = await axiosInstance.put(`/freelancer`, {
        resume: Location,
      });

      if (putResponse.status === 200) {
        
        setUploadedFileName(selectedResume.name);
        toast({ title: 'Success', description: 'Resume uploaded successfully!' });
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
        const response = await axiosInstance.get('/freelancer'); // API to get user profile
        if (response.data.resume) {
          setUploadedFileName(response.data.resume); // Set the stored resume URL
          setResumePreviewURL(response.data.resume); // Set the preview URL
        }
      } catch (error) {
        console.error('Error fetching resume:', error);
      }
    };
  
    fetchResume();
  }, []);

  const handleCancelClick = () => {
    setSelectedResume(null);
    setResumePreviewURL(null);
    setUploadedFileName(null);
  };

  return (
    <div className="upload-form max-w-md mx-auto rounded shadow-md p-4">
      <div className="space-y-6 flex flex-col items-center">
        <div
          className="flex flex-col items-center justify-center border-dashed border-2 border-gray-400 rounded-lg p-6 w-full cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          {selectedResume ? (
            <div className="w-full flex flex-col items-center gap-4 text-gray-700 text-center">
              <div className="flex flex-1 gap-6">
                <p className="truncate">{truncateFileName(selectedResume.name)}</p>
                <button
                  className="bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                  onClick={handleCancelClick}
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
                  <span className="text-gray-600 text-sm">{truncateFileName(selectedResume.name)}</span>
                </div>
              )}
            </div>
          ) : (
            <>
              <UploadCloud className="text-gray-500 w-12 h-12 mb-2" />
              <p className="text-gray-700 text-center">
                Drag and drop your resume here or click to upload
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

        {selectedResume && (
          <Button onClick={handleUploadClick} className="w-full" disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Upload Resume'}
          </Button>
        )}

        {uploadedFileName && (
          <p className="text-center text-gray-600">
            Uploaded: <strong>{truncateFileName(uploadedFileName || '')}</strong>
          </p>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;
