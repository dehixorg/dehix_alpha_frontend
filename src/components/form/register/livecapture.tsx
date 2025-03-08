import { useRef, useState } from 'react';
import Image from 'next/image';
import { Camera } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form'; // Add this import

import { Button } from '@/components/ui/button';
import {
  FormField,
  FormItem,
  FormLabel,
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

  const startLiveCapture = async () => {
    setIsCapturing(true);
    try {
      // Request camera access
      const userMediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setStream(userMediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = userMediaStream;
        await new Promise((resolve) => {
          videoRef.current!.onloadedmetadata = () => resolve(true);
        });
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setIsCapturing(false);
    }
  };

  const captureLiveImage = () => {
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

        // Convert to a file and save it in form
        fetch(dataUrl)
          .then((res) => res.blob())
          .then((blob) => {
            const file = new File([blob], 'live-capture.jpg', {
              type: 'image/jpeg',
            });
            form.setValue('liveCaptureUrl', file);
          });

        // Stop the camera stream
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        setIsCapturing(false);
      }
    }
  };

  return (
    <FormField
      control={form.control}
      name="liveCaptureUrl"
      render={(
        { field }, // Keep field even if unused for form control
      ) => (
        <FormItem>
          <FormLabel>Live Capture</FormLabel>
          <FormControl>
            <div className="flex flex-col gap-2">
              {/* Live Capture Buttons */}
              <div className="flex gap-2">
                {/* Captured Image Preview */}
                {(capturedImage || field.value) && (
                  <div className="flex flex-col items-center">
                    <Image
                      src={capturedImage || field.value}
                      alt="Live Capture"
                      width={128}
                      height={128}
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
                {!isCapturing && (
                  <Button type="button" onClick={startLiveCapture}>
                    <Camera className="w-4 h-4 mr-2" />
                    Live Capture
                  </Button>
                )}
                {isCapturing && (
                  <Button type="button" onClick={captureLiveImage}>
                    Take Photo
                  </Button>
                )}

                {/* Live Video Preview */}
                {isCapturing && (
                  <video
                    ref={videoRef}
                    autoPlay
                    className="w-64 h-48 border rounded-md"
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
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default LiveCaptureField;
