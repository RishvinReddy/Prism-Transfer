"use client";

import * as React from "react";
import { Play, Pause, RotateCcw, FastForward, SkipBack, SkipForward, Download, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

import { QRGenerator } from "./QRGenerator";
import { DEFAULT_FPS } from "@/constants/protocol";
import { Card } from "@/components/ui/card";

export interface QRPlayerProps {
  frames: string[]; // Serialized packets (Manifest + Data)
  initialFps?: number;
}

export function QRPlayer({ frames, initialFps = DEFAULT_FPS }: QRPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [fps, setFps] = React.useState(initialFps);
  const [epochDuration, setEpochDuration] = React.useState(1000); // Default 1.0s epoch
  const [isResetting, setIsResetting] = React.useState(false);

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
            }, epochDuration); // Epoch loop boundary reset
            return prevIndex; // Hold on current index while resetting, UI handles blanking
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
    <div className="flex flex-col items-center space-y-6 w-full max-w-md mx-auto">
      <Card className="p-4 bg-white shadow-xl rounded-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full bg-black/80 backdrop-blur-sm text-white p-3 text-xs flex flex-col z-10 space-y-1">
          <div className="flex justify-between font-bold items-center">
            <span className="flex items-center gap-2">PrismTransfer <span className="px-1.5 py-0.5 rounded-sm bg-primary/20 text-primary text-[9px] uppercase tracking-widest font-mono">v1</span></span>
            <span className="font-mono text-cyan-400">{fps} FPS</span>
          </div>
          <div className="flex justify-between text-white/80">
            <span>Frame {currentIndex + 1} / {totalFrames}</span>
            <span>{Math.round(((currentIndex + 1) / totalFrames) * 100)}%</span>
          </div>
          
          <div className="mt-1 pt-1 border-t border-white/20 text-[10px] space-y-0.5">
            <div className="flex justify-between">
              <span className="text-white/60">Length:</span>
              <span className="font-mono">{frames[currentIndex]?.length || 0} bytes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Type:</span>
              <span className="font-mono">{currentIndex === 0 ? "Manifest" : `Packet ${currentIndex}`}</span>
            </div>
          </div>

          <div className="w-full bg-white/20 h-1.5 rounded-full mt-1 overflow-hidden">
            <div 
              className="bg-indigo-500 h-full transition-all duration-100" 
              style={{ width: `${((currentIndex + 1) / totalFrames) * 100}%` }}
            />
          </div>
        </div>
        <div className="mt-16">
          {isResetting ? (
            <div className="flex items-center justify-center text-muted-foreground w-full h-[320px] bg-black/5 rounded-xl border-2 border-dashed border-border/50">
               <span className="font-mono text-sm animate-pulse">Restarting transfer...</span>
            </div>
          ) : (
            <QRGenerator data={frames[currentIndex]} size={320} />
          )}
        </div>
      </Card>

      <div className="flex flex-col w-full space-y-4 bg-card/50 backdrop-blur border border-border/50 p-6 rounded-xl">
        <div className="flex items-center justify-between text-sm font-medium">
          <span className="text-muted-foreground">Frame {currentIndex + 1} of {totalFrames}</span>
          <span className="text-primary">{Math.round(((currentIndex + 1) / totalFrames) * 100)}%</span>
        </div>

        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-100 ease-linear"
            style={{ width: `${((currentIndex + 1) / totalFrames) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-center space-x-4 pt-2">
          <Button variant="outline" size="icon" onClick={handleRestart} title="Restart">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handlePrev} disabled={isPlaying || currentIndex === 0}>
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button size="icon" className="h-12 w-12 rounded-full" onClick={handlePlayPause}>
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-1" />}
          </Button>
          <Button variant="outline" size="icon" onClick={handleNext} disabled={isPlaying || currentIndex === totalFrames - 1}>
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col items-center space-y-3 pt-4 border-t border-border/50">
          <div className="flex items-center space-x-2 text-muted-foreground text-xs font-medium uppercase tracking-wider w-full justify-center">
            <FastForward className="h-3 w-3" />
            <span>Playback Speed</span>
          </div>
          <div className="grid grid-cols-3 gap-2 w-full">
            <Button 
              variant={fps === 5 ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFps(5)}
              className="w-full text-xs"
            >
              Slow (5)
            </Button>
            <Button 
              variant={fps === 10 ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFps(10)}
              className="w-full text-xs"
            >
              Normal (10)
            </Button>
            <Button 
              variant={fps === 20 ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFps(20)}
              className="w-full text-xs"
            >
              Fast (20)
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-3 pt-4 border-t border-border/50">
          <div className="flex items-center space-x-2 text-muted-foreground text-xs font-medium uppercase tracking-wider w-full justify-center">
            <Clock className="h-3 w-3" />
            <span>Epoch Loop Pause</span>
          </div>
          <div className="grid grid-cols-3 gap-2 w-full">
            <Button 
              variant={epochDuration === 500 ? "default" : "outline"} 
              size="sm" 
              onClick={() => setEpochDuration(500)}
              className="w-full text-xs"
            >
              0.5s
            </Button>
            <Button 
              variant={epochDuration === 1000 ? "default" : "outline"} 
              size="sm" 
              onClick={() => setEpochDuration(1000)}
              className="w-full text-xs"
            >
              1.0s
            </Button>
            <Button 
              variant={epochDuration === 1500 ? "default" : "outline"} 
              size="sm" 
              onClick={() => setEpochDuration(1500)}
              className="w-full text-xs"
            >
              1.5s
            </Button>
          </div>
        </div>
        
        <div className="pt-2">
          <Button variant="secondary" className="w-full text-xs" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Simulation Packets
          </Button>
        </div>
      </div>
    </div>
  );
}
