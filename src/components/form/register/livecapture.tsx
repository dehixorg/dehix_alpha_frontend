import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Camera } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form'; // Add this import
import { axiosInstance } from '@/lib/axiosinstance';

import { Button } from '@/components/ui/button';
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from '@/components/ui/form';

// Add interface for props
interface LiveCaptureFieldProps {
  form: UseFormReturn<any>; // Use appropriate type for your form
}

const LiveCaptureField = ({ form }: LiveCaptureFieldProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
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
      if (context && video.videoWidth > 0 && video.videoHeight > 0) {
        // Set canvas size to video size
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);

        // Convert to a file, upload immediately, and store URL in form
        setUploading(true);
        try {
          const resp = await fetch(dataUrl);
          const blob = await resp.blob();
          const file = new File([blob], 'live-capture.jpg', { type: 'image/jpeg' });
          const formData = new FormData();
          formData.append('liveCaptureUrl', file);
          const res = await axiosInstance.post('/register/upload-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          const url: string | undefined = res?.data?.data?.Location;
          if (url) {
            form.setValue('liveCaptureUrl', url, { shouldDirty: true, shouldValidate: true });
            form.clearErrors('liveCaptureUrl' as any);
          } else {
            setError('Failed to upload captured image.');
          }
        } catch (e) {
          console.error(e);
          setError('Failed to upload captured image.');
        } finally {
          setUploading(false);
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
    };
  }, [stream]);

  return (
    <FormField
      control={form.control}
      name="liveCaptureUrl"
      render={(
        { field }, // Keep field even if unused for form control
      ) => (
        <FormItem>
          <FormControl>
            <div className="flex flex-col md:justify-start md:items-start sm:justify-center items-center gap-2">
              {/* Live Capture Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                {/* Captured Image Preview */}
                {(capturedImage || field.value) && (
                  <div className="flex flex-col items-center">
                    <Image
                      src={capturedImage || field.value}
                      alt="Live Capture"
                      width={250}
                      height={250}
                      className="rounded-md object-cover"
                    />
                  </div>
                )}
                {!field.value && capturedImage && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setCapturedImage(null);
                      form.setValue('liveCaptureUrl', '');
                      startLiveCapture();
                    }}
                  >
                    Retake Photo
                  </Button>
                )}
                {!isCapturing && isMediaSupported && (
                  <Button type="button" onClick={startLiveCapture}>
                    <Camera className="w-4 h-4 mr-2" />
                    Live Capture
                  </Button>
                )}
                {isCapturing && (
                  <Button type="button" onClick={captureLiveImage}>
                    {uploading ? 'Uploading…' : 'Take Photo'}
                  </Button>
                )}

                {/* Stop camera */}
                {isCapturing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (stream) stream.getTracks().forEach((t) => t.stop());
                      setIsCapturing(false);
                    }}
                  >
                    Stop Camera
                  </Button>
                )}

                {/* Live Video Preview */}
                {isCapturing && (
                  <video
                    ref={videoRef}
                    autoPlay
                    className="w-64 h-48 border rounded-md"
                    playsInline
                  >
                    {/* Add track element for accessibility */}
                    <track
                      kind="captions"
                      srcLang="en"
                      label="English captions"
                      src=""
                    />
                  </video>
                )}

                {/* Canvas (Hidden) */}
                <canvas
                  ref={canvasRef}
                  className="hidden"
                  width="640"
                  height="480"
                />
              </div>

              {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default LiveCaptureField;
