import { axiosInstance } from '@/lib/axiosinstance';

export type UploadViaSignedUrlResult = {
  key: string;
  url: string;
};

type UploadBackendResponse = {
  data?: {
    key?: string;
    url?: string;
  };
};

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

const uploadViaBackend = async (file: File, key: string) => {
  const formData = new FormData();
  formData.append('file', file, file.name || 'file');

  const fallbackResp = await axiosInstance.post<UploadBackendResponse>(
    '/register/upload-file',
    formData,
    {
      params: { key },
    },
  );

  const fallbackData = fallbackResp.data?.data;
  const fallbackUrl = fallbackData?.url;
  const fallbackKey = fallbackData?.key || key;

  if (!fallbackUrl) {
    throw new Error('Failed to upload file through backend fallback.');
  }

  return { key: fallbackKey, url: fallbackUrl };
};

export async function uploadFileViaSignedUrl(
  file: File,
  opts?: {
    keyPrefix?: string;
    key?: string;
    expiresInSeconds?: number;
  },
): Promise<UploadViaSignedUrlResult> {
  const key = opts?.key || buildKey(file, opts?.keyPrefix);
  void opts?.expiresInSeconds;

  return uploadViaBackend(file, key);
}
