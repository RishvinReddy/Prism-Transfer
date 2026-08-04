"use client";

import * as React from "react";
import jsQR from "jsqr";

interface UseQRScannerOptions {
  onScan: (data: string) => void;
  isScanning: boolean;
  targetFps?: number;
}

export function useQRScanner({ onScan, isScanning, targetFps = 30 }: UseQRScannerOptions) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const requestRef = React.useRef<number>(0);
  const lastScanTimeRef = React.useRef<number>(0);
  const [error, setError] = React.useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = React.useState(false);

  // Diagnostics state
  const [diagnostics, setDiagnostics] = React.useState({
    resolution: "Unknown",
    ready: "NO",
    decoderState: "Stopped",
    fps: 0,
    decodedFrames: 0,
    lastFrameMs: 0
  });

  const onScanRef = React.useRef(onScan);
  React.useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const startCamera = React.useCallback(async () => {
    try {
      if (streamRef.current) return;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true"); // required to tell iOS safari we don't want fullscreen
        await videoRef.current.play();
        
        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();
        setDiagnostics(prev => ({
          ...prev,
          resolution: `${settings.width}x${settings.height}`,
          ready: "YES"
        }));
        setIsCameraReady(true);
        console.log(`[Camera] Ready (${settings.width}x${settings.height})`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to access camera");
      setDiagnostics(prev => ({ ...prev, ready: "ERROR" }));
    }
  }, []);

  const stopCamera = React.useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraReady(false);
    setDiagnostics(prev => ({ ...prev, ready: "NO", decoderState: "Stopped", fps: 0 }));
  }, []);

  const scanFrame = React.useCallback(() => {
    if (!isScanning) {
      setDiagnostics(prev => ({ ...prev, decoderState: "Paused" }));
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      requestRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    // Critical check: ensure video has enough data
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      requestRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const now = performance.now();
    const minFrameTime = 1000 / targetFps;

    // Throttle decoding to target FPS
    if (now - lastScanTimeRef.current < minFrameTime) {
      requestRef.current = requestAnimationFrame(scanFrame);
      return;
    }
    
    // Update FPS metric
    const currentFps = 1000 / (now - lastScanTimeRef.current);
    lastScanTimeRef.current = now;

    // Calculate crop region (matching the UI's object-cover square with 10% padding)
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const minDim = Math.min(vw, vh);
    // UI box is 80% of the square (10% padding on each side)
    const scanSize = Math.floor(minDim * 0.8);
    
    const sx = Math.floor((vw - scanSize) / 2);
    const sy = Math.floor((vh - scanSize) / 2);

    // Set canvas to exactly the crop region size
    canvas.width = scanSize;
    canvas.height = scanSize;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    
    if (ctx) {
      // Draw only the cropped region
      ctx.drawImage(video, sx, sy, scanSize, scanSize, 0, 0, scanSize, scanSize);
      const imageData = ctx.getImageData(0, 0, scanSize, scanSize);
      
      const decodeStart = performance.now();
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "attemptBoth",
      });
      const decodeTime = performance.now() - decodeStart;

      setDiagnostics(prev => ({
        ...prev,
        decoderState: "Running",
        fps: Math.round(currentFps),
        lastFrameMs: Math.round(decodeTime)
      }));

      if (code) {
        console.log("QR FOUND");
        console.log(code.data);
        setDiagnostics(prev => ({ ...prev, decodedFrames: prev.decodedFrames + 1 }));
        onScanRef.current(code.data);
      } else {
        console.log("NO QR");
        console.log(imageData.width, imageData.height);
      }
    }

    requestRef.current = requestAnimationFrame(scanFrame);
  }, [isScanning, targetFps]);

  React.useEffect(() => {
    if (isScanning) {
      startCamera().then(() => {
        requestRef.current = requestAnimationFrame(scanFrame);
      });
    } else {
      cancelAnimationFrame(requestRef.current);
      stopCamera();
    }

    return () => {
      cancelAnimationFrame(requestRef.current);
      stopCamera();
    };
  }, [isScanning, startCamera, stopCamera, scanFrame]);

  return {
    videoRef,
    canvasRef,
    error,
    isCameraReady,
    diagnostics
  };
}
