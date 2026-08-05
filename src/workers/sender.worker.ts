/// <reference lib="webworker" />
import { processFileForTransfer } from "@/lib/chunker";
import { TransferOptions } from "@/types/transfer";

export interface SenderWorkerRequest {
  file: File;
  options?: TransferOptions;
}

self.onmessage = async (event: MessageEvent<SenderWorkerRequest>) => {
  try {
    const t0 = performance.now();
    const { file, options } = event.data;
    
    // We execute the heavy pipeline in the worker.
    const result = await processFileForTransfer(file, options);
    
    const t1 = performance.now();
    // Send back the manifest, packets, and metrics.
    self.postMessage({ 
      success: true, 
      result, 
      metrics: {
        latencyMs: Math.round(t1 - t0),
        details: result.metrics,
      } 
    });
  } catch (error: any) {
    self.postMessage({ success: false, error: error.message });
  }
};
