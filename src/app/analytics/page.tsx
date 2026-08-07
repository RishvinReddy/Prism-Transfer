"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PrismProfile, ProfileManager } from "@/lib/profile";
import { Activity, Cpu, Monitor, HardDrive, Camera, TrendingUp, ShieldAlert, BarChart } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

function ScoreBar({ score, label, icon: Icon, colorClass }: { score?: number; label: string; icon: any; colorClass: string }) {
  const displayScore = score ?? 0;
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between text-sm">
        <span className="flex items-center gap-1 font-medium text-muted-foreground"><Icon className="w-4 h-4" /> {label}</span>
        <span className="font-bold">{score === undefined ? "—" : displayScore}</span>
      </div>
      <div className="h-3 w-full bg-secondary/50 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${displayScore}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full", colorClass)}
        />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [profile, setProfile] = React.useState<PrismProfile | null>(null);

  React.useEffect(() => {
    setProfile(ProfileManager.load());
  }, []);

  if (!profile) return null;

  const history = profile.history || [];
  const senderHistory = history.filter(h => h.role === "sender");
  const receiverHistory = history.filter(h => h.role === "receiver");

  const avgSenderSpeed = senderHistory.length > 0 
    ? senderHistory.reduce((acc, h) => acc + h.throughputMBps, 0) / senderHistory.length 
    : 0;

  const avgReceiverSpeed = receiverHistory.length > 0 
    ? receiverHistory.reduce((acc, h) => acc + h.throughputMBps, 0) / receiverHistory.length 
    : 0;

  const avgReliability = receiverHistory.length > 0 
    ? receiverHistory.reduce((acc, h) => acc + (h.signalQuality || 0), 0) / receiverHistory.length 
    : 0;

  return (
    <div className="flex flex-col max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center justify-center gap-3">
          <Activity className="w-8 h-8 text-primary" />
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          PrismTransfer adapts to your hardware over time. Here is what your device has learned from past transfers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Device Capabilities */}
        <Card className="bg-card/40 backdrop-blur-md shadow-xl border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" />
              Device Capability Profile
            </CardTitle>
            <CardDescription>Generated from on-device benchmarks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ScoreBar score={profile.cpu?.score} label="CPU Performance" icon={Cpu} colorClass="bg-blue-500" />
            <ScoreBar score={profile.display?.score} label="Display Refresh Stability" icon={Monitor} colorClass="bg-indigo-500" />
            <ScoreBar score={profile.storage?.score} label="Storage Write Speed" icon={HardDrive} colorClass="bg-purple-500" />
            <ScoreBar score={profile.optical?.score} label="Optical & Camera Readiness" icon={Camera} colorClass="bg-pink-500" />
          </CardContent>
        </Card>

        {/* Transfer Stats */}
        <Card className="bg-card/40 backdrop-blur-md shadow-xl border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Transfer Trends
            </CardTitle>
            <CardDescription>Based on {history.length} recent transfers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 rounded-xl border border-border/50 text-center space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Avg Send Speed</span>
                <div className="text-2xl font-bold">{avgSenderSpeed.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">MB/s</span></div>
              </div>
              <div className="p-4 bg-muted/30 rounded-xl border border-border/50 text-center space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Avg Receive Speed</span>
                <div className="text-2xl font-bold">{avgReceiverSpeed.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">MB/s</span></div>
              </div>
              <div className="col-span-2 p-4 bg-primary/10 rounded-xl border border-primary/20 text-center space-y-1">
                <span className="text-xs font-semibold text-primary uppercase tracking-wide flex items-center justify-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> Average Signal Quality
                </span>
                <div className="text-3xl font-black text-primary">{(avgReliability * 100).toFixed(1)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Timeline */}
      <Card className="bg-card/40 backdrop-blur-md shadow-xl border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <BarChart className="w-5 h-5 text-primary" />
            Recent History
          </CardTitle>
          <CardDescription>The last 50 transfers</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transfers yet. Complete a transfer to see history!
            </div>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 10).map((h, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/10 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      h.success ? "bg-green-500" : "bg-red-500"
                    )} />
                    <div>
                      <div className="font-semibold text-sm capitalize">{h.role}</div>
                      <div className="text-xs text-muted-foreground">{new Date(h.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-sm">{h.throughputMBps.toFixed(2)} MB/s</div>
                    {h.signalQuality && (
                      <div className="text-xs text-muted-foreground">{(h.signalQuality * 100).toFixed(0)}% quality</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
