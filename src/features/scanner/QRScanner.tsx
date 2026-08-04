"use client";

import * as React from "react";
import { Html5Qrcode } from "html5-qrcode";

export interface QRScannerProps {
  onScan: (decodedText: string) => void;
  isScanning: boolean;
}

export function QRScanner({ onScan, isScanning }: QRScannerProps) {
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
            (errorMessage) => {
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

  return (
    <div className="w-full max-w-md mx-auto overflow-hidden rounded-2xl border border-border/50 shadow-2xl relative bg-black aspect-square flex items-center justify-center">
      <div id={regionId} className="w-full h-full [&>video]:object-cover" />
      
      {/* Minimal Scanner Overlay */}
      {isScanning && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          {/* Dimmed background outside scan region */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          
          {/* Clear Scan Region */}
          <div className="relative w-[70%] h-[70%] bg-transparent rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
            
            {/* White Corner Brackets with Slight Glow */}
            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
            
            {/* Thin inner border */}
            <div className="absolute inset-0 border border-white/20 rounded-lg" />
          </div>
        </div>
      )}

      {!isScanning && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-20">
          <p className="text-white font-medium">Scanner Paused</p>
        </div>
      )}
    </div>
  );
}
