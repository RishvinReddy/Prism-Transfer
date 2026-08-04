"use client";

import * as React from "react";
import { QRScanner } from "./QRScanner";
import { useProgressTracker } from "./useProgressTracker";
import { deserializeManifest, deserializePacket } from "@/lib/serializer";
import { validateManifest, validatePacket } from "@/lib/validator";
import { saveManifest, savePacket, getAllPackets } from "@/features/storage/packetStore";
import { reconstructFile, downloadBlob, ReconstructionError } from "./reconstructionEngine";
import { TransferManifest } from "@/types/transfer";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertTriangle, RefreshCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useSettings } from "@/contexts/settings";
import { DeveloperDashboard, BenchmarkMetrics } from "@/features/developer/DeveloperDashboard";

export function PacketReceiver() {
  const { settings } = useSettings();
  const [isScanning, setIsScanning] = React.useState(true);
  const [manifest, setManifest] = React.useState<TransferManifest | null>(null);
  const [isReconstructing, setIsReconstructing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const tracker = useProgressTracker(manifest?.totalPackets || 0);

  const handleScan = async (decodedText: string) => {
    // Determine if it's a manifest or packet (Manifests have "filename" in the JSON usually, but let's try-catch)
    try {
      if (!manifest && decodedText.includes('"filename"')) {
        // Assume Manifest
        const m = deserializeManifest(decodedText);
        if (validateManifest(m)) {
          await saveManifest(m);
          setManifest(m);
          tracker.resetProgress(m.totalPackets);
        }
      } else if (manifest) {
        // Assume Data Packet
        const p = deserializePacket(decodedText);
        if (validatePacket(p) && p.transferId === manifest.transferId) {
          const isNew = await savePacket(p);
          tracker.recordPacket(p.index, !isNew);
        }
      }
    } catch (e) {
      // Invalid JSON or corrupted frame
      tracker.recordCorruption();
    }
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
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-foreground">
                {manifest ? `Receiving ${manifest.filename}` : "Waiting for Manifest..."}
              </span>
              <span className="text-primary font-mono">{tracker.progress.percentage}%</span>
            </div>

            <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-200 ease-out"
                style={{ width: `${tracker.progress.percentage}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-y-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{tracker.progress.packetsReceived} / {tracker.progress.totalPackets}</span>
                <span>Packets</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="font-medium text-foreground">{tracker.progress.packetsPerSecond}</span>
                <span>Packets/sec</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{tracker.progress.duplicateCount}</span>
                <span>Duplicates Ignored</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="font-medium text-foreground text-destructive">{tracker.progress.corruptedCount}</span>
                <span>Corrupted</span>
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
