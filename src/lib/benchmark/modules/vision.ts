import { BenchmarkModule, BenchmarkResult } from "../types";
import QRCode from "qrcode";
import jsQR from "jsqr";

export class VisionBenchmark implements BenchmarkModule {
  name = "Vision";

  async run(): Promise<BenchmarkResult> {
    const details: Record<string, number | string> = {};
    const tStart = performance.now();
    let score = 0;

    // 1. QR Generation Speed (Main thread)
    const qrGenTime = await this.measureQRGeneration();
    details.qrGenerationMs = qrGenTime;

    // 2. Synthetic Decode Speed (Main thread or Worker)
    // Here we'll do it on the main thread for a pure vision engine baseline
    // The worker latency is tested via the Scanner Worker
    const { decodeTime, processingLatency } = await this.measureSyntheticDecode();
    details.syntheticDecodeMs = decodeTime;
    details.imageProcessingLatencyMs = processingLatency;

    // 3. Worker Latency (Scanner Worker)
    const workerLatency = await this.measureWorkerLatency();
    details.scannerWorkerLatencyMs = workerLatency;

    // Calculate score
    // Generation < 5ms is excellent (30 pts)
    const genScore = Math.max(0, 30 - qrGenTime);
    // Decode < 15ms is excellent (40 pts)
    const decScore = Math.max(0, 40 - decodeTime);
    // Worker latency < 10ms is excellent (30 pts)
    const workerScore = Math.max(0, 30 - workerLatency);

    score = Math.round(genScore + decScore + workerScore);

    return {
      name: this.name,
      score: Math.max(0, Math.min(100, score)),
      durationMs: Math.round(performance.now() - tStart),
      timestamp: Date.now(),
      details,
    };
  }

  private async measureQRGeneration(): Promise<number> {
    const data = "PRISM_TEST_PAYLOAD_" + "A".repeat(500);
    const t0 = performance.now();
    for (let i = 0; i < 5; i++) {
      await QRCode.toDataURL(data, { errorCorrectionLevel: "L", version: 10 });
    }
    const t1 = performance.now();
    return Math.round((t1 - t0) / 5);
  }

  private async measureSyntheticDecode(): Promise<{ decodeTime: number, processingLatency: number }> {
    return new Promise((resolve) => {
      // 1. Generate a raw QR code data URI
      QRCode.toDataURL("SYNTHETIC_DECODE_TEST", { errorCorrectionLevel: "M" }, (err, url) => {
        if (err || !url) {
          resolve({ decodeTime: 100, processingLatency: 100 });
          return;
        }

        const img = new Image();
        img.onload = () => {
          const tProcStart = performance.now();
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve({ decodeTime: 100, processingLatency: 100 });
            return;
          }
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const tProcEnd = performance.now();

          const tDecStart = performance.now();
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          const tDecEnd = performance.now();

          resolve({
            decodeTime: Math.round(tDecEnd - tDecStart),
            processingLatency: Math.round(tProcEnd - tProcStart)
          });
        };
        img.onerror = () => {
          resolve({ decodeTime: 100, processingLatency: 100 });
        };
        img.src = url;
      });
    });
  }

  private async measureWorkerLatency(): Promise<number> {
    const t0 = performance.now();
    return new Promise(resolve => {
      try {
        const worker = new Worker(new URL("../../../workers/scanner.worker.ts", import.meta.url));
        worker.onmessage = (e) => {
          if (e.data.success || e.data.error) {
            const t1 = performance.now();
            worker.terminate();
            resolve(Math.round(t1 - t0));
          }
        };
        // Send a fake blank image
        const fakeData = new Uint8ClampedArray(400 * 400 * 4);
        worker.postMessage({ data: fakeData, width: 400, height: 400 });
      } catch {
        resolve(999);
      }
    });
  }
}
