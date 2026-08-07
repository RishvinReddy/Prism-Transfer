"use client";

import * as React from "react";
import QRCode from "qrcode";
import { DEFAULT_ERROR_CORRECTION } from "@/constants/protocol";
import { cn } from "@/lib/utils";

export interface QRGeneratorProps {
  data: string | Uint8Array;
  size?: number;
  className?: string;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  quietZone?: number;
}

/**
 * QRGenerator is a pure presentation component.
 * It takes a serialized string (data) and renders it onto a Canvas.
 */
export const QRGenerator = React.memo(function QRGenerator({ 
  data, 
  size = 400, 
  className,
  errorCorrectionLevel = DEFAULT_ERROR_CORRECTION as any,
  quietZone = 6
}: QRGeneratorProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (canvasRef.current && data) {
      const qrData = data instanceof Uint8Array 
        ? [{ data: data as any, mode: 'byte' }] // 'any' cast to bypass outdated qrcode typings if necessary
        : data;

      QRCode.toCanvas(
        canvasRef.current,
        qrData as any,
        {
          width: size,
          margin: quietZone,
          errorCorrectionLevel: errorCorrectionLevel as any,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        },
        (error) => {
          if (error) console.error("QR Code rendering failed:", error);
        }
      );
    }
  }, [data, size]);

  return (
    <canvas 
      ref={canvasRef} 
      width={size} 
      height={size} 
      className={cn("!w-full !h-full object-contain", className)} 
    />
  );
});
