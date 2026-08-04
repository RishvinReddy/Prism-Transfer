"use client";

import * as React from "react";
import { motion } from "motion/react";

export function DataTransferIllustration() {
  return (
    <div className="relative w-full aspect-[4/3] max-w-[480px] lg:max-w-[550px] overflow-hidden flex items-center justify-center select-none pointer-events-none">
      
      {/* Scaled Wrapper to fit responsive sizes */}
      <div className="absolute w-[800px] h-[600px] scale-[0.45] xs:scale-[0.55] sm:scale-[0.65] md:scale-[0.75] lg:scale-[0.6] xl:scale-[0.75] origin-center flex-shrink-0">
        
        {/* Background Blob with pulse animation */}
        <motion.div 
          animate={{ 
            borderRadius: [
              "40% 60% 70% 30% / 40% 50% 60% 50%",
              "50% 50% 60% 40% / 50% 40% 60% 50%",
              "40% 60% 70% 30% / 40% 50% 60% 50%"
            ]
          }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute top-[10%] left-[15%] w-[60%] h-[70%] bg-indigo-500/5 dark:bg-indigo-500/10 z-0" 
        />
        
        {/* Particles */}
        <div className="absolute top-[15%] left-[10%] w-3 h-3 rounded-full border border-indigo-400/40 z-10" />
        <div className="absolute top-[20%] left-[45%] w-2 h-2 rounded-full bg-cyan-400/40 z-10 animate-ping" />
        <div className="absolute top-[10%] right-[25%] w-4 h-4 rounded-full border border-cyan-400/30 z-10" />
        <div className="absolute top-[40%] right-[10%] w-1.5 h-1.5 rounded-full bg-indigo-400/30 z-10" />
        <div className="absolute bottom-[20%] left-[5%] w-3 h-3 rounded-full border border-indigo-400/20 z-10" />

        {/* Dashed Line SVG Trajectory */}
        <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none" viewBox="0 0 800 600">
          <motion.path 
            d="M 230 250 C 230 100, 480 100, 450 180 C 420 260, 600 200, 600 300" 
            fill="transparent" 
            stroke="url(#gradient)" 
            strokeWidth="3" 
            strokeDasharray="8, 8" 
            initial={{ strokeDashoffset: 100 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="50%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
        </svg>

        {/* Foliage Left */}
        <div className="absolute top-[50%] left-[5%] rotate-[-20deg] flex flex-wrap gap-1.5 w-[100px] z-10">
          <div className="w-8 h-8 bg-emerald-800/20 border border-emerald-500/20 rounded-tr-[32px] rounded-bl-[32px]" />
          <div className="w-8 h-8 bg-emerald-600/30 border border-emerald-400/20 rounded-tr-[32px] rounded-bl-[32px]" />
          <div className="w-8 h-8 bg-emerald-800/20 border border-emerald-500/20 rounded-tr-[32px] rounded-bl-[32px]" />
        </div>

        {/* Foliage Right */}
        <div className="absolute top-[55%] right-[5%] rotate-[20deg] flex flex-wrap gap-1.5 w-[100px] z-10">
          <div className="w-8 h-8 bg-emerald-600/30 border border-emerald-400/20 rounded-tr-[32px] rounded-bl-[32px]" />
          <div className="w-8 h-8 bg-emerald-800/20 border border-emerald-500/20 rounded-tr-[32px] rounded-bl-[32px]" />
          <div className="w-8 h-8 bg-emerald-600/30 border border-emerald-400/20 rounded-tr-[32px] rounded-bl-[32px]" />
        </div>

        {/* Smartphone */}
        <div className="absolute bottom-[120px] left-[150px] width-[150px] height-[300px] w-[150px] h-[300px] bg-zinc-800 border border-zinc-700/80 rounded-[25px] z-20 shadow-2xl flex justify-center items-center">
          <div className="w-[140px] h-[290px] bg-zinc-950 border border-zinc-800 rounded-[20px] relative overflow-hidden flex flex-col justify-end">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60px] h-[15px] bg-zinc-800 rounded-b-[10px] z-30" />
            
            {/* Folder on Phone */}
            <div className="relative w-[140px] h-[100px] bottom-[15px] left-[-5px] z-20">
              <div className="w-[90%] h-[70px] bg-indigo-950/80 border border-indigo-500/30 rounded-t-lg relative">
                <div className="absolute top-[-8px] left-0 w-[40%] h-[8px] bg-indigo-950 border border-indigo-500/30 border-b-0 rounded-t-lg" />
              </div>
              
              {/* Document emerging from phone folder */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute bottom-[10px] left-[18px] w-[60px] h-[80px] bg-white border border-zinc-200 rounded-[4px] shadow-lg p-2 flex flex-col gap-1.5 z-10"
              >
                <div className="w-[60%] h-1 bg-zinc-400 rounded-full" />
                <div className="w-full h-[3px] bg-zinc-200 rounded-full" />
                <div className="w-full h-[3px] bg-zinc-200 rounded-full" />
                <div className="w-[80%] h-[3px] bg-zinc-200 rounded-full" />
              </motion.div>
              
              <div className="w-[96%] h-[80px] bg-indigo-600/80 border border-indigo-400/40 absolute bottom-[-5px] left-[2%] rounded-lg shadow-xl" 
                   style={{ clipPath: "polygon(0 20%, 100% 0, 100% 100%, 0 100%)" }} />
            </div>
          </div>
        </div>

        {/* Flying Documents */}
        <motion.div 
          animate={{ 
            y: [0, -15, 0],
            rotate: [-15, -10, -15]
          }}
          transition={{ repeat: Infinity, duration: 6, delay: 0, ease: "easeInOut" }}
          className="absolute bottom-[280px] left-[260px] w-[65px] h-[85px] bg-white border border-zinc-200 rounded-[4px] shadow-xl p-2 flex flex-col gap-1.5 z-30"
        >
          <div className="w-[60%] h-1 bg-indigo-400 rounded-full" />
          <div className="w-full h-[3px] bg-zinc-200 rounded-full" />
          <div className="w-full h-[3px] bg-zinc-200 rounded-full" />
          <div className="w-[80%] h-[3px] bg-zinc-200 rounded-full" />
        </motion.div>

        <motion.div 
          animate={{ 
            y: [0, -20, 0],
            rotate: [5, 10, 5]
          }}
          transition={{ repeat: Infinity, duration: 5, delay: 1, ease: "easeInOut" }}
          className="absolute bottom-[320px] left-[380px] w-[65px] h-[85px] bg-white border border-zinc-200 rounded-[4px] shadow-xl p-2 flex flex-col gap-1.5 z-30"
        >
          <div className="w-[60%] h-1 bg-violet-400 rounded-full" />
          <div className="w-full h-[3px] bg-zinc-200 rounded-full" />
          <div className="w-full h-[3px] bg-zinc-200 rounded-full" />
          <div className="w-[80%] h-[3px] bg-zinc-200 rounded-full" />
        </motion.div>

        <motion.div 
          animate={{ 
            y: [0, -12, 0],
            rotate: [15, 8, 15]
          }}
          transition={{ repeat: Infinity, duration: 7, delay: 0.5, ease: "easeInOut" }}
          className="absolute bottom-[280px] left-[490px] w-[65px] h-[85px] bg-white border border-zinc-200 rounded-[4px] shadow-xl p-2 flex flex-col gap-1.5 z-30"
        >
          <div className="w-[60%] h-1 bg-cyan-400 rounded-full" />
          <div className="w-full h-[3px] bg-zinc-200 rounded-full" />
          <div className="w-full h-[3px] bg-zinc-200 rounded-full" />
          <div className="w-[80%] h-[3px] bg-zinc-200 rounded-full" />
        </motion.div>

        {/* Laptop */}
        <div className="absolute bottom-[120px] right-[120px] z-20 flex flex-col items-center">
          {/* Screen */}
          <div className="w-[260px] h-[170px] bg-zinc-900 border-[12px] border-zinc-800 border-b-[20px] rounded-t-[10px] relative overflow-hidden flex flex-col justify-end">
            <div className="w-full h-full bg-zinc-950 flex flex-col justify-end p-2">
              
              {/* Folder in Laptop */}
              <div className="relative w-[120px] h-[90px] left-[55px] bottom-[5px] z-20">
                <div className="w-full h-[65px] bg-indigo-950/80 border border-indigo-500/30 rounded-t-lg relative">
                  <div className="absolute top-[-8px] left-0 w-[45%] h-[8px] bg-indigo-950 border border-indigo-500/30 border-b-0 rounded-t-lg" />
                </div>
                
                {/* Document arriving in laptop folder */}
                <motion.div 
                  animate={{ y: [0, 8, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute bottom-[-15px] left-[15px] w-[55px] h-[75px] bg-white border border-zinc-200 rounded-[4px] shadow-lg p-2 flex flex-col gap-1.5 z-10"
                >
                  <div className="w-[60%] h-1 bg-zinc-400 rounded-full" />
                  <div className="w-full h-[3px] bg-zinc-200 rounded-full" />
                  <div className="w-full h-[3px] bg-zinc-200 rounded-full" />
                  <div className="w-[80%] h-[3px] bg-zinc-200 rounded-full" />
                </motion.div>
                
                <div className="w-[110%] h-[75px] bg-indigo-600/80 border border-indigo-400/40 absolute bottom-[-10px] left-[-5%] rounded-lg shadow-xl" 
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
