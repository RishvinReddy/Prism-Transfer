import { BenchmarkModule, BenchmarkResult } from "./types";
import { CPUBenchmark } from "./modules/cpu";
import { MemoryBenchmark } from "./modules/memory";
import { StorageBenchmark } from "./modules/storage";
import { DisplayBenchmark } from "./modules/display";
import { VisionBenchmark } from "./modules/vision";
import { OpticalBenchmark } from "./modules/optical";
import { TransferBenchmark } from "./modules/transfer";

export type BenchmarkUpdateCallback = (currentModule: string, result?: BenchmarkResult) => void;

export class BenchmarkRunner {
  private modules: BenchmarkModule[] = [];

  constructor(includeOptical: boolean = false) {
    this.modules.push(new CPUBenchmark());
    this.modules.push(new MemoryBenchmark());
    this.modules.push(new StorageBenchmark());
    this.modules.push(new DisplayBenchmark());
    this.modules.push(new VisionBenchmark());
    this.modules.push(new TransferBenchmark());

    if (includeOptical) {
      this.modules.push(new OpticalBenchmark());
    }
  }

  async runAll(onUpdate?: BenchmarkUpdateCallback): Promise<Record<string, BenchmarkResult>> {
    const results: Record<string, BenchmarkResult> = {};
    
    for (const mod of this.modules) {
      if (onUpdate) onUpdate(mod.name);
      
      // Let the UI breathe before locking the thread
      await new Promise(r => setTimeout(r, 50));
      
      const res = await mod.run();
      results[mod.name.toLowerCase()] = res;
      
      if (onUpdate) onUpdate(mod.name, res);
      
      // Cooldown between tests
      await new Promise(r => setTimeout(r, 200));
    }

    return results;
  }
}
