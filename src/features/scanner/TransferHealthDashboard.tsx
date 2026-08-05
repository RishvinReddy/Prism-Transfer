import * as React from "react";
import { TransferProgress } from "./useProgressTracker";
import { Activity, ShieldCheck, Zap } from "lucide-react";
import { motion } from "motion/react";

interface TransferHealthDashboardProps {
  progress: TransferProgress;
}

export function TransferHealthDashboard({ progress }: TransferHealthDashboardProps) {
  const { signalQuality, packetsPerSecond, recoveryRate, corruptedCount, duplicateCount } = progress;

  const isHealthy = signalQuality > 85;
  const isWarning = signalQuality > 60 && signalQuality <= 85;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-6 left-0 right-0 mx-auto w-[90%] max-w-md bg-background/90 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-4 overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1">
        <div 
          className={`h-full transition-all duration-500 ${isHealthy ? 'bg-green-500' : isWarning ? 'bg-orange-500' : 'bg-red-500'}`}
          style={{ width: `${signalQuality}%` }}
        />
      </div>

      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Transfer Health
        </h3>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isHealthy ? 'bg-green-500/20 text-green-500' : isWarning ? 'bg-orange-500/20 text-orange-500' : 'bg-red-500/20 text-red-500'}`}>
          {isHealthy ? '🟢 Excellent' : isWarning ? '🟠 Fair' : '🔴 Poor'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col bg-muted/30 p-2 rounded-lg">
          <span className="text-[10px] text-muted-foreground uppercase font-semibold">Signal</span>
          <span className="text-lg font-bold">{signalQuality}%</span>
        </div>
        
        <div className="flex flex-col bg-muted/30 p-2 rounded-lg">
          <span className="text-[10px] text-muted-foreground uppercase font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Recovery
          </span>
          <span className="text-lg font-bold">{recoveryRate}%</span>
        </div>

        <div className="flex flex-col bg-muted/30 p-2 rounded-lg">
          <span className="text-[10px] text-muted-foreground uppercase font-semibold flex items-center gap-1">
            <Zap className="w-3 h-3" /> Speed
          </span>
          <span className="text-sm font-bold mt-1">{packetsPerSecond} pkt/s</span>
        </div>
      </div>

      {(corruptedCount > 0 || duplicateCount > 50) && (
        <div className="mt-3 text-[10px] text-muted-foreground flex justify-between px-1">
          {corruptedCount > 0 && <span>{corruptedCount} corrupted packets dropped</span>}
          {duplicateCount > 50 && <span>High duplicate rate ({duplicateCount})</span>}
        </div>
      )}
    </motion.div>
  );
}
