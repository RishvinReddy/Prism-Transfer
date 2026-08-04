"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { QRScanner } from "./QRScanner";
import { useProgressTracker } from "./useProgressTracker";
import { validateManifestDetailed, validatePacketDetailed } from "@/lib/validator";
import { saveManifest, savePacket, getAllPackets, clearTransfer } from "@/features/storage/packetStore";
import { reconstructFile, downloadBlob, ReconstructionError } from "./reconstructionEngine";
import { TransferManifest, TransferPacket } from "@/types/transfer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSettings } from "@/contexts/settings";
import { DeveloperDashboard, BenchmarkMetrics } from "@/features/developer/DeveloperDashboard";
import { ReceiveDebugger, DebugSession, DebugStage } from "./ReceiveDebugger";
import {
  Loader2, CheckCircle2, AlertTriangle, RefreshCcw, Download, RotateCcw
} from "lucide-react";

// ─── Transfer State Machine ─────────────────────────────────────────────────
type TransferPhase =
  | "waiting"       // No manifest received yet
  | "receiving"     // Manifest received, collecting packets
  | "reconstructing" // All packets collected, rebuilding file
  | "verifying"     // SHA check
  | "complete"      // Done
  | "error";        // Failure

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatETA(ms: number): string {
  if (ms <= 0) return "—";
  const s = Math.ceil(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

// Derive scan quality from duplicate rate
function getScanQuality(duplicates: number, received: number): "excellent" | "good" | "poor" {
  if (received === 0) return "excellent";
  const dupRate = duplicates / (received + duplicates);
  if (dupRate < 0.15) return "excellent";
  if (dupRate < 0.40) return "good";
  return "poor";
}

const qualityLabel: Record<string, string> = {
  excellent: "Excellent",
  good: "Good — Minor Frame Loss",
  poor: "Poor — Move Closer",
};

const qualityColor: Record<string, string> = {
  excellent: "#22c55e",
  good: "#f59e0b",
  poor: "#ef4444",
};

// ─── Packet Heatmap (Developer Mode) ─────────────────────────────────────────
function PacketHeatmap({ total, received, missing }: { total: number; received: Set<number>; missing: number[] }) {
  const missingSet = new Set(missing);
  return (
    <div className="flex flex-wrap gap-[3px]">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          title={`Packet ${i}: ${received.has(i) ? "Received" : missingSet.has(i) ? "Missing" : "Pending"}`}
          className="w-3 h-3 rounded-sm transition-colors duration-200"
          style={{
            backgroundColor: received.has(i)
              ? "#6366f1"
              : missingSet.has(i)
              ? "#ef4444"
              : "#27272a",
          }}
        />
      ))}
    </div>
  );
}

// ─── Phase Status Labels ──────────────────────────────────────────────────────
const phaseLabel: Record<TransferPhase, string> = {
  waiting: "Waiting for sender...",
  receiving: "Receiving...",
  reconstructing: "Reconstructing file...",
  verifying: "Verifying integrity...",
  complete: "Transfer complete",
  error: "Transfer failed",
};

// ─── Main Component ───────────────────────────────────────────────────────────
export function PacketReceiver() {
  const { settings } = useSettings();
  const [isScanning, setIsScanning] = React.useState(true);
  const [manifest, setManifest] = React.useState<TransferManifest | null>(null);
  const [phase, setPhase] = React.useState<TransferPhase>("waiting");
  const [error, setError] = React.useState<string | null>(null);
  const [downloadedBlob, setDownloadedBlob] = React.useState<{ blob: Blob; filename: string } | null>(null);

  const tracker = useProgressTracker(manifest?.totalPackets || 0);
  const lastScannedRef = React.useRef<{ id: string; time: number } | null>(null);
  const pauseScannerRef = React.useRef<boolean>(false);
  const [debugSessions, setDebugSessions] = React.useState<DebugSession[]>([]);

  const addDebugSession = (session: DebugSession) => {
    setDebugSessions(prev => [session, ...prev].slice(0, 50));
  };

  const scanQuality = getScanQuality(tracker.progress.duplicateCount, tracker.progress.packetsReceived);

  const handleScan = async (decodedText: string) => {
    if (!isScanning || pauseScannerRef.current) return;

    const sessionStart = performance.now();
    const sessionId = `scan-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    const stages: DebugStage[] = [];

    const addStage = (name: string, status: "SUCCESS" | "ERROR" | "SKIPPED", message: string, start?: number) => {
      stages.push({ name, status, message, durationMs: start ? performance.now() - start : undefined });
    };

    let finalStatus: "SUCCESS" | "ERROR" | "DROPPED" = "SUCCESS";
    let rawPreview = decodedText.slice(0, 200);
    if (decodedText.length > 200) rawPreview += "...";

    addStage("QR_DECODE", "SUCCESS", `Decoded ${decodedText.length} bytes`, sessionStart);

    try {
      const parseStart = performance.now();
      const parsed = JSON.parse(decodedText);
      addStage("JSON_PARSE", "SUCCESS", "Valid JSON", parseStart);

      const packetId = parsed.type === "manifest" ? "manifest" : parsed.packetId;
      const now = Date.now();

      const debounceStart = performance.now();
      if (lastScannedRef.current && lastScannedRef.current.id === packetId) {
        if (now - lastScannedRef.current.time < 200) {
          addStage("DEBOUNCE", "SKIPPED", `Ignored within 200ms window`);
          finalStatus = "DROPPED";
          addDebugSession({ id: sessionId, timestamp: now, stages, rawPayloadPreview: rawPreview, rawPayloadLength: decodedText.length, finalStatus });
          return;
        } else {
          tracker.recordDuplicate();
          lastScannedRef.current.time = now;
          addStage("DEBOUNCE", "SKIPPED", `Counted as duplicate`);
          finalStatus = "DROPPED";
          addDebugSession({ id: sessionId, timestamp: now, stages, rawPayloadPreview: rawPreview, rawPayloadLength: decodedText.length, finalStatus });
          return;
        }
      }

      lastScannedRef.current = { id: packetId, time: now };
      addStage("DEBOUNCE", "SUCCESS", `Accepted new read for ${packetId || "unknown"}`, debounceStart);

      const identifyStart = performance.now();
      if (parsed.type === "manifest") {
        addStage("IDENTIFY_TYPE", "SUCCESS", "Identified as Manifest", identifyStart);
        if (!manifest) {
          delete parsed.type;
          const validateStart = performance.now();
          const { valid, reason } = validateManifestDetailed(parsed);

          if (valid) {
            addStage("VALIDATE_SCHEMA", "SUCCESS", "Manifest matches schema", validateStart);
            const m = parsed as TransferManifest;
            await saveManifest(m);
            addStage("STORE_PACKET", "SUCCESS", "Manifest saved to IDB", validateStart);
            setManifest(m);
            tracker.resetProgress(m.totalPackets);
            setPhase("receiving");
            addStage("UPDATE_PROGRESS", "SUCCESS", `Expected packets: ${m.totalPackets}`);
            pauseScannerRef.current = true;
            setTimeout(() => { pauseScannerRef.current = false; }, 150);
          } else {
            addStage("VALIDATE_SCHEMA", "ERROR", reason || "Unknown schema failure", validateStart);
            finalStatus = "ERROR";
          }
        } else {
          addStage("IDENTIFY_TYPE", "SKIPPED", "Manifest already exists", identifyStart);
          finalStatus = "DROPPED";
        }
      } else {
        addStage("IDENTIFY_TYPE", "SUCCESS", "Identified as Data Packet", identifyStart);
        if (manifest) {
          const validateStart = performance.now();
          const { valid, reason } = validatePacketDetailed(parsed);

          if (valid && parsed.transferId === manifest.transferId) {
            addStage("VALIDATE_SCHEMA", "SUCCESS", `Valid packet ${parsed.index}`, validateStart);
            const p = parsed as TransferPacket;
            const isNew = await savePacket(p);

            if (isNew) {
              addStage("STORE_PACKET", "SUCCESS", "Saved new packet to IDB", validateStart);
              tracker.recordPacket(p.index, false);
              addStage("UPDATE_PROGRESS", "SUCCESS", `Recorded packet ${p.index}`);
              pauseScannerRef.current = true;
              setTimeout(() => { pauseScannerRef.current = false; }, 150);
            } else {
              addStage("STORE_PACKET", "SKIPPED", "Packet already existed in IDB", validateStart);
              tracker.recordPacket(p.index, true);
              finalStatus = "DROPPED";
            }
          } else {
            addStage("VALIDATE_SCHEMA", "ERROR", reason || `TransferId mismatch`, validateStart);
            finalStatus = "ERROR";
          }
        } else {
          addStage("VALIDATE_SCHEMA", "ERROR", "Received Data Packet before Manifest", identifyStart);
          finalStatus = "ERROR";
        }
      }
    } catch (e: any) {
      addStage("JSON_PARSE", "ERROR", e.message || "Unknown JSON parsing error");
      tracker.recordCorruption();
      finalStatus = "ERROR";
    }

    addDebugSession({ id: sessionId, timestamp: Date.now(), stages, rawPayloadPreview: rawPreview, rawPayloadLength: decodedText.length, finalStatus });
  };

  // Reconstruction effect
  React.useEffect(() => {
    if (tracker.progress.isComplete && manifest && phase === "receiving") {
      setIsScanning(false);
      setPhase("reconstructing");

      const run = async () => {
        try {
          const packets = await getAllPackets(manifest.transferId);
          setPhase("verifying");
          await new Promise(r => setTimeout(r, 600)); // Brief verifying state for UX
          const blob = await reconstructFile(manifest, packets);
          await clearTransfer(manifest.transferId);
          setDownloadedBlob({ blob, filename: manifest.filename });
          setPhase("complete");
        } catch (e) {
          setError(e instanceof ReconstructionError ? e.message : "An unknown error occurred.");
          setPhase("error");
        }
      };

      run();
    }
  }, [tracker.progress.isComplete, manifest, phase]);

  // Derived metrics for developer dashboard
  const metrics: BenchmarkMetrics = {
    transferId: manifest?.transferId,
    frames: tracker.progress.totalPackets + 1,
    fps: settings.fps,
    compressionRatio: manifest ? manifest.compressedSize / manifest.originalSize : 0,
    averageKbps: 0,
    duplicatePercentage: tracker.progress.totalPackets > 0 ? (tracker.progress.duplicateCount / tracker.progress.totalPackets) * 100 : 0,
    missingPercentage: tracker.progress.totalPackets > 0 ? (tracker.progress.missingPackets.length / tracker.progress.totalPackets) * 100 : 0,
    crcErrors: tracker.progress.corruptedCount,
    shaStatus: phase === "error" ? "Failed" : phase === "complete" ? "Verified" : "Pending",
    durationSeconds: tracker.progress.estimatedTimeRemainingMs / 1000 || 0,
  };

  const isTerminal = phase === "complete" || phase === "error";

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 w-full max-w-6xl mx-auto items-start">

      {/* ── LEFT: Camera ─────────────────────────────────────────── */}
      <div className="lg:col-span-7 w-full flex flex-col space-y-4">
        {/* Page header (mobile) */}
        <div className="lg:hidden text-center space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight">Receive File</h1>
          <p className="text-sm text-muted-foreground">Point your camera at the sender's screen</p>
        </div>

        {!isTerminal ? (
          <QRScanner
            isScanning={isScanning}
            onScan={handleScan}
            hasManifest={!!manifest}
            scanQuality={manifest ? scanQuality : undefined}
          />
        ) : (
          // Success / Error illustration replaces camera
          <div className="w-full max-w-md mx-auto aspect-square rounded-2xl bg-card/60 border border-border/30 flex flex-col items-center justify-center space-y-4">
            {phase === "complete" ? (
              <motion.div
                className="flex flex-col items-center space-y-4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(34,197,94,0.1)" }}>
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <span className="font-bold text-xl text-foreground">Transfer Complete</span>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10 text-destructive" />
                </div>
                <span className="font-semibold text-foreground">Transfer Failed</span>
              </div>
            )}
          </div>
        )}

        {/* Scan guidance hint */}
        {phase === "waiting" && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-muted-foreground"
          >
            Hold the sender's screen inside the frame and keep both devices steady.
          </motion.p>
        )}
      </div>

      {/* ── RIGHT: Status & Summary ───────────────────────────────── */}
      <div className="lg:col-span-5 w-full flex flex-col space-y-5">

        {/* Desktop heading */}
        <div className="hidden lg:block space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight">Receive File</h1>
        </div>

        {/* ── Status Card ──────────────────────────────── */}
        <Card className="w-full bg-card/60 backdrop-blur-xl border border-border/30 rounded-2xl overflow-hidden">
          <div className="p-6 space-y-5">

            {/* Phase indicator */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</span>
                {phase === "receiving" && scanQuality && (
                  <span
                    className="text-xs flex items-center space-x-1.5 font-medium"
                    style={{ color: qualityColor[scanQuality] }}
                  >
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: qualityColor[scanQuality], boxShadow: `0 0 6px ${qualityColor[scanQuality]}` }}
                    />
                    <span>{qualityLabel[scanQuality]}</span>
                  </span>
                )}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={phase}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center space-x-3"
                >
                  {(phase === "reconstructing" || phase === "verifying") && (
                    <Loader2 className="w-5 h-5 text-primary animate-spin flex-shrink-0" />
                  )}
                  {phase === "complete" && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />}
                  {phase === "error" && <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />}
                  <span className="font-semibold text-lg text-foreground">{phaseLabel[phase]}</span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* File info (once manifest received) */}
            {manifest && (
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm border-t border-border/30 pt-5">
                <div className="flex flex-col space-y-1">
                  <span className="text-muted-foreground">File</span>
                  <span className="font-medium text-foreground truncate" title={manifest.filename}>{manifest.filename}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-muted-foreground">Size</span>
                  <span className="font-medium text-foreground">{formatSize(manifest.originalSize)}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-muted-foreground">Packets</span>
                  <span className="font-mono text-foreground">
                    {tracker.progress.packetsReceived} / {tracker.progress.totalPackets}
                  </span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-muted-foreground">ETA</span>
                  <span className="font-mono text-foreground">{formatETA(tracker.progress.estimatedTimeRemainingMs)}</span>
                </div>
              </div>
            )}

            {/* Progress bar (only during receiving) */}
            {(phase === "receiving" || phase === "reconstructing" || phase === "verifying") && manifest && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                  <span>Progress</span>
                  <span className="text-primary font-bold">{tracker.progress.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden border border-border/30">
                  <motion.div
                    className="h-full rounded-full bg-primary shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                    style={{ width: `${tracker.progress.percentage}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}

            {/* SHA-256 Verified badge (complete state) */}
            {phase === "complete" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-2 py-2 px-3 rounded-lg"
                style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
              >
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm font-mono text-green-400">SHA-256 Verified</span>
              </motion.div>
            )}

            {/* Error message */}
            {phase === "error" && error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                {error}
              </div>
            )}
          </div>
        </Card>

        {/* ── Packet Heatmap (Developer Mode) ─────────── */}
        {settings.developerMode && manifest && tracker.progress.totalPackets > 0 && tracker.progress.totalPackets <= 200 && (
          <Card className="w-full bg-card/40 border border-border/30 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Packet Heatmap</span>
            <PacketHeatmap
              total={tracker.progress.totalPackets}
              received={tracker.progress.receivedIndexes}
              missing={tracker.progress.missingPackets}
            />
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span className="flex items-center space-x-1"><span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" /> Received</span>
              <span className="flex items-center space-x-1"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /> Missing</span>
              <span className="flex items-center space-x-1"><span className="w-3 h-3 rounded-sm bg-zinc-700 inline-block" /> Pending</span>
            </div>
          </Card>
        )}

        {/* ── Action Buttons ───────────────────────────── */}
        <div className="flex flex-col space-y-3">
          {phase === "complete" && downloadedBlob && (
            <Button
              className="w-full h-14 rounded-2xl font-bold text-base shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:scale-[1.02] active:scale-[0.98] transition-all"
              onClick={() => downloadBlob(downloadedBlob.blob, downloadedBlob.filename)}
            >
              <Download className="w-5 h-5 mr-2" /> Download {manifest?.filename}
            </Button>
          )}

          {(phase === "complete" || phase === "error") && (
            <Button
              variant="outline"
              className="w-full h-12 rounded-2xl font-medium border-border/40"
              onClick={() => window.location.reload()}
            >
              <RotateCcw className="w-4 h-4 mr-2" /> New Transfer
            </Button>
          )}

          {phase === "receiving" && (
            <Button
              variant="ghost"
              onClick={() => setIsScanning(prev => !prev)}
              className="w-full h-12 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-muted/30"
            >
              {isScanning ? "Pause Scanner" : "Resume Scanner"}
            </Button>
          )}
        </div>

        {/* ── Developer Tools ───────────────────────────── */}
        {settings.developerMode && (
          <div className="space-y-3">
            <ReceiveDebugger sessions={debugSessions} />
            <DeveloperDashboard metrics={metrics} />
          </div>
        )}
      </div>
    </div>
  );
}
