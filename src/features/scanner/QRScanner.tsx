"use client";

import * as React from "react";
import { motion } from "motion/react";
import { useQRScanner } from "./useQRScanner";
import { useSettings } from "@/contexts/settings";

export interface QRScannerProps {
  onScan: (decodedText: string) => void;
  isScanning: boolean;
  hasManifest?: boolean;
  scanQuality?: "excellent" | "good" | "poor";
}

export function QRScanner({ onScan, isScanning, hasManifest, scanQuality }: QRScannerProps) {
  const { settings } = useSettings();
  const { videoRef, canvasRef, error, isCameraReady, diagnostics } = useQRScanner({
    onScan,
    isScanning,
    targetFps: 30
  });

  const qualityColor = scanQuality === "excellent" ? "#22c55e" : scanQuality === "good" ? "#f59e0b" : "#ef4444";

  return (
    <div className="w-full max-w-md mx-auto relative rounded-2xl overflow-hidden bg-black shadow-2xl" style={{ aspectRatio: "1" }}>
      {/* Camera Feed */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        muted
        playsInline
      />
      
      {/* Hidden canvas for extraction */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Dimmed overlay outside scan region */}
      {isScanning && (
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
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              >
                <span className="text-white/80 text-xs font-medium tracking-wide">Point at sender's screen</span>
              </motion.div>
            )}
          </div>

          {/* Scan Quality Badge */}
          {scanQuality && hasManifest && (
            <div className="absolute top-3 right-3 flex items-center space-x-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: qualityColor, boxShadow: `0 0 6px ${qualityColor}` }} />
              <span className="text-white text-[11px] font-medium capitalize">{scanQuality}</span>
            </div>
          )}
        </div>
      )}

      {/* Diagnostics Overlay */}
      {settings.developerMode && (
        <div className="absolute top-2 left-2 z-50 bg-black/70 p-2 rounded text-[10px] font-mono text-green-400 space-y-1">
          <div>Res: {diagnostics.resolution}</div>
          <div>Ready: {diagnostics.ready}</div>
          <div>State: {diagnostics.decoderState}</div>
          <div>FPS: {diagnostics.fps}</div>
          <div>Decoded: {diagnostics.decodedFrames}</div>
          <div>DecodeMs: {diagnostics.lastFrameMs}</div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-6 text-center space-y-2">
          <div className="text-red-500 font-bold">Camera Error</div>
          <div className="text-white/70 text-xs">{error}</div>
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
