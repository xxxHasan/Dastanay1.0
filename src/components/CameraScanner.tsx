import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Plus, Trash2, Check, AlertCircle, UploadCloud, X } from 'lucide-react';
import { CapturedPage } from '../types';

interface CameraScannerProps {
  onCaptureComplete: (pages: CapturedPage[]) => void;
  onCancel: () => void;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  onCaptureComplete,
  onCancel,
}) => {
  const [pages, setPages] = useState<CapturedPage[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize camera stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera access isn't available on this device.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera access failed:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in browser settings.');
      } else {
        setCameraError("Camera access isn't available on this device.");
      }
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const base64 = dataUrl.split(',')[1];

    const newPage: CapturedPage = {
      id: `page-${Date.now()}-${pages.length + 1}`,
      pageNumber: pages.length + 1,
      base64,
      previewUrl: dataUrl,
    };

    setPages((prev) => [...prev, newPage]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        setPages((prev) => [
          ...prev,
          {
            id: `upload-${Date.now()}-${idx}`,
            pageNumber: prev.length + 1,
            base64,
            previewUrl: dataUrl,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePage = (id: string) => {
    setPages((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      return filtered.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    });
  };

  const handleComplete = () => {
    stopCamera();
    onCaptureComplete(pages);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-600" />
            <span>Document & Note Scanner</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Capture multiple pages of handwritten notes, whiteboard formulas, or textbook chapters.
          </p>
        </div>

        <button
          onClick={() => { stopCamera(); onCancel(); }}
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Hidden Canvas for Frame Extraction */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden File Input for Fallback / Multi-image Selection */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Viewfinder or Fallback */}
      {!cameraError ? (
        <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-[380px] flex items-center justify-center border border-slate-800 shadow-inner">
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Viewfinder Guides */}
          <div className="absolute inset-6 border border-white/30 rounded-lg pointer-events-none" />

          {/* Shutter Bar Overlay */}
          <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-6 z-10">
            <button
              type="button"
              onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
              className="p-2.5 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-xs cursor-pointer transition-colors"
              title="Flip camera"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Big Shutter Button */}
            <button
              type="button"
              onClick={capturePhoto}
              className="w-14 h-14 rounded-full border-4 border-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 shadow-xl flex items-center justify-center text-white cursor-pointer transition-transform"
              title="Capture page"
            >
              <Camera className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-xs cursor-pointer transition-colors"
              title="Upload photo from disk"
            >
              <UploadCloud className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Camera Error / Fallback State */
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{cameraError}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              You can still scan and analyze your notes by choosing images directly from your photo library or computer.
            </p>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Images Instead</span>
          </button>
        </div>
      )}

      {/* Captured Pages Gallery Strip */}
      {pages.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Captured Pages ({pages.length})
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add From Files</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {pages.map((p) => (
              <div
                key={p.id}
                className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group bg-slate-100 dark:bg-slate-800 aspect-[3/4]"
              >
                <img
                  src={p.previewUrl}
                  alt={`Page ${p.pageNumber}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 p-2 flex flex-col justify-between opacity-90 group-hover:opacity-100 transition-opacity">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-white bg-black/50 px-1.5 py-0.5 rounded font-mono">
                      Page {p.pageNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => removePage(p.id)}
                      className="p-1 rounded bg-rose-600 text-white hover:bg-rose-700 cursor-pointer transition-colors"
                      title="Delete page"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Completion Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => { stopCamera(); onCancel(); }}
          className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={pages.length === 0}
          onClick={handleComplete}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:opacity-40 rounded-lg shadow-sm cursor-pointer transition-colors"
        >
          <Check className="w-4 h-4" />
          <span>
            {pages.length === 1 ? 'Use 1 Page' : pages.length > 1 ? `Analyze ${pages.length} Pages` : 'Capture a Page First'}
          </span>
        </button>
      </div>
    </div>
  );
};
