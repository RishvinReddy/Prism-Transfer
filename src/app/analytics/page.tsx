"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PrismProfile, ProfileManager } from "@/lib/profile";
import {
  Activity, Cpu, Monitor, HardDrive, Camera, TrendingUp, ShieldAlert,
  BarChart3, Zap, Shield, FileText, Image, Archive, Code2,
  ArrowUpRight, Clock, Layers, Database, Radio, CheckCircle2, AlertCircle,
  Gauge, Lock, Globe, WifiOff
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

// ── Static protocol data ─────────────────────────────────────────────────────

const SPEED_MODES = [
  {
    name: "Turbo", icon: "⚡", fps: 45, chunkSize: 1000, ec: "L", ecPct: 7,
    throughputRaw: 45, color: "from-violet-500 to-purple-600",
    bgGlow: "shadow-violet-500/20", borderColor: "border-violet-500/30",
    textColor: "text-violet-400", barColor: "bg-violet-500",
    description: "Ideal conditions — high-res screens, close distance",
    fileEst: { small: "~7s", medium: "~2min", large: "~9min" },
  },
  {
    name: "Speed", icon: "🟢", fps: 30, chunkSize: 600, ec: "M", ecPct: 15,
    throughputRaw: 18, color: "from-emerald-500 to-green-600",
    bgGlow: "shadow-emerald-500/20", borderColor: "border-emerald-500/30",
    textColor: "text-emerald-400", barColor: "bg-emerald-500",
    description: "Clean setups, close distance, good camera",
    fileEst: { small: "~18s", medium: "~5min", large: "~22min" },
  },
  {
    name: "Balanced", icon: "🟡", fps: 20, chunkSize: 300, ec: "M", ecPct: 15,
    throughputRaw: 6, color: "from-amber-500 to-yellow-500",
    bgGlow: "shadow-amber-500/20", borderColor: "border-amber-500/30",
    textColor: "text-amber-400", barColor: "bg-amber-500",
    description: "Default — most environments & lighting conditions",
    fileEst: { small: "~54s", medium: "~15min", large: "~1.1h" },
  },
  {
    name: "Reliable", icon: "🔴", fps: 10, chunkSize: 150, ec: "H", ecPct: 30,
    throughputRaw: 1.5, color: "from-rose-500 to-red-600",
    bgGlow: "shadow-rose-500/20", borderColor: "border-rose-500/30",
    textColor: "text-rose-400", barColor: "bg-rose-500",
    description: "Maximum reliability — small/dirty screens, distance",
    fileEst: { small: "~3.5min", medium: "~1h", large: "~4.5h" },
  },
];

const QR_CAPACITIES = [
  { version: 15, ec: "L", bytes: 1251, ecPct: 7, best: false },
  { version: 15, ec: "M", bytes: 991, ecPct: 15, best: false },
  { version: 20, ec: "L", bytes: 2061, ecPct: 7, best: false },
  { version: 20, ec: "M", bytes: 1634, ecPct: 15, best: true },
  { version: 25, ec: "L", bytes: 3057, ecPct: 7, best: false },
  { version: 25, ec: "M", bytes: 2431, ecPct: 15, best: false },
  { version: 30, ec: "L", bytes: 4238, ecPct: 7, best: false },
  { version: 30, ec: "M", bytes: 3391, ecPct: 15, best: false },
  { version: 40, ec: "L", bytes: 7089, ecPct: 7, best: false },
  { version: 40, ec: "M", bytes: 5596, ecPct: 15, best: false },
];

const COMPRESSION_TYPES = [
  { type: "Plain Text", icon: FileText, min: 70, max: 85, color: "bg-blue-500", textColor: "text-blue-400", notes: "Excellent compression" },
  { type: "JSON / CSV", icon: Code2, min: 65, max: 80, color: "bg-indigo-500", textColor: "text-indigo-400", notes: "Highly compressible" },
  { type: "PDF (text)", icon: FileText, min: 60, max: 75, color: "bg-purple-500", textColor: "text-purple-400", notes: "High entropy text" },
  { type: "PNG Image", icon: Image, min: 5, max: 15, color: "bg-cyan-500", textColor: "text-cyan-400", notes: "Already compressed" },
  { type: "JPEG Image", icon: Image, min: 2, max: 5, color: "bg-teal-500", textColor: "text-teal-400", notes: "Minimal gain" },
  { type: "ZIP Archive", icon: Archive, min: 0, max: 3, color: "bg-amber-500", textColor: "text-amber-400", notes: "Already deflated" },
];

const SECURITY_LAYERS = [
  { title: "Per-Packet CRC-32", subtitle: "Computed & re-verified on each chunk", icon: Shield, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  { title: "Global SHA-256", subtitle: "Hardware-accelerated via Web Crypto API", icon: Lock, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  { title: "Size Verification", subtitle: "Byte count matched after decompression", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { title: "Zero Network", subtitle: "Data never leaves either device", icon: WifiOff, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
];

const LIGHTHOUSE = [
  { metric: "Performance", value: 100, color: "text-green-500" },
  { metric: "SEO", value: 100, color: "text-blue-500" },
  { metric: "Accessibility", value: 95, color: "text-purple-500" },
  { metric: "Best Practices", value: 100, color: "text-amber-500" },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon: Icon }: {
  label: string; value: string | number; sub?: string; icon: React.ElementType;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-5 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden group"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="text-3xl font-black tracking-tight">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </motion.div>
  );
}

function ScoreBar({ score, label, icon: Icon, colorClass }: { score?: number; label: string; icon: React.ElementType; colorClass: string }) {
  const displayScore = score ?? 0;
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between text-sm">
        <span className="flex items-center gap-1 font-medium text-muted-foreground"><Icon className="w-4 h-4" /> {label}</span>
        <span className="font-bold">{score === undefined ? "—" : displayScore}</span>
      </div>
      <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${displayScore}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className={cn("h-full rounded-full", colorClass)}
        />
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [profile, setProfile] = React.useState<PrismProfile | null>(null);
  const [activeMode, setActiveMode] = React.useState(0);

  React.useEffect(() => {
    setProfile(ProfileManager.load());
  }, []);

  const history = profile?.history ?? [];
  const senderHistory = history.filter(h => h.role === "sender");
  const receiverHistory = history.filter(h => h.role === "receiver");

  const avgSenderSpeed = senderHistory.length > 0
    ? senderHistory.reduce((acc, h) => acc + h.throughputMBps, 0) / senderHistory.length
    : null;

  const avgReceiverSpeed = receiverHistory.length > 0
    ? receiverHistory.reduce((acc, h) => acc + h.throughputMBps, 0) / receiverHistory.length
    : null;

  const avgReliability = receiverHistory.length > 0
    ? receiverHistory.reduce((acc, h) => acc + (h.signalQuality ?? 0), 0) / receiverHistory.length
    : null;

  const successRate = history.length > 0
    ? (history.filter(h => h.success).length / history.length) * 100
    : null;

  const selectedMode = SPEED_MODES[activeMode];
  const maxQRBytes = Math.max(...QR_CAPACITIES.map(c => c.bytes));

  return (
    <div className="flex flex-col max-w-6xl mx-auto px-4 py-10 space-y-12">

      {/* ── Hero Header ── */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-2">
          <Activity className="w-3.5 h-3.5" />
          Performance Data
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight">
          PrismTransfer{" "}
          <span className="bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 bg-clip-text text-transparent">
            Analytics
          </span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Transfer speeds, QR capacities, compression ratios, protocol specs, and your device's personal transfer history.
        </p>
      </motion.div>

      {/* ── Speed Mode Selector ── */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Gauge className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Transfer Speed Modes</h2>
          <span className="text-xs text-muted-foreground ml-auto">Tap a mode to explore</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SPEED_MODES.map((mode, i) => (
            <button
              key={mode.name}
              onClick={() => setActiveMode(i)}
              className={cn(
                "relative p-4 rounded-2xl border text-left transition-all duration-300 overflow-hidden",
                activeMode === i
                  ? `${mode.borderColor} bg-gradient-to-br ${mode.color} shadow-xl ${mode.bgGlow}`
                  : "border-border/50 bg-card/30 hover:border-border hover:bg-card/60"
              )}
            >
              <div className="text-2xl mb-2">{mode.icon}</div>
              <div className={cn("font-bold text-sm", activeMode === i ? "text-white" : "")}>{mode.name}</div>
              <div className={cn("text-xs mt-0.5", activeMode === i ? "text-white/80" : "text-muted-foreground")}>{mode.fps} fps</div>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedMode.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="bg-card/50 backdrop-blur-md border-primary/10 shadow-2xl overflow-hidden">
              <div className={cn("h-1 w-full bg-gradient-to-r", selectedMode.color)} />
              <CardContent className="pt-6 pb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  {[
                    { label: "Frame Rate", value: `${selectedMode.fps} fps`, sub: "QR frames/sec", icon: Zap },
                    { label: "Chunk Size", value: `${selectedMode.chunkSize}B`, sub: "per QR packet", icon: Layers },
                    { label: "Error Correction", value: `${selectedMode.ec} (${selectedMode.ecPct}%)`, sub: "data redundancy", icon: Shield },
                    { label: "Raw Throughput", value: `${selectedMode.throughputRaw} KB/s`, sub: "clean conditions", icon: TrendingUp },
                  ].map(({ label, value, sub, icon: Icon }) => (
                    <div key={label} className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                        <Icon className="w-3.5 h-3.5" />{label}
                      </div>
                      <div className={cn("text-2xl font-black", selectedMode.textColor)}>{value}</div>
                      <div className="text-xs text-muted-foreground">{sub}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="font-medium">Throughput vs Turbo Max (45 KB/s)</span>
                    <span className="font-mono font-bold">{selectedMode.throughputRaw} KB/s</span>
                  </div>
                  <div className="h-4 bg-secondary/50 rounded-full overflow-hidden">
                    <motion.div
                      key={selectedMode.name + "-bar"}
                      initial={{ width: 0 }}
                      animate={{ width: `${(selectedMode.throughputRaw / 45) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={cn("h-full rounded-full bg-gradient-to-r", selectedMode.color)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estimated Transfer Time</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { size: "100 KB", est: selectedMode.fileEst.small },
                      { size: "5 MB", est: selectedMode.fileEst.medium },
                      { size: "25 MB", est: selectedMode.fileEst.large },
                    ].map(({ size, est }) => (
                      <div key={size} className="p-3 rounded-xl bg-muted/30 border border-border/40 text-center">
                        <div className="text-xs text-muted-foreground">{size} file</div>
                        <div className={cn("font-mono font-bold text-sm mt-0.5", selectedMode.textColor)}>{est}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4 italic border-l-2 border-primary/30 pl-3">{selectedMode.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <Card className="bg-card/40 backdrop-blur-md border-border/30 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Mode Throughput Comparison
            </CardTitle>
            <CardDescription>Raw optical throughput under ideal conditions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {SPEED_MODES.map((mode) => (
              <div key={mode.name} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold flex items-center gap-2">
                    {mode.icon} {mode.name}
                    <span className="text-xs text-muted-foreground font-normal">{mode.fps} fps · {mode.chunkSize}B chunks · EC-{mode.ec}</span>
                  </span>
                  <span className={cn("font-mono font-bold", mode.textColor)}>{mode.throughputRaw} KB/s</span>
                </div>
                <div className="h-3 bg-secondary/40 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(mode.throughputRaw / 45) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                    className={cn("h-full rounded-full bg-gradient-to-r", mode.color)}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* ── QR Code Capacities ── */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">QR Code Capacity Matrix</h2>
          <span className="ml-auto px-2 py-0.5 rounded text-xs bg-primary/10 text-primary font-semibold border border-primary/20">ISO/IEC 18004</span>
        </div>
        <Card className="bg-card/40 backdrop-blur-md border-border/30 shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/20">
                    <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">QR Version</th>
                    <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">EC Level</th>
                    <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Redundancy</th>
                    <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Bytes / Frame</th>
                    <th className="px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide w-40">Capacity</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {QR_CAPACITIES.map((row, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={cn("border-b border-border/20 transition-colors hover:bg-muted/20", row.best && "bg-primary/5")}
                    >
                      <td className="px-5 py-3 font-mono font-bold">v{row.version}</td>
                      <td className="px-5 py-3">
                        <span className={cn("px-2 py-0.5 rounded-md text-xs font-bold", row.ec === "L" ? "bg-green-500/15 text-green-400" : "bg-blue-500/15 text-blue-400")}>
                          {row.ec}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{row.ecPct}%</td>
                      <td className="px-5 py-3 font-mono font-semibold">{row.bytes.toLocaleString()}</td>
                      <td className="px-5 py-3 w-40">
                        <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(row.bytes / maxQRBytes) * 100}%` }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.04 }}
                            className={cn("h-full rounded-full", row.best ? "bg-primary" : row.ec === "L" ? "bg-emerald-500" : "bg-blue-500")}
                          />
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {row.best && (
                          <span className="text-xs font-bold text-primary border border-primary/30 bg-primary/10 rounded-full px-2 py-0.5">← Default</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── Compression Ratios ── */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Layers className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Compression Ratios by File Type</h2>
          <span className="text-xs text-muted-foreground ml-auto">fflate DEFLATE — level 9</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COMPRESSION_TYPES.map((item, i) => {
            const Icon = item.icon;
            const avg = (item.min + item.max) / 2;
            return (
              <motion.div
                key={item.type}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="p-4 rounded-2xl bg-card/50 border border-border/40 backdrop-blur-sm hover:border-border transition-all hover:shadow-lg"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Icon className={cn("w-4 h-4", item.textColor)} />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{item.type}</div>
                    <div className="text-xs text-muted-foreground">{item.notes}</div>
                  </div>
                  <div className={cn("font-mono font-black text-lg", item.textColor)}>{item.min}–{item.max}%</div>
                </div>
                <div className="h-2.5 bg-secondary/40 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${avg}%` }}
                    transition={{ duration: 0.9, ease: "easeOut", delay: i * 0.07 }}
                    className={cn("h-full rounded-full", item.color)}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="p-4 rounded-xl bg-muted/30 border border-border/30 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Note:</span> These are size reduction percentages. A 70% reduction means a 10 MB text file transfers as ~3 MB of optical data.
        </div>
      </section>

      {/* ── Security & Protocol ── */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Security & Protocol Architecture</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SECURITY_LAYERS.map((layer, i) => {
            const Icon = layer.icon;
            return (
              <motion.div
                key={layer.title}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className={cn("flex items-start gap-4 p-4 rounded-2xl border", layer.bg)}
              >
                <div className="p-2.5 rounded-xl bg-background/50">
                  <Icon className={cn("w-5 h-5", layer.color)} />
                </div>
                <div>
                  <div className="font-bold text-sm">{layer.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{layer.subtitle}</div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto mt-0.5 flex-shrink-0" />
              </motion.div>
            );
          })}
        </div>

        <Card className="bg-card/40 border-border/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Radio className="w-4 h-4 text-primary" />
              Protocol Quick Facts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Protocol Version", value: "OTP v1", icon: Layers },
                { label: "Compression", value: "DEFLATE", icon: Archive },
                { label: "Encoding", value: "Base64URL", icon: Code2 },
                { label: "Network Required", value: "None", icon: WifiOff },
                { label: "Frame Dedup", value: "IDB + CRC", icon: Database },
                { label: "Session ID", value: "nanoid", icon: Globe },
                { label: "Per-packet check", value: "CRC-32", icon: CheckCircle2 },
                { label: "File integrity", value: "SHA-256", icon: Lock },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="p-3 rounded-xl bg-muted/20 border border-border/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Icon className="w-3 h-3" />{label}
                  </div>
                  <div className="font-mono font-bold text-sm text-primary">{value}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── Lighthouse Scores ── */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Lighthouse Performance Targets</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {LIGHTHOUSE.map((item, i) => (
            <motion.div
              key={item.metric}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-2xl bg-card/50 border border-border/30 text-center space-y-3 backdrop-blur-sm"
            >
              <div className="relative w-20 h-20 mx-auto">
                <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="6" className="text-secondary" />
                  <motion.circle
                    cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="6"
                    strokeLinecap="round"
                    className={item.color}
                    strokeDasharray={`${2 * Math.PI * 32}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - item.value / 100) }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: i * 0.1 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black">{item.value}</span>
                </div>
              </div>
              <div className="text-xs font-semibold text-muted-foreground">{item.metric}</div>
            </motion.div>
          ))}
        </div>

        <Card className="bg-card/40 border-border/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Core Web Vitals Targets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { metric: "LCP", value: "< 1.5s", label: "Largest Contentful Paint" },
                { metric: "CLS", value: "< 0.05", label: "Cumulative Layout Shift" },
                { metric: "INP", value: "< 100ms", label: "Interaction to Next Paint" },
                { metric: "TTFB", value: "< 200ms", label: "Time to First Byte" },
              ].map(({ metric, value, label }) => (
                <div key={metric} className="p-3 rounded-xl bg-green-500/5 border border-green-500/20 space-y-0.5">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-black text-green-400 text-sm">{metric}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  </div>
                  <div className="font-bold text-base">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── Personal Transfer History ── */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Your Transfer History</h2>
          <span className="text-xs text-muted-foreground ml-auto">Local device only</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Transfers"
            value={history.length > 0 ? history.length : "—"}
            sub={history.length > 0 ? `${senderHistory.length} sent · ${receiverHistory.length} received` : "No transfers yet"}
            icon={BarChart3}
          />
          <StatCard
            label="Avg Send Speed"
            value={avgSenderSpeed !== null ? `${avgSenderSpeed.toFixed(2)} MB/s` : "—"}
            sub={senderHistory.length > 0 ? `${senderHistory.length} sessions` : "No sends yet"}
            icon={TrendingUp}
          />
          <StatCard
            label="Avg Receive Speed"
            value={avgReceiverSpeed !== null ? `${avgReceiverSpeed.toFixed(2)} MB/s` : "—"}
            sub={receiverHistory.length > 0 ? `${receiverHistory.length} sessions` : "No receives yet"}
            icon={Camera}
          />
          <StatCard
            label="Success Rate"
            value={successRate !== null ? `${successRate.toFixed(1)}%` : "—"}
            sub={avgReliability !== null ? `${(avgReliability * 100).toFixed(1)}% avg signal` : "No history yet"}
            icon={ShieldAlert}
          />
        </div>

        {profile && (profile.cpu ?? profile.display ?? profile.storage ?? profile.optical) && (
          <Card className="bg-card/40 backdrop-blur-md shadow-xl border-primary/20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Cpu className="w-4 h-4 text-primary" />
                Device Capability Profile
              </CardTitle>
              <CardDescription>Scores from on-device benchmarks · Visit /benchmark to refresh</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <ScoreBar score={profile.cpu?.score} label="CPU Performance" icon={Cpu} colorClass="bg-blue-500" />
              <ScoreBar score={profile.display?.score} label="Display Refresh Stability" icon={Monitor} colorClass="bg-indigo-500" />
              <ScoreBar score={profile.storage?.score} label="Storage Write Speed" icon={HardDrive} colorClass="bg-purple-500" />
              <ScoreBar score={profile.optical?.score} label="Optical & Camera Readiness" icon={Camera} colorClass="bg-pink-500" />
            </CardContent>
          </Card>
        )}

        <Card className="bg-card/40 backdrop-blur-md shadow-xl border-primary/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Recent Transfer Log
            </CardTitle>
            <CardDescription>The last {Math.min(history.length, 10)} of {history.length} transfers</CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto">
                  <Activity className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <p className="text-muted-foreground text-sm">No transfers yet.</p>
                <p className="text-xs text-muted-foreground">Complete a transfer to see your history here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.slice(0, 10).map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/10 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", h.success ? "bg-green-500" : "bg-red-500")} />
                      <div>
                        <div className="font-semibold text-sm capitalize flex items-center gap-1.5">
                          {h.role === "sender"
                            ? <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
                            : <Camera className="w-3.5 h-3.5 text-purple-400" />}
                          {h.role}
                          {h.success
                            ? <span className="text-xs text-green-500 font-normal">· success</span>
                            : <span className="text-xs text-red-500 font-normal flex items-center gap-0.5"><AlertCircle className="w-3 h-3" /> failed</span>
                          }
                        </div>
                        <div className="text-xs text-muted-foreground">{new Date(h.timestamp).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-sm">{h.throughputMBps.toFixed(2)} MB/s</div>
                      {h.signalQuality !== undefined && (
                        <div className="text-xs text-muted-foreground">{(h.signalQuality * 100).toFixed(0)}% signal</div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center py-8 space-y-4 border-t border-border/30"
      >
        <p className="text-muted-foreground text-sm">
          All data is processed <strong className="text-foreground">100% locally</strong> — no analytics sent to any server, ever.
        </p>
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><WifiOff className="w-3.5 h-3.5" /> Zero network</span>
          <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> No telemetry</span>
          <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Air-gapped</span>
        </div>
      </motion.div>
    </div>
  );
}
