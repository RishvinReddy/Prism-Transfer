import fs from "fs";
import path from "path";

export interface Baseline {
  protocol: string;
  serializeMs?: number;
  deserializeMs?: number;
  throughputMBps: number;
  recoveryRate: number;
}

export class BaselineManager {
  private static getFilePath(): string {
    return path.join(process.cwd(), "tests", "harness", "baseline.json");
  }

  static load(): Baseline | null {
    try {
      const p = this.getFilePath();
      if (!fs.existsSync(p)) return null;
      return JSON.parse(fs.readFileSync(p, "utf-8")) as Baseline;
    } catch (e) {
      console.warn("Failed to load baseline.json", e);
      return null;
    }
  }

  static save(baseline: Baseline): void {
    try {
      const p = this.getFilePath();
      fs.writeFileSync(p, JSON.stringify(baseline, null, 2), "utf-8");
    } catch (e) {
      console.warn("Failed to save baseline.json", e);
    }
  }

  static checkRegression(current: Baseline, thresholdPercent: number = 10): { passed: boolean; reason?: string } {
    const previous = this.load();
    if (!previous) return { passed: true }; // No baseline to regress against

    if (current.throughputMBps < previous.throughputMBps * (1 - thresholdPercent / 100)) {
      return { 
        passed: false, 
        reason: `Throughput regressed from ${previous.throughputMBps} MB/s to ${current.throughputMBps} MB/s (limit: ${thresholdPercent}%)` 
      };
    }
    
    if (current.recoveryRate < previous.recoveryRate * (1 - thresholdPercent / 100)) {
      return { 
        passed: false, 
        reason: `Recovery rate regressed from ${previous.recoveryRate}% to ${current.recoveryRate}%` 
      };
    }

    return { passed: true };
  }
}
