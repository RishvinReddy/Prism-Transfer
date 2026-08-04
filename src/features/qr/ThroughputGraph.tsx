"use client";

import * as React from "react";

interface ThroughputGraphProps {
  currentSpeed: number; // in MB/s
}

export function ThroughputGraph({ currentSpeed }: ThroughputGraphProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [history, setHistory] = React.useState<number[]>(new Array(15).fill(0));

  // Update history every second
  React.useEffect(() => {
    const interval = setInterval(() => {
      setHistory((prev) => {
        const next = [...prev.slice(1), currentSpeed];
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSpeed]);

  // Redraw canvas on history change
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // Grid lines (horizontal)
    ctx.strokeStyle = "rgba(63, 63, 70, 0.2)"; // zinc-800 low opacity
    ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Determine max speed in history for scaling (min max speed of 1.0 MB/s to avoid division by zero)
    const maxVal = Math.max(...history, 1.0);

    // Draw graph line
    ctx.beginPath();
    const pointsCount = history.length;
    const stepX = width / (pointsCount - 1);

    history.forEach((val, idx) => {
      const x = idx * stepX;
      // Invert y since (0,0) is top-left
      const y = height - (val / maxVal) * (height - 12) - 6; 
      if (idx === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    // Stroke style for graph line
    ctx.strokeStyle = "#6366f1"; // indigo-500
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    // Fill area under line
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(99, 102, 241, 0.15)");
    gradient.addColorStop(1, "rgba(99, 102, 241, 0)");
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw current speed value on top-right of graph area
    ctx.fillStyle = "#a1a1aa"; // zinc-400
    ctx.font = "bold 9px monospace";
    ctx.fillText(`${maxVal.toFixed(2)} MB/s max`, width - 85, 12);

  }, [history]);

  return (
    <div className="flex flex-col space-y-1.5 w-full bg-zinc-950/40 p-4 border border-zinc-900 rounded-2xl">
      <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Throughput Graph (15s)</span>
      <div className="w-full h-24 relative overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </div>
  );
}
