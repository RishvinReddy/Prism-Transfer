"use client";

import * as React from "react";
import { Html5Qrcode } from "html5-qrcode";
import { motion } from "motion/react";

export interface QRScannerProps {
  onScan: (decodedText: string) => void;
  isScanning: boolean;
  hasManifest?: boolean;
  scanQuality?: "excellent" | "good" | "poor";
}

export function QRScanner({ onScan, isScanning, hasManifest, scanQuality }: QRScannerProps) {
  const scannerRef = React.useRef<Html5Qrcode | null>(null);
  const onScanRef = React.useRef(onScan);
  const regionId = "qr-reader-region";

  React.useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  React.useEffect(() => {
    let active = true;

    const initializeScanner = async () => {
      try {
        if (!scannerRef.current) {
          scannerRef.current = new Html5Qrcode(regionId);
        }

        if (isScanning && active) {
          await scannerRef.current.start(
            { facingMode: "environment" },
            {
              fps: 60,
              qrbox: { width: 300, height: 300 },
              aspectRatio: 1.0,
            },
            (decodedText) => {
              if (active) onScanRef.current(decodedText);
            },
            () => {
              // Ignore scan failures as they happen constantly between frames
            }
          );
        } else if (!isScanning && scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
      } catch (err) {
        console.error("Scanner initialization failed:", err);
      }
    };

    initializeScanner();

    return () => {
      active = false;
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [isScanning]);

  const qualityColor = scanQuality === "excellent" ? "#22c55e" : scanQuality === "good" ? "#f59e0b" : "#ef4444";

  return (
    <div className="w-full max-w-md mx-auto relative rounded-2xl overflow-hidden bg-black shadow-2xl" style={{ aspectRatio: "1" }}>
      {/* Camera Feed */}
      <div id={regionId} className="w-full h-full [&>video]:object-cover [&>video]:w-full [&>video]:h-full" />

      {/* Dimmed overlay outside scan region — 4 sides */}
      {isScanning && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* Top */}
          <div className="absolute top-0 left-0 right-0 bg-black/50" style={{ height: "15%" }} />
          {/* Bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/50" style={{ height: "15%" }} />
          {/* Left */}
          <div className="absolute left-0 bg-black/50" style={{ top: "15%", bottom: "15%", width: "15%" }} />
          {/* Right */}
          <div className="absolute right-0 bg-black/50" style={{ top: "15%", bottom: "15%", width: "15%" }} />

          {/* Clear Scan Region with Corner Brackets */}
          <div
            className="absolute"
            style={{ top: "15%", left: "15%", right: "15%", bottom: "15%" }}
          >
            {/* Corner Brackets */}
            <div className="absolute -top-[3px] -left-[3px] w-10 h-10 border-t-[3px] border-l-[3px] border-white rounded-tl-lg" style={{ boxShadow: "0 0 12px rgba(255,255,255,0.4)" }} />
            <div className="absolute -top-[3px] -right-[3px] w-10 h-10 border-t-[3px] border-r-[3px] border-white rounded-tr-lg" style={{ boxShadow: "0 0 12px rgba(255,255,255,0.4)" }} />
            <div className="absolute -bottom-[3px] -left-[3px] w-10 h-10 border-b-[3px] border-l-[3px] border-white rounded-bl-lg" style={{ boxShadow: "0 0 12px rgba(255,255,255,0.4)" }} />
            <div className="absolute -bottom-[3px] -right-[3px] w-10 h-10 border-b-[3px] border-r-[3px] border-white rounded-br-lg" style={{ boxShadow: "0 0 12px rgba(255,255,255,0.4)" }} />

            {/* Animated scanning hint when no manifest yet */}
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

          {/* Scan Quality Badge — top right */}
          {scanQuality && hasManifest && (
            <div className="absolute top-3 right-3 flex items-center space-x-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: qualityColor, boxShadow: `0 0 6px ${qualityColor}` }} />
              <span className="text-white text-[11px] font-medium capitalize">{scanQuality}</span>
            </div>
          )}
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
