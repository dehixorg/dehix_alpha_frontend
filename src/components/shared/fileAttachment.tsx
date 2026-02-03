import React from 'react';
import { Download } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface FileAttachmentProps {
  fileName: string;
  fileUrl: string;
  fileType: string;
}

export function FileAttachment({
  fileName,
  fileUrl,
  fileType,
}: FileAttachmentProps) {
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
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
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
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
}
