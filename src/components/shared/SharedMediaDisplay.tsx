import React from 'react';
import {
  Image as ImageIcon,
  Video as VideoIcon,
  FileText as FileTextIcon,
  AlertTriangle,
} from 'lucide-react'; // Added AlertTriangle for unknown

import { cn } from '@/lib/utils';
// If using next/image:
// import Image from 'next/image';

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
}

const SharedMediaDisplay: React.FC<SharedMediaDisplayProps> = ({
  mediaItems,
  onMediaItemClick,
  className,
}) => {
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

  const renderMediaItem = (item: MediaItem) => {
    let content;
    const commonIconContainerClasses =
      'flex flex-col items-center justify-center h-full p-2 text-[hsl(var(--muted-foreground))]';
    const commonIconClasses = 'w-1/2 h-1/2';
    const commonFileNameClasses =
      'text-xs text-center truncate mt-1 w-full px-1';

    if (item.type.startsWith('image/')) {
      content = (
        // Using standard <img> for now. Replace with Next.js <Image /> if the project is set up for it.
        // <Image src={item.url} alt={item.fileName} layout="fill" objectFit="cover" className="rounded-md" />
        <img
          src={item.url}
          alt={item.fileName}
          className="object-cover w-full h-full rounded-md"
        />
      );
    } else if (item.type.startsWith('video/')) {
      content = (
        <div className={commonIconContainerClasses}>
          <VideoIcon className={commonIconClasses} />
          <p className={commonFileNameClasses}>{item.fileName}</p>
        </div>
      );
    } else if (
      item.type.startsWith('application/pdf') ||
      item.type.startsWith('text/')
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
      'aspect-square relative overflow-hidden rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--muted)_/_0.3)] hover:bg-[hsl(var(--muted)_/_0.5)] transition-colors',
      onMediaItemClick ? 'cursor-pointer' : '',
    );

    if (onMediaItemClick) {
      return (
        <button
          key={item.id}
          onClick={() => onMediaItemClick(item)}
          className={itemContainerClasses}
          aria-label={`View ${item.fileName}`}
        >
          {content}
        </button>
      );
    }

    return (
      <div key={item.id} className={itemContainerClasses}>
        {content}
      </div>
    );
  };

  return (
    <div
      className={cn(
        'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2',
        className,
      )}
    >
      {mediaItems.map(renderMediaItem)}
    </div>
  );
};

export default SharedMediaDisplay;
