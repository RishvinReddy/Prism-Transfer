export interface MemorySnapshot {
  timestamp: number;
  heapUsedMB: number;
  heapTotalMB: number;
  externalMB: number;
}

export class MetricsCollector {
  private snapshots: MemorySnapshot[] = [];
  
  takeSnapshot() {
    // Only works in Node environments (Vitest/CI)
    if (typeof process !== "undefined" && process.memoryUsage) {
      const mem = process.memoryUsage();
      this.snapshots.push({
        timestamp: Date.now(),
        heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024 * 100) / 100,
        heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024 * 100) / 100,
        externalMB: Math.round(mem.external / 1024 / 1024 * 100) / 100,
      });
    }
  }

  getSnapshots(): MemorySnapshot[] {
    return this.snapshots;
  }

  getPeakHeapUsedMB(): number {
    return this.snapshots.reduce((max, snap) => Math.max(max, snap.heapUsedMB), 0);
  }

  getLeakEstimateMB(): number {
    if (this.snapshots.length < 2) return 0;
    const initial = this.snapshots[0].heapUsedMB;
    const final = this.snapshots[this.snapshots.length - 1].heapUsedMB;
    return final - initial;
  }
}
