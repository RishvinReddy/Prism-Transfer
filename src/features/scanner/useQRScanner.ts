"use client";

import * as React from "react";
import { useDiagnostics } from "@/contexts/diagnostics";

interface UseQRScannerOptions {
  onScan: (data: string, binaryData?: Uint8Array) => void;
  isScanning: boolean;
  targetFps?: number;
  facingMode?: "environment" | "user";
}

export function useQRScanner({
  onScan,
  isScanning,
  targetFps = 30,
  facingMode = "environment",
}: UseQRScannerOptions) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const requestRef = React.useRef<number>(0);
  const lastScanTimeRef = React.useRef<number>(0);
  const [error, setError] = React.useState<string | null>(null);
  const [errorType, setErrorType] = React.useState<"NotAllowed" | "NotFound" | "Generic" | null>(null);
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

  const workerRef = React.useRef<Worker | null>(null);
  const workerBusyRef = React.useRef<boolean>(false);
  const lastDecodeStartRef = React.useRef<number>(0);
  
  // Optional diagnostics context (fail-safe if used outside provider)
  let diagnosticsCtx: ReturnType<typeof useDiagnostics> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    diagnosticsCtx = useDiagnostics();
  } catch (e) {}
  
  const updateCamera = diagnosticsCtx?.updateCamera;

  const onScanRef = React.useRef(onScan);
  React.useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  React.useEffect(() => {
    const worker = new Worker(new URL("../../workers/scanner.worker.ts", import.meta.url));
    workerRef.current = worker;
    
    worker.onmessage = (e) => {
      workerBusyRef.current = false;
      const decodeTime = performance.now() - lastDecodeStartRef.current;
      
      setDiagnostics(prev => ({
        ...prev,
        decoderState: "Running",
        lastFrameMs: Math.round(decodeTime)
      }));

      const { success, data, binaryData, error, latencyMs } = e.data;
      
      if (diagnosticsCtx) {
        diagnosticsCtx.updateScannerWorker({
          status: "Running",
          latencyMs: latencyMs || Math.round(decodeTime)
        });
        diagnosticsCtx.updateCamera({ decodeLatencyMs: Math.round(decodeTime) });
      }

      if (success && (data || binaryData)) {
        setDiagnostics(prev => {
          const newFrames = prev.decodedFrames + 1;
          if (updateCamera) updateCamera({ decodedFrames: newFrames });
          return { ...prev, decodedFrames: newFrames };
        });
        const binaryArray = binaryData ? new Uint8Array(binaryData) : undefined;
        onScanRef.current(data, binaryArray);
      } else if (!success) {
        if (diagnosticsCtx) diagnosticsCtx.updateScannerWorker({ status: "Error", error });
        console.error("Scanner worker error:", error);
      }
    };

    return () => {
      worker.terminate();
    };
  }, []);

  // Keep a stable ref to the current facingMode so startCamera can be called
  // without re-registering effects every time it changes.
  const facingModeRef = React.useRef(facingMode);
  React.useEffect(() => {
    facingModeRef.current = facingMode;
  }, [facingMode]);

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

  const startCamera = React.useCallback(async () => {
    try {
      // Stop any existing stream first so we can restart with new facingMode
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }

      setError(null);
      setErrorType(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingModeRef.current,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();

        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();
        setDiagnostics(prev => ({
          ...prev,
          resolution: `${settings.width}x${settings.height}`,
          ready: "YES"
        }));
        setIsCameraReady(true);
        console.log(`[Camera] Ready (${settings.width}x${settings.height}) facing=${facingModeRef.current}`);
      }
    } catch (err: any) {
      const name: string = err?.name ?? "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setErrorType("NotAllowed");
        setError("Camera permission denied.");
      } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        setErrorType("NotFound");
        setError("No camera found on this device.");
      } else {
        setErrorType("Generic");
        setError(err.message || "Failed to access camera.");
      }
      setDiagnostics(prev => ({ ...prev, ready: "ERROR" }));
    }
  }, []); // facingMode is read via ref, so this stays stable

  // Exposed retry — lets callers restart the camera without re-mounting
  const retryCamera = React.useCallback(async () => {
    stopCamera();
    await startCamera();
  }, [startCamera, stopCamera]);

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

    // Scale down for jsQR performance (max 400x400)
    const targetSize = Math.min(scanSize, 400);

    // Set canvas to exactly the scaled region size
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (ctx) {
      if (workerBusyRef.current) {
        if (diagnosticsCtx) {
          diagnosticsCtx.updateCamera({ droppedFrames: diagnosticsCtx.state.camera.droppedFrames + 1 });
        }
        requestRef.current = requestAnimationFrame(scanFrame);
        return;
      }

      // Draw only the cropped region, scaling it down if necessary
      ctx.drawImage(video, sx, sy, scanSize, scanSize, 0, 0, targetSize, targetSize);
      const imageData = ctx.getImageData(0, 0, targetSize, targetSize);

      workerBusyRef.current = true;
      lastDecodeStartRef.current = performance.now();
      
      setDiagnostics(prev => {
        const next = { ...prev, fps: Math.round(currentFps) };
        if (updateCamera) updateCamera({ fps: next.fps });
        return next;
      });

      workerRef.current?.postMessage(
        {
          buffer: imageData.data.buffer,
          width: imageData.width,
          height: imageData.height,
        },
        [imageData.data.buffer] // Transfer the buffer for zero-copy
      );
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

  // When facingMode changes while scanning, restart the camera stream
  React.useEffect(() => {
    if (isScanning && isCameraReady) {
      startCamera().then(() => {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(scanFrame);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  return {
    videoRef,
    canvasRef,
    error,
    errorType,
    isCameraReady,
    diagnostics,
    retryCamera,
    startCamera,
  };
}
