"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { WifiOff, ShieldCheck, Check } from "lucide-react";

// Flashing Mini QR Code component to simulate actual transmission
function MiniQR() {
  const [grid, setGrid] = React.useState<boolean[]>([]);
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setGrid(Array.from({ length: 36 }, () => Math.random() > 0.45));
    }, 120); // Fast optical transmission speed (120ms intervals)
    return () => clearInterval(interval);
  }, []);

  if (grid.length === 0) return null;

  return (
    <div className="grid grid-cols-6 grid-rows-6 gap-[2.5px] p-2 bg-white rounded-lg border border-zinc-200 w-20 h-20 shadow-inner">
      {grid.map((val, idx) => {
        // Build mock finder patterns in the three corners to look realistic
        const isTLFinder = (idx < 3 && idx % 6 < 3) || idx === 6 || idx === 8 || idx === 12 || idx === 13 || idx === 14;
        const isTRFinder = (idx < 3 && idx % 6 >= 3) || idx === 9 || idx === 11 || idx === 15 || idx === 16 || idx === 17;
        const isBLFinder = (idx >= 18 && idx % 6 < 3) || idx === 24 || idx === 26 || idx === 30 || idx === 31 || idx === 32;
        
        const isFinderPattern = isTLFinder || isTRFinder || isBLFinder;

        return (
          <div 
            key={idx} 
            className={cn(
              "w-full h-full rounded-[1px] transition-colors duration-75",
              isFinderPattern || val ? "bg-black" : "bg-white"
            )}
          />
        );
      })}
    </div>
  );
}

export function DataTransferIllustration() {
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      // Slight parallax offsets
      const x = (e.clientX - innerWidth / 2) / 50; 
      const y = (e.clientY - innerHeight / 2) / 50;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative w-full aspect-[4/3] max-w-[480px] lg:max-w-[550px] overflow-hidden flex items-center justify-center select-none pointer-events-none">
      
      {/* Scaled Wrapper to fit responsive sizes */}
      <div 
        className="absolute w-[800px] h-[600px] scale-[0.45] xs:scale-[0.55] sm:scale-[0.65] md:scale-[0.75] lg:scale-[0.6] xl:scale-[0.75] origin-center flex-shrink-0 transition-transform duration-300 ease-out"
      >
        
        {/* Background Blob with pulse and parallax animation */}
        <motion.div 
          style={{
            transform: `translate(${mousePos.x * -1.5}px, ${mousePos.y * -1.5}px)`,
          }}
          animate={{ 
            borderRadius: [
              "40% 60% 70% 30% / 40% 50% 60% 50%",
              "50% 50% 60% 40% / 50% 40% 60% 50%",
              "40% 60% 70% 30% / 40% 50% 60% 50%"
            ]
          }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute top-[10%] left-[15%] w-[60%] h-[70%] bg-indigo-500/5 dark:bg-indigo-500/10 z-0 transition-transform duration-300 ease-out" 
        />
        
        {/* Particles */}
        <div className="absolute top-[15%] left-[10%] w-3 h-3 rounded-full border border-indigo-400/40 z-10 animate-pulse" />
        <div className="absolute top-[20%] left-[45%] w-2 h-2 rounded-full bg-cyan-400/40 z-10 animate-ping" />
        <div className="absolute top-[10%] right-[25%] w-4 h-4 rounded-full border border-cyan-400/30 z-10" />
        <div className="absolute top-[40%] right-[10%] w-1.5 h-1.5 rounded-full bg-indigo-400/30 z-10 animate-pulse" />
        <div className="absolute bottom-[20%] left-[5%] w-3 h-3 rounded-full border border-indigo-400/20 z-10" />

        {/* Dashed Line SVG Trajectory with flowing laser packets */}
        <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none" viewBox="0 0 800 600">
          <path 
            id="trajectory-path"
            d="M 230 250 C 230 100, 480 100, 450 180 C 420 260, 600 200, 600 300" 
            fill="transparent" 
            stroke="url(#gradient)" 
            strokeWidth="3" 
            strokeDasharray="8, 8" 
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="50%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Glowing packets flowing natively along the path */}
          <circle r="7" fill="#818cf8" filter="url(#glow)">
            <animateMotion dur="4s" repeatCount="indefinite" begin="0s">
              <mpath href="#trajectory-path" />
            </animateMotion>
          </circle>
          <circle r="6" fill="#a78bfa" filter="url(#glow)">
            <animateMotion dur="4s" repeatCount="indefinite" begin="1.3s">
              <mpath href="#trajectory-path" />
            </animateMotion>
          </circle>
          <circle r="7" fill="#22d3ee" filter="url(#glow)">
            <animateMotion dur="4s" repeatCount="indefinite" begin="2.6s">
              <mpath href="#trajectory-path" />
            </animateMotion>
          </circle>
        </svg>

        {/* Foliage Left */}
        <div className="absolute top-[50%] left-[5%] rotate-[-20deg] flex flex-wrap gap-1.5 w-[100px] z-10">
          <div className="w-8 h-8 bg-emerald-800/20 border border-emerald-500/20 rounded-tr-[32px] rounded-bl-[32px]" />
          <div className="w-8 h-8 bg-emerald-600/30 border border-emerald-400/20 rounded-tr-[32px] rounded-bl-[32px]" />
        </div>

        {/* Foliage Right */}
        <div className="absolute top-[55%] right-[5%] rotate-[20deg] flex flex-wrap gap-1.5 w-[100px] z-10">
          <div className="w-8 h-8 bg-emerald-600/30 border border-emerald-400/20 rounded-tr-[32px] rounded-bl-[32px]" />
          <div className="w-8 h-8 bg-emerald-800/20 border border-emerald-500/20 rounded-tr-[32px] rounded-bl-[32px]" />
        </div>

        {/* Smartphone with Parallax */}
        <div 
          style={{ transform: `translate(${mousePos.x * 0.9}px, ${mousePos.y * 0.9}px)` }}
          className="absolute bottom-[120px] left-[150px] w-[150px] h-[300px] bg-zinc-800 border border-zinc-700/80 rounded-[25px] z-20 shadow-2xl flex justify-center items-center transition-transform duration-300 ease-out"
        >
          <div className="w-[140px] h-[290px] bg-zinc-950 border border-zinc-850 rounded-[20px] relative overflow-hidden flex flex-col justify-between py-4 items-center">
            
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60px] h-[15px] bg-zinc-800 rounded-b-[10px] z-30" />
            
            {/* Offline Status Bar */}
            <div className="w-full px-4 flex justify-between items-center text-[7px] text-zinc-500 font-mono tracking-tight pt-1">
              <span>9:41 AM</span>
              <div className="flex items-center space-x-1">
                <WifiOff className="w-2.5 h-2.5 text-red-500/80" />
                <span className="bg-zinc-800 text-[6px] px-1 rounded-sm text-red-400 font-bold">AIRGAP</span>
              </div>
            </div>

            {/* Simulated Live Flashing QR Stream */}
            <div className="flex-1 flex items-center justify-center">
              <MiniQR />
            </div>

            {/* Folder on Phone Screen */}
            <div className="relative w-[140px] h-[85px] z-20">
              <div className="w-[90%] h-[60px] bg-indigo-950/80 border border-indigo-500/30 rounded-t-lg relative mx-auto">
                <div className="absolute top-[-8px] left-0 w-[40%] h-[8px] bg-indigo-950 border border-indigo-500/30 border-b-0 rounded-t-lg" />
              </div>
              
              {/* Document emerging from phone folder */}
              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute bottom-[10px] left-[22px] w-[50px] h-[70px] bg-white border border-zinc-200 rounded-[4px] shadow-lg p-2 flex flex-col gap-1 z-10"
              >
                <div className="w-[60%] h-1 bg-zinc-400 rounded-full" />
                <div className="w-full h-[2px] bg-zinc-200 rounded-full" />
                <div className="w-full h-[2px] bg-zinc-200 rounded-full" />
                <div className="w-[80%] h-[2px] bg-zinc-200 rounded-full" />
              </motion.div>
              
              <div className="w-[96%] h-[70px] bg-indigo-600/80 border border-indigo-400/40 absolute bottom-[-5px] left-[2%] rounded-lg shadow-xl" 
                   style={{ clipPath: "polygon(0 20%, 100% 0, 100% 100%, 0 100%)" }} />
            </div>
          </div>
        </div>

        {/* Flying Documents with Parallax */}
        <motion.div 
          style={{ transform: `translate(${mousePos.x * 1.5}px, ${mousePos.y * 1.5}px)` }}
          animate={{ y: [0, -15, 0], rotate: [-15, -10, -15] }}
          transition={{ repeat: Infinity, duration: 6, delay: 0, ease: "easeInOut" }}
          className="absolute bottom-[280px] left-[260px] w-[65px] h-[85px] bg-white border border-zinc-200 rounded-[4px] shadow-xl p-2 flex flex-col gap-1.5 z-30 transition-transform duration-300 ease-out"
        >
          <div className="w-[60%] h-1 bg-indigo-400 rounded-full" />
          <div className="w-full h-[3px] bg-zinc-200 rounded-full" />
          <div className="w-full h-[3px] bg-zinc-200 rounded-full" />
          <div className="w-[80%] h-[3px] bg-zinc-200 rounded-full" />
        </motion.div>

        <motion.div 
          style={{ transform: `translate(${mousePos.x * 1.8}px, ${mousePos.y * 1.8}px)` }}
          animate={{ y: [0, -20, 0], rotate: [5, 10, 5] }}
          transition={{ repeat: Infinity, duration: 5, delay: 1, ease: "easeInOut" }}
          className="absolute bottom-[320px] left-[380px] w-[65px] h-[85px] bg-white border border-zinc-200 rounded-[4px] shadow-xl p-2 flex flex-col gap-1.5 z-30 transition-transform duration-300 ease-out"
        >
          <div className="w-[60%] h-1 bg-violet-400 rounded-full" />
          <div className="w-full h-[3px] bg-zinc-200 rounded-full" />
          <div className="w-full h-[3px] bg-zinc-200 rounded-full" />
          <div className="w-[80%] h-[3px] bg-zinc-200 rounded-full" />
        </motion.div>

        <motion.div 
          style={{ transform: `translate(${mousePos.x * 1.3}px, ${mousePos.y * 1.3}px)` }}
          animate={{ y: [0, -12, 0], rotate: [15, 8, 15] }}
          transition={{ repeat: Infinity, duration: 7, delay: 0.5, ease: "easeInOut" }}
          className="absolute bottom-[280px] left-[490px] w-[65px] h-[85px] bg-white border border-zinc-200 rounded-[4px] shadow-xl p-2 flex flex-col gap-1.5 z-30 transition-transform duration-300 ease-out"
        >
          <div className="w-[60%] h-1 bg-cyan-400 rounded-full" />
          <div className="w-full h-[3px] bg-zinc-200 rounded-full" />
          <div className="w-full h-[3px] bg-zinc-200 rounded-full" />
          <div className="w-[80%] h-[3px] bg-zinc-200 rounded-full" />
        </motion.div>

        {/* Laptop with Parallax */}
        <div 
          style={{ transform: `translate(${mousePos.x * -0.6}px, ${mousePos.y * -0.6}px)` }}
          className="absolute bottom-[120px] right-[120px] z-20 flex flex-col items-center transition-transform duration-300 ease-out"
        >
          {/* Screen */}
          <div className="w-[260px] h-[170px] bg-zinc-900 border-[12px] border-zinc-800 border-b-[20px] rounded-t-[10px] relative overflow-hidden flex flex-col justify-end">
            <div className="w-full h-full bg-zinc-950 flex flex-col justify-between p-2 select-none border border-zinc-900">
              
              {/* Receiver Header */}
              <div className="flex justify-between items-center text-[7px] text-zinc-500 font-mono tracking-wider border-b border-zinc-900 pb-1">
                <span>RECEIVER CONSOLE</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              </div>
              
              {/* Progress HUD */}
              <div className="flex items-center space-x-2 my-1">
                <div className="relative w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="16" cy="16" r="13" stroke="rgba(63, 63, 70, 0.2)" strokeWidth="2.5" fill="transparent" />
                    <circle cx="16" cy="16" r="13" stroke="#22d3ee" strokeWidth="2.5" fill="transparent"
                            strokeDasharray="81.6" strokeDashoffset="28" className="animate-[pulse_1.5s_ease-in-out_infinite]" />
                  </svg>
                  <span className="absolute text-[7px] font-bold text-white">65%</span>
                </div>
                
                {/* Console Log */}
                <div className="flex-1 flex flex-col space-y-0.5 font-mono text-[6px] text-zinc-500 overflow-hidden leading-none">
                  <div className="text-zinc-400 font-semibold truncate flex items-center gap-0.5"><ShieldCheck className="w-2 h-2 text-green-400" /> manifest.json accepted</div>
                  <div className="text-cyan-400 truncate">chunk_42.bin (CRC32 OK)</div>
                  <div className="animate-pulse truncate">verifying SHA-256...</div>
                </div>
              </div>
              
              {/* Folder in Laptop */}
              <div className="relative w-full h-[55px] z-20 mt-1">
                <div className="w-[100px] h-[45px] bg-indigo-950/80 border border-indigo-500/30 rounded-t-lg relative mx-auto">
                  <div className="absolute top-[-8px] left-0 w-[45%] h-[8px] bg-indigo-950 border border-indigo-500/30 border-b-0 rounded-t-lg" />
                </div>
                
                {/* Document arriving in laptop folder */}
                <motion.div 
                  animate={{ y: [0, 6, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute bottom-[-5px] left-[76px] w-[45px] h-[60px] bg-white border border-zinc-200 rounded-[4px] shadow-lg p-1.5 flex flex-col gap-1 z-10"
                >
                  <div className="w-[60%] h-1 bg-zinc-400 rounded-full" />
                  <div className="w-full h-[2px] bg-zinc-200 rounded-full" />
                  <div className="w-[80%] h-[2px] bg-zinc-200 rounded-full" />
                </motion.div>
                
                <div className="w-[110px] h-[55px] bg-indigo-600/80 border border-indigo-400/40 absolute bottom-[-10px] left-[58px] rounded-lg shadow-xl" 
                     style={{ clipPath: "polygon(0 20%, 100% 0, 100% 100%, 0 100%)" }} />
              </div>

            </div>
          </div>
          {/* Base */}
          <div className="w-[300px] h-[15px] bg-zinc-800 border-t border-zinc-700 rounded-b-[15px] relative shadow-xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60px] h-[5px] bg-zinc-900 rounded-b-[5px]" />
          </div>
        </div>

      </div>

    </div>
  );
}
