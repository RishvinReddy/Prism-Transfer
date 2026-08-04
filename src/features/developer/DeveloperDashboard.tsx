"use client";

import * as React from "react";
import { useSettings } from "@/contexts/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface BenchmarkMetrics {
  transferId?: string;
  frames: number;
  fps: number;
  encodeTimeMs?: number;
  decodeTimeMs?: number;
  compressionRatio: number;
  averageKbps: number;
  duplicatePercentage: number;
  missingPercentage: number;
  crcErrors: number;
  shaStatus: string;
  durationSeconds: number;
}

export function DeveloperDashboard({ metrics }: { metrics: BenchmarkMetrics }) {
  const { settings } = useSettings();

  if (!settings.developerMode) return null;

  const exportBenchmark = () => {
    const data = {
      device: navigator.userAgent,
      timestamp: new Date().toISOString(),
      ...metrics,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prism-benchmark-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full mt-4 border-dashed border-primary bg-primary/5">
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex justify-between items-center text-primary">
          <span>Developer Metrics</span>
          <Button variant="outline" size="sm" onClick={exportBenchmark} className="h-7 text-xs">
            Export JSON
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs font-mono">
          <div><span className="text-muted-foreground">FPS:</span> {metrics.fps}</div>
          <div><span className="text-muted-foreground">KB/s:</span> {metrics.averageKbps.toFixed(1)}</div>
          <div><span className="text-muted-foreground">Compression:</span> {(metrics.compressionRatio * 100).toFixed(1)}%</div>
          <div><span className="text-muted-foreground">Duplicates:</span> {metrics.duplicatePercentage.toFixed(1)}%</div>
          <div><span className="text-muted-foreground">Missing:</span> {metrics.missingPercentage.toFixed(1)}%</div>
          <div><span className="text-muted-foreground">CRC Errors:</span> {metrics.crcErrors}</div>
          <div><span className="text-muted-foreground">Duration:</span> {metrics.durationSeconds.toFixed(1)}s</div>
          <div className="col-span-2"><span className="text-muted-foreground">SHA:</span> {metrics.shaStatus}</div>
        </div>
      </CardContent>
    </Card>
  );
}
