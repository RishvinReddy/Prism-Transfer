"use client";

import React, { useState } from "react";
import { useDiagnostics } from "@/contexts/diagnostics";
import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, 
  Cpu, 
  Camera, 
  Network, 
  ChevronRight, 
  ChevronLeft,
  X,
  Bug,
  Download
} from "lucide-react";

export function DiagnosticsDashboard() {
  const { state, setIsOpen } = useDiagnostics();
  const [activeTab, setActiveTab] = useState<"Workers" | "Camera" | "Protocol">("Workers");

  if (!state.isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-zinc-900 border border-zinc-700 p-3 rounded-full shadow-lg z-50 text-zinc-400 hover:text-cyan-400 hover:border-cyan-500 transition-all"
        title="Open Diagnostics"
      >
        <Bug className="w-5 h-5" />
      </button>
    );
  }

  const exportDiagnostics = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `transfer-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <motion.div 
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      className="fixed right-0 top-0 bottom-0 w-80 sm:w-96 bg-zinc-950/95 backdrop-blur-xl border-l border-zinc-800 z-50 flex flex-col shadow-2xl font-mono text-xs"
    >
      <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-zinc-100 text-sm tracking-wide">Prism DevTools</h3>
        </div>
        <div className="flex gap-1">
          <button onClick={exportDiagnostics} className="text-zinc-400 hover:text-cyan-400 p-1 rounded hover:bg-zinc-800" title="Export Diagnostics Replay">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex border-b border-zinc-800 bg-zinc-900/30 overflow-x-auto">
        <TabButton active={activeTab === "Workers"} onClick={() => setActiveTab("Workers")} icon={<Cpu className="w-3 h-3" />} label="Workers" />
        <TabButton active={activeTab === "Camera"} onClick={() => setActiveTab("Camera")} icon={<Camera className="w-3 h-3" />} label="Camera" />
        <TabButton active={activeTab === "Protocol"} onClick={() => setActiveTab("Protocol")} icon={<Network className="w-3 h-3" />} label="Protocol" />
        <TabButton active={activeTab === "Timeline" as any} onClick={() => setActiveTab("Timeline" as any)} icon={<Activity className="w-3 h-3" />} label="Timeline" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeTab === "Timeline" as any && (
          <div className="space-y-4">
            <h4 className="text-zinc-400 uppercase tracking-widest text-[10px] font-bold mb-2">Operation Latency (Flame Graph)</h4>
            <div className="space-y-2 relative border-l border-zinc-700/50 pl-2 ml-1">
              {/* Fake flame graph based on actual metrics from state */}
              {state.senderWorker.details && (
                <>
                  <FlameBar label="SHA-256" ms={Number(state.senderWorker.details.shaTimeMs || 0)} color="bg-blue-500" />
                  <FlameBar label="Compress" ms={Number(state.senderWorker.details.compressTimeMs || 0)} color="bg-indigo-500" />
                  <FlameBar label="Chunk" ms={Number(state.senderWorker.details.chunkTimeMs || 0)} color="bg-purple-500" />
                  <FlameBar label="Serialize" ms={Number(state.senderWorker.details.serializeTimeMs || 0)} color="bg-pink-500" />
                </>
              )}
              {state.camera.decodeLatencyMs > 0 && (
                <FlameBar label="QR Decode" ms={state.camera.decodeLatencyMs} color="bg-emerald-500" />
              )}
              {state.reconstructionWorker.details && (
                <>
                  <FlameBar label="CRC Verify" ms={Number(state.reconstructionWorker.details.crcTimeMs || 0)} color="bg-teal-500" />
                  <FlameBar label="Decompress" ms={Number(state.reconstructionWorker.details.decompressTimeMs || 0)} color="bg-cyan-500" />
                  <FlameBar label="SHA Verify" ms={Number(state.reconstructionWorker.details.shaTimeMs || 0)} color="bg-sky-500" />
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === "Workers" && (
          <div className="space-y-4">
            <WorkerCard title="Sender Worker" stats={state.senderWorker} />
            <WorkerCard title="Scanner Worker" stats={state.scannerWorker} />
            <WorkerCard title="Reconstruction Worker" stats={state.reconstructionWorker} />
          </div>
        )}

        {activeTab === "Camera" && (
          <div className="space-y-4">
            <MetricRow label="Camera FPS" value={state.camera.fps} unit="fps" />
            <MetricRow label="Decode Latency" value={state.camera.decodeLatencyMs} unit="ms" />
            <MetricRow label="Decoded Frames" value={state.camera.decodedFrames} />
            <MetricRow label="Dropped Frames" value={state.camera.droppedFrames} />
            <MetricRow label="Duplicate Packets" value={state.camera.duplicatePackets} />
            <MetricRow label="CRC Failures" value={state.camera.crcFailures} />
          </div>
        )}

        {activeTab === "Protocol" && (
          <div className="space-y-4">
            <MetricRow label="Active Version" value={`V${state.protocol.activeVersion || "-"}`} />
            <MetricRow label="Chunk Size" value={state.protocol.chunkSize} unit="bytes" />
            <MetricRow label="Payload Efficiency" value={state.protocol.payloadEfficiencyPercent} unit="%" />
            <MetricRow label="Total Packets" value={state.protocol.totalPackets} />
            <MetricRow label="Transfer Speed" value={state.protocol.speedKbps} unit="KB/s" />
            
            <div className="mt-8">
              <h4 className="text-zinc-400 uppercase tracking-widest text-[10px] font-bold mb-3">Protocol Benchmarks</h4>
              <div className="space-y-3">
                <BenchmarkBar version="V1 (JSON)" value={25} color="bg-zinc-600" />
                <BenchmarkBar version="V2 (Compact)" value={45} color="bg-zinc-500" />
                <BenchmarkBar version="V3 (Binary)" value={98} color="bg-cyan-500" />
              </div>
              <p className="text-[10px] text-zinc-500 mt-2 text-center">Relative throughput efficiency</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2.5 whitespace-nowrap transition-colors ${
        active ? "text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function WorkerCard({ title, stats }: any) {
  const statusColor = 
    stats.status === "Running" ? "text-green-400 bg-green-950/30 border-green-900/50" :
    stats.status === "Error" ? "text-red-400 bg-red-950/30 border-red-900/50" :
    "text-zinc-400 bg-zinc-900/30 border-zinc-800";
    
  const statusDot = 
    stats.status === "Running" ? "bg-green-400 animate-pulse" :
    stats.status === "Error" ? "bg-red-400" : "bg-zinc-600";

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/20">
      <div className={`px-3 py-2 border-b flex items-center justify-between ${statusColor}`}>
        <span className="font-semibold flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statusDot}`} />
          {title}
        </span>
        <span className="text-[10px] uppercase tracking-wider">{stats.status}</span>
      </div>
      <div className="p-3 space-y-2">
        <div className="flex justify-between">
          <span className="text-zinc-500">Latency</span>
          <span className="text-zinc-200">{stats.latencyMs} ms</span>
        </div>
        {stats.queueDepth > 0 && (
          <div className="flex justify-between">
            <span className="text-orange-400/80">Queue Depth</span>
            <span className="text-orange-400 font-bold">{stats.queueDepth}</span>
          </div>
        )}
        {stats.details && Object.entries(stats.details).map(([k, v]) => (
          <div key={k} className="flex justify-between">
            <span className="text-zinc-500 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
            <span className="text-zinc-200">{String(v)}</span>
          </div>
        ))}
        {stats.error && (
          <div className="text-red-400 text-xs mt-2 p-2 bg-red-950/20 rounded border border-red-900/50">
            {stats.error}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricRow({ label, value, unit }: any) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-zinc-800/50 last:border-0">
      <span className="text-zinc-400">{label}</span>
      <span className="text-zinc-100 font-medium">
        {value} <span className="text-zinc-600">{unit}</span>
      </span>
    </div>
  );
}

function FlameBar({ label, ms, color }: { label: string, ms: number, color: string }) {
  if (ms <= 0) return null;
  // Cap at 100% width for roughly 200ms
  const widthPercent = Math.min(100, Math.max(2, (ms / 200) * 100));
  return (
    <div className="flex flex-col gap-1 mb-3">
      <div className="flex justify-between text-[10px]">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-500">{ms.toFixed(1)} ms</span>
      </div>
      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${widthPercent}%` }} />
      </div>
    </div>
  );
}

function BenchmarkBar({ version, value, color }: { version: string, value: number, color: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[10px] text-zinc-400">{version}</div>
      <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden relative">
        <div className={`absolute top-0 left-0 bottom-0 ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
