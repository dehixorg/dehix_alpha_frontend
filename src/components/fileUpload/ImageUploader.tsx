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
import { compressImageFile } from '@/utils/imageCompression';

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

  // Seed preview when receiving an existing File value or string URL
  useEffect(() => {
    if (typeof File !== 'undefined' && value instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string')
          setLocalPreview(e.target.result);
      };
      reader.readAsDataURL(value);
    } else if (typeof value === 'string') {
      setLocalPreview(value);
    } else if (!value) {
      setLocalPreview('');
      setFiles(undefined);
    }
  }, [value]);

  return (
    <div className={className}>
      {label && <p className="text-sm font-medium mb-2">{label}</p>}
      <div className="flex flex-col items-center gap-4">
        <Dropzone
          maxSize={maxSize}
          minSize={minSize}
          maxFiles={maxFiles}
          accept={accept}
          src={files}
          onDrop={async (accepted) => {
            const original = accepted?.[0];
            if (!original) {
              setFiles(undefined);
              setLocalPreview('');
              onChange(null);
              return;
            }

            const file = await compressImageFile(original, {
              maxBytes: maxSize,
            });

            onChange(file);
            setFiles([file]);
            const reader = new FileReader();
            reader.onload = (e) => {
              if (typeof e.target?.result === 'string') {
                setLocalPreview(e.target.result);
              }
            };
            reader.readAsDataURL(file);
          }}
          onError={() => {}}
          className="w-full"
        >
          <DropzoneEmptyState />
          <DropzoneContent>
            {localPreview && (
              <div className="relative w-full group">
                <div
                  className={`relative w-full`}
                  style={{ height: `${previewHeight}px` }}
                >
                  <Image
                    alt="Preview"
                    className="absolute top-0 left-0 h-full w-full object-cover rounded-lg"
                    src={localPreview}
                    width={260}
                    height={260}
                  />
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="absolute top-2 right-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(null);
                    setLocalPreview('');
                    setFiles(undefined);
                  }}
                  aria-label="Remove image"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            )}
          </DropzoneContent>
        </Dropzone>
      </div>
    </div>
  );
}
