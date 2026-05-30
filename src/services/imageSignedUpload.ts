import { axiosInstance } from '@/lib/axiosinstance';

type SignedUrlResponse = {
  message?: string;
  data: {
    getUrl: string;
    uploadUrl: string;
    deleteUrl?: string;
    updateUrl?: string;
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

export async function uploadFileViaSignedUrl(
  file: File,
  opts?: {
    keyPrefix?: string;
    key?: string;
    expiresInSeconds?: number;
    methods?: SignedUrlMethod[] | string;
  },
): Promise<UploadViaSignedUrlResult> {
  const key = opts?.key || buildKey(file, opts?.keyPrefix);
  const expiresInSeconds = opts?.expiresInSeconds ?? 300;

  const methods = opts?.methods ?? ['upload', 'get'];

  const signedResp = await axiosInstance.post<SignedUrlResponse>(
    '/register/image-signed-urls',
    {
      key,
      contentType: file.type || 'application/octet-stream',
      expiresInSeconds,
    },
    {
      params: {
        methods,
      },
    },
  );

  const uploadUrl = signedResp.data?.data?.uploadUrl;
  const getUrl =
    signedResp.data?.data?.getUrl ||
    (typeof uploadUrl === 'string' ? uploadUrl.split('?')[0] : undefined);

  if (!uploadUrl || !getUrl) {
    throw new Error('Failed to get signed URLs for upload.');
  }

  const putResp = await fetch(uploadUrl, {
    method: 'PUT',
    mode: 'cors',
    credentials: 'omit',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  });

  if (!putResp.ok) {
    const txt = await putResp.text().catch(() => '');
    throw new Error(
      `Failed to upload file to storage (status ${putResp.status}). ${txt}`,
    );
  }

  return { key, url: getUrl };
}
