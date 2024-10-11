import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast'; 
import { Button } from '@/components/ui/button';

const FileUpload = () => {
 
  const allowedResumeFormats = ['application/pdf'];
  const allowedImageFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml'];

  const [selectedResume, setSelectedResume] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean | null>(null);

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && allowedResumeFormats.includes(file.type)) {
      setSelectedResume(file);
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: `Please upload a valid resume file. Allowed formats: ${allowedResumeFormats.join(', ')}`,
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && allowedImageFormats.includes(file.type)) {
      setSelectedImage(file);
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: `Please upload a valid image file. Allowed formats: ${allowedImageFormats.join(', ')}`,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedResume || !selectedImage) {
      toast({
        variant: 'destructive',
        title: 'Missing files',
        description: 'Please upload both a resume and an image.',
      });
      return;
    }

    const formData = new FormData();
    formData.append('resume', selectedResume);
    formData.append('image', selectedImage);

    try {
      const response = await fetch('/api/upload', { // according to api endpoint ye hum change kr denge
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadSuccess(true);
        toast({
          title: 'Success',
          description: 'Files uploaded successfully!',
        });
      } else {
        setUploadSuccess(false);
        toast({
          variant: 'destructive',
          title: 'Upload failed',
          description: 'File upload failed. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      setUploadSuccess(false);
      toast({
        variant: 'destructive',
        title: 'Network error',
        description: 'Error connecting to the server. Please check your network.',
      });
    }
  };

  return (
    <div className="upload-form max-w-md mx-auto p-6 rounded shadow-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="resume">Upload Resume (PDF):</Label>
          <Input
            type="file"
            accept={allowedResumeFormats.join(',')}
            onChange={handleResumeChange}
            className="mt-1 block w-full px-3 py-2 text-muted-foreground"
          />
        </div>
        <div>
          <Label htmlFor="image">Upload Image (PNG/JPG/GIF/SVG):</Label>
          <Input
            type="file"
            accept={allowedImageFormats.join(',')}
            onChange={handleImageChange}
            className="mt-1 block w-full px-3 py-2 text-muted-foreground"
          />
        </div>
        
        <Button className="w-full">Upload Files</Button>
      </form>
    </div>
  );
};

export default FileUpload;
