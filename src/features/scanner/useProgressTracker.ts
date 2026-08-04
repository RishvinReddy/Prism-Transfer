import { useState, useEffect, useCallback, useRef } from "react";

export interface TransferProgress {
  totalPackets: number;
  packetsReceived: number;
  packetsRemaining: number;
  percentage: number;
  packetsPerSecond: number;
  estimatedTimeRemainingMs: number;
  duplicateCount: number;
  corruptedCount: number;
  isComplete: boolean;
  missingPackets: number[];
  receivedIndexes: Set<number>;
}

export function useProgressTracker(totalPackets: number = 0) {
  const [receivedIndexes, setReceivedIndexes] = useState<Set<number>>(new Set());
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [corruptedCount, setCorruptedCount] = useState(0);
  const [packetsPerSecond, setPacketsPerSecond] = useState(0);

  const startTimeRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const packetsSinceLastUpdateRef = useRef<number>(0);

  // Interval to calculate speed every second
  useEffect(() => {
    if (packetsReceived === 0 || packetsReceived >= totalPackets) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeElapsedSec = (now - lastUpdateTimeRef.current) / 1000;
      
      if (timeElapsedSec >= 1) {
        const speed = packetsSinceLastUpdateRef.current / timeElapsedSec;
        setPacketsPerSecond(Math.round(speed * 10) / 10);
        
        lastUpdateTimeRef.current = now;
        packetsSinceLastUpdateRef.current = 0;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [packetsReceived, totalPackets]);

  const recordPacket = useCallback((index: number, isDuplicate: boolean = false) => {
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now();
      lastUpdateTimeRef.current = Date.now();
    }

    if (isDuplicate) {
      setDuplicateCount((prev) => prev + 1);
    } else {
      setReceivedIndexes((prev) => {
        const next = new Set(prev);
        next.add(index);
        return next;
      });
      packetsSinceLastUpdateRef.current += 1;
    }
  }, []);

  const recordCorruption = useCallback(() => {
    setCorruptedCount((prev) => prev + 1);
  }, []);

  const resetProgress = useCallback((newTotal: number = 0) => {
    setReceivedIndexes(new Set());
    setDuplicateCount(0);
    setCorruptedCount(0);
    setPacketsPerSecond(0);
    startTimeRef.current = null;
    lastUpdateTimeRef.current = Date.now();
    packetsSinceLastUpdateRef.current = 0;
  }, []);

  // Set the total packets if we restore from DB
  const setInitialReceived = useCallback((indexes: number[]) => {
    setReceivedIndexes(new Set(indexes));
  }, []);

  const packetsReceived = receivedIndexes.size;
  const packetsRemaining = Math.max(0, totalPackets - packetsReceived);
  const percentage = totalPackets > 0 ? Math.min(100, Math.round((packetsReceived / totalPackets) * 100)) : 0;
  const estimatedTimeRemainingMs = packetsPerSecond > 0 ? (packetsRemaining / packetsPerSecond) * 1000 : 0;
  const isComplete = totalPackets > 0 && packetsReceived >= totalPackets;

  // Compute missing packets (contiguous expected minus received)
  const missingPackets = Array.from({ length: totalPackets }, (_, i) => i).filter(i => !receivedIndexes.has(i));

  const progress: TransferProgress = {
    totalPackets,
    packetsReceived,
    packetsRemaining,
    percentage,
    packetsPerSecond,
    estimatedTimeRemainingMs,
    duplicateCount,
    corruptedCount,
    isComplete,
    missingPackets,
    receivedIndexes,
  };

  return {
    progress,
    recordPacket,
    recordCorruption,
    resetProgress,
    setInitialReceived,
  };
}
