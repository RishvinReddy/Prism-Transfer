"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { QRScanner } from "./QRScanner";
import { useProgressTracker } from "./useProgressTracker";
import { validateManifestDetailed, validatePacketDetailed, verifyCRC } from "@/lib/validator";
import {
  deserializeManifestV2,
  deserializePacketV2,
  deserializeManifestV1,
  deserializePacketV1,
} from "@/lib/serializer";
import { isV3Packet, decodeManifestPacketV3, decodeDataPacketV3 } from "@/lib/binaryCodec";
import { saveManifest, savePacket, getAllPackets, clearTransfer, getManifest } from "@/features/storage/packetStore";
import { reconstructFile, downloadBlob, ReconstructionError } from "./reconstructionEngine";
import { TransferManifest, TransferPacket } from "@/types/transfer";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/settings";
import { useDiagnostics } from "@/contexts/diagnostics";
import { cn } from "@/lib/utils";
import { ReceiveDebugger, DebugPacket, DebugStage } from "./ReceiveDebugger";
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Download,
  RotateCcw,
  MonitorSmartphone,
  History,
  X,
} from "lucide-react";

// ─── Transfer State Machine ─────────────────────────────────────────────────
export type ReceiverPhase =
  | "Idle"
  | "Camera Ready"
  | "QR Detected"
  | "Receiving Metadata"
  | "Receiving Chunks"
  | "Verifying CRC"
  | "Reconstructing"
  | "Completed"
  | "Error";

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

// ─── IndexedDB resume helpers ────────────────────────────────────────────────
/** Attempt to find any stored manifest in IDB (we check for transferId stored in sessionStorage). */
async function findResumableSession(): Promise<TransferManifest | null> {
  try {
    const storedId = sessionStorage.getItem("prism_active_transferId");
    if (!storedId) return null;

    const m = await getManifest(storedId);
    if (!m) {
      // Manifest was cleared (transfer completed or IDB wiped) — remove stale ID
      clearActiveTransferId();
      return null;
    }

    // Only offer resume if at least 1 packet was already received.
    // This prevents a banner for transfers where only the manifest was scanned.
    const packets = await getAllPackets(storedId);
    if (packets.length === 0) {
      clearActiveTransferId();
      return null;
    }

    return m;
  } catch {
    // IDB is unavailable or corrupt — clean up gracefully
    clearActiveTransferId();
    return null;
  }
}

function persistActiveTransferId(id: string) {
  try { sessionStorage.setItem("prism_active_transferId", id); } catch {}
}

function clearActiveTransferId() {
  try { sessionStorage.removeItem("prism_active_transferId"); } catch {}
}

// ─── Component ───────────────────────────────────────────────────────────────
export function PacketReceiver() {
  const { settings } = useSettings();
  
  // Telemetry (fail-safe)
  let diagnosticsCtx: ReturnType<typeof useDiagnostics> | null = null;
  try {
    diagnosticsCtx = useDiagnostics();
  } catch (e) {}

  const [isScanning, setIsScanning] = React.useState(true);
  const [manifest, setManifest] = React.useState<TransferManifest | null>(null);
  const [phase, setPhase] = React.useState<ReceiverPhase>("Idle");
  const [error, setError] = React.useState<string | null>(null);
  const [downloadedBlob, setDownloadedBlob] = React.useState<{ blob: Blob; filename: string } | null>(null);
  const [resumableSession, setResumableSession] = React.useState<TransferManifest | null>(null);
  const [showResumeBanner, setShowResumeBanner] = React.useState(false);

  const tracker = useProgressTracker(manifest?.totalPackets || 0);
  const lastScannedRef = React.useRef<{ id: string; time: number } | null>(null);
  const pauseScannerRef = React.useRef<boolean>(false);
  const timestampRef = React.useRef(Date.now());
  const [debugPackets, setDebugPackets] = React.useState<DebugPacket[]>([]);

  // ── Initial phase transition ─────────────────────────────────────────────
  React.useEffect(() => {
    if (phase === "Idle") {
      setPhase("Camera Ready");
    }
  }, [phase]);

  // ── Check for resumable session on mount ─────────────────────────────────
  React.useEffect(() => {
    findResumableSession().then((found) => {
      if (found) {
        setResumableSession(found);
        setShowResumeBanner(true);
      }
    });
  }, []);

  // ── Core reset — replaces window.location.reload() ───────────────────────
  const resetSession = React.useCallback(async () => {
    // Clean up IDB for the current session
    if (manifest) {
      try { await clearTransfer(manifest.transferId); } catch {}
    }
    clearActiveTransferId();

    // Reset all state inline — no page reload
    setManifest(null);
    setPhase("Camera Ready");
    setError(null);
    setDownloadedBlob(null);
    setDebugPackets([]);
    setResumableSession(null);
    setShowResumeBanner(false);
    lastScannedRef.current = null;
    pauseScannerRef.current = false;
    tracker.resetProgress(0);
    setIsScanning(true);
  }, [manifest, tracker]);

  // ── Resume a previous session ────────────────────────────────────────────
  const handleResume = React.useCallback(async () => {
    if (!resumableSession) return;
    setShowResumeBanner(false);

    const existingPackets = await getAllPackets(resumableSession.transferId);
    setManifest(resumableSession);
    tracker.resetProgress(resumableSession.totalPackets);
    // Pre-credit already-received packets
    existingPackets.forEach((p) => tracker.recordPacket(p.index, false));
    setPhase("Receiving Chunks");
    setIsScanning(true);
  }, [resumableSession, tracker]);

  const handleDismissResume = () => {
    setShowResumeBanner(false);
    setResumableSession(null);
  };

  // ── Debug helpers ────────────────────────────────────────────────────────
  const addDebugPacket = (packet: DebugPacket) => {
    setDebugPackets(prev => [packet, ...prev].slice(0, 100));
  };

  // ── Scan handler ─────────────────────────────────────────────────────────
  const handleScan = async (decodedText: string, binaryData?: Uint8Array) => {
    if (!isScanning || pauseScannerRef.current) return;

    if (phase === "Camera Ready") {
      setPhase("QR Detected");
    }

    const timestamp = Date.now();
    const stages: DebugStage[] = [];

    const addStage = (name: string, status: "SUCCESS" | "ERROR" | "SKIPPED", message: string) => {
      stages.push({ name, status, message });
    };

    let finalStatus: "SUCCESS" | "ERROR" | "DROPPED" = "SUCCESS";
    let rawPreview = decodedText.slice(0, 100);
    if (decodedText.length > 100) rawPreview += "...";

    addStage("QR Decode", "SUCCESS", `Decoded ${decodedText.length} bytes`);

    let packetId = "unknown";
    let isManifest = false;
    let parsed: any = null;
    let isV2 = false;
    let isV3 = false;
    let deserializedManifest: TransferManifest | null = null;
    let deserializedPacket: TransferPacket | null = null;

    try {
      if (binaryData && isV3Packet(binaryData)) {
        isV3 = true;
        const type = binaryData[1];
        if (type === 0x00) { // TYPE_MANIFEST
          isManifest = true;
          deserializedManifest = decodeManifestPacketV3(binaryData);
          packetId = "manifest";
          addStage("Binary Parse", "SUCCESS", "Decoded V3 Manifest");
        } else if (type === 0x01) { // TYPE_DATA
          deserializedPacket = decodeDataPacketV3(binaryData);
          packetId = deserializedPacket.packetId;
          addStage("Binary Parse", "SUCCESS", "Decoded V3 Data Packet");
        }
      } else {
        parsed = JSON.parse(decodedText);
        // v2 uses short "id" field; v1 uses "packetId"; manifests get special label
        packetId = (parsed.k === "M" || parsed.type === "manifest")
          ? "manifest"
          : parsed.id ?? parsed.packetId ?? "unknown";
        addStage("JSON Parse", "SUCCESS", "Valid JSON structure");

        isManifest = parsed.k === "M" || parsed.type === "manifest";
        isV2 = parsed.k === "M" || (typeof parsed.v === "number" && parsed.v >= 2);

        if (isManifest) {
          deserializedManifest = isV2
            ? deserializeManifestV2(decodedText)
            : deserializeManifestV1(decodedText);
        } else {
          deserializedPacket = isV2
            ? deserializePacketV2(decodedText)
            : deserializePacketV1(decodedText);
        }
      }

      const now = Date.now();
      if (lastScannedRef.current && lastScannedRef.current.id === packetId) {
        if (now - lastScannedRef.current.time < 200) {
          addStage("Debounce", "SKIPPED", `Ignored duplicate within 200ms`);
          finalStatus = "DROPPED";
          addDebugPacket({ id: packetId, timestamp, stages, rawPayloadPreview: rawPreview, rawPayloadLength: decodedText.length, finalStatus });
          return;
        } else {
          tracker.recordDuplicate();
          lastScannedRef.current.time = now;
          addStage("Debounce", "SKIPPED", `Counted as duplicate`);
          finalStatus = "DROPPED";
          addDebugPacket({ id: packetId, timestamp, stages, rawPayloadPreview: rawPreview, rawPayloadLength: decodedText.length, finalStatus });
          return;
        }
      }

      lastScannedRef.current = { id: packetId, time: now };
      addStage("Debounce", "SUCCESS", `Accepted new read for ${packetId}`);

      if (isManifest && deserializedManifest) {
        // ── Manifest path ──
        const isNewSession = !manifest || deserializedManifest.transferId !== manifest.transferId;

        if (isNewSession) {
          setPhase("Receiving Metadata");
          
          let valid = true;
          let reason = "";
          
          if (!isV3) {
            const result = validateManifestDetailed(parsed);
            valid = result.valid;
            reason = result.reason || "";
          }

          if (valid) {
            addStage("Schema Validate", "SUCCESS", `v${isV3 ? 3 : isV2 ? 2 : 1} manifest conforms to schema`);

            // Clean up previous transfer state in IndexedDB if starting a new one
            if (manifest) {
              await clearTransfer(manifest.transferId);
            }

            await saveManifest(deserializedManifest);
            persistActiveTransferId(deserializedManifest.transferId);
            addStage("Store", "SUCCESS", "Manifest saved to IDB");

            setManifest(deserializedManifest);
            tracker.resetProgress(deserializedManifest.totalPackets);
            setPhase("Receiving Chunks");

            pauseScannerRef.current = true;
            setTimeout(() => { pauseScannerRef.current = false; }, 100);
          } else {
            addStage("Schema Validate", "ERROR", reason || "Unknown schema failure");
            finalStatus = "ERROR";
          }
        } else {
          addStage("Identify", "SKIPPED", "Manifest already stored");
          finalStatus = "DROPPED";
        }
      } else if (deserializedPacket) {
        if (manifest) {
          let valid = true;
          let reason = "";
          if (!isV3) {
            const result = validatePacketDetailed(parsed);
            valid = result.valid;
            reason = result.reason || "";
          }

          if (valid) {
            const p = deserializedPacket;

            if (p.transferId !== manifest.transferId) {
              addStage("Schema Validate", "ERROR", `TransferId mismatch`);
              finalStatus = "ERROR";
            } else {
              addStage("Schema Validate", "SUCCESS", `v${isV3 ? 3 : isV2 ? 2 : 1} packet ${p.index}`);

              // Per-packet CRC validation
              const crcValid = verifyCRC(p);
              if (!crcValid) {
                addStage("CRC Check", "ERROR", `CRC mismatch for packet ${p.index}`);
                tracker.recordCorruption();
                finalStatus = "ERROR";
              } else {
                addStage("CRC Check", "SUCCESS", "Integrity verified");
                const isNew = await savePacket(p);

                if (isNew) {
                  addStage("Store", "SUCCESS", "Saved new packet to IDB");
                  tracker.recordPacket(p.index, false);
                  pauseScannerRef.current = true;
                  setTimeout(() => { pauseScannerRef.current = false; }, 50);
                } else {
                  addStage("Store", "SKIPPED", "Packet already existed in IDB");
                  tracker.recordPacket(p.index, true);
                  finalStatus = "DROPPED";
                }
              }
            }
          } else {
            addStage("Schema Validate", "ERROR", reason || `TransferId mismatch`);
            finalStatus = "ERROR";
          }
        } else {
          addStage("Identify", "ERROR", "Received Data Packet before Manifest");
          finalStatus = "ERROR";
        }
      }
    } catch (e: any) {
      addStage("JSON Parse", "ERROR", e.message || "Unknown parsing error");
      tracker.recordCorruption();
      finalStatus = "ERROR";
    }

    addDebugPacket({ id: packetId, timestamp, stages, rawPayloadPreview: rawPreview, rawPayloadLength: decodedText.length, finalStatus });
  };

  // ── Reconstruction effect ────────────────────────────────────────────────
  React.useEffect(() => {
    if (tracker.progress.isComplete && manifest && phase === "Receiving Chunks") {
      setIsScanning(false);
      setPhase("Verifying CRC");

      const run = async () => {
        try {
          const packets = await getAllPackets(manifest.transferId);
          setPhase("Reconstructing");

          const worker = new Worker(new URL("../../workers/reconstruction.worker.ts", import.meta.url));
          const blob = await new Promise<Blob>((resolve, reject) => {
            worker.onmessage = (e) => {
              if (e.data.success) {
                if (diagnosticsCtx) {
                  diagnosticsCtx.updateReconstructionWorker({
                    status: "Done",
                    latencyMs: e.data.metrics?.latencyMs || 0,
                    details: e.data.metrics?.details
                  });
                }
                resolve(e.data.blob);
              } else {
                if (diagnosticsCtx) {
                  diagnosticsCtx.updateReconstructionWorker({
                    status: "Error",
                    error: e.data.error
                  });
                }
                reject(new Error(e.data.error));
              }
              worker.terminate();
            };
            worker.onerror = (e) => {
              if (diagnosticsCtx) {
                diagnosticsCtx.updateReconstructionWorker({
                  status: "Error",
                  error: "Worker failed"
                });
              }
              reject(e);
              worker.terminate();
            };
            
            if (diagnosticsCtx) {
              diagnosticsCtx.updateReconstructionWorker({ status: "Running", latencyMs: 0 });
            }
            
            worker.postMessage({ manifest, packets });
          });

          await clearTransfer(manifest.transferId);
          clearActiveTransferId();
          setDownloadedBlob({ blob, filename: manifest.filename });
          setPhase("Completed");
        } catch (e) {
          setError(e instanceof Error ? e.message : "An unknown error occurred.");
          setPhase("Error");
        }
      };

      setTimeout(run, 500);
    }
  }, [tracker.progress.isComplete, manifest, phase]);

  const isTerminal = phase === "Completed" || phase === "Error";

  // Compute speed in KB/s
  const speedKbps =
    tracker.progress.packetsReceived > 0
      ? ((tracker.progress.packetsReceived * (manifest?.chunkSize || 0)) / 1024) /
        (tracker.progress.estimatedTimeRemainingMs > 0
          ? (Date.now() - timestampRef.current) / 1000
          : 1)
      : 0;

  React.useEffect(() => {
    if (diagnosticsCtx && speedKbps > 0) {
      diagnosticsCtx.updateProtocol({ speedKbps: Math.round(speedKbps) });
    }
  }, [speedKbps]);

  React.useEffect(() => {
    if (phase === "Receiving Chunks") timestampRef.current = Date.now();
  }, [phase]);

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

      {/* ── Left Column: Viewfinder / Scanner Lens ── */}
      <div className="lg:col-span-5 flex flex-col space-y-6">
        <div className="flex flex-col items-center justify-center p-6 bg-zinc-950/20 backdrop-blur-xl border border-zinc-800/40 rounded-3xl relative overflow-hidden group shadow-2xl">
          {/* Glass glare effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none z-20" />

          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Viewfinder Scanner</h2>

          <div className="w-full max-w-[280px] aspect-square rounded-2xl overflow-hidden bg-black shadow-inner ring-1 ring-white/10 relative">
            {/* Viewfinder Target Brackets */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60 z-30 pointer-events-none group-hover:border-cyan-400 transition-colors" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400/60 z-30 pointer-events-none group-hover:border-cyan-400 transition-colors" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400/60 z-30 pointer-events-none group-hover:border-cyan-400 transition-colors" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400/60 z-30 pointer-events-none group-hover:border-cyan-400 transition-colors" />

            {/* Glowing scanning laser line — suppressed under reduced motion */}
            {phase === "Receiving Chunks" && !settings.reducedMotion && (
              <div className="absolute left-[10%] right-[10%] h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent z-30 pointer-events-none animate-[scan_2s_ease-in-out_infinite]" />
            )}
            {/* Static indicator when reduced motion is on */}
            {phase === "Receiving Chunks" && settings.reducedMotion && (
              <div className="absolute top-1/2 left-[10%] right-[10%] h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent z-30 pointer-events-none" />
            )}

            {!isTerminal ? (
              <QRScanner
                isScanning={isScanning}
                onScan={handleScan}
                hasManifest={!!manifest}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950">
                {phase === "Completed" ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="rounded-full bg-green-500/10 p-5 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.15)]"
                  >
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                  </motion.div>
                ) : (
                  <div className="rounded-full bg-red-500/10 p-5 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
                    <AlertTriangle className="w-12 h-12 text-red-500" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Security / Isolation stats */}
        <div className="p-5 bg-zinc-950/20 backdrop-blur-xl border border-zinc-800/40 rounded-2xl flex flex-col space-y-3">
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full bg-green-400 ${settings.reducedMotion ? "" : "animate-pulse"}`} />
            <span className="text-xs font-bold uppercase tracking-wider text-green-400">Isolated Network Layer</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Reassembly occurs serverless and client-side. No packets are mirrored, logged, or dispatched over the internet.
          </p>
        </div>
      </div>

      {/* ── Right Column: Control Dashboard & Stats ── */}
      <div className="lg:col-span-7 flex flex-col space-y-6">

        {/* Title */}
        <div className="space-y-1.5">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Receive Files</h1>
          <p className="text-muted-foreground text-xs md:text-sm">
            Point your camera at a transmitting PrismTransfer stream to capture manifest and reassemble chunks.
          </p>
        </div>

        {/* ── Resume previous session banner ── */}
        <AnimatePresence>
          {showResumeBanner && resumableSession && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-start space-x-4 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl"
            >
              <div className="p-2 bg-indigo-500/20 rounded-xl">
                <History className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Incomplete transfer detected</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {resumableSession.filename} · {formatSize(resumableSession.originalSize)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  className="h-8 rounded-lg text-xs bg-indigo-600 hover:bg-indigo-500 text-white"
                  onClick={handleResume}
                >
                  Resume
                </Button>
                <button
                  onClick={handleDismissResume}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Indicator */}
        <div className="flex items-center justify-between p-4 bg-zinc-950/25 backdrop-blur-xl border border-zinc-800/40 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent pointer-events-none" />
          <div className="flex flex-col z-10">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Transfer State</span>
            <div className="flex items-center space-x-2.5 mt-1.5">
              {phase === "Camera Ready" || phase === "QR Detected" ? <div className={`w-2.5 h-2.5 rounded-full bg-cyan-400 ${settings.reducedMotion ? "" : "animate-pulse"}`} /> : null}
              {phase === "Receiving Chunks" ? <div className={`w-2.5 h-2.5 rounded-full bg-indigo-500 ${settings.reducedMotion ? "" : "animate-pulse"}`} /> : null}
              {(phase === "Verifying CRC" || phase === "Reconstructing") ? <Loader2 className="w-4 h-4 text-primary animate-spin" /> : null}
              {phase === "Completed" ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : null}
              {phase === "Error" ? <AlertTriangle className="w-4 h-4 text-red-500" /> : null}
              <span className="font-extrabold text-lg text-foreground tracking-tight">{phase}</span>
            </div>
          </div>
        </div>

        {/* Transfer Progress (Shows during active transfer) */}
        <AnimatePresence>
          {manifest && phase !== "Completed" && phase !== "Error" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col p-5 bg-zinc-950/20 backdrop-blur-xl border border-zinc-800/40 rounded-2xl space-y-4"
            >
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">{manifest.filename}</span>
                  <span className="text-xs text-muted-foreground">{formatSize(manifest.originalSize)}</span>
                </div>
                <span className="text-xl font-extrabold text-indigo-400">{tracker.progress.percentage}%</span>
              </div>

              <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden border border-zinc-800/40 p-[1px]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                  style={{ width: `${tracker.progress.percentage}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transfer Stats Grid (Visible during active chunking) */}
        <AnimatePresence>
          {manifest && phase === "Receiving Chunks" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-black/20 border border-zinc-800/40 rounded-2xl"
            >
              <div className="flex flex-col p-3 rounded-xl bg-zinc-950/20 border border-zinc-900">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Frames</span>
                <span className="font-mono text-sm font-bold text-foreground mt-0.5">{tracker.progress.packetsReceived} / {tracker.progress.totalPackets}</span>
              </div>
              <div className="flex flex-col p-3 rounded-xl bg-zinc-950/20 border border-zinc-900">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">ETA</span>
                <span className="font-mono text-sm font-bold text-foreground mt-0.5">{formatETA(tracker.progress.estimatedTimeRemainingMs)}</span>
              </div>
              <div className="flex flex-col p-3 rounded-xl bg-zinc-950/20 border border-zinc-900">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Duplicates</span>
                <span className="font-mono text-sm font-bold text-yellow-500 mt-0.5">{tracker.progress.duplicateCount}</span>
              </div>
              <div className="flex flex-col p-3 rounded-xl bg-zinc-950/20 border border-zinc-900">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Corruption</span>
                <span className="font-mono text-sm font-bold text-red-400 mt-0.5">{tracker.progress.corruptedCount}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Real-time debugging validation console */}
        {phase === "Receiving Chunks" && (
          <div className="flex flex-col p-4 bg-zinc-950/75 border border-zinc-900 rounded-2xl space-y-1.5 h-44 overflow-y-auto font-mono text-[10px] text-zinc-500">
            <div className="text-zinc-400 font-bold uppercase tracking-wider text-[8px] pb-1 border-b border-zinc-900/50 flex justify-between items-center mb-1">
              <span>Active Validation Trace</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </div>
            {debugPackets.length === 0 ? (
              <div className="text-zinc-600 italic">Waiting for incoming optical signal stream...</div>
            ) : (
              debugPackets.slice(0, 10).reverse().map((pkt, idx) => (
                <div key={idx} className="flex justify-between items-center py-0.5 border-b border-zinc-900/10 last:border-0">
                  <span className={cn(
                    pkt.finalStatus === "SUCCESS" ? "text-green-400" :
                    pkt.finalStatus === "ERROR" ? "text-red-400" : "text-yellow-500"
                  )}>
                    {pkt.id === "manifest" ? "⚡ [MANIFEST] metadata parsed" : `✓ [FRAME #${pkt.id}] chunk verified`}
                  </span>
                  <span className="text-[8px] text-zinc-700">{new Date(pkt.timestamp).toLocaleTimeString()}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Success/Action State */}
        <AnimatePresence>
          {phase === "Completed" && downloadedBlob && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col p-6 bg-zinc-955/20 backdrop-blur-xl border border-green-500/30 rounded-2xl space-y-4 shadow-xl"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                  <MonitorSmartphone className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-foreground">{manifest?.filename}</span>
                  <span className="text-xs text-muted-foreground">{formatSize(manifest?.originalSize || 0)}</span>
                </div>
              </div>

              <Button
                className="w-full h-12 rounded-xl font-bold bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/10 transition-colors"
                onClick={() => downloadBlob(downloadedBlob.blob, downloadedBlob.filename)}
              >
                <Download className="w-5 h-5 mr-2" /> Save to Device
              </Button>

              <Button
                variant="outline"
                className="w-full h-12 rounded-xl border-zinc-800 hover:bg-zinc-900 transition-colors"
                onClick={resetSession}
              >
                Receive Another File
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        {phase === "Error" && (
          <div className="flex flex-col p-6 bg-red-950/10 border border-red-900/50 rounded-2xl space-y-4">
            <p className="text-sm text-red-400">{error}</p>
            <Button
              variant="destructive"
              className="w-full h-12 rounded-xl"
              onClick={resetSession}
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Reset Session
            </Button>
          </div>
        )}

        {/* Device Info Footer */}
        <div className="flex justify-between items-center text-xs text-muted-foreground px-1 border-t border-border/10 pt-4 mt-2">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-zinc-500">Optical v2 protocol</span>
          <span>Session: <span className="font-mono text-zinc-400">{manifest ? "Active" : "Waiting"}</span></span>
        </div>

      </div>

      {/* Developer Tools */}
      {settings.developerMode && (
        <ReceiveDebugger packets={debugPackets} />
      )}
    </div>
  );
}
