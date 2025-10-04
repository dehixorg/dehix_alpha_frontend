import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, RefreshCw, User2 } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from '@/components/ui/form';

interface LiveCaptureFieldProps {
  form: UseFormReturn<any>;
}

const LiveCaptureField = ({ form }: LiveCaptureFieldProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [canShoot, setCanShoot] = useState(false);
  // Use a ref for the current object URL to avoid stale closures and leaks
  const objectUrlRef = useRef<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const isMediaSupported =
    typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

  const startLiveCapture = async () => {
    setIsCapturing(true);
    try {
      setError(null);
      if (!isMediaSupported) throw new Error('Camera API not supported');
      // Request camera access with front camera preference
      const userMediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      setStream(userMediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = userMediaStream;
        // iOS/Safari requires playsInline and a play() call after a user gesture
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.muted = true;
        await videoRef.current.play();
        // Wait for metadata to ensure width/height
        await new Promise((resolve) => {
          const onLoaded = () => {
            setCanShoot((videoRef.current?.videoWidth || 0) > 0);
            resolve(true);
          };
          if ((videoRef.current?.readyState || 0) >= 1) onLoaded();
          else
            videoRef.current?.addEventListener('loadedmetadata', onLoaded, {
              once: true,
            });
        });
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError(
        'Unable to access the camera. Please allow camera permission or use the upload option below.',
      );
      setIsCapturing(false);
    }
  };

  const captureLiveImage = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvasRef.current.getContext('2d');
      // If video dimensions aren't ready yet, wait a few frames
      let tries = 0;
      while (
        (video.videoWidth === 0 || video.videoHeight === 0) &&
        tries < 10
      ) {
        await new Promise((r) => requestAnimationFrame(r));
        tries++;
      }
      if (!context) {
        setError('Unable to access drawing context.');
        return;
      }
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        // Set canvas size to video size
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);

        // Convert to a file and store in form; upload will happen on final submit
        try {
          const resp = await fetch(dataUrl);
          const blob = await resp.blob();
          const file = new File([blob], 'live-capture.jpg', {
            type: 'image/jpeg',
          });
          form.setValue('liveCaptureUrl', file as any, {
            shouldDirty: true,
            shouldValidate: true,
          });
          form.clearErrors('liveCaptureUrl' as any);
        } catch (e) {
          console.error(e);
          setError('Failed to process captured image.');
        }

        // Stop the camera stream
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        setIsCapturing(false);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [stream]);

  // Maintain previewSrc reactively based on capturedImage and liveCaptureUrl field
  useEffect(() => {
    const updateFromValue = (val: any) => {
      if (capturedImage) {
        setPreviewSrc(capturedImage);
        return;
      }
      if (typeof val === 'string') {
        setPreviewSrc(val);
      } else if (typeof File !== 'undefined' && val instanceof File) {
        // Revoke the previous object URL before creating a new one
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
        }
        const url = URL.createObjectURL(val);
        objectUrlRef.current = url;
        setPreviewSrc(url);
      } else {
        setPreviewSrc(null);
      }
    };

    // initial
    updateFromValue(form.getValues('liveCaptureUrl'));

    // subscribe to changes
    const subscription = form.watch((values: any, meta: any) => {
      if (!meta || meta.name === 'liveCaptureUrl') {
        updateFromValue(values?.liveCaptureUrl);
      }
    });
    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, [capturedImage]);

  return (
    <FormField
      control={form.control}
      name="liveCaptureUrl"
      render={({ field }: any) => (
        <FormItem>
          <FormControl>
            <div className="w-full">
              {/* Container */}
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-[220px]">
                    <p className="text-sm font-medium">Live selfie capture</p>
                    <p className="text-xs text-muted-foreground">
                      Allow camera, align your face within the guide, then take
                      a photo.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!isCapturing && isMediaSupported && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={startLiveCapture}
                      >
                        <Camera className="w-4 h-4" />
                        Start camera
                      </Button>
                    )}
                    {isCapturing && (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          onClick={captureLiveImage}
                          disabled={!canShoot}
                        >
                          {canShoot ? 'Take photo' : 'Preparing…'}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (stream)
                              stream.getTracks().forEach((t) => t.stop());
                            setIsCapturing(false);
                            setCanShoot(false);
                          }}
                        >
                          Stop
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Capture/Preview Area */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Left: Live or Illustration */}
                  <div className="relative flex items-center justify-center border rounded-md bg-background overflow-hidden h-64">
                    {isCapturing ? (
                      <div className="relative w-full h-full">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover"
                        >
                          <track
                            kind="captions"
                            srcLang="en"
                            label="English captions"
                            src=""
                          />
                        </video>
                        {/* Circular guide overlay */}
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <div className="h-44 w-44 rounded-full ring-2 ring-primary/70 ring-offset-2 ring-offset-background" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                        <User2 className="w-14 h-14 mb-3 border-4 border-muted-foreground rounded-full" />
                        <p className="text-sm">
                          No live preview. Start the camera to capture a selfie.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right: Captured preview only (no upload alternative) */}
                  <div className="space-y-3">
                    {previewSrc ? (
                      <div className="rounded-md flex items-center justify-center">
                        <Image
                          src={previewSrc}
                          alt="Selfie preview"
                          width={260}
                          height={260}
                          className="rounded-md object-cover border"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="border rounded-md p-3 bg-background text-center text-xs text-muted-foreground">
                        No photo yet. Start the camera and take a live selfie.
                      </div>
                    )}

                    {/* Actions under preview */}
                    {(capturedImage || field.value) && (
                      <div className="flex-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setCapturedImage(null);
                            form.setValue('liveCaptureUrl', null);
                            if (isMediaSupported) startLiveCapture();
                          }}
                        >
                          <RefreshCw className="w-4 h-4" />
                          Retake
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hidden canvas used for capture */}
                <canvas
                  ref={canvasRef}
                  className="hidden"
                  width={640}
                  height={480}
                />

                {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default LiveCaptureField;
