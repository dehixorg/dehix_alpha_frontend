import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface FileAttachmentProps {
  fileName: string;
  fileUrl: string;
  fileType: string;
}

// Allowed protocols for security
const ALLOWED_PROTOCOLS = ['http:', 'https:', 'blob:', 'data:'];

/**
 * Validates that the URL uses a safe protocol.
 * Returns true if safe, false otherwise.
 */
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin);
    return ALLOWED_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function FileAttachment({
  fileName,
  fileUrl,
  fileType,
}: FileAttachmentProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'ppt':
      case 'pptx':
        return '📊';
      case 'doc':
      case 'docx':
        return '📝';
      default:
        return '📁';
    }
  };

  const handleDownload = async () => {
    // Validate URL before any network/browser action
    if (!fileUrl || !isSafeUrl(fileUrl)) {
      toast({
        variant: 'destructive',
        title: 'Invalid File URL',
        description: 'The file URL is invalid or uses an unsafe protocol.',
      });
      return;
    }

    if (isDownloading) return; // Prevent repeated clicks

    setIsDownloading(true);
    try {
      // Fetch as blob so download works for cross-origin URLs (e.g. S3 in other chats)
      const res = await fetch(fileUrl, { mode: 'cors' });
      if (!res.ok) throw new Error('Fetch failed');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback: open in new tab so user can save (e.g. when CORS blocks fetch)
      // Re-validate before fallback window.open
      if (!isSafeUrl(fileUrl)) {
        toast({
          variant: 'destructive',
          title: 'Download Failed',
          description: 'The file URL uses an unsafe protocol.',
        });
        return;
      }
      const newWindow = window.open(fileUrl, '_blank', 'noopener,noreferrer');
      if (!newWindow) {
        // Popup was blocked - provide user-friendly feedback
        toast({
          variant: 'destructive',
          title: 'Popup Blocked',
          description: `Your browser blocked the download popup. Please allow popups for this site.`,
        });
      }
    } finally {
      setIsDownloading(false);
    }
  };

  // Truncate the file name if it's longer than 25 characters
  const truncatedFileName =
    fileName.length > 25 ? fileName.substring(0, 22) + '...' : fileName;

  return (
    <div className="flex items-center space-x-3 p-2 bg-[hsl(var(--muted))] dark:bg-[hsl(var(--accent))] rounded-md w-full max-w-md">
      {/* File Icon */}
      <div className="text-2xl">{getFileIcon(fileType)}</div>

      {/* File Name and Type */}
      <div className="flex-1">
        {/* Truncated File Name */}
        <p className="text-sm font-medium truncate">{truncatedFileName}</p>

        {/* File Type (Always visible, below the file name) */}
        <p className="text-xs  uppercase">{fileType}</p>
      </div>

      {/* Download Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDownload}
        title="Download"
        disabled={isDownloading}
      >
        {isDownloading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
