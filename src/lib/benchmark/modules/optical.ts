import { BenchmarkModule, BenchmarkResult } from "../types";

export class OpticalBenchmark implements BenchmarkModule {
  name = "Optical";

  async run(): Promise<BenchmarkResult> {
    const details: Record<string, number | string> = {};
    const tStart = performance.now();
    let score = 0;

    let stream: MediaStream | null = null;
    let video: HTMLVideoElement | null = null;
    
    try {
      // 1. Camera Initialization & Permission Latency
      const tInitStart = performance.now();
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      const tInitEnd = performance.now();
      const initLatency = Math.round(tInitEnd - tInitStart);
      details.cameraInitMs = initLatency;

      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings();
      details.resolution = `${settings.width || 0}x${settings.height || 0}`;

      // 2. Frame Acquisition & Brightness
      video = document.createElement("video");
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      
      await new Promise<void>((resolve) => {
        video!.onloadedmetadata = () => {
          video!.play().then(resolve).catch(() => resolve());
        };
      });

      // Wait a moment for auto-exposure to settle
      await new Promise(r => setTimeout(r, 500));

      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      if (ctx) {
        const tFrameStart = performance.now();
        ctx.drawImage(video, 0, 0, 400, 400);
        const imageData = ctx.getImageData(0, 0, 400, 400);
        const tFrameEnd = performance.now();
        
        details.frameAcquisitionMs = Math.round(tFrameEnd - tFrameStart);

        let lumaSum = 0;
        let samples = 0;
        for (let i = 0; i < imageData.data.length; i += 16) {
          const r = imageData.data[i];
          const g = imageData.data[i + 1];
          const b = imageData.data[i + 2];
          lumaSum += 0.299 * r + 0.587 * g + 0.114 * b;
          samples++;
        }
        const avgLuma = lumaSum / samples;
        details.averageBrightness = Math.round(avgLuma);

        // Score Calculation
        // Fast init < 500ms = 50 pts, > 3000ms = 0 pts
        const initScore = Math.max(0, 50 - ((initLatency - 500) / 50));
        
        // Good brightness (30-220) = 50 pts
        let brightnessScore = 50;
        if (avgLuma < 30) brightnessScore = Math.max(0, avgLuma * (50/30));
        else if (avgLuma > 220) brightnessScore = Math.max(0, 50 - (avgLuma - 220));

        score = Math.round(initScore + brightnessScore);
      } else {
        score = 0;
      }

    } catch (e) {
      details.error = (e as Error).message;
      score = 0;
    } finally {
      if (video) {
        video.srcObject = null;
      }
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    }

    return {
      name: this.name,
      score: Math.max(0, Math.min(100, score)),
      durationMs: Math.round(performance.now() - tStart),
      timestamp: Date.now(),
      details,
    };
  }
}
