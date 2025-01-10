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

  const handleDownload = () => {
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName; // Optional: This sets the downloaded file name

    // Append the link to the body (it needs to be in the DOM to trigger a click event)
    document.body.appendChild(link);

    // Programmatically click the link to trigger the download
    link.click();

    // Clean up by removing the link from the DOM
    document.body.removeChild(link);
  };

  // Truncate the file name if it's longer than 15 characters
  const truncatedFileName =
    fileName.length > 15 ? fileName.substring(14, 28) + '...' : fileName;

  return (
    <div className="flex items-center space-x-3 p-2 bg-primary rounded-md w-full max-w-md">
      {/* File Icon */}
      <div className="text-2xl">{getFileIcon(fileType)}</div>

      {/* File Name and Type */}
      <div className="flex-1">
        {/* Truncated File Name */}
        <p className="text-sm font-medium truncate">{truncatedFileName}</p>

        {/* File Type (Always visible, below the file name) */}
        <p className="text-xs text-muted-foreground uppercase">{fileType}</p>
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
