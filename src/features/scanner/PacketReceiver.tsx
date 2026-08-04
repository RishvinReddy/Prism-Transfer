"use client";

import * as React from "react";
import { QRScanner } from "./QRScanner";
import { useProgressTracker } from "./useProgressTracker";
import { deserializeManifest, deserializePacket } from "@/lib/serializer";
import { validateManifest, validatePacket, validateManifestDetailed, validatePacketDetailed } from "@/lib/validator";
import { saveManifest, savePacket, getAllPackets, clearTransfer } from "@/features/storage/packetStore";
import { reconstructFile, downloadBlob, ReconstructionError } from "./reconstructionEngine";
import { TransferManifest, TransferPacket } from "@/types/transfer";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertTriangle, RefreshCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useSettings } from "@/contexts/settings";
import { DeveloperDashboard, BenchmarkMetrics } from "@/features/developer/DeveloperDashboard";
import { ReceiveDebugger, DebugSession, DebugStage } from "./ReceiveDebugger";

export function PacketReceiver() {
  const { settings } = useSettings();
  const [isScanning, setIsScanning] = React.useState(true);
  const [manifest, setManifest] = React.useState<TransferManifest | null>(null);
  const [isReconstructing, setIsReconstructing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const tracker = useProgressTracker(manifest?.totalPackets || 0);
  const lastScannedRef = React.useRef<{ id: string; time: number } | null>(null);
  const pauseScannerRef = React.useRef<boolean>(false);
  const [debugSessions, setDebugSessions] = React.useState<DebugSession[]>([]);

  const addDebugSession = (session: DebugSession) => {
    setDebugSessions(prev => [session, ...prev].slice(0, 50));
  };

  const handleScan = async (decodedText: string) => {
    if (!isScanning || pauseScannerRef.current) return;
    
    const sessionStart = performance.now();
    const sessionId = `scan-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    const stages: DebugStage[] = [];
    
    const addStage = (name: string, status: "SUCCESS"|"ERROR"|"SKIPPED", message: string, start?: number) => {
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
      addStage("DEBOUNCE", "SUCCESS", `Accepted new read for ${packetId || 'unknown'}`, debounceStart);
      
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
            const storeStart = performance.now();
            await saveManifest(m);
            addStage("STORE_PACKET", "SUCCESS", "Manifest saved to IDB", storeStart);
            
            setManifest(m);
            tracker.resetProgress(m.totalPackets);
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
            
            const storeStart = performance.now();
            const isNew = await savePacket(p);
            
            if (isNew) {
              addStage("STORE_PACKET", "SUCCESS", "Saved new packet to IDB", storeStart);
              tracker.recordPacket(p.index, false);
              addStage("UPDATE_PROGRESS", "SUCCESS", `Recorded packet ${p.index}`);
              pauseScannerRef.current = true;
              setTimeout(() => { pauseScannerRef.current = false; }, 150);
            } else {
              addStage("STORE_PACKET", "SKIPPED", "Packet already existed in IDB", storeStart);
              tracker.recordPacket(p.index, true);
              finalStatus = "DROPPED";
            }
          } else {
            if (!valid) {
              addStage("VALIDATE_SCHEMA", "ERROR", reason || "Unknown schema failure", validateStart);
            } else {
              addStage("VALIDATE_SCHEMA", "ERROR", `TransferId mismatch. Expected ${manifest.transferId}`, validateStart);
            }
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

    addDebugSession({
      id: sessionId,
      timestamp: Date.now(),
      stages,
      rawPayloadPreview: rawPreview,
      rawPayloadLength: decodedText.length,
      finalStatus
    });
  };

  React.useEffect(() => {
    if (tracker.progress.isComplete && manifest && !isReconstructing) {
      setIsScanning(false);
      setIsReconstructing(true);

      const runReconstruction = async () => {
        try {
          const packets = await getAllPackets(manifest.transferId);
          const blob = await reconstructFile(manifest, packets);
          downloadBlob(blob, manifest.filename);
          await clearTransfer(manifest.transferId);
        } catch (e) {
          if (e instanceof ReconstructionError) {
            setError(e.message);
          } else {
            setError("An unknown error occurred during reconstruction.");
          }
        } finally {
          setIsReconstructing(false);
        }
      };

      runReconstruction();
    }
  }, [tracker.progress.isComplete, manifest, isReconstructing]);

  // Derived metrics for developer dashboard
  const metrics: BenchmarkMetrics = {
    transferId: manifest?.transferId,
    frames: tracker.progress.totalPackets + 1,
    fps: settings.fps,
    compressionRatio: manifest ? manifest.compressedSize / manifest.originalSize : 0,
    averageKbps: (manifest?.compressedSize || 0) / 1024 / ((Date.now() - (tracker.progress.totalPackets > 0 ? (tracker.progress.estimatedTimeRemainingMs) : Date.now())) / 1000 || 1), // Rough approx
    duplicatePercentage: tracker.progress.totalPackets > 0 ? (tracker.progress.duplicateCount / tracker.progress.totalPackets) * 100 : 0,
    missingPercentage: tracker.progress.totalPackets > 0 ? (tracker.progress.missingPackets.length / tracker.progress.totalPackets) * 100 : 0,
    crcErrors: tracker.progress.corruptedCount,
    shaStatus: error ? "Failed" : tracker.progress.isComplete ? "Verified" : "Pending",
    durationSeconds: tracker.progress.estimatedTimeRemainingMs / 1000 || 0,
  };

  return (
    <div className="flex flex-col items-center space-y-6 w-full">
      <QRScanner isScanning={isScanning} onScan={handleScan} />

      <Card className="w-full max-w-md p-6 bg-card/50 backdrop-blur border-border/50 shadow-xl space-y-4">
        {error ? (
          <div className="text-destructive flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium text-sm">{error}</span>
          </div>
        ) : isReconstructing ? (
          <div className="flex items-center space-x-3 text-primary justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="font-semibold text-lg">Reconstructing File...</span>
          </div>
        ) : tracker.progress.isComplete ? (
          <div className="flex flex-col items-center space-y-4 text-success justify-center py-4">
            <CheckCircle2 className="h-12 w-12 text-success" />
            <span className="font-bold text-2xl">Transfer Complete</span>
            <div className="bg-muted p-4 rounded-lg w-full space-y-2 text-sm text-foreground">
              <div className="flex justify-between">
                <span className="text-muted-foreground">File</span>
                <span className="font-medium truncate max-w-[150px]">{manifest?.filename}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Size</span>
                <span className="font-medium">{(manifest?.originalSize! / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average Speed</span>
                <span className="font-medium">{tracker.progress.packetsPerSecond} pkts/sec</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">The file has been successfully downloaded.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">Status</span>
                <span className="font-semibold text-lg text-foreground leading-none">
                  {manifest ? manifest.filename : "Waiting for Manifest..."}
                </span>
              </div>
              <span className="text-4xl font-extrabold text-primary tracking-tighter tabular-nums">
                {tracker.progress.percentage}%
              </span>
            </div>

            <div className="h-4 w-full bg-muted/50 rounded-full overflow-hidden border border-border/50">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                style={{ width: `${tracker.progress.percentage}%` }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-2">
              <div className="flex flex-col p-3 bg-muted/20 rounded-xl border border-border/40">
                <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Packets Received</span>
                <span className="font-mono text-lg text-foreground">{tracker.progress.packetsReceived} <span className="text-muted-foreground text-sm">/ {tracker.progress.totalPackets}</span></span>
              </div>
              <div className="flex flex-col p-3 bg-muted/20 rounded-xl border border-border/40 text-right">
                <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Speed</span>
                <span className="font-mono text-lg text-foreground">{tracker.progress.packetsPerSecond} <span className="text-muted-foreground text-sm">pkts/s</span></span>
              </div>
              <div className="flex flex-col p-3 bg-muted/20 rounded-xl border border-border/40">
                <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Duplicates</span>
                <span className="font-mono text-lg text-foreground">{tracker.progress.duplicateCount}</span>
              </div>
              <div className="flex flex-col p-3 bg-muted/20 rounded-xl border border-border/40 text-right">
                <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Corrupted</span>
                <span className="font-mono text-lg text-destructive">{tracker.progress.corruptedCount}</span>
              </div>
            </div>
            
            {tracker.progress.missingPackets.length > 0 && tracker.progress.packetsReceived > 0 && (
              <div className="pt-2 border-t border-border/50 text-xs">
                <span className="text-muted-foreground">Missing packets (last 5): </span>
                <span className="text-warning font-mono">
                  {tracker.progress.missingPackets.slice(-5).join(", ")}
                </span>
              </div>
            )}
          </div>
        )}
      </Card>

      <ReceiveDebugger sessions={debugSessions} />

      {settings.developerMode && <DeveloperDashboard metrics={metrics} />}

      <Button
        variant="outline"
        onClick={() => setIsScanning((prev) => !prev)}
        className="mt-4"
        disabled={tracker.progress.isComplete || isReconstructing}
      >
        {isScanning ? "Pause Scanner" : "Resume Scanner"}
      </Button>

      {error && (
        <Button variant="secondary" onClick={() => window.location.reload()} className="mt-2">
          <RefreshCcw className="mr-2 h-4 w-4" /> Restart Transfer
        </Button>
      )}
    </div>
  );
}
