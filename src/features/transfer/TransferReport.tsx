import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TransferProgress } from "@/features/scanner/useProgressTracker";
import { TransferManifest } from "@/types/transfer";
import { CheckCircle2, Download, Zap, ShieldCheck, Activity, BarChart4 } from "lucide-react";
import { ProfileManager } from "@/lib/profile";

interface TransferReportProps {
  manifest: TransferManifest;
  progress: TransferProgress;
  onClose: () => void;
}

export function TransferReport({ manifest, progress, onClose }: TransferReportProps) {
  React.useEffect(() => {
    // Record historical data to feed back into the PrismProfile
    ProfileManager.addHistory({
      timestamp: Date.now(),
      role: "receiver",
      fileSize: manifest.originalSize,
      throughputMBps: Number((progress.packetsPerSecond * manifest.chunkSize / (1024 * 1024)).toFixed(2)),
      recoveryRate: progress.recoveryRate,
      signalQuality: progress.signalQuality,
      success: progress.isComplete
    });
    ProfileManager.applyFeedbackLoop();
  }, [manifest, progress]);

  const handleExport = () => {
    const report = {
      manifest,
      progress,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transfer_report_${manifest.transferId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full max-w-lg mx-auto bg-card/50 backdrop-blur-md shadow-2xl border-success/30">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>
        <CardTitle className="text-2xl">Transfer Complete</CardTitle>
        <CardDescription>
          Successfully received {manifest.filename}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
            <span className="text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1 mb-1">
              <Activity className="w-3 h-3" /> Signal Quality
            </span>
            <span className="text-xl font-bold">{progress.signalQuality}%</span>
          </div>
          
          <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
            <span className="text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1 mb-1">
              <ShieldCheck className="w-3 h-3" /> Recovery Rate
            </span>
            <span className="text-xl font-bold">{progress.recoveryRate}%</span>
          </div>
          
          <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
            <span className="text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1 mb-1">
              <Zap className="w-3 h-3" /> Avg Speed
            </span>
            <span className="text-xl font-bold">
              {progress.packetsPerSecond > 0 ? (progress.packetsPerSecond * manifest.chunkSize / 1024).toFixed(1) : 0} KB/s
            </span>
          </div>
          
          <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
            <span className="text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1 mb-1">
              <BarChart4 className="w-3 h-3" /> Total Packets
            </span>
            <span className="text-xl font-bold">{progress.totalDataPackets}</span>
          </div>
        </div>
        
        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 text-sm">
          <p className="font-semibold text-primary mb-1">Feedback Loop Updated</p>
          <p className="text-muted-foreground">
            These metrics have been added to your Prism Profile to improve future Transfer Advisor recommendations automatically.
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t border-border/50 pt-6">
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" /> Export JSON
        </Button>
        <Button onClick={onClose} className="min-w-[120px]">
          Done
        </Button>
      </CardFooter>
    </Card>
  );
}
