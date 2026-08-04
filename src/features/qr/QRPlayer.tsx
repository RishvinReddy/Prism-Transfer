"use client";

import * as React from "react";
import { Play, Pause, ChevronRight, ChevronDown, Settings2, Square, Maximize, Minimize, RefreshCcw, Sun, Clock, File as FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRGenerator } from "./QRGenerator";
import { DEFAULT_FPS } from "@/constants/protocol";
import { useSettings } from "@/contexts/settings";
import { TransferManifest } from "@/types/transfer";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { ThroughputGraph } from "./ThroughputGraph";

export interface QRPlayerProps {
  frames: string[]; 
  manifest: TransferManifest;
  onCancel: () => void;
  onComplete?: () => void;
  onLoop?: () => void;
  totalLoops?: number;
  initialFps?: number;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const getModeConfig = (mode: string) => {
  switch (mode) {
    case "turbo":
      return { fps: 45, ec: "L" as const };
    case "speed":
      return { fps: 30, ec: "M" as const };
    case "reliable":
      return { fps: 10, ec: "H" as const };
    case "balanced":
    default:
      return { fps: 20, ec: "M" as const };
  }
};

export function QRPlayer({ 
  frames, 
  manifest, 
  onCancel, 
  onComplete,
  onLoop,
  totalLoops = 0,
  initialFps = DEFAULT_FPS 
}: QRPlayerProps) {
  const { settings } = useSettings();
  const config = getModeConfig(settings.reliabilityMode);
  
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [fps, setFps] = React.useState(config.fps);
  const [epochDuration, setEpochDuration] = React.useState(1000);
  const [isResetting, setIsResetting] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  React.useEffect(() => {
    setFps(config.fps);
  }, [settings.reliabilityMode, config.fps]);

  const totalFrames = frames.length;

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) setIsFullscreen(false);
        else onCancel();
      }
      if (e.key === 'f' || e.key === 'F') setIsFullscreen(p => !p);
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(p => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onCancel]);

  React.useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isPlaying && totalFrames > 0 && !isResetting) {
      intervalId = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          if (prevIndex >= totalFrames - 1) {
            setIsResetting(true);
            onLoop?.();
            setTimeout(() => {
              setIsResetting(false);
              setCurrentIndex(0);
            }, epochDuration);
            return prevIndex;
          }
          return prevIndex + 1;
        });
      }, 1000 / fps);
    }

    return () => clearInterval(intervalId);
  }, [isPlaying, fps, epochDuration, totalFrames, onLoop, isResetting]);

  // Rough simulation of speed
  const transferSpeed = fps * (manifest.chunkSize / 1024 / 1024); // MB/s
  const remainingPackets = totalFrames - currentIndex;
  const etaSec = remainingPackets / fps;

  return (
    <div className="fixed inset-0 z-50 bg-black flex overflow-hidden">
      
      {/* ── Desktop 70/30 Layout | Mobile Vertical Stack ── */}
      <div className={cn(
        "flex w-full h-full transition-all duration-500",
        isFullscreen ? "flex-col" : "flex-col lg:flex-row"
      )}>
        
        {/* ── Left Side: The Hero QR Code ── */}
        <div className={cn(
          "flex-1 flex flex-col items-center justify-center relative transition-all duration-500",
          isFullscreen ? "w-full h-full" : "w-full lg:w-[70%] h-[60vh] lg:h-full border-b lg:border-b-0 lg:border-r border-zinc-900"
        )}>
          
          <div 
            className={cn(
              "bg-white flex items-center justify-center transition-all duration-300 rounded-3xl shadow-2xl",
              isFullscreen 
                ? "w-[90vmin] h-[90vmin]" 
                : "w-[min(80vw,50vh)] h-[min(80vw,50vh)] lg:w-[min(60vw,70vh)] lg:h-[min(60vw,70vh)]"
            )}
            onClick={() => setIsPlaying(!isPlaying)}
            style={{ cursor: 'pointer' }}
          >
            {/* Always render the QR code to maintain camera tracking and guarantee the last frame is captured */}
            <div className="w-full h-full p-6 lg:p-10 box-border relative">
              <QRGenerator 
                data={frames[currentIndex]} 
                size={1024} 
                className="w-full h-full" 
                errorCorrectionLevel={config.ec}
              />
              
              {/* Optional subtle visual indicator for sync pause in developer mode */}
              {isResetting && settings.developerMode && (
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center backdrop-blur-[1px] rounded-3xl">
                  <div className="bg-white/95 text-black px-4 py-2 rounded-xl shadow-lg flex items-center space-x-2 font-mono text-xs font-bold uppercase">
                    <Clock className="w-4 h-4 animate-spin-slow" />
                    <span>Sync Pause</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Minimal overlay when in Fullscreen */}
          {isFullscreen && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[80vmin] max-w-md flex flex-col space-y-3 opacity-30 hover:opacity-100 transition-opacity">
              <div className="flex items-center space-x-4">
                <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:text-white transition-colors">
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                </button>
                <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white transition-all duration-75 ease-linear" style={{ width: `${((currentIndex + 1) / totalFrames) * 100}%` }} />
                </div>
                <button onClick={() => setIsFullscreen(false)} className="text-white hover:text-white transition-colors">
                  <Minimize className="w-5 h-5" />
                </button>
              </div>
              <div className="flex justify-between items-center text-white/70 text-[10px] font-mono uppercase tracking-widest px-1">
                <span>Packet {currentIndex + 1} / {totalFrames}</span>
                <span>{totalLoops > 0 ? `Loop ${totalLoops + 1}` : ''}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Right Side: Transfer Dashboard ── */}
        {!isFullscreen && (
          <div className="w-full lg:w-[30%] h-[40vh] lg:h-full bg-zinc-950 flex flex-col relative overflow-y-auto">
            
            {/* Header */}
            <div className="p-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/80 backdrop-blur sticky top-0 z-10">
              <span className="text-white font-bold text-lg">Transfer Dashboard</span>
            </div>

            {/* File Info */}
            <div className="p-6 space-y-8 flex-1">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                  <FileIcon className="w-6 h-6" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-white font-bold text-lg truncate">{manifest.filename}</span>
                  <span className="text-zinc-500 text-sm">{formatSize(manifest.originalSize)} • {manifest.mimeType || "Unknown"}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Packets</span>
                  <span className="text-white font-mono">{currentIndex + 1} <span className="text-zinc-600">/ {totalFrames}</span></span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Speed</span>
                  <span className="text-white font-mono">{transferSpeed.toFixed(2)} MB/s</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">ETA</span>
                  <span className="text-white font-mono">{etaSec > 60 ? `${Math.floor(etaSec/60)}m ${Math.floor(etaSec%60)}s` : `${Math.ceil(etaSec)}s`}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Loops</span>
                  <span className="text-white font-mono">{totalLoops}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Compression</span>
                  <span className="text-white font-mono capitalize">{manifest.compressionAlgorithm || "Deflate"}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Hash SHA256</span>
                  <span className="text-white font-mono text-[10px] truncate" title={manifest.sha256}>
                    {manifest.sha256 ? `${manifest.sha256.slice(0, 6)}...${manifest.sha256.slice(-4)}` : "—"}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2 pt-4">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-zinc-400">Progress</span>
                  <span className="text-indigo-400">{Math.round(((currentIndex + 1) / totalFrames) * 100)}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-indigo-500" 
                    style={{ width: `${((currentIndex + 1) / totalFrames) * 100}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </div>

              {/* Throughput Graph */}
              <ThroughputGraph currentSpeed={transferSpeed} />

              {/* Collapsible Advanced Protocol & Controls Accordion */}
              <details className="group border border-zinc-900 rounded-2xl bg-zinc-950/20 overflow-hidden" open={settings.developerMode}>
                <summary className="flex justify-between items-center p-4 text-xs font-bold uppercase tracking-wider text-zinc-400 cursor-pointer hover:bg-zinc-900/40 select-none list-none [&::-webkit-details-marker]:hidden">
                  <span>Advanced Settings</span>
                  <ChevronDown className="w-4 h-4 text-zinc-500 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="p-4 pt-0 border-t border-zinc-900/50 space-y-4 text-xs font-mono text-zinc-400">
                  
                  {/* Interactive: Sync Epoch */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-500">
                      <span>Sync Epoch</span>
                      <span className="text-white font-mono">{epochDuration}ms</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {[500, 1000, 1500].map(v => (
                        <Button 
                          key={v} 
                          size="sm" 
                          variant={epochDuration === v ? "default" : "outline"} 
                          className={cn(
                            "h-7 text-[10px] font-mono rounded-md",
                            epochDuration === v 
                              ? "bg-indigo-600 hover:bg-indigo-500 text-white border-0" 
                              : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                          )}
                          onClick={() => setEpochDuration(v)}
                        >
                          {v}ms
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Interactive: Manual Complete */}
                  <div className="space-y-1.5 pt-2 border-t border-zinc-900/50">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-500">
                      <span>Manual Override</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full h-8 text-[10px] bg-green-950/20 text-green-500 border-green-900/30 hover:bg-green-900/30 hover:text-green-400" 
                      onClick={() => onComplete?.()}
                    >
                      Trigger Complete Screen
                    </Button>
                  </div>

                  {/* Read-Only Parameters */}
                  <div className="space-y-2 pt-4 border-t border-zinc-900/50 text-[10px]">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-500 mb-1">
                      <span>Protocol Details</span>
                    </div>
                    <div className="flex justify-between"><span>Protocol Version</span><span className="text-white font-bold">Optical v{manifest.version || 2}</span></div>
                    <div className="flex justify-between"><span>Chunk Size</span><span className="text-white font-bold">{manifest.chunkSize} bytes</span></div>
                    <div className="flex justify-between"><span>EC Level (Redundancy)</span><span className="text-white font-bold">{config.ec} ({config.ec === 'H' ? '30%' : config.ec === 'M' ? '15%' : '7%'})</span></div>
                    <div className="flex justify-between"><span>CRC32 Validation</span><span className="text-emerald-500 font-bold">Enabled</span></div>
                    <div className="flex justify-between"><span>Integrity Check</span><span className="text-emerald-500 font-bold">SHA-256</span></div>
                    <div className="flex justify-between"><span>Compression Level</span><span className="text-white font-bold">Deflate (Level {settings.compressionLevel})</span></div>
                  </div>

                </div>
              </details>

              {/* Speed Control */}
              <div className="space-y-3 pt-4 border-t border-zinc-900">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-bold uppercase tracking-wider">Transmission Speed</span>
                  <span className="text-indigo-400 font-mono font-bold">{fps} FPS</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[10, 15, 20, 30, 45].map((v) => (
                    <Button
                      key={v}
                      size="sm"
                      variant={fps === v ? "default" : "outline"}
                      className={cn(
                        "h-8 text-xs font-mono rounded-lg",
                        fps === v 
                          ? "bg-indigo-600 hover:bg-indigo-500 text-white border-0" 
                          : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                      )}
                      onClick={() => setFps(v)}
                    >
                      {v}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="p-4 border-t border-zinc-900 bg-zinc-950 grid grid-cols-4 gap-2 pb-8 lg:pb-4">
              <Button variant="ghost" className="flex flex-col h-16 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <Pause className="w-5 h-5 mb-1" /> : <Play className="w-5 h-5 mb-1" />}
                <span className="text-[10px] uppercase tracking-wider">{isPlaying ? "Pause" : "Resume"}</span>
              </Button>
              <Button variant="ghost" className="flex flex-col h-16 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900" onClick={() => setCurrentIndex(0)}>
                <RefreshCcw className="w-5 h-5 mb-1" />
                <span className="text-[10px] uppercase tracking-wider">Restart</span>
              </Button>
              <Button variant="ghost" className="flex flex-col h-16 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900" onClick={() => setIsFullscreen(true)}>
                <Maximize className="w-5 h-5 mb-1" />
                <span className="text-[10px] uppercase tracking-wider">Expand</span>
              </Button>
              <Button variant="ghost" className="flex flex-col h-16 rounded-xl text-red-500/50 hover:text-red-400 hover:bg-red-950/30" onClick={onCancel}>
                <Square className="w-5 h-5 mb-1" />
                <span className="text-[10px] uppercase tracking-wider">Stop</span>
              </Button>
            </div>
            
          </div>
        )}

      </div>

    </div>
  );
}
