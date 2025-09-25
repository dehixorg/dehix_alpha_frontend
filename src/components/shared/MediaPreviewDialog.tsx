import React from 'react';
import { Download } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface MediaPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType: string;
  fileName: string;
}

export const MediaPreviewDialog: React.FC<MediaPreviewDialogProps> = ({
  isOpen,
  onClose,
  mediaUrl,
  mediaType,
  fileName,
}) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-auto bg-background p-0 border-0 flex flex-col">
        <DialogHeader className="p-4 flex flex-row items-center  border-b">
          <div className="flex items-start ">
            <a href={mediaUrl} download={fileName}>
              <Button variant="ghost" size="icon" aria-label="Download file">
                <Download className="h-5 w-5" />
              </Button>
            </a>
          </div>
          <DialogTitle className="text-lg font-medium text-foreground truncate">
            {fileName}
          </DialogTitle>
        </DialogHeader>
        <div className="relative flex-1 w-full min-h-[70vh] flex items-center justify-center p-4">
          {mediaType.startsWith('image/') ? (
            <Image
              src={mediaUrl}
              alt={fileName}
              fill
              className="rounded-md object-contain"
              sizes="(max-width: 768px) 100vw, 80vw"
              priority
            />
          ) : mediaType.startsWith('audio/') ? (
            <audio controls src={mediaUrl} className="w-full max-w-md">
              Your browser does not support the audio element.
            </audio>
          ) : (
            <div className="text-center text-destructive flex flex-col items-center gap-4">
              <p className="font-semibold">Preview not available</p>
              <p className="text-sm text-muted-foreground">
                This file type ({mediaType}) cannot be previewed.
              </p>
              <a href={mediaUrl} download={fileName}>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Download {fileName}
                </Button>
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
