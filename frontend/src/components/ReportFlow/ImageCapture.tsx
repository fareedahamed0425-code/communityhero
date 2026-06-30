import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, RefreshCcw, Check, X } from 'lucide-react';

interface Props {
  onNext: (imageUrl: string) => void;
}

const ImageCapture: React.FC<Props> = ({ onNext }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera when unmounting
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      setCameraError('Unable to access camera. Please allow permissions or use file upload.');
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPreview(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = () => {
    if (preview) {
      onNext(preview);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto animate-fade-in-up">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-headline font-extrabold text-on-surface mb-2">Capture Issue</h2>
        <p className="text-on-surface-variant font-body">Take a clear photo of the problem for our AI to analyze.</p>
      </div>
      
      {!preview ? (
        <div className="w-full flex flex-col items-center gap-6">
          
          {isCameraActive ? (
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-lg border border-surface-container-highest">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
              />
              <button 
                onClick={capturePhoto}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-black p-4 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-transform"
              >
                <Camera className="h-8 w-8" />
              </button>
              <button 
                onClick={stopCamera}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 backdrop-blur-md transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          ) : (
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={startCamera}
                className="flex flex-col items-center justify-center p-10 bg-surface-container-lowest border border-outline-variant/50 rounded-[2rem] hover:border-primary hover:shadow-md transition-all group active:scale-95"
              >
                <div className="bg-primary-container p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <Camera className="h-8 w-8 text-on-primary-container" />
                </div>
                <span className="text-on-surface font-label font-bold text-lg">Use Camera</span>
                <span className="text-on-surface-variant font-body text-sm mt-1">Take a live photo</span>
              </button>
              
              <label className="flex flex-col items-center justify-center p-10 bg-surface-container-lowest border border-outline-variant/50 rounded-[2rem] hover:border-secondary hover:shadow-md transition-all cursor-pointer group active:scale-95">
                <div className="bg-secondary-container p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="h-8 w-8 text-on-secondary-container" />
                </div>
                <span className="text-on-surface font-label font-bold text-lg">Upload Image</span>
                <span className="text-on-surface-variant font-body text-sm mt-1">Choose from gallery</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          )}

          {cameraError && (
            <div className="bg-error-container text-on-error-container p-4 rounded-xl text-sm font-medium w-full text-center">
              {cameraError}
            </div>
          )}
          
          {/* Hidden canvas for capturing frame */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      ) : (
        <div className="w-full flex flex-col items-center space-y-6">
          <div className="relative w-full rounded-2xl overflow-hidden shadow-md border border-surface-container-highest bg-black">
            <img src={preview} alt="Captured preview" className="w-full max-h-[50vh] object-contain" />
          </div>
          
          <div className="flex w-full gap-4">
            <button 
              onClick={() => setPreview(null)}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-surface-container-low text-on-surface font-label font-bold rounded-xl hover:bg-surface-container transition-colors active:scale-95"
            >
              <RefreshCcw className="h-5 w-5" />
              Retake
            </button>
            <button 
              onClick={handleContinue}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary text-on-primary font-label font-bold rounded-xl hover:bg-surface-tint shadow-sm hover:shadow transition-all active:scale-95"
            >
              Continue
              <Check className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCapture;
