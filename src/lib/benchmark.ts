import { calculateSHA256 } from "./checksum";
import { packetStore } from "./storage";
import { nanoid } from "nanoid";

export class BenchmarkEngine {
  
  static async runCoreBenchmarks(): Promise<{ cpu: number, display: number, storage: number }> {
    const cpuScore = await this.benchmarkCPU();
    const storageScore = await this.benchmarkStorage();
    const displayScore = await this.benchmarkDisplay();

    return {
      cpu: cpuScore,
      display: displayScore,
      storage: storageScore
    };
  }

  static async runOpticalBenchmark(): Promise<{ optical: number }> {
    const opticalScore = await this.benchmarkCamera();
    return { optical: opticalScore };
  }

  private static async benchmarkCPU(): Promise<number> {
    try {
      const payload = new Uint8Array(5 * 1024 * 1024); // 5 MB
      const t0 = performance.now();
      await calculateSHA256(payload);
      const t1 = performance.now();
      const elapsed = t1 - t0;
      
      // Expected baseline: M-series mac can do 5MB SHA-256 very fast. 
      // If it takes < 20ms = 100, > 200ms = 0
      let score = 100 - ((elapsed - 20) / 1.8);
      return Math.max(0, Math.min(100, Math.round(score)));
    } catch {
      return 50; // Fallback
    }
  }

  private static async benchmarkStorage(): Promise<number> {
    try {
      const transferId = nanoid();
      const t0 = performance.now();
      // Write 500 small packets to storage (simulating chunking)
      for (let i = 0; i < 500; i++) {
        await packetStore.savePacket({
          transferId,
          packetId: `${transferId}:${i}`,
          index: i,
          kind: "data",
          crc32: "dummy",
          payload: new Uint8Array(1000), // 1KB per packet
          version: 3,
          total: 500
        });
      }
      const t1 = performance.now();
      await packetStore.clearTransfer(transferId);
      
      const elapsed = t1 - t0;
      // Writing 500 packets (500KB total but high IOPS). 
      // Expected < 50ms = 100, > 500ms = 0
      let score = 100 - ((elapsed - 50) / 4.5);
      return Math.max(0, Math.min(100, Math.round(score)));
    } catch {
      return 50;
    }
  }

  private static async benchmarkDisplay(): Promise<number> {
    return new Promise((resolve) => {
      let frames = 0;
      const MAX_FRAMES = 60;
      const timings: number[] = [];
      let lastTime = performance.now();

      const loop = (time: number) => {
        const delta = time - lastTime;
        if (frames > 0) timings.push(delta); // Skip first frame
        lastTime = time;
        frames++;

        if (frames < MAX_FRAMES) {
          requestAnimationFrame(loop);
        } else {
          // Calculate jitter
          const avg = timings.reduce((a, b) => a + b, 0) / timings.length;
          // For a 60hz display, avg should be ~16.6ms. We care about variance.
          let variance = 0;
          for (const t of timings) variance += Math.pow(t - avg, 2);
          const stdDev = Math.sqrt(variance / timings.length);
          
          // If stdDev < 1ms = 100. > 8ms = 0
          let score = 100 - ((stdDev - 1) * (100 / 7));
          resolve(Math.max(0, Math.min(100, Math.round(score))));
        }
      };
      
      requestAnimationFrame(loop);
    });
  }

  private static async benchmarkCamera(): Promise<number> {
    const t0 = performance.now();
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      const t1 = performance.now();
      
      const elapsed = t1 - t0;
      // Fast init < 500ms = 100, > 3000ms = 0
      let score = 100 - ((elapsed - 500) / 25);
      
      return Math.max(0, Math.min(100, Math.round(score)));
    } catch (e) {
      return 0; // Denied or failed
    } finally {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    }
  }
}
