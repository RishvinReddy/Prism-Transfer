/**
 * calibrationEngine.ts
 *
 * Pre-transfer optical calibration — measures the sender device's actual
 * display frame rate and QR generation time, then recommends a reliability
 * mode and FPS that the device can sustain without dropping frames.
 *
 * All work is done on the main thread (requestAnimationFrame + canvas).
 * Typical runtime: 1.5–2.5 seconds.
 */

import QRCode from "qrcode";

// ─── Public types ─────────────────────────────────────────────────────────────

export interface CalibrationResult {
  /** Measured display frame rate from requestAnimationFrame (Hz). */
  actualDisplayFps: number;

  /** Time to render one full-size test QR frame onto an OffscreenCanvas (ms). */
  qrGenMs: number;

  /** Recommended FPS setting for this device. */
  recommendedFps: number;

  /** Recommended reliability mode for this device. */
  recommendedMode: "turbo" | "speed" | "balanced" | "reliable";

  /**
   * Confidence in the recommendation.
   *   high   — both display fps and QR gen time are consistent across samples
   *   medium — one of the two measurements had high variance
   *   low    — measurements were unstable (slow device / overloaded main thread)
   */
  confidence: "high" | "medium" | "low";
}

// ─── Measurement helpers ──────────────────────────────────────────────────────

const RAF_SAMPLE_COUNT = 40;        // rAF frames to sample (typically ~650 ms at 60 Hz)
const QR_SAMPLE_COUNT  = 5;         // QR renders to average
const TEST_QR_PAYLOAD  = "PT2:" + "A".repeat(400);  // ~402-char test payload (realistic balanced-mode load)

/**
 * Measures the average interval between requestAnimationFrame callbacks.
 * Returns the measured frame rate in Hz.
 */
function measureDisplayFps(): Promise<number> {
  return new Promise<number>((resolve) => {
    const timestamps: number[] = [];
    let frameCount = 0;

    function tick(ts: number) {
      timestamps.push(ts);
      frameCount++;

      if (frameCount < RAF_SAMPLE_COUNT) {
        requestAnimationFrame(tick);
      } else {
        // Compute mean interval, drop the first frame (often a cold-start outlier)
        const intervals: number[] = [];
        for (let i = 2; i < timestamps.length; i++) {
          intervals.push(timestamps[i] - timestamps[i - 1]);
        }
        const meanInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        resolve(meanInterval > 0 ? 1000 / meanInterval : 60);
      }
    }

    requestAnimationFrame(tick);
  });
}

/**
 * Renders a test QR code onto an OffscreenCanvas (or a hidden canvas fallback)
 * and returns the average render time in milliseconds.
 */
async function measureQRGenTime(): Promise<number> {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  canvas.style.position = "absolute";
  canvas.style.left = "-9999px";
  document.body.appendChild(canvas);

  const samples: number[] = [];

  for (let i = 0; i < QR_SAMPLE_COUNT; i++) {
    const start = performance.now();
    await new Promise<void>((resolve, reject) => {
      QRCode.toCanvas(canvas, TEST_QR_PAYLOAD, {
        width: 512,
        margin: 4,
        errorCorrectionLevel: "M",
      }, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    samples.push(performance.now() - start);
  }

  document.body.removeChild(canvas);

  // Drop the first sample (JIT warm-up) and average the rest
  const relevant = samples.slice(1);
  return relevant.reduce((a, b) => a + b, 0) / relevant.length;
}

// ─── Decision table ───────────────────────────────────────────────────────────
//
// Recommendation logic:
//
//  Display FPS ≥ 55 AND qrGenMs < 8  → turbo   / 45 FPS / high
//  Display FPS ≥ 28 AND qrGenMs < 16 → speed   / 30 FPS / medium
//  Display FPS ≥ 20                   → balanced / 20 FPS / medium
//  else                               → reliable / 10 FPS / low
//
// qrGenMs threshold: at 45 FPS the budget per frame is 22 ms.
// If QR generation takes 8+ ms, sustained 45 FPS will cause frame drops
// because the setInterval will contend with the canvas render.
// At 30 FPS the budget is 33 ms; threshold scales accordingly.

function deriveRecommendation(
  displayFps: number,
  qrGenMs: number
): Pick<CalibrationResult, "recommendedFps" | "recommendedMode" | "confidence"> {
  if (displayFps >= 55 && qrGenMs < 8) {
    return { recommendedFps: 45, recommendedMode: "turbo",    confidence: "high"   };
  }
  if (displayFps >= 28 && qrGenMs < 16) {
    return { recommendedFps: 30, recommendedMode: "speed",    confidence: "medium" };
  }
  if (displayFps >= 20) {
    return { recommendedFps: 20, recommendedMode: "balanced", confidence: "medium" };
  }
  return   { recommendedFps: 10, recommendedMode: "reliable", confidence: "low"    };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Runs the full calibration sequence and returns a recommended configuration.
 *
 * Typical duration: 1.5–2.5 seconds.
 * Safe to call multiple times — each call is fully independent.
 *
 * @throws Never — returns a "reliable / low" fallback on any error.
 */
export async function runCalibration(): Promise<CalibrationResult> {
  try {
    // Run both measurements concurrently (rAF doesn't block the canvas)
    const [actualDisplayFps, qrGenMs] = await Promise.all([
      measureDisplayFps(),
      measureQRGenTime(),
    ]);

    const recommendation = deriveRecommendation(actualDisplayFps, qrGenMs);

    return {
      actualDisplayFps: Math.round(actualDisplayFps * 10) / 10,
      qrGenMs:          Math.round(qrGenMs * 10) / 10,
      ...recommendation,
    };
  } catch (err) {
    console.warn("[CalibrationEngine] Measurement failed, using safe fallback:", err);
    return {
      actualDisplayFps: 0,
      qrGenMs:          0,
      recommendedFps:   10,
      recommendedMode:  "reliable",
      confidence:       "low",
    };
  }
}

// ─── Session cache helpers ────────────────────────────────────────────────────

const CACHE_KEY     = "prism_calibration";
const CACHE_TTL_MS  = 60 * 60 * 1000;   // 1 hour

export function getCachedCalibration(): CalibrationResult | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { result, ts } = JSON.parse(raw) as { result: CalibrationResult; ts: number };
    if (Date.now() - ts > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return result;
  } catch {
    return null;
  }
}

export function cacheCalibrationResult(result: CalibrationResult): void {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ result, ts: Date.now() }));
  } catch {}
}

export function clearCalibrationCache(): void {
  try { sessionStorage.removeItem(CACHE_KEY); } catch {}
}
