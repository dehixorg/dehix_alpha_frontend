export type CompressImageOptions = {
  maxBytes: number;
  maxDimension?: number;
  mimeType?: 'image/jpeg' | 'image/webp';
  initialQuality?: number;
  minQuality?: number;
};

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Failed to read file'));
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error('Failed to encode image'));
        else resolve(blob);
      },
      mimeType,
      quality,
    );
  });

const clampSize = (
  width: number,
  height: number,
  maxDimension: number,
): { width: number; height: number } => {
  if (width <= maxDimension && height <= maxDimension) return { width, height };
  const scale = maxDimension / Math.max(width, height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
};

export async function compressImageFile(
  file: File,
  {
    maxBytes,
    maxDimension = 2048,
    mimeType = 'image/jpeg',
    initialQuality = 0.88,
    minQuality = 0.55,
  }: CompressImageOptions,
): Promise<File> {
  if (typeof window === 'undefined') return file;
  if (!(file instanceof File)) return file;

  const type = (file.type || '').toLowerCase();
  if (!type.startsWith('image/')) return file;
  if (type === 'image/svg+xml') return file;

  if (file.size <= maxBytes) return file;

  const dataUrl = await readFileAsDataUrl(file);
  const img = await loadImage(dataUrl);

  let { width, height } = clampSize(
    img.naturalWidth,
    img.naturalHeight,
    maxDimension,
  );

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  let quality = initialQuality;
  let blob = await canvasToBlob(canvas, mimeType, quality);

  while (blob.size > maxBytes && quality > minQuality) {
    quality = Math.max(minQuality, quality - 0.07);
    blob = await canvasToBlob(canvas, mimeType, quality);
  }

  if (blob.size > maxBytes && Math.max(width, height) > 1024) {
    const nextMaxDim = Math.max(
      1024,
      Math.round(Math.max(width, height) * 0.85),
    );
    const next = clampSize(width, height, nextMaxDim);
    width = next.width;
    height = next.height;

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    quality = Math.min(quality, 0.82);
    blob = await canvasToBlob(canvas, mimeType, quality);
    while (blob.size > maxBytes && quality > minQuality) {
      quality = Math.max(minQuality, quality - 0.07);
      blob = await canvasToBlob(canvas, mimeType, quality);
    }
  }

  if (blob.size >= file.size) return file;

  const nextName =
    file.name.replace(/\.[^.]+$/, '') +
    (mimeType === 'image/webp' ? '.webp' : '.jpg');
  return new File([blob], nextName, {
    type: mimeType,
    lastModified: Date.now(),
  });
}
