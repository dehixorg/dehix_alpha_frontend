import { axiosInstance } from '@/lib/axiosinstance';

type UploadFileResponse = {
  message?: string;
  data: {
    key: string;
    url: string;
  };
};

export type UploadViaSignedUrlResult = {
  key: string;
  url: string;
};

type SignedUrlMethod = 'get' | 'upload' | 'delete' | 'update';

const sanitizeFileName = (name: string) =>
  name
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '');

const buildKey = (file: File, keyPrefix?: string) => {
  const safeName = sanitizeFileName(file.name || 'file');
  const prefix = keyPrefix ? `${keyPrefix.replace(/^\/+|\/+$/g, '')}/` : '';
  return `${prefix}${Date.now()}-${safeName}`;
};

/**
 * Upload a file to Azure Blob Storage via the backend.
 *
 * This function replaces the old S3 signed-URL flow. Instead of getting a
 * pre-signed URL and PUTting to S3 directly, we now POST the file as
 * multipart/form-data to the backend, which handles the Azure upload and
 * returns { key, url }.
 *
 * The function signature and return type remain identical so that all
 * existing consumers (chat, KYC, resume, thumbnails, reports, profile pics)
 * continue to work without changes.
 */
export async function uploadFileViaSignedUrl(
  file: File,
  opts?: {
    keyPrefix?: string;
    key?: string;
    expiresInSeconds?: number;
    methods?: SignedUrlMethod[] | string;
  },
): Promise<UploadViaSignedUrlResult> {
  // Build the blob path (key) using the same logic as before
  const key = opts?.key || buildKey(file, opts?.keyPrefix);

  // Create FormData with the file
  const formData = new FormData();
  formData.append('file', file);

  // POST to the general-purpose Azure upload endpoint
  const response = await axiosInstance.post<UploadFileResponse>(
    '/register/upload-file',
    formData,
    {
      params: { key },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  const url = response.data?.data?.url;
  if (!url) {
    throw new Error('Failed to upload file — no URL returned from server.');
  }

  return { key, url };
}
