import { BenchmarkModule, BenchmarkResult } from "../types";
import { processFileForTransfer } from "@/lib/chunker";
import { reconstructFile } from "@/features/scanner/reconstructionEngine";

export class TransferBenchmark implements BenchmarkModule {
  name = "Transfer";

  async run(): Promise<BenchmarkResult> {
    const details: Record<string, number | string> = {};
    const tStart = performance.now();
    let score = 0;

    // 1. Generate Dummy File (1MB)
    const size = 1024 * 1024;
    const data = new Uint8Array(size);
    for (let i = 0; i < size; i += 4) {
      data[i] = Math.floor(Math.random() * 256);
    }
    const file = new File([data], "benchmark_dummy.bin", { type: "application/octet-stream" });

    try {
      // 2. Encode Pipeline (processFile)
      const tEncodeStart = performance.now();
      const transfer = await processFileForTransfer(file, { reliabilityMode: "turbo" });
      const tEncodeEnd = performance.now();
      
      const encodeTime = tEncodeEnd - tEncodeStart;
      details.encodePipelineMs = Math.round(encodeTime);
      details.packetCount = transfer.packets.length;

      // 3. Decode Pipeline (reconstructFile)
      const tDecodeStart = performance.now();
      await reconstructFile(transfer.manifest, transfer.packets);
      const tDecodeEnd = performance.now();
      
      const decodeTime = tDecodeEnd - tDecodeStart;
      details.decodePipelineMs = Math.round(decodeTime);

      const totalTimeSec = (encodeTime + decodeTime) / 1000;
      const throughputMBps = 1 / (totalTimeSec || 0.001);
      
      details.endToEndThroughputMBps = Math.round(throughputMBps * 100) / 100;

      // Calculate score
      // Throughput > 5 MB/s = 100 pts. Throughput < 0.5 MB/s = 0 pts.
      score = Math.max(0, Math.min(100, ((throughputMBps - 0.5) / 4.5) * 100));
      
    } catch (e) {
      details.error = (e as Error).message;
      score = 0;
    }

    return {
      name: this.name,
      score: Math.round(score),
      durationMs: Math.round(performance.now() - tStart),
      timestamp: Date.now(),
      details,
    };
  }
}
