export interface BenchmarkResult {
  name: string;
  score: number;
  durationMs: number;
  throughput?: number;
  unit?: string;
  timestamp: number;
  details: Record<string, number | string>;
}

export interface BenchmarkModule {
  name: string;
  run(): Promise<BenchmarkResult>;
}
