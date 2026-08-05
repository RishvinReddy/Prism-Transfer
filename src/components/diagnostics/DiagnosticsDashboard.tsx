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
  Bug
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
        <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex border-b border-zinc-800 bg-zinc-900/30 overflow-x-auto">
        <TabButton active={activeTab === "Workers"} onClick={() => setActiveTab("Workers")} icon={<Cpu className="w-3 h-3" />} label="Workers" />
        <TabButton active={activeTab === "Camera"} onClick={() => setActiveTab("Camera")} icon={<Camera className="w-3 h-3" />} label="Camera" />
        <TabButton active={activeTab === "Protocol"} onClick={() => setActiveTab("Protocol")} icon={<Network className="w-3 h-3" />} label="Protocol" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
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
