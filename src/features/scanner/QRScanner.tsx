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
    <div className="w-full max-w-md mx-auto overflow-hidden rounded-xl border border-border/50 shadow-lg relative bg-black min-h-[300px] flex items-center justify-center">
      <div id={regionId} className="w-full h-full [&>video]:object-cover" />
      {!isScanning && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <p className="text-white font-medium">Scanner Paused</p>
        </div>
      )}
    </div>
  );
}
