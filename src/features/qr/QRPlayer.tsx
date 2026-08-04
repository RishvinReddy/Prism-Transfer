"use client";

import * as React from "react";
import { Play, Pause, Download, ChevronDown, ChevronRight, Settings2, Square, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRGenerator } from "./QRGenerator";
import { DEFAULT_FPS } from "@/constants/protocol";
import { useSettings } from "@/contexts/settings";
import { TransferManifest } from "@/types/transfer";

export interface QRPlayerProps {
  frames: string[]; 
  manifest: TransferManifest;
  onCancel: () => void;
  initialFps?: number;
}

export function QRPlayer({ frames, manifest, onCancel, initialFps = DEFAULT_FPS }: QRPlayerProps) {
  const { settings } = useSettings();
  const [isPlaying, setIsPlaying] = React.useState(true); // Auto-play by default in scientific mode
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [fps, setFps] = React.useState(initialFps);
  const [epochDuration, setEpochDuration] = React.useState(1000);
  const [isResetting, setIsResetting] = React.useState(false);
  const [isDevToolsOpen, setIsDevToolsOpen] = React.useState(false);

  const totalFrames = frames.length;

  React.useEffect(() => {
    console.log({
      chunkSize: manifest.chunkSize,
      frameCount: totalFrames,
      payloadLength: frames[0]?.length || 0,
    });
  }, [manifest.chunkSize, totalFrames, frames]);

  React.useEffect(() => {
    // Esc to cancel
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === ' ') setIsPlaying(p => !p);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  React.useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isPlaying && totalFrames > 0 && !isResetting) {
      intervalId = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          if (prevIndex >= totalFrames - 1) {
            setIsResetting(true);
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
  }, [isPlaying, fps, epochDuration, totalFrames]);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(frames, null, 2));
    const dlAnchorElem = document.createElement("a");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `simulation-packets.json`);
    dlAnchorElem.click();
  };

  if (totalFrames === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden">
      
      {/* 
        The QR Code Area - Scientific Instrument UI
        Uses exactly 85vmin to be 85% of the shortest viewport dimension.
      */}
      <div 
        className="w-[85vmin] h-[85vmin] bg-white flex items-center justify-center"
        onClick={() => setIsPlaying(!isPlaying)}
        style={{ cursor: 'pointer' }}
      >
        {isResetting ? (
          <div className="flex flex-col items-center justify-center text-black">
            <Clock className="w-12 h-12 mb-4 animate-spin-slow" />
            <span className="font-mono text-sm uppercase tracking-widest">Sync Pause</span>
          </div>
        ) : (
          <QRGenerator data={frames[currentIndex]} size={1024} className="w-full h-full" />
        )}
      </div>

      {/* Tiny Progress Bar & Minimal Controls Below */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[85vmin] max-w-md flex flex-col space-y-3">
        <div className="flex items-center space-x-4">
          <button onClick={() => setIsPlaying(!isPlaying)} className="text-white/50 hover:text-white transition-colors">
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          </button>
          
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-75 ease-linear"
              style={{ width: `${((currentIndex + 1) / totalFrames) * 100}%` }}
            />
          </div>

          <button onClick={onCancel} className="text-white/50 hover:text-white transition-colors" title="Stop Transfer">
            <Square className="w-4 h-4 fill-current" />
          </button>
        </div>
        
        <div className="flex justify-between items-center text-white/40 text-[10px] font-mono uppercase tracking-widest px-1">
          <span>{manifest.filename.length > 20 ? manifest.filename.substring(0,20)+'...' : manifest.filename}</span>
          <span>{currentIndex + 1} / {totalFrames}</span>
        </div>
      </div>

      {/* Developer Tools Toggle (Top Right) */}
      {settings.developerMode && (
        <button 
          onClick={() => setIsDevToolsOpen(!isDevToolsOpen)}
          className="absolute top-4 right-4 p-2 text-white/30 hover:text-white transition-colors z-50 bg-black/50 rounded-full"
        >
          <Settings2 className="w-5 h-5" />
        </button>
      )}

      {/* Developer Tools Overlay Panel */}
      {settings.developerMode && isDevToolsOpen && (
        <div className="absolute top-16 right-4 w-72 bg-zinc-950 border border-zinc-800 rounded-lg p-4 shadow-2xl z-50 text-zinc-300 font-mono text-xs flex flex-col space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
            <span className="font-bold text-white uppercase tracking-wider">Dev Tools</span>
            <button onClick={() => setIsDevToolsOpen(false)}><ChevronRight className="w-4 h-4" /></button>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-zinc-500"><span>Target FPS:</span><span className="text-white">{fps}</span></div>
            <div className="grid grid-cols-3 gap-1 mt-1">
              {[10, 15, 30].map(v => (
                <button key={v} onClick={() => setFps(v)} className={`py-1 rounded ${fps === v ? 'bg-zinc-700 text-white' : 'bg-zinc-900 hover:bg-zinc-800'}`}>{v}</button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-zinc-500"><span>Sync Epoch:</span><span className="text-white">{epochDuration}ms</span></div>
            <div className="grid grid-cols-3 gap-1 mt-1">
              {[500, 1000, 1500].map(v => (
                <button key={v} onClick={() => setEpochDuration(v)} className={`py-1 rounded ${epochDuration === v ? 'bg-zinc-700 text-white' : 'bg-zinc-900 hover:bg-zinc-800'}`}>{v}</button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800 flex justify-between items-center">
            <span className="text-zinc-500">Payload:</span>
            <span className="text-white">{frames[currentIndex]?.length || 0} B</span>
          </div>

          <button onClick={handleExport} className="w-full flex items-center justify-center py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-white transition-colors">
            <Download className="w-3 h-3 mr-2" /> Export Array
          </button>
        </div>
      )}

    </div>
  );
}
