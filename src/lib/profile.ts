import { BenchmarkResult } from "./benchmark/types";

export interface PrismProfile {
  prismScore?: number;

  cpu?: BenchmarkResult;
  display?: BenchmarkResult;
  storage?: BenchmarkResult;
  memory?: BenchmarkResult;
  vision?: BenchmarkResult;
  optical?: BenchmarkResult;
  transfer?: BenchmarkResult;
  
  benchmarkHistory: Array<{ timestamp: number; score: number }>;
  history: TransferHistory[];
  lastUpdated: number;
}

export interface TransferHistory {
  timestamp: number;
  role: "sender" | "receiver";
  fileSize: number;
  throughputMBps: number;
  recoveryRate?: number;    // Receiver only
  signalQuality?: number;   // Receiver only
  success: boolean;
}

const PROFILE_KEY = "prism_profile_v2";
const LEGACY_PROFILE_KEY = "prism_profile";

export const BENCHMARK_WEIGHTS = {
  cpu: 0.25,
  optical: 0.15,
  vision: 0.10,
  transfer: 0.20,
  display: 0.10,
  storage: 0.10,
  memory: 0.10,
};

export class ProfileManager {
  static load(): PrismProfile {
    if (typeof window === "undefined") {
      return { benchmarkHistory: [], history: [], lastUpdated: 0 };
    }
    
    // Attempt load v2
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }

    // Migrate from v1 if needed
    const legacy = localStorage.getItem(LEGACY_PROFILE_KEY);
    if (legacy) {
      try {
        const legacyData = JSON.parse(legacy);
        return {
          history: legacyData.history || [],
          benchmarkHistory: [],
          lastUpdated: legacyData.lastUpdated || 0,
        };
      } catch {}
    }

    return { benchmarkHistory: [], history: [], lastUpdated: 0 };
  }

  static save(profile: PrismProfile) {
    if (typeof window === "undefined") return;
    profile.lastUpdated = Date.now();
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }

  static updateBenchmarks(results: Record<string, BenchmarkResult>) {
    const profile = this.load();
    
    if (results.cpu) profile.cpu = results.cpu;
    if (results.display) profile.display = results.display;
    if (results.storage) profile.storage = results.storage;
    if (results.memory) profile.memory = results.memory;
    if (results.vision) profile.vision = results.vision;
    if (results.optical) profile.optical = results.optical;
    if (results.transfer) profile.transfer = results.transfer;

    // Calculate PrismScore
    let score = 0;
    let weightSum = 0;

    const addScore = (category: keyof typeof BENCHMARK_WEIGHTS, result?: BenchmarkResult) => {
      if (result && result.score !== undefined) {
        score += result.score * BENCHMARK_WEIGHTS[category];
        weightSum += BENCHMARK_WEIGHTS[category];
      }
    };

    addScore("cpu", profile.cpu);
    addScore("display", profile.display);
    addScore("storage", profile.storage);
    addScore("memory", profile.memory);
    addScore("vision", profile.vision);
    addScore("optical", profile.optical);
    addScore("transfer", profile.transfer);

    if (weightSum > 0) {
      // Normalize if some benchmarks weren't run (e.g., optical missing camera permission)
      profile.prismScore = Math.round(score / weightSum);
      
      profile.benchmarkHistory.unshift({
        timestamp: Date.now(),
        score: profile.prismScore,
      });

      if (profile.benchmarkHistory.length > 50) {
        profile.benchmarkHistory.length = 50;
      }
    }

    this.save(profile);
  }

  static addHistory(entry: TransferHistory) {
    const profile = this.load();
    profile.history.unshift(entry);
    // Keep only last 50 transfers
    if (profile.history.length > 50) {
      profile.history.length = 50;
    }
    this.save(profile);
  }

  // Adjusts the optical score dynamically based on recent receiver performance
  static applyFeedbackLoop() {
    const profile = this.load();
    if (profile.history.length === 0) return;

    // Look at recent receiver transfers
    const recentReceives = profile.history.filter(h => h.role === "receiver").slice(0, 5);
    if (recentReceives.length === 0) return;

    let adjustment = 0;
    for (const rx of recentReceives) {
      if (rx.success && rx.signalQuality && rx.signalQuality > 0.9) {
        adjustment += 1;
      } else if (!rx.success || (rx.signalQuality && rx.signalQuality < 0.7)) {
        adjustment -= 2;
      }
    }

    if (adjustment !== 0 && profile.optical) {
      profile.optical.score = Math.max(0, Math.min(100, profile.optical.score + adjustment));
      this.save(profile);
    }
  }
}
