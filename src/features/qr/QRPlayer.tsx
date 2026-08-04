"use client";

import * as React from "react";
import { Play, Pause, RotateCcw, FastForward, SkipBack, SkipForward, Download, Clock, ChevronDown, ChevronRight, Settings2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

import { QRGenerator } from "./QRGenerator";
import { DEFAULT_FPS } from "@/constants/protocol";
import { Card } from "@/components/ui/card";
import { useSettings } from "@/contexts/settings";
import { motion, AnimatePresence } from "motion/react";
import { TransferManifest } from "@/types/transfer";

export interface QRPlayerProps {
  frames: string[]; 
  manifest: TransferManifest;
  onCancel: () => void;
  initialFps?: number;
}

export function QRPlayer({ frames, manifest, onCancel, initialFps = DEFAULT_FPS }: QRPlayerProps) {
  const { settings } = useSettings();
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [fps, setFps] = React.useState(initialFps);
  const [epochDuration, setEpochDuration] = React.useState(1000);
  const [isResetting, setIsResetting] = React.useState(false);
  const [isDevToolsOpen, setIsDevToolsOpen] = React.useState(false);

  const totalFrames = frames.length;

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

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleRestart = () => setCurrentIndex(0);
  const handlePrev = () => setCurrentIndex((p) => Math.max(0, p - 1));
  const handleNext = () => setCurrentIndex((p) => Math.min(totalFrames - 1, p + 1));

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(frames, null, 2));
    const dlAnchorElem = document.createElement("a");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `simulation-packets.json`);
    dlAnchorElem.click();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (totalFrames === 0) return null;

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 w-full max-w-6xl mx-auto items-start">
      
      {/* 
        LEFT COLUMN (Mobile: Top, Desktop: 8 cols)
        Focuses entirely on the QR Code.
      */}
      <div className="lg:col-span-8 w-full flex flex-col items-center">
        {/* Sending Header (Mobile only, hidden on Desktop) */}
        <div className="lg:hidden w-full text-center mb-6 space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-primary">Sending</h2>
          <p className="text-lg font-semibold text-foreground truncate px-4">{manifest.filename}</p>
        </div>

        {/* QR Card — always white, device-agnostic */}
        <div 
          className="w-full max-w-[600px] rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] border border-black/8 overflow-hidden"
          style={{ background: "#ffffff" }}
        >
          {/* Quiet zone is provided by the QRCode library (margin:4) + this p-8 padding */}
          <div className="p-6 md:p-10">
            {isResetting ? (
              <div 
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 aspect-square"
                style={{ background: "#f9f9f9" }}
              >
                <Clock className="w-8 h-8 mb-4 text-gray-300 animate-pulse" />
                <span className="font-mono text-sm uppercase tracking-widest text-gray-400 animate-pulse">Sync Pause</span>
              </div>
            ) : (
              <QRGenerator data={frames[currentIndex]} size={1024} />
            )}
          </div>
        </div>
      </div>

      {/* 
        RIGHT COLUMN (Mobile: Bottom, Desktop: 4 cols)
        Contains Metadata, Controls, and Developer Tools.
      */}
      <div className="lg:col-span-4 w-full flex flex-col space-y-6">
        
        {/* Desktop Header */}
        <div className="hidden lg:block space-y-1 mb-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-primary">Sending</h2>
        </div>

        {/* Transfer Summary Card */}
        <Card className="w-full bg-card/60 backdrop-blur-xl border border-border/30 shadow-lg rounded-2xl overflow-hidden flex flex-col">
          <div className="p-6 flex flex-col space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Transfer Summary</h3>
              
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                <div className="flex flex-col space-y-1">
                  <span className="text-muted-foreground">File</span>
                  <span className="font-medium text-foreground truncate pr-2" title={manifest.filename}>{manifest.filename}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-muted-foreground">Size</span>
                  <span className="font-medium text-foreground">{formatSize(manifest.originalSize)}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-muted-foreground">Frames</span>
                  <span className="font-mono text-foreground">{currentIndex + 1} / {totalFrames}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium text-primary animate-pulse">{isPlaying ? "Sending..." : "Paused"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-muted-foreground font-medium">
                <span>Progress</span>
                <span className="font-mono">{Math.round(((currentIndex + 1) / totalFrames) * 100)}%</span>
              </div>
              <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden border border-border/30">
                <div 
                  className="h-full bg-primary transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                  style={{ width: `${((currentIndex + 1) / totalFrames) * 100}%` }}
                />
              </div>
            </div>

          </div>
        </Card>

        {/* Primary Controls */}
        <div className="flex items-center justify-between w-full space-x-4">
          <Button 
            variant="outline" 
            className="flex-1 h-14 rounded-2xl font-semibold border-border/40 bg-card hover:bg-muted/50 transition-colors"
            onClick={handleRestart}
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Restart
          </Button>
          <Button 
            variant="default" 
            className="flex-[1.5] h-14 rounded-2xl font-bold shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            onClick={handlePlayPause}
          >
            {isPlaying ? (
              <><Pause className="w-5 h-5 mr-2" /> Pause</>
            ) : (
              <><Play className="w-5 h-5 mr-2 fill-current" /> Resume</>
            )}
          </Button>
        </div>

        <Button 
          variant="ghost" 
          onClick={onCancel}
          className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-2xl h-12 font-medium"
        >
          <Square className="w-4 h-4 mr-2 fill-current" /> Stop Transfer
        </Button>

        {/* Developer Tools (Hidden for normal users) */}
        {settings.developerMode && (
          <div className="w-full mt-4 border border-border/40 bg-card/30 backdrop-blur-md rounded-2xl overflow-hidden">
            <button 
              onClick={() => setIsDevToolsOpen(!isDevToolsOpen)}
              className="flex items-center justify-between w-full p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center space-x-2 text-sm font-semibold">
                <Settings2 className="w-4 h-4 text-primary" />
                <span>Developer Tools</span>
              </div>
              {isDevToolsOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            </button>
            
            <AnimatePresence>
              {isDevToolsOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 space-y-6 border-t border-border/40 mt-2">
                    
                    {/* Step Controls */}
                    <div className="flex items-center justify-center space-x-2 pt-2">
                      <Button variant="outline" size="sm" onClick={handlePrev} disabled={isPlaying || currentIndex === 0} className="w-full rounded-xl">
                        <SkipBack className="h-4 w-4 mr-1" /> Prev
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleNext} disabled={isPlaying || currentIndex === totalFrames - 1} className="w-full rounded-xl">
                        Next <SkipForward className="h-4 w-4 ml-1" />
                      </Button>
                    </div>

                    {/* FPS */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        <span>Playback Speed</span>
                        <span className="text-primary">{fps} FPS</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[5, 10, 20].map((v) => (
                          <Button 
                            key={v}
                            variant={fps === v ? "default" : "outline"} 
                            size="sm" 
                            onClick={() => setFps(v)}
                            className="w-full text-xs rounded-lg"
                          >
                            {v}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Epoch */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        <span>Epoch Pause</span>
                        <span className="text-primary">{epochDuration / 1000}s</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[500, 1000, 1500].map((v) => (
                          <Button 
                            key={v}
                            variant={epochDuration === v ? "default" : "outline"} 
                            size="sm" 
                            onClick={() => setEpochDuration(v)}
                            className="w-full text-xs rounded-lg"
                          >
                            {v / 1000}s
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Diagnostics */}
                    <div className="pt-2 space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground bg-black/40 p-3 rounded-lg font-mono">
                        <span>Packet Length:</span>
                        <span className="text-foreground">{frames[currentIndex]?.length || 0} bytes</span>
                      </div>
                      <Button variant="secondary" className="w-full text-xs rounded-lg h-10" onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" /> Export Packets
                      </Button>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

    </div>
  );
}
