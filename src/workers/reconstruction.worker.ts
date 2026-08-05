/// <reference lib="webworker" />
import { reconstructFile, ReconstructionError } from "@/features/scanner/reconstructionEngine";
import { TransferManifest, TransferPacket } from "@/types/transfer";

export interface ReconstructionWorkerRequest {
  manifest: TransferManifest;
  packets: TransferPacket[];
}

self.onmessage = async (event: MessageEvent<ReconstructionWorkerRequest>) => {
  try {
    const { manifest, packets } = event.data;
    
    const t0 = performance.now();
    // Perform sorting, decompression, CRC and SHA256 checks in the worker
    const { blob, metrics } = await reconstructFile(manifest, packets);
    
    // Blob is structured cloneable, we can send it directly
    self.postMessage({ 
      success: true, 
      blob,
      metrics: {
        latencyMs: Math.round(performance.now() - t0),
        details: metrics
      }
    });
  } catch (error: any) {
    self.postMessage({ success: false, error: error.message || "Unknown reconstruction error" });
  }
};
