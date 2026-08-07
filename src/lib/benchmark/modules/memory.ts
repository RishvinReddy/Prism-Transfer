import { BenchmarkModule, BenchmarkResult } from "../types";

export class MemoryBenchmark implements BenchmarkModule {
  name = "Memory";

  async run(): Promise<BenchmarkResult> {
    const details: Record<string, number | string> = {};
    const tStart = performance.now();
    let score = 0;

    // 1. ArrayBuffer allocation speed
    const allocTime = this.measureAllocation();
    details.alloc100MBMs = allocTime;

    // 2. TypedArray writes
    const writeThroughput = this.measureWrites();
    details.typedArrayWriteMBps = Math.round(writeThroughput);

    // 3. Blob creation latency
    const blobLatency = this.measureBlobCreation();
    details.blobCreationMs = blobLatency;

    // 4. Large object release (GC hint)
    const gcStability = this.measureGCStability();
    details.gcStabilityScore = gcStability;

    // Calculate score
    const allocScore = Math.min(25, (50 / (allocTime || 1)) * 25);
    const writeScore = Math.min(25, (writeThroughput / 2000) * 25);
    const blobScore = Math.max(0, 25 - (blobLatency / 2));
    const gcScore = gcStability * 0.25; // 0-100 mapped to 0-25

    score = Math.round(allocScore + writeScore + blobScore + gcScore);

    return {
      name: this.name,
      score: Math.max(0, Math.min(100, score)),
      durationMs: Math.round(performance.now() - tStart),
      timestamp: Date.now(),
      details,
    };
  }

  private measureAllocation(): number {
    const t0 = performance.now();
    const buffers: ArrayBuffer[] = [];
    for (let i = 0; i < 10; i++) {
      buffers.push(new ArrayBuffer(10 * 1024 * 1024)); // 100MB total
    }
    const t1 = performance.now();
    return Math.round(t1 - t0);
  }

  private measureWrites(): number {
    const size = 10 * 1024 * 1024; // 10MB
    const buffer = new Uint8Array(size);
    const t0 = performance.now();
    for (let i = 0; i < size; i += 4) {
      buffer[i] = 255;
    }
    const t1 = performance.now();
    const elapsedSec = (t1 - t0) / 1000;
    return 10 / (elapsedSec || 0.001); // MB/s
  }

  private measureBlobCreation(): number {
    const parts = [];
    for (let i = 0; i < 1000; i++) {
      parts.push(new Uint8Array(1024)); // 1000 x 1KB
    }
    const t0 = performance.now();
    const blob = new Blob(parts);
    const t1 = performance.now();
    return Math.round(t1 - t0);
  }

  private measureGCStability(): number {
    // Repeatedly allocate and overwrite to test memory pressure
    const t0 = performance.now();
    let temp: Uint8Array;
    for (let i = 0; i < 50; i++) {
      temp = new Uint8Array(1024 * 1024); // 1MB
      temp[0] = i;
    }
    const t1 = performance.now();
    
    // We expect this to be fast if GC doesn't pause much
    const elapsed = t1 - t0;
    return Math.max(0, Math.min(100, 100 - (elapsed - 10) * 2));
  }
}
