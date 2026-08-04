"use client";

import * as React from "react";
import QRCode from "qrcode";
import { DEFAULT_ERROR_CORRECTION } from "@/constants/protocol";

export interface QRGeneratorProps {
  data: string;
  size?: number;
  className?: string;
}

/**
 * QRGenerator is a pure presentation component.
 * It takes a serialized string (data) and renders it onto a Canvas.
 */
export const QRGenerator = React.memo(function QRGenerator({ 
  data, 
  size = 400, 
  className 
}: QRGeneratorProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (canvasRef.current && data) {
      QRCode.toCanvas(
        canvasRef.current,
        data,
        {
          width: size,
          margin: 4,
          errorCorrectionLevel: DEFAULT_ERROR_CORRECTION as any,
          color: {
            dark: "#09090b",
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
      className={className} 
      style={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }}
    />
  );
});
