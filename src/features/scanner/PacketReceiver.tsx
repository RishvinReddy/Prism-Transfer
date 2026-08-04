"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { QRScanner } from "./QRScanner";
import { useProgressTracker } from "./useProgressTracker";
import { validateManifestDetailed, validatePacketDetailed, verifyCRC } from "@/lib/validator";
import { saveManifest, savePacket, getAllPackets, clearTransfer } from "@/features/storage/packetStore";
import { reconstructFile, downloadBlob, ReconstructionError } from "./reconstructionEngine";
import { TransferManifest, TransferPacket } from "@/types/transfer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSettings } from "@/contexts/settings";
import { ReceiveDebugger, DebugPacket, DebugStage } from "./ReceiveDebugger";
import { Loader2, CheckCircle2, AlertTriangle, RefreshCcw, Download, RotateCcw, MonitorSmartphone } from "lucide-react";

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

export function PacketReceiver() {
  const { settings } = useSettings();
  const [isScanning, setIsScanning] = React.useState(true);
  const [manifest, setManifest] = React.useState<TransferManifest | null>(null);
  const [phase, setPhase] = React.useState<ReceiverPhase>("Idle");
  const [error, setError] = React.useState<string | null>(null);
  const [downloadedBlob, setDownloadedBlob] = React.useState<{ blob: Blob; filename: string } | null>(null);

  const tracker = useProgressTracker(manifest?.totalPackets || 0);
  const lastScannedRef = React.useRef<{ id: string; time: number } | null>(null);
  const pauseScannerRef = React.useRef<boolean>(false);
  const timestampRef = React.useRef(Date.now());
  const [debugPackets, setDebugPackets] = React.useState<DebugPacket[]>([]);

  // Update phase to Camera Ready initially
  React.useEffect(() => {
    if (phase === "Idle") {
      setPhase("Camera Ready");
    }
  }, [phase]);

  const addDebugPacket = (packet: DebugPacket) => {
    setDebugPackets(prev => [packet, ...prev].slice(0, 100)); // Keep last 100 packets
  };

  const handleScan = async (decodedText: string) => {
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
    try {
      const parsed = JSON.parse(decodedText);
      packetId = parsed.type === "manifest" ? "manifest" : parsed.packetId || "unknown";
      addStage("JSON Parse", "SUCCESS", "Valid JSON structure");

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

      if (parsed.type === "manifest") {
        if (!manifest) {
          setPhase("Receiving Metadata");
          delete parsed.type;
          const { valid, reason } = validateManifestDetailed(parsed);

          if (valid) {
            addStage("Schema Validate", "SUCCESS", "Manifest conforms to schema");
            const m = parsed as TransferManifest;
            await saveManifest(m);
            addStage("Store", "SUCCESS", "Manifest saved to IDB");
            
            setManifest(m);
            tracker.resetProgress(m.totalPackets);
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
      } else {
        if (manifest) {
          const { valid, reason } = validatePacketDetailed(parsed);

          if (valid && parsed.transferId === manifest.transferId) {
            addStage("Schema Validate", "SUCCESS", `Valid packet ${parsed.index}`);
            const p = parsed as TransferPacket;
            
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

  // Reconstruction effect
  React.useEffect(() => {
    if (tracker.progress.isComplete && manifest && phase === "Receiving Chunks") {
      setIsScanning(false);
      setPhase("Verifying CRC"); // We actually do SHA validation here

      const run = async () => {
        try {
          const packets = await getAllPackets(manifest.transferId);
          setPhase("Reconstructing");
          const blob = await reconstructFile(manifest, packets);
          await clearTransfer(manifest.transferId);
          setDownloadedBlob({ blob, filename: manifest.filename });
          setPhase("Completed");
        } catch (e) {
          setError(e instanceof ReconstructionError ? e.message : "An unknown error occurred.");
          setPhase("Error");
        }
      };

      // Slight delay for UX
      setTimeout(run, 500);
    }
  }, [tracker.progress.isComplete, manifest, phase]);

  const isTerminal = phase === "Completed" || phase === "Error";

  // Compute speed in KB/s
  const speedKbps = tracker.progress.packetsReceived > 0 
    ? ((tracker.progress.packetsReceived * (manifest?.chunkSize || 0)) / 1024) / (tracker.progress.estimatedTimeRemainingMs > 0 ? (Date.now() - timestampRef.current) / 1000 : 1)
    : 0; // rough mock
    
  React.useEffect(() => { if (phase === "Receiving Chunks") timestampRef.current = Date.now(); }, [phase]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col space-y-6">
      
      {/* ── Top UI: Persistent Scanner Box ── */}
      <div className="flex flex-col items-center justify-center p-6 bg-card/40 border border-border/30 rounded-3xl space-y-6">
        <h1 className="text-xl font-bold tracking-tight">Receive Files</h1>
        
        <div className="w-full max-w-[280px] aspect-square rounded-2xl overflow-hidden bg-black shadow-xl ring-1 ring-white/10 relative">
          {!isTerminal ? (
            <QRScanner
              isScanning={isScanning}
              onScan={handleScan}
              hasManifest={!!manifest}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900">
              {phase === "Completed" ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="rounded-full bg-green-500/20 p-4">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </motion.div>
              ) : (
                <div className="rounded-full bg-red-500/20 p-4">
                  <AlertTriangle className="w-12 h-12 text-red-500" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Status Indicator ── */}
      <div className="flex items-center justify-between p-4 bg-card/60 backdrop-blur-xl border border-border/30 rounded-2xl">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Status</span>
          <div className="flex items-center space-x-2 mt-1">
            {phase === "Camera Ready" || phase === "QR Detected" ? <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" /> : null}
            {phase === "Receiving Chunks" ? <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" /> : null}
            {(phase === "Verifying CRC" || phase === "Reconstructing") ? <Loader2 className="w-4 h-4 text-primary animate-spin" /> : null}
            {phase === "Completed" ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : null}
            {phase === "Error" ? <AlertTriangle className="w-4 h-4 text-red-500" /> : null}
            <span className="font-semibold text-lg">{phase}</span>
          </div>
        </div>
      </div>

      {/* ── Transfer Progress (Shows during active transfer) ── */}
      <AnimatePresence>
        {manifest && phase !== "Completed" && phase !== "Error" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col p-5 bg-card/60 backdrop-blur-xl border border-border/30 rounded-2xl space-y-4"
          >
            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{manifest.filename}</span>
                <span className="text-xs text-muted-foreground">{formatSize(manifest.originalSize)}</span>
              </div>
              <span className="text-xl font-bold text-primary">{tracker.progress.percentage}%</span>
            </div>
            
            <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden border border-border/30">
              <motion.div
                className="h-full rounded-full bg-primary"
                style={{ width: `${tracker.progress.percentage}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Transfer Stats Bottom Sheet (Visible during active chunking) ── */}
      <AnimatePresence>
        {manifest && phase === "Receiving Chunks" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="grid grid-cols-2 gap-4 p-5 bg-black/40 border border-border/20 rounded-2xl"
          >
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Packets</span>
              <span className="font-mono text-sm">{tracker.progress.packetsReceived} / {tracker.progress.totalPackets}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">ETA</span>
              <span className="font-mono text-sm">{formatETA(tracker.progress.estimatedTimeRemainingMs)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Duplicates</span>
              <span className="font-mono text-sm">{tracker.progress.duplicateCount}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">CRC Errors</span>
              <span className="font-mono text-sm text-red-400">{tracker.progress.corruptedCount}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Success/Action State ── */}
      <AnimatePresence>
        {phase === "Completed" && downloadedBlob && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col p-6 bg-card/60 backdrop-blur-xl border border-green-500/30 rounded-2xl space-y-4"
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-zinc-900 rounded-xl">
                <MonitorSmartphone className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold">{manifest?.filename}</span>
                <span className="text-sm text-muted-foreground">{formatSize(manifest?.originalSize || 0)}</span>
              </div>
            </div>
            
            <Button
              className="w-full h-12 rounded-xl font-bold bg-green-600 hover:bg-green-500 text-white"
              onClick={() => downloadBlob(downloadedBlob.blob, downloadedBlob.filename)}
            >
              <Download className="w-5 h-5 mr-2" /> Save to Device
            </Button>
            
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl"
              onClick={() => window.location.reload()}
            >
              Receive Another File
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error State ── */}
      {phase === "Error" && (
        <div className="flex flex-col p-6 bg-red-950/20 border border-red-900/50 rounded-2xl space-y-4">
          <p className="text-sm text-red-400">{error}</p>
          <Button
            variant="destructive"
            className="w-full h-12 rounded-xl"
            onClick={() => window.location.reload()}
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Reset Session
          </Button>
        </div>
      )}

      {/* ── Device Info Footer ── */}
      <div className="flex justify-between items-center text-xs text-muted-foreground px-4">
        <div className="flex flex-col">
          <span>Protocol: <span className="font-mono text-zinc-300">Optical v2</span></span>
          <span>Session: <span className="font-mono text-zinc-300">{manifest ? "Active" : "Waiting"}</span></span>
        </div>
      </div>

      {/* ── Developer Tools ── */}
      {settings.developerMode && (
        <ReceiveDebugger packets={debugPackets} />
      )}
    </div>
  );
}
