'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import ImageUploader from '@/components/fileUpload/ImageUploader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

type ReportKycUploaderProps = {
  onFilesChange?: (
    front: File | string | null,
    back: File | string | null,
  ) => void;
};

export default function ReportKycUploader({
  onFilesChange,
}: ReportKycUploaderProps) {
  const [frontFile, setFrontFile] = useState<File | string | null>(null);
  const [backFile, setBackFile] = useState<File | string | null>(null);
  const [frontPreview, setFrontPreview] = useState<string>('');
  const [backPreview, setBackPreview] = useState<string>('');

  const frontUrlRef = useRef<string | null>(null);
  const backUrlRef = useRef<string | null>(null);

  useEffect(() => {
    onFilesChange?.(frontFile, backFile);
  }, [frontFile, backFile, onFilesChange]);

  useEffect(() => {
    const updatePreview = (
      val: any,
      set: (v: string) => void,
      ref: React.MutableRefObject<string | null>,
    ) => {
      if (ref.current) {
        URL.revokeObjectURL(ref.current);
        ref.current = null;
      }
      if (typeof val === 'string') {
        set(val);
      } else if (typeof File !== 'undefined' && val instanceof File) {
        const url = URL.createObjectURL(val);
        ref.current = url;
        set(url);
      } else {
        set('');
      }
    };
    updatePreview(frontFile, setFrontPreview, frontUrlRef);
    updatePreview(backFile, setBackPreview, backUrlRef);
    return () => {
      if (frontUrlRef.current) URL.revokeObjectURL(frontUrlRef.current);
      if (backUrlRef.current) URL.revokeObjectURL(backUrlRef.current);
    };
  }, [frontFile, backFile]);


  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <ImageUploader
            label={undefined}
            value={frontFile}
            onChange={setFrontFile}
            accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
            maxSize={5 * 1024 * 1024}
            minSize={1}
            maxFiles={1}
            previewHeight={102}
          />
        </div>
        <div>
          <ImageUploader
            label={undefined}
            value={backFile}
            onChange={setBackFile}
            accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
            maxSize={5 * 1024 * 1024}
            minSize={1}
            maxFiles={1}
            previewHeight={102}
          />
        </div>
      </div>
    </Card>
  );
}
