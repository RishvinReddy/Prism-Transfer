export interface PrismProfile {
  cpu?: number;      // 0-100 score
  display?: number;  // 0-100 score (based on frame timing stability)
  storage?: number;  // 0-100 score (based on write speed)
  optical?: number;  // 0-100 score (based on camera init speed and frame read)
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

const PROFILE_KEY = "prism_profile";

export class ProfileManager {
  static load(): PrismProfile {
    if (typeof window === "undefined") {
      return { history: [], lastUpdated: 0 };
    }
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return { history: [], lastUpdated: 0 };
    try {
      return JSON.parse(raw);
    } catch {
      return { history: [], lastUpdated: 0 };
    }
  }

  static save(profile: PrismProfile) {
    if (typeof window === "undefined") return;
    profile.lastUpdated = Date.now();
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }

  static updateScore(category: "cpu" | "display" | "storage" | "optical", score: number) {
    const profile = this.load();
    profile[category] = Math.min(100, Math.max(0, Math.round(score)));
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

    if (adjustment !== 0 && profile.optical !== undefined) {
      profile.optical = Math.max(0, Math.min(100, profile.optical + adjustment));
      this.save(profile);
    }
  }
}
