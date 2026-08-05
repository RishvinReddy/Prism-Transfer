/// <reference lib="webworker" />
import jsQR from "jsqr";

export interface ScannerWorkerRequest {
  buffer: ArrayBuffer;
  width: number;
  height: number;
}

self.onmessage = (event: MessageEvent<ScannerWorkerRequest>) => {
  const { buffer, width, height } = event.data;
  
  try {
    const t0 = performance.now();
    const uint8Clamped = new Uint8ClampedArray(buffer);
    const code = jsQR(uint8Clamped, width, height, {
      inversionAttempts: "attemptBoth",
    });
    const t1 = performance.now();
    
    if (code) {
      // If V3 binary data is present, we copy it so we can safely transfer it back,
      // or we can just send the array structure.
      const binaryDataArray = code.binaryData ? Array.from(code.binaryData) : undefined;
      
      self.postMessage({
        success: true,
        data: code.data,
        binaryData: binaryDataArray,
        latencyMs: Math.round(t1 - t0)
      });
    } else {
      self.postMessage({ success: true, data: null, latencyMs: Math.round(t1 - t0) });
    }
  } catch (error: any) {
    self.postMessage({ success: false, error: error.message });
  }
};
