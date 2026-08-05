"use client";

import * as React from "react";
import { ProcessedTransfer } from "@/lib/chunker";
import { serializeManifest, serializePacket } from "@/lib/serializer";
import { QRPlayer } from "@/features/qr/QRPlayer";
import { CalibrationPreflight } from "@/features/qr/CalibrationPreflight";
import { CalibrationResult } from "@/lib/calibrationEngine";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, RotateCcw, MonitorUp, Zap, Clock } from "lucide-react";

export interface TransferControllerProps {
  transfer: ProcessedTransfer;
  onCancel: () => void;
  /** When true, fires onCancel immediately on completion instead of showing the stats screen.
   *  Use this to auto-advance to the next file in a queue. */
  autoAdvance?: boolean;
}

export type SenderPhase = "Preparing" | "Calibrating" | "Transferring" | "Completed";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function TransferController({ transfer, onCancel, autoAdvance = false }: TransferControllerProps) {
  const [frames, setFrames] = React.useState<string[]>([]);
  const [phase, setPhase] = React.useState<SenderPhase>("Preparing");
  const [initialFps, setInitialFps] = React.useState<number | undefined>(undefined);
  
  // Stats
  const [startTime, setStartTime] = React.useState<number>(0);
  const [endTime, setEndTime] = React.useState<number>(0);
  const [totalLoops, setTotalLoops] = React.useState(0);

  React.useEffect(() => {
    // Generate the serialized frames
    const serializedManifest = serializeManifest(transfer.manifest);
    const serializedPackets = transfer.packets.map(serializePacket);
    
    // The sequence is strictly: Manifest, then Packets 1..N
    setFrames([serializedManifest, ...serializedPackets]);
    setPhase("Calibrating");
  }, [transfer]);

  const handleCalibrationComplete = (result: CalibrationResult) => {
    setInitialFps(result.recommendedFps);
    setPhase("Transferring");
    setStartTime(Date.now());
  };

  const handleComplete = () => {
    setEndTime(Date.now());
    if (autoAdvance) {
      // Skip the completion screen and advance the caller's queue immediately
      onCancel();
    } else {
      setPhase("Completed");
    }
  };

  const handleLoop = () => {
    setTotalLoops(prev => prev + 1);
  };

  if (phase === "Preparing" || frames.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full animate-pulse space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-muted-foreground font-medium">Preparing transfer sequence...</p>
      </div>
    );
  }

  if (phase === "Calibrating") {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-in fade-in duration-300 flex items-center justify-center">
        <CalibrationPreflight onComplete={handleCalibrationComplete} />
      </div>
    );
  }

  if (phase === "Completed") {
    const durationSec = (endTime - startTime) / 1000;
    const avgSpeed = (transfer.manifest.compressedSize / 1024 / 1024) / (durationSec || 1);

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center w-full max-w-lg mx-auto p-8 bg-card/40 backdrop-blur-xl border border-border/40 rounded-3xl space-y-8"
      >
        <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-foreground">Transfer Complete</h2>
          <p className="text-muted-foreground font-medium">{transfer.manifest.filename}</p>
        </div>

        <div className="w-full grid grid-cols-2 gap-4">
          <div className="flex flex-col p-4 bg-black/20 rounded-2xl border border-border/20">
            <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1"><HardDrive className="w-3 h-3 inline mr-1" />Size</span>
            <span className="font-mono text-lg">{formatSize(transfer.manifest.originalSize)}</span>
          </div>
          <div className="flex flex-col p-4 bg-black/20 rounded-2xl border border-border/20">
            <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1"><Layers className="w-3 h-3 inline mr-1" />Packets</span>
            <span className="font-mono text-lg">{transfer.manifest.totalPackets}</span>
          </div>
          <div className="flex flex-col p-4 bg-black/20 rounded-2xl border border-border/20">
            <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1"><Clock className="w-3 h-3 inline mr-1" />Duration</span>
            <span className="font-mono text-lg">{durationSec.toFixed(1)}s</span>
          </div>
          <div className="flex flex-col p-4 bg-black/20 rounded-2xl border border-border/20">
            <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1"><Zap className="w-3 h-3 inline mr-1" />Speed</span>
            <span className="font-mono text-lg">{avgSpeed.toFixed(2)} MB/s</span>
          </div>
        </div>

        <div className="flex flex-col w-full space-y-3 pt-4 border-t border-border/30">
          <Button 
            className="w-full h-14 rounded-2xl font-bold bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => {
              setPhase("Transferring");
              setStartTime(Date.now());
              setTotalLoops(0);
            }}
          >
            <RotateCcw className="w-5 h-5 mr-2" /> Send Again
          </Button>
          <Button 
            variant="outline" 
            className="w-full h-14 rounded-2xl font-bold"
            onClick={onCancel}
          >
            <MonitorUp className="w-5 h-5 mr-2" /> Send New File
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black animate-in fade-in duration-300">
      <QRPlayer 
        frames={frames} 
        manifest={transfer.manifest} 
        onCancel={onCancel} 
        onComplete={handleComplete}
        onLoop={handleLoop}
        totalLoops={totalLoops}
        initialFps={initialFps}
      />
    </div>
  );
}

// Quick icons used in the grid that aren't imported at top
function HardDrive(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="12" x2="2" y2="12"></line><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path><line x1="6" y1="16" x2="6.01" y2="16"></line><line x1="10" y1="16" x2="10.01" y2="16"></line></svg>;
}
function Layers(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>;
}
