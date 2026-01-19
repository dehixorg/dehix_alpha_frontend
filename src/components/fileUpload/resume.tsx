import React, { useEffect, useMemo, useState } from 'react';
import { FileText, ExternalLink } from 'lucide-react';

import {
  Dropzone,
  DropzoneEmptyState,
  DropzoneContent,
} from '@/components/ui/shadcn-io/dropzone';
import { notifyError } from '@/utils/toastMessage';
import { axiosInstance } from '@/lib/axiosinstance';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { uploadFileViaSignedUrl } from '@/services/imageSignedUpload';

interface ResumeUploadProps {
  maxResumeSize?: number;
  onResumeUpdate?: () => void;
  userId?: string;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({
  maxResumeSize = 5 * 1024 * 1024,
  onResumeUpdate,
  userId,
}) => {
  const [files, setFiles] = useState<File[] | undefined>();
  const [isUploading, setIsUploading] = useState(false);
  const [existingResumeUrl, setExistingResumeUrl] = useState<string | null>(
    null,
  );
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const extractFileNameFromUrl = (url: string) => {
    try {
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      return fileName.split('?')[0] || 'resume.pdf';
    } catch {
      return 'resume.pdf';
    }
  };

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const endpoint = userId ? `/freelancer/${userId}` : '/freelancer';
        const response = await axiosInstance.get(endpoint);
        const resumeUrl = response.data?.data?.resume || response.data?.resume;
        if (resumeUrl && resumeUrl.trim() !== '') {
          setExistingResumeUrl(resumeUrl);
          setUploadedFileName(extractFileNameFromUrl(resumeUrl));
        } else {
          setExistingResumeUrl(null);
          setUploadedFileName(null);
        }
      } catch {
        // ignore
      }
    };
    fetchResume();
  }, [userId]);

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true);
      const scope = userId;
      if (!scope) {
        notifyError(
          'User ID is missing. Please log in again and try uploading your resume.',
          'Authentication required',
        );
        return;
      }
      const extFromName = file.name?.split('.')?.pop();
      const extFromType = (file.type || '').split('/')[1];
      const ext = (extFromName || extFromType || 'pdf').split(';')[0];
      const { url } = await uploadFileViaSignedUrl(file, {
        key: `resume/${scope}/resume.${ext}`,
        methods: ['upload', 'get'],
      });

      const putResponse = await axiosInstance.put('/freelancer', {
        resume: url,
      });
      if (putResponse.status !== 200)
        throw new Error('Failed to update resume.');

      onResumeUpdate?.();
      setExistingResumeUrl(url);
      setUploadedFileName(extractFileNameFromUrl(url));
      setFiles(undefined);
    } catch (err: any) {
      notifyError(
        err?.message || 'Something went wrong. Please try again.',
        'Upload error',
      );
    } finally {
      setIsUploading(false);
    }
  };
  const { cleanedName, uploadedAtLabel } = useMemo(() => {
    const name = uploadedFileName || '';
    const match = name.match(/^(\d{10,})-(.+)$/);
    if (!match)
      return { cleanedName: name, uploadedAtLabel: null as string | null };
    const tsRaw = match[1];
    const rest = match[2];
    let ms = Number(tsRaw);
    if (tsRaw.length === 10) ms *= 1000; // seconds -> ms
    const d = new Date(ms);
    const label = isNaN(d.getTime()) ? null : `Uploaded ${d.toLocaleString()}`;
    return { cleanedName: rest, uploadedAtLabel: label };
  }, [uploadedFileName]);

  return (
    <>
      <Dropzone
        maxSize={maxResumeSize}
        minSize={1024}
        maxFiles={1}
        accept={{
          'application/pdf': ['.pdf'],
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            ['.docx'],
        }}
        src={files}
        onDrop={async (accepted) => {
          setFiles(accepted);
          const file = accepted?.[0];
          if (file) await uploadFile(file);
        }}
        onError={(err) => notifyError(err.message, 'Upload error')}
        className="w-full"
        disabled={isUploading}
      >
        <DropzoneEmptyState />
        <DropzoneContent />
      </Dropzone>

      {existingResumeUrl && (
        <div className="mt-4 rounded-lg border border-border/60 bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Current Resume
              </p>
              <div className="flex items-center gap-2 min-w-0">
                <p
                  className="text-sm font-medium text-foreground truncate"
                  title={cleanedName || uploadedFileName || undefined}
                >
                  {cleanedName || uploadedFileName}
                </p>
                {uploadedAtLabel && (
                  <Badge variant="secondary" className="shrink-0">
                    {uploadedAtLabel}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(existingResumeUrl as string, '_blank')
                }
                className="flex items-center gap-1"
              >
                <ExternalLink className="h-4 w-4" /> View
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResumeUpload;
