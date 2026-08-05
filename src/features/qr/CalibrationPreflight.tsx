"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Gauge, MonitorSmartphone, Zap, ChevronRight, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  runCalibration,
  getCachedCalibration,
  cacheCalibrationResult,
  CalibrationResult,
} from "@/lib/calibrationEngine";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CalibrationPreflightProps {
  /** Called when calibration completes (or is skipped). */
  onComplete: (result: CalibrationResult) => void;
}

// ─── Step labels (rendered during measurement) ────────────────────────────────

const STEPS = [
  { label: "Measuring display rate",   detail: "Sampling requestAnimationFrame intervals" },
  { label: "Rendering test QR frame",  detail: "Timing canvas encode at target density" },
  { label: "Calculating settings",     detail: "Deriving optimal FPS and reliability mode" },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MODE_COLOR: Record<CalibrationResult["recommendedMode"], string> = {
  turbo:    "text-violet-400",
  speed:    "text-cyan-400",
  balanced: "text-indigo-400",
  reliable: "text-amber-400",
};

const CONFIDENCE_COLOR: Record<CalibrationResult["confidence"], string> = {
  high:   "text-green-400",
  medium: "text-yellow-400",
  low:    "text-red-400",
};

function modeLabel(mode: CalibrationResult["recommendedMode"]) {
  return mode.charAt(0).toUpperCase() + mode.slice(1);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CalibrationPreflight({ onComplete }: CalibrationPreflightProps) {
  const [step, setStep] = React.useState(0);             // 0 = measuring, 1 = showing result
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [result, setResult] = React.useState<CalibrationResult | null>(null);
  const [showSkip, setShowSkip] = React.useState(false);
  const hasRun = React.useRef(false);

  React.useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    // Show skip button after 1 second so power users can bypass
    const skipTimer = setTimeout(() => setShowSkip(true), 1000);

    // Check session cache first
    const cached = getCachedCalibration();
    if (cached) {
      clearTimeout(skipTimer);
      setResult(cached);
      setStep(1);
      return;
    }

    // Animate step labels while measurement runs
    const stepTimers = [
      setTimeout(() => setCurrentStepIndex(1), 500),
      setTimeout(() => setCurrentStepIndex(2), 1200),
    ];

    runCalibration().then((r) => {
      clearTimeout(skipTimer);
      stepTimers.forEach(clearTimeout);
      cacheCalibrationResult(r);
      setResult(r);
      setStep(1);
    });

    return () => {
      clearTimeout(skipTimer);
      stepTimers.forEach(clearTimeout);
    };
  }, []);

  // ── Skip handler (uses balanced/20fps as fallback) ──────────────────────────
  const handleSkip = () => {
    const fallback: CalibrationResult = {
      actualDisplayFps: 0,
      qrGenMs:          0,
      recommendedFps:   20,
      recommendedMode:  "balanced",
      confidence:       "medium",
    };
    onComplete(fallback);
  };

  // ── Auto-advance to transfer after 3 seconds on the result screen ──────────
  const autoAdvanceRef = React.useRef<NodeJS.Timeout | null>(null);
  const [countdown, setCountdown] = React.useState(3);

  React.useEffect(() => {
    if (step !== 1 || !result) return;

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onComplete(result);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    autoAdvanceRef.current = interval;
    return () => clearInterval(interval);
  }, [step, result, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-md mx-auto px-6 text-center">
      <AnimatePresence mode="wait">

        {/* ── Measuring phase ── */}
        {step === 0 && (
          <motion.div
            key="measuring"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex flex-col items-center w-full space-y-10"
          >
            {/* Spinner orb */}
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-2xl" />
              <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
              <motion.div
                className="absolute inset-2 rounded-full border-2 border-t-indigo-500 border-transparent"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Gauge className="w-7 h-7 text-indigo-400" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">Optical Calibration</h3>
              <p className="text-sm text-muted-foreground">
                Measuring display rate and QR render time to find the best settings for this device.
              </p>
            </div>

            {/* Step indicators */}
            <div className="w-full space-y-2">
              {STEPS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: currentStepIndex >= i ? 1 : 0.3 }}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-xl border text-left transition-colors",
                    currentStepIndex > i
                      ? "border-green-500/20 bg-green-500/5 text-green-400"
                      : currentStepIndex === i
                      ? "border-indigo-500/30 bg-indigo-500/5 text-foreground"
                      : "border-border/20 bg-muted/5 text-muted-foreground"
                  )}
                >
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    {currentStepIndex > i ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : currentStepIndex === i ? (
                      <motion.div
                        className="w-2 h-2 rounded-full bg-indigo-400"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                      />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">{s.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{s.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Skip button (shown after 1 second) */}
            <AnimatePresence>
              {showSkip && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <button
                    onClick={handleSkip}
                    className="flex items-center space-x-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                    <span>Skip calibration</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Result phase ── */}
        {step === 1 && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center w-full space-y-8"
          >
            {/* Icon */}
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/10 blur-2xl rounded-full" />
              <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20">
                <MonitorSmartphone className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-foreground">Device Calibrated</h3>
              <p className={cn("text-xs font-semibold uppercase tracking-wider", CONFIDENCE_COLOR[result.confidence])}>
                {result.confidence} confidence
              </p>
            </div>

            {/* Measurement grid */}
            <div className="w-full grid grid-cols-2 gap-3">
              <div className="flex flex-col p-3.5 bg-muted/20 border border-border/30 rounded-xl text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Display Rate</span>
                <span className="font-mono text-lg font-bold text-foreground">
                  {result.actualDisplayFps > 0 ? `${result.actualDisplayFps.toFixed(0)} Hz` : "—"}
                </span>
              </div>
              <div className="flex flex-col p-3.5 bg-muted/20 border border-border/30 rounded-xl text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">QR Render</span>
                <span className="font-mono text-lg font-bold text-foreground">
                  {result.qrGenMs > 0 ? `${result.qrGenMs.toFixed(1)} ms` : "—"}
                </span>
              </div>
              <div className="flex flex-col p-3.5 bg-primary/5 border border-primary/20 rounded-xl text-left col-span-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Mode</span>
                <span className={cn("font-mono text-lg font-bold capitalize", MODE_COLOR[result.recommendedMode])}>
                  {modeLabel(result.recommendedMode)}
                </span>
              </div>
              <div className="flex flex-col p-3.5 bg-primary/5 border border-primary/20 rounded-xl text-left col-span-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">FPS</span>
                <span className="font-mono text-lg font-bold text-foreground">
                  {result.recommendedFps}
                </span>
              </div>
            </div>

            {/* Proceed button with countdown */}
            <Button
              onClick={() => {
                if (autoAdvanceRef.current) clearInterval(autoAdvanceRef.current);
                onComplete(result);
              }}
              className="w-full h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
            >
              <Zap className="w-4 h-4 mr-2" />
              Start Transfer
              <span className="ml-2 text-primary-foreground/60 font-normal text-sm">({countdown}s)</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
