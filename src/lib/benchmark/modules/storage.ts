import { BenchmarkModule, BenchmarkResult } from "../types";
import { packetStore } from "@/lib/storage";
import { nanoid } from "nanoid";

export class StorageBenchmark implements BenchmarkModule {
  name = "Storage";

  async run(): Promise<BenchmarkResult> {
    const details: Record<string, number | string> = {};
    const tStart = performance.now();
    let score = 0;

    // 1. IndexedDB Write & Read Speed
    const { writeThroughput, readThroughput } = await this.measureIndexedDB();
    details.idbWriteMBps = Math.round(writeThroughput);
    details.idbReadMBps = Math.round(readThroughput);

    // 2. Blob Serialization
    const blobLatency = await this.measureBlobSerialization();
    details.blobSerializeMs = blobLatency;

    // 3. LocalStorage Latency
    const lsLatency = this.measureLocalStorage();
    details.lsLatencyMs = lsLatency;

    // Calculate score
    const writeScore = Math.min(30, (writeThroughput / 100) * 30); // 100 MB/s = 30 pts
    const readScore = Math.min(30, (readThroughput / 200) * 30); // 200 MB/s = 30 pts
    const blobScore = Math.max(0, 20 - (blobLatency / 2)); // fast blob = 20 pts
    const lsScore = Math.max(0, 20 - lsLatency); // fast LS = 20 pts

    score = Math.round(writeScore + readScore + blobScore + lsScore);

    return {
      name: this.name,
      score: Math.max(0, Math.min(100, score)),
      durationMs: Math.round(performance.now() - tStart),
      timestamp: Date.now(),
      details,
    };
  }

  private async measureIndexedDB(): Promise<{ writeThroughput: number, readThroughput: number }> {
    try {
      const transferId = nanoid();
      const payloadSize = 1000;
      const count = 500;
      const totalMB = (payloadSize * count) / (1024 * 1024);

      // Write
      const t0 = performance.now();
      for (let i = 0; i < count; i++) {
        await packetStore.savePacket({
          transferId,
          packetId: `${transferId}:${i}`,
          index: i,
          kind: "data",
          crc32: "dummy",
          payload: new Uint8Array(payloadSize),
          version: 3,
          total: count
        });
      }
      const t1 = performance.now();
      
      // Read
      const t2 = performance.now();
      const packets = await packetStore.getAllPackets(transferId);
      const t3 = performance.now();

      await packetStore.clearTransfer(transferId);

      const writeElapsed = (t1 - t0) / 1000;
      const readElapsed = (t3 - t2) / 1000;

      return {
        writeThroughput: totalMB / (writeElapsed || 0.001),
        readThroughput: totalMB / (readElapsed || 0.001),
      };
    } catch {
      return { writeThroughput: 0, readThroughput: 0 };
    }
  }

  private async measureBlobSerialization(): Promise<number> {
    const data = new Uint8Array(5 * 1024 * 1024); // 5MB
    const t0 = performance.now();
    const blob = new Blob([data]);
    const url = URL.createObjectURL(blob);
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    const t1 = performance.now();
    URL.revokeObjectURL(url);
    return Math.round(t1 - t0);
  }

  private measureLocalStorage(): number {
    const t0 = performance.now();
    localStorage.setItem("prism_bench_test", "12345");
    const val = localStorage.getItem("prism_bench_test");
    localStorage.removeItem("prism_bench_test");
    const t1 = performance.now();
    return Math.round(t1 - t0);
  }
}
