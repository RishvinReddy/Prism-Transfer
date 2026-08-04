"use client";

import * as React from "react";
import { Play, Pause, RotateCcw, FastForward, SkipBack, SkipForward, Download, Clock, ChevronDown, ChevronRight, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { QRGenerator } from "./QRGenerator";
import { DEFAULT_FPS } from "@/constants/protocol";
import { Card } from "@/components/ui/card";
import { useSettings } from "@/contexts/settings";
import { motion, AnimatePresence } from "motion/react";

export interface QRPlayerProps {
  frames: string[]; // Serialized packets (Manifest + Data)
  initialFps?: number;
}

export function QRPlayer({ frames, initialFps = DEFAULT_FPS }: QRPlayerProps) {
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

  if (totalFrames === 0) return null;

  return (
    <div className="flex flex-col items-center space-y-4 w-full mx-auto">
      
      {/* Premium Glass Bezel Frame */}
      <Card className="p-2 md:p-3 bg-black/90 backdrop-blur-xl border border-border/60 shadow-2xl rounded-2xl md:rounded-3xl relative overflow-hidden w-full">
        {/* Simplified Status Bar */}
        <div className="flex justify-between items-center text-white/90 px-2 pt-1 pb-2">
          <span className="font-bold tracking-tight text-sm flex items-center">
            ◈ PrismTransfer
          </span>
          <span className="text-xs font-mono text-white/50">
            {currentIndex === 0 ? "Manifest" : `Frame ${currentIndex} / ${totalFrames - 1}`}
          </span>
        </div>

        {/* QR Display Area */}
        <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden flex items-center justify-center p-4">
          {isResetting ? (
            <div className="flex flex-col items-center justify-center text-muted-foreground w-full aspect-square bg-black/5 rounded-xl border-2 border-dashed border-border/50 max-w-[500px]">
               <Clock className="w-8 h-8 mb-2 animate-pulse text-primary/50" />
               <span className="font-mono text-xs animate-pulse">Sync Pause...</span>
            </div>
          ) : (
            <div className="w-full aspect-square max-w-[500px] flex items-center justify-center">
              <QRGenerator data={frames[currentIndex]} size={1024} />
            </div>
          )}
        </div>

        {/* Clean Progress Bar */}
        <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
            style={{ width: `${((currentIndex + 1) / totalFrames) * 100}%` }}
          />
        </div>
      </Card>

      {/* Main Controls (Normal Mode) */}
      <div className="flex items-center justify-center space-x-4">
        <Button variant="outline" size="icon" onClick={handleRestart} title="Restart" className="rounded-full w-10 h-10 border-border/60">
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button size="icon" className="h-14 w-14 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all" onClick={handlePlayPause}>
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
        </Button>
      </div>

      {/* Developer Tools (Hidden for normal users) */}
      {settings.developerMode && (
        <div className="w-full max-w-sm mt-8 border border-border/40 bg-card/30 backdrop-blur-md rounded-2xl overflow-hidden">
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
                    <Button variant="outline" size="sm" onClick={handlePrev} disabled={isPlaying || currentIndex === 0}>
                      <SkipBack className="h-4 w-4 mr-1" /> Prev
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleNext} disabled={isPlaying || currentIndex === totalFrames - 1}>
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
                          className="w-full text-xs"
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
                          className="w-full text-xs"
                        >
                          {v / 1000}s
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Diagnostics */}
                  <div className="pt-2 space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground bg-black/40 p-2 rounded-md font-mono">
                      <span>Packet Length:</span>
                      <span className="text-foreground">{frames[currentIndex]?.length || 0} bytes</span>
                    </div>
                    <Button variant="secondary" className="w-full text-xs" onClick={handleExport}>
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
  );
}
