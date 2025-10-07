'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from '@/components/ui/shadcn-io/dropzone';

export type ImageUploaderProps = {
  label?: string;
  value: File | string | null | undefined;
  onChange: (next: File | string | null) => void;
  accept?: { [mime: string]: string[] };
  maxSize?: number;
  minSize?: number;
  maxFiles?: number;
  className?: string;
  previewHeight?: number;
};

export default function ImageUploader({
  label,
  value,
  onChange,
  accept = { 'image/*': ['.png', '.jpg', '.jpeg'] },
  maxSize = 5 * 1024 * 1024,
  minSize = 1,
  maxFiles = 1,
  className,
  previewHeight = 102,
}: ImageUploaderProps) {
  const [localPreview, setLocalPreview] = useState<string>('');
  const [files, setFiles] = useState<File[] | undefined>(undefined);

  // Seed preview when receiving an existing File value
  useEffect(() => {
    if (typeof File !== 'undefined' && value instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string')
          setLocalPreview(e.target.result);
      };
      reader.readAsDataURL(value);
    } else if (typeof value === 'string') {
      setLocalPreview('');
    } else if (!value) {
      setLocalPreview('');
      setFiles(undefined);
    }
  }, [value]);

  return (
    <div className={className}>
      {label && <p className="text-sm font-medium mb-2">{label}</p>}
      <div className="flex flex-col items-center gap-4">
        {(value && typeof value === 'string') || localPreview ? (
          <div className="relative">
            <Image
              src={typeof value === 'string' ? value : localPreview}
              alt={label || 'Image'}
              width={260}
              height={160}
              className="rounded-lg object-contain border shadow-sm"
            />
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute top-2 right-2 rounded-full shadow"
              onClick={() => {
                onChange(null);
                setLocalPreview('');
                setFiles(undefined);
              }}
              aria-label="Change image"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Dropzone
            maxSize={maxSize}
            minSize={minSize}
            maxFiles={maxFiles}
            accept={accept}
            src={files}
            onDrop={(accepted) => {
              const file = accepted?.[0];
              if (file) {
                onChange(file);
                setFiles(accepted);
                const reader = new FileReader();
                reader.onload = (e) => {
                  if (typeof e.target?.result === 'string') {
                    setLocalPreview(e.target.result);
                  }
                };
                reader.readAsDataURL(file);
              } else {
                setFiles(undefined);
                setLocalPreview('');
              }
            }}
            onError={() => {}}
            className="w-full"
          >
            <DropzoneEmptyState />
            <DropzoneContent>
              {localPreview && (
                <div
                  className={`relative w-full`}
                  style={{ height: `${previewHeight}px` }}
                >
                  <Image
                    alt="Preview"
                    className="absolute top-0 left-0 h-full w-full object-cover"
                    src={localPreview}
                    width={260}
                    height={260}
                  />
                </div>
              )}
            </DropzoneContent>
          </Dropzone>
        )}
      </div>
    </div>
  );
}
