import React, { useState } from 'react';
import Image from 'next/image';
import {
  Video as VideoIcon,
  FileText as FileTextIcon,
  FileAudio as FileAudioIcon,
  AlertTriangle,
} from 'lucide-react';

import { MediaPreviewDialog } from './MediaPreviewDialog';

import { cn } from '@/lib/utils';

export type MediaItem = {
  id: string; // Added id for key prop
  url: string;
  type: string; // e.g., 'image/jpeg', 'application/pdf', 'video/mp4'
  fileName: string;
};
interface SharedMediaDisplayProps {
  mediaItems: MediaItem[];
  onMediaItemClick?: (item: MediaItem) => void;
  className?: string; // Allow passing additional class names for the container
  isExpanded?: boolean;
}

const SharedMediaDisplay: React.FC<SharedMediaDisplayProps> = ({
  mediaItems,
  onMediaItemClick,
  className,
  isExpanded = false,
}) => {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const itemsToShow = isExpanded ? mediaItems : mediaItems.slice(0, 4);

  if (!mediaItems || mediaItems.length === 0) {
    return (
      <div
        className={cn(
          'text-center text-sm text-[hsl(var(--muted-foreground))] p-4',
          className,
        )}
      >
        <p>No media to display.</p>
      </div>
    );
  }

  const handleItemClick = (item: MediaItem) => {
    if (onMediaItemClick) {
      onMediaItemClick(item);
    } else if (
      item.type.startsWith('image/') ||
      item.type.startsWith('audio/')
    ) {
      setSelectedMedia(item);
    } else {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  const renderMediaItem = (item: MediaItem) => {
    let content;
    const commonIconContainerClasses =
      'flex flex-col items-center justify-center h-full p-2 text-[hsl(var(--muted-foreground))]';
    const commonIconClasses = 'w-1/2 h-1/2';
    const commonFileNameClasses =
      'text-xs text-center truncate mt-1 w-full px-1';

    if (item.type.startsWith('image/')) {
      content = (
        <Image
          src={item.url}
          alt={item.fileName}
          layout="fill"
          objectFit="cover"
          className="w-full h-full rounded-md"
        />
      );
    } else if (item.type.startsWith('video/')) {
      content = (
        <div className={commonIconContainerClasses}>
          <VideoIcon className={commonIconClasses} />
          <p className={commonFileNameClasses}>{item.fileName}</p>
        </div>
      );
    } else if (item.type.startsWith('audio/')) {
      content = (
        <div className={commonIconContainerClasses}>
          <FileAudioIcon className={commonIconClasses} />
          <p className={commonFileNameClasses}>{item.fileName}</p>
        </div>
      );
    } else if (
      item.type.startsWith('application/pdf') ||
      item.type.startsWith('text/') ||
      item.type.includes('presentation') ||
      item.type.includes('document')
    ) {
      content = (
        <div className={commonIconContainerClasses}>
          <FileTextIcon className={commonIconClasses} />
          <p className={commonFileNameClasses}>{item.fileName}</p>
        </div>
      );
    } else {
      // Fallback for other/unknown file types
      content = (
        <div className={commonIconContainerClasses}>
          <AlertTriangle className={commonIconClasses} />
          <p className={commonFileNameClasses}>{item.fileName}</p>
        </div>
      );
    }

    const itemContainerClasses = cn(
      'aspect-square w-full h-full relative overflow-hidden rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--muted)_/_0.3)] hover:bg-[hsl(var(--muted)_/_0.5)] transition-colors',
      'cursor-pointer',
    );

    return (
      <button
        key={item.id}
        onClick={() => handleItemClick(item)}
        className={itemContainerClasses}
        aria-label={`View ${item.fileName}`}
      >
        {content}
      </button>
    );
  };

  return (
    <>
      <div className={cn('grid grid-cols-3 sm:grid-cols-4 gap-2', className)}>
        {itemsToShow.map(renderMediaItem)}
      </div>
      {selectedMedia && (
        <MediaPreviewDialog
          isOpen={!!selectedMedia}
          onClose={() => setSelectedMedia(null)}
          mediaUrl={selectedMedia.url}
          mediaType={selectedMedia.type}
          fileName={selectedMedia.fileName}
        />
      )}
    </>
  );
};

export default SharedMediaDisplay;
