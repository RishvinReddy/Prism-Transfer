import { BenchmarkModule, BenchmarkResult } from "../types";
import { calculateSHA256 } from "@/lib/checksum";

export class CPUBenchmark implements BenchmarkModule {
  name = "CPU";

  async run(): Promise<BenchmarkResult> {
    const details: Record<string, number | string> = {};
    const tStart = performance.now();
    let score = 0;

    // 1. Event Loop Latency
    const loopLatency = await this.measureEventLoopLatency();
    details.eventLoopLatencyMs = Math.round(loopLatency * 10) / 10;
    
    // 2. SHA-256 Throughput
    const shaThroughput = await this.measureSHA256();
    details.sha256ThroughputMBps = Math.round(shaThroughput);

    // 3. AES-256-GCM Encryption / Decryption
    const { encThroughput, decThroughput } = await this.measureAES();
    details.aesEncryptMBps = Math.round(encThroughput);
    details.aesDecryptMBps = Math.round(decThroughput);

    // 4. PBKDF2 Key Derivation
    const pbkdf2Latency = await this.measurePBKDF2();
    details.pbkdf2LatencyMs = Math.round(pbkdf2Latency);

    // 5. Worker Startup Latency
    const workerLatency = await this.measureWorkerStartup();
    details.workerStartupMs = workerLatency;

    // Calculate score (out of 100)
    // 500 MB/s hashing is good (40 pts)
    const shaScore = Math.min(40, (shaThroughput / 500) * 40);
    // 1000 MB/s AES is good (30 pts)
    const aesScore = Math.min(30, (encThroughput / 1000) * 30);
    // PBKDF2 < 100ms is good (10 pts)
    const pbkdf2Score = Math.max(0, 10 - (pbkdf2Latency / 10));
    // Worker startup < 20ms is good (10 pts)
    const workerScore = Math.max(0, 10 - (workerLatency / 5));
    // Loop latency < 2ms is good (10 pts)
    const loopScore = Math.max(0, 10 - loopLatency);

    score = Math.round(shaScore + aesScore + pbkdf2Score + workerScore + loopScore);

    return {
      name: this.name,
      score: Math.max(0, Math.min(100, score)),
      durationMs: Math.round(performance.now() - tStart),
      timestamp: Date.now(),
      details,
    };
  }

  private async measureEventLoopLatency(): Promise<number> {
    return new Promise(resolve => {
      const t0 = performance.now();
      setTimeout(() => {
        const t1 = performance.now();
        // A standard setTimeout is clamped at 4ms in most browsers, but we check raw latency
        resolve(t1 - t0 - 4 > 0 ? t1 - t0 - 4 : t1 - t0);
      }, 0);
    });
  }

  private async measureSHA256(): Promise<number> {
    const data = new Uint8Array(2 * 1024 * 1024); // 2MB
    const t0 = performance.now();
    await calculateSHA256(data);
    const t1 = performance.now();
    const elapsedSec = (t1 - t0) / 1000;
    return 2 / elapsedSec; // MB/s
  }

  private async measureAES(): Promise<{ encThroughput: number, decThroughput: number }> {
    try {
      const key = await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );
      
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const data = new Uint8Array(2 * 1024 * 1024); // 2MB
      crypto.getRandomValues(data.subarray(0, 1024)); // randomize part

      const t0 = performance.now();
      const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        data
      );
      const t1 = performance.now();

      const t2 = performance.now();
      await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        encrypted
      );
      const t3 = performance.now();

      return {
        encThroughput: 2 / ((t1 - t0) / 1000),
        decThroughput: 2 / ((t3 - t2) / 1000)
      };
    } catch {
      return { encThroughput: 0, decThroughput: 0 };
    }
  }

  private async measurePBKDF2(): Promise<number> {
    try {
      const enc = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode("benchmark_passphrase"),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
      );
      
      const salt = crypto.getRandomValues(new Uint8Array(16));
      
      const t0 = performance.now();
      await crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt,
          iterations: 200000,
          hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
      );
      const t1 = performance.now();
      return t1 - t0;
    } catch {
      return 999;
    }
  }

  private async measureWorkerStartup(): Promise<number> {
    const t0 = performance.now();
    return new Promise(resolve => {
      try {
        const blob = new Blob(["self.onmessage = function(e) { self.postMessage('pong'); }"], { type: "application/javascript" });
        const url = URL.createObjectURL(blob);
        const worker = new Worker(url);
        worker.onmessage = () => {
          const t1 = performance.now();
          worker.terminate();
          URL.revokeObjectURL(url);
          resolve(Math.round(t1 - t0));
        };
        worker.postMessage("ping");
      } catch {
        resolve(999);
      }
    });
  }
}
