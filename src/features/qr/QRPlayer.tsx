"use client";

import * as React from "react";
import { Play, Pause, RotateCcw, FastForward, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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

  const totalFrames = frames.length;

  React.useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isPlaying && totalFrames > 0) {
      intervalId = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          // Loop back to start if we hit the end
          if (prevIndex >= totalFrames - 1) {
            return 0; // Infinite loop until receiver confirms, but for MVP we just loop
          }
          return prevIndex + 1;
        });
      }, 1000 / fps);
    }

    return () => clearInterval(intervalId);
  }, [isPlaying, fps, totalFrames]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleRestart = () => setCurrentIndex(0);
  const handlePrev = () => setCurrentIndex((p) => Math.max(0, p - 1));
  const handleNext = () => setCurrentIndex((p) => Math.min(totalFrames - 1, p + 1));

  if (totalFrames === 0) return null;

  return (
    <div className="flex flex-col items-center space-y-6 w-full max-w-md mx-auto">
      <Card className="p-4 bg-white shadow-xl rounded-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full bg-black/80 backdrop-blur-sm text-white p-3 text-xs flex flex-col z-10 space-y-1">
          <div className="flex justify-between font-bold">
            <span>PrismTransfer</span>
            <span className="font-mono text-cyan-400">{fps} FPS</span>
          </div>
          <div className="flex justify-between text-white/80">
            <span>Frame {currentIndex + 1} / {totalFrames}</span>
            <span>{Math.round(((currentIndex + 1) / totalFrames) * 100)}%</span>
          </div>
          <div className="w-full bg-white/20 h-1.5 rounded-full mt-1 overflow-hidden">
            <div 
              className="bg-indigo-500 h-full transition-all duration-100" 
              style={{ width: `${((currentIndex + 1) / totalFrames) * 100}%` }}
            />
          </div>
        </div>
        <div className="mt-16">
          <QRGenerator data={frames[currentIndex]} size={320} />
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

        <div className="flex items-center space-x-4 pt-4 border-t border-border/50">
          <FastForward className="h-4 w-4 text-muted-foreground" />
          <Slider 
            value={[fps]} 
            min={1} 
            max={30} 
            step={1} 
            onValueChange={(val) => setFps(val[0])}
            className="flex-1"
          />
          <span className="text-sm font-mono w-12 text-right">{fps} fps</span>
        </div>
      </div>
    </div>
  );
}
