
import React, { useRef, useEffect, useState, useCallback } from 'react';
import Spinner from './Spinner';

interface CameraCaptureProps {
  onImageCapture: (file: File) => void;
  onCancel: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onImageCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const startCamera = async () => {
      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      setIsLoading(true);
      setError(null);
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setStream(mediaStream);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Nie można uzyskać dostępu do aparatu. Sprawdź uprawnienia w przeglądarce.");
      } finally {
        setIsLoading(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  const handleTakePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        canvas.toBlob(blob => {
          if (blob) {
            const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
            onImageCapture(file);
          }
        }, 'image/jpeg', 0.95);
      }
    }
  }, [onImageCapture]);

  return (
    <div className="flex flex-col items-center">
        <h2 className="text-2xl font-bold text-slate-700 mb-4">Zrób zdjęcie posiłku</h2>
        <div className="w-full aspect-square rounded-xl overflow-hidden shadow-md border-4 border-slate-100 mb-4 relative bg-black flex items-center justify-center">
            {isLoading && (
            <div className="text-center text-white">
                <Spinner />
                <p className="mt-2">Uruchamianie aparatu...</p>
            </div>
            )}
            {error && (
                <div className="p-4 text-center text-red-400">
                    <i className="fas fa-exclamation-triangle text-3xl mb-2"></i>
                    <p>{error}</p>
                </div>
            )}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                onCanPlay={handleCanPlay}
                className={`w-full h-full object-cover ${isLoading || error ? 'hidden' : ''}`}
                aria-label="Podgląd z kamery"
            />
            <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
        </div>
        <div className="flex space-x-4">
            <button
            onClick={handleTakePhoto}
            disabled={isLoading || !!error}
            className="bg-indigo-600 text-white font-bold p-4 rounded-full hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors flex items-center justify-center aspect-square h-16 w-16"
            aria-label="Zrób zdjęcie"
            >
            <i className="fas fa-camera text-2xl"></i>
            </button>
            <button
            onClick={onCancel}
            className="bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-lg hover:bg-slate-300 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
            Anuluj
            </button>
        </div>
    </div>
  );
};

export default CameraCapture;
