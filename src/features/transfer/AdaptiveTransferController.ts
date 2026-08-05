import { DiagnosticsState } from "@/contexts/diagnostics";

export type AdaptiveState = "Excellent" | "Fast" | "Balanced" | "Reliable" | "Recovery";

export interface ScannerRecommendations {
  debounceMs: number;
  throttleFps: number | null; // null means uncapped (requestAnimationFrame)
  alertMessage: string | null;
}

export class AdaptiveTransferController {
  private currentState: AdaptiveState = "Balanced";
  private consecutiveErrors = 0;
  private consecutiveSuccesses = 0;
  
  // Tuning thresholds
  private readonly CRC_FAILURE_THRESHOLD = 3;
  private readonly DROPPED_FRAME_THRESHOLD = 10;
  private readonly DECODE_SUCCESS_BURST = 30; // 30 frames without error = upgrade

  public observe(state: DiagnosticsState) {
    const { camera } = state;
    
    // Evaluate current frame window
    if (camera.crcFailures > this.CRC_FAILURE_THRESHOLD || camera.droppedFrames > this.DROPPED_FRAME_THRESHOLD) {
      this.consecutiveErrors++;
      this.consecutiveSuccesses = 0;
    } else if (camera.decodedFrames > 0 && camera.crcFailures === 0 && camera.droppedFrames < 2) {
      this.consecutiveSuccesses++;
      this.consecutiveErrors = 0;
    }

    this.analyze();
  }

  private analyze() {
    // Downgrade path
    if (this.consecutiveErrors > 5) {
      this.downgradeState();
      this.consecutiveErrors = 0; // Reset after downgrade
    }
    
    // Upgrade path
    if (this.consecutiveSuccesses > this.DECODE_SUCCESS_BURST) {
      this.upgradeState();
      this.consecutiveSuccesses = 0; // Reset after upgrade
    }
  }

  private downgradeState() {
    switch (this.currentState) {
      case "Excellent": this.currentState = "Fast"; break;
      case "Fast": this.currentState = "Balanced"; break;
      case "Balanced": this.currentState = "Reliable"; break;
      case "Reliable": this.currentState = "Recovery"; break;
      case "Recovery": /* Floor */ break;
    }
  }

  private upgradeState() {
    switch (this.currentState) {
      case "Recovery": this.currentState = "Reliable"; break;
      case "Reliable": this.currentState = "Balanced"; break;
      case "Balanced": this.currentState = "Fast"; break;
      case "Fast": this.currentState = "Excellent"; break;
      case "Excellent": /* Ceiling */ break;
    }
  }

  public get currentStateValue() {
    return this.currentState;
  }

  public recommend(): ScannerRecommendations {
    switch (this.currentState) {
      case "Excellent":
        return { debounceMs: 10, throttleFps: null, alertMessage: null };
      case "Fast":
        return { debounceMs: 15, throttleFps: 30, alertMessage: null };
      case "Balanced":
        return { debounceMs: 25, throttleFps: 20, alertMessage: null };
      case "Reliable":
        return { 
          debounceMs: 50, 
          throttleFps: 15, 
          alertMessage: "Notice: Glare or distance causing frame drops. Tell sender to lower speed." 
        };
      case "Recovery":
        return { 
          debounceMs: 100, 
          throttleFps: 10, 
          alertMessage: "Critical: High corruption rate. Please switch Sender to 'Reliable' mode." 
        };
      default:
        return { debounceMs: 25, throttleFps: 20, alertMessage: null };
    }
  }
}
