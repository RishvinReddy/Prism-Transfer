import { BenchmarkModule, BenchmarkResult } from "../types";

export class DisplayBenchmark implements BenchmarkModule {
  name = "Display";

  async run(): Promise<BenchmarkResult> {
    const details: Record<string, number | string> = {};
    const tStart = performance.now();
    let score = 0;

    const timings = await this.measureFrames(60);
    
    const avgFrameMs = timings.reduce((a, b) => a + b, 0) / timings.length;
    const effectiveFPS = 1000 / avgFrameMs;
    const shortestFrame = Math.min(...timings);
    const longestFrame = Math.max(...timings);

    let variance = 0;
    for (const t of timings) variance += Math.pow(t - avgFrameMs, 2);
    const stdDev = Math.sqrt(variance / timings.length);

    details.effectiveFPS = Math.round(effectiveFPS);
    details.avgFrameMs = Math.round(avgFrameMs * 10) / 10;
    details.shortestFrameMs = Math.round(shortestFrame * 10) / 10;
    details.longestFrameMs = Math.round(longestFrame * 10) / 10;
    details.jitterStdDevMs = Math.round(stdDev * 10) / 10;

    // Calculate score
    // Display score is mostly about consistency (stdDev) and raw FPS
    const fpsScore = Math.min(50, (effectiveFPS / 60) * 50);
    // If stdDev < 1ms = 50. > 8ms = 0
    const jitterScore = Math.max(0, 50 - ((stdDev - 1) * (50 / 7)));

    score = Math.round(fpsScore + jitterScore);

    return {
      name: this.name,
      score: Math.max(0, Math.min(100, score)),
      durationMs: Math.round(performance.now() - tStart),
      timestamp: Date.now(),
      details,
    };
  }

  private async measureFrames(frameCount: number): Promise<number[]> {
    return new Promise((resolve) => {
      let frames = 0;
      const timings: number[] = [];
      let lastTime = performance.now();

      const loop = (time: number) => {
        const delta = time - lastTime;
        if (frames > 0) timings.push(delta); // Skip first frame
        lastTime = time;
        frames++;

        if (frames < frameCount) {
          requestAnimationFrame(loop);
        } else {
          resolve(timings);
        }
      };
      
      requestAnimationFrame(loop);
    });
  }
}
