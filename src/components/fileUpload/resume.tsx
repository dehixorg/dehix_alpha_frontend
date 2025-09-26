import React, { useState, useRef, useEffect } from 'react';
import { X, UploadCloud, FileText, Download, Trash2 } from 'lucide-react';

import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { toast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/lib/axiosinstance';

const allowedResumeFormats = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const maxResumeSize = 5 * 1024 * 1024; // 5MB

interface ResumeUploadProps {
  onResumeUpdate?: () => void;
  userId?: string; // Add userId to ensure we fetch the correct user's data
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({
  onResumeUpdate,
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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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

  // Dropzone-style handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (allowedResumeFormats.includes(file.type)) {
        if (file.size <= maxResumeSize) {
          setSelectedResume(file);
          setUploadedFileName(file.name);
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
    <Card className="max-w-xl mx-auto">
      <CardHeader className="pb-3">
        <CardDescription>Upload or manage your resume. PDF preferred for a quick preview.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 flex flex-col items-center">
          {existingResumeUrl && !selectedResume ? (
            <div className="w-full rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FileText className="text-green-600 dark:text-green-400 w-8 h-8" />
                  <div>
                    <p className="font-medium text-foreground">Resume Uploaded</p>
                    <p className="text-sm text-muted-foreground">{truncateFileName(uploadedFileName || 'resume.pdf')}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)} className="flex items-center gap-2">
                  <Download className="w-4 h-4" /> Preview
                </Button>
                <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2">
                  Replace
                </Button>
                <Button variant="destructive" size="sm" onClick={handleRemoveResume} disabled={isRemoving} className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> {isRemoving ? 'Removing...' : 'Remove'}
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={`flex flex-col items-center justify-center border-dashed border-2 rounded-lg p-6 w-full cursor-pointer transition-colors ${
                isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              aria-label="Upload resume"
            >
              {selectedResume ? (
                <div className="w-full flex flex-col items-center gap-4 text-foreground text-center">
                  <div className="flex items-center gap-3">
                    <p className="truncate">{truncateFileName(selectedResume.name)}</p>
                    <button className="bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors" onClick={(e) => handleCancelClick(e)} aria-label="Remove file">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {resumePreviewURL ? (
                    <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
                      Preview
                    </Button>
                  ) : (
                    <div className="flex items-center space-x-2 p-2 bg-muted rounded">
                      <FileText className="text-muted-foreground w-6 h-6" />
                      <span className="text-muted-foreground text-sm">{truncateFileName(selectedResume.name)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <UploadCloud className="text-muted-foreground w-12 h-12 mb-2" />
                  <p className="text-foreground text-center">
                    {existingResumeUrl ? 'Select a new resume to replace the current one' : 'Drag and drop your resume here or click to upload'}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-muted-foreground text-xs md:text-sm">Supported formats: PDF, DOCX.</span>
                  </div>
                  <input type="file" accept={allowedResumeFormats.join(',')} onChange={handleResumeChange} className="hidden" ref={fileInputRef} />
                </>
              )}
            </div>
          )}

          {selectedResume && (
            <Button onClick={handleUploadClick} className="w-full" disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload Resume'}
            </Button>
          )}

          {uploadedFileName && (
            <p className="text-center text-muted-foreground">
              Uploaded: <strong className="text-foreground">{truncateFileName(uploadedFileName || '')}</strong>
            </p>
          )}
          {/* Hidden input to support Replace action even when existing resume is shown */}
          <input type="file" accept={allowedResumeFormats.join(',')} onChange={handleResumeChange} className="hidden" ref={fileInputRef} />

          {/* PDF Preview Modal */}
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogContent className="max-w-3xl w-[95vw] h-[80vh] p-0 overflow-hidden">
              <DialogHeader className="px-6 pt-4 pb-2">
                <DialogTitle className="text-base">Resume Preview</DialogTitle>
              </DialogHeader>
              {resumePreviewURL ? (
                <iframe src={resumePreviewURL} title="Resume Preview" className="w-full h-full border-t" />
              ) : existingResumeUrl ? (
                <iframe src={existingResumeUrl} title="Resume Preview" className="w-full h-full border-t" />
              ) : null}
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumeUpload;
