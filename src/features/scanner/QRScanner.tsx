"use client";

import * as React from "react";
import { motion } from "motion/react";
import { useQRScanner } from "./useQRScanner";
import { useSettings } from "@/contexts/settings";
import { FlipHorizontal, RefreshCcw, ShieldAlert, Camera, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface QRScannerProps {
  onScan: (decodedText: string, binaryData?: Uint8Array) => void;
  isScanning: boolean;
  hasManifest?: boolean;
  scanQuality?: "excellent" | "good" | "poor";
  targetFps?: number | null;
  onEnvironmentWarning?: (warning: string | null) => void;
}

export function QRScanner({ onScan, isScanning, hasManifest, scanQuality, targetFps, onEnvironmentWarning }: QRScannerProps) {
  const { settings } = useSettings();

  // Local camera-facing override (toggled by Switch Camera button)
  const [facingMode, setFacingMode] = React.useState<"environment" | "user">(
    settings.cameraPreference
  );

  // Sync if the settings page changes preference while the scanner is mounted
  React.useEffect(() => {
    setFacingMode(settings.cameraPreference);
  }, [settings.cameraPreference]);

  const { videoRef, canvasRef, error, errorType, isCameraReady, diagnostics, environmentWarning, retryCamera } =
    useQRScanner({
      onScan,
      isScanning,
      targetFps: targetFps !== undefined ? targetFps : settings.fps,
      facingMode,
    });

  React.useEffect(() => {
    if (onEnvironmentWarning) {
      onEnvironmentWarning(environmentWarning);
    }
  }, [environmentWarning, onEnvironmentWarning]);

  const qualityColor =
    scanQuality === "excellent"
      ? "#22c55e"
      : scanQuality === "good"
      ? "#f59e0b"
      : "#ef4444";

  const handleSwitchCamera = () => {
    setFacingMode(prev => (prev === "environment" ? "user" : "environment"));
  };

  return (
    <div
      className="w-full max-w-md mx-auto relative rounded-2xl overflow-hidden bg-black shadow-2xl"
      style={{ aspectRatio: "1" }}
    >
      {/* Camera Feed */}
      <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />

      {/* Hidden canvas for extraction */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Dimmed overlay outside scan region */}
      {isScanning && !error && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute top-0 left-0 right-0 bg-black/50" style={{ height: "10%" }} />
          <div className="absolute bottom-0 left-0 right-0 bg-black/50" style={{ height: "10%" }} />
          <div className="absolute left-0 bg-black/50" style={{ top: "10%", bottom: "10%", width: "10%" }} />
          <div className="absolute right-0 bg-black/50" style={{ top: "10%", bottom: "10%", width: "10%" }} />

          {/* Clear Scan Region with Corner Brackets */}
          <div className="absolute" style={{ top: "10%", left: "10%", right: "10%", bottom: "10%" }}>
            <div className="absolute -top-[3px] -left-[3px] w-10 h-10 border-t-[3px] border-l-[3px] border-white rounded-tl-lg shadow-[0_0_12px_rgba(255,255,255,0.4)]" />
            <div className="absolute -top-[3px] -right-[3px] w-10 h-10 border-t-[3px] border-r-[3px] border-white rounded-tr-lg shadow-[0_0_12px_rgba(255,255,255,0.4)]" />
            <div className="absolute -bottom-[3px] -left-[3px] w-10 h-10 border-b-[3px] border-l-[3px] border-white rounded-bl-lg shadow-[0_0_12px_rgba(255,255,255,0.4)]" />
            <div className="absolute -bottom-[3px] -right-[3px] w-10 h-10 border-b-[3px] border-r-[3px] border-white rounded-br-lg shadow-[0_0_12px_rgba(255,255,255,0.4)]" />

            {!hasManifest && (
              <motion.div
                className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 whitespace-nowrap"
                initial={{ opacity: settings.reducedMotion ? 0.7 : 0 }}
                animate={settings.reducedMotion ? { opacity: 0.7 } : { opacity: [0, 1, 0] }}
                transition={settings.reducedMotion ? {} : { repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              >
                <span className="text-white/80 text-xs font-medium tracking-wide">
                  Point at sender's screen
                </span>
              </motion.div>
            )}
          </div>

          {/* Scan Quality Badge */}
          {scanQuality && hasManifest && (
            <div className="absolute top-3 right-3 flex items-center space-x-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-full">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: qualityColor, boxShadow: `0 0 6px ${qualityColor}` }}
              />
              <span className="text-white text-[11px] font-medium capitalize">{scanQuality}</span>
            </div>
          )}

          {/* Switch Camera Button */}
          <button
            onClick={handleSwitchCamera}
            title="Switch camera"
            className="absolute bottom-3 right-3 z-30 p-2 rounded-full bg-black/60 backdrop-blur-md text-white/80 hover:text-white hover:bg-black/80 transition-all pointer-events-auto"
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Diagnostics Overlay */}
      {settings.developerMode && (
        <div className="absolute top-2 left-2 z-50 bg-black/70 p-2 rounded text-[10px] font-mono text-green-400 space-y-1">
          <div>Res: {diagnostics.resolution}</div>
          <div>Ready: {diagnostics.ready}</div>
          <div>State: {diagnostics.decoderState}</div>
          <div>FPS: {diagnostics.fps} (target: {settings.fps})</div>
          <div>Facing: {facingMode}</div>
          <div>Decoded: {diagnostics.decodedFrames}</div>
          <div>DecodeMs: {diagnostics.lastFrameMs}</div>
        </div>
      )}

      {/* ── Actionable Error Overlay ── */}
      {error && (
        <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-50 p-6 text-center space-y-4">
          {errorType === "NotAllowed" ? (
            <>
              <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
                <ShieldAlert className="w-8 h-8 text-red-400" />
              </div>
              <div className="space-y-1">
                <p className="text-white font-bold text-sm">Camera permission denied</p>
                <p className="text-white/50 text-xs leading-relaxed max-w-[220px]">
                  Open your browser settings, find <span className="text-white/70 font-semibold">Camera</span>, allow access for this site, then retry.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full border-white/20 text-white hover:bg-white/10 text-xs"
                onClick={retryCamera}
              >
                <RefreshCcw className="w-3 h-3 mr-1.5" /> Retry
              </Button>
            </>
          ) : errorType === "NotFound" ? (
            <>
              <div className="p-3 bg-zinc-800 rounded-2xl border border-zinc-700">
                <CameraOff className="w-8 h-8 text-zinc-400" />
              </div>
              <div className="space-y-1">
                <p className="text-white font-bold text-sm">No camera detected</p>
                <p className="text-white/50 text-xs max-w-[220px]">
                  This device does not appear to have a camera available.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 bg-zinc-800 rounded-2xl border border-zinc-700">
                <Camera className="w-8 h-8 text-zinc-400" />
              </div>
              <div className="space-y-1">
                <p className="text-white font-bold text-sm">Camera failed to start</p>
                <p className="text-white/50 text-xs max-w-[220px]">{error}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full border-white/20 text-white hover:bg-white/10 text-xs"
                onClick={retryCamera}
              >
                <RefreshCcw className="w-3 h-3 mr-1.5" /> Retry
              </Button>
            </>
          )}
        </div>
      )}

      {/* Loading Overlay */}
      {!isCameraReady && !error && isScanning && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-40">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Paused Overlay */}
      {!isScanning && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-20">
          <p className="text-white/60 font-medium text-sm">Scanner Paused</p>
        </div>
      )}
    </div>
  );
}
