"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

export type WorkerStatus = "Idle" | "Running" | "Error" | "Done";

export interface WorkerStats {
  status: WorkerStatus;
  latencyMs: number;
  queueDepth: number;
  error?: string;
  details?: Record<string, number | string>; // e.g. SHA-256 time, Compress time
}

export interface CameraMetrics {
  fps: number;
  decodeLatencyMs: number;
  droppedFrames: number;
  decodedFrames: number;
  duplicatePackets: number;
  crcFailures: number;
}

export interface ProtocolMetrics {
  activeVersion: number;
  chunkSize: number;
  payloadEfficiencyPercent: number; // Ratio of payload bytes to total bytes
  totalPackets: number;
  speedKbps: number;
}

export interface DiagnosticsState {
  isOpen: boolean;
  senderWorker: WorkerStats;
  scannerWorker: WorkerStats;
  reconstructionWorker: WorkerStats;
  camera: CameraMetrics;
  protocol: ProtocolMetrics;
}

export interface DiagnosticsContextType {
  state: DiagnosticsState;
  setIsOpen: (isOpen: boolean) => void;
  updateSenderWorker: (stats: Partial<WorkerStats>) => void;
  updateScannerWorker: (stats: Partial<WorkerStats>) => void;
  updateReconstructionWorker: (stats: Partial<WorkerStats>) => void;
  updateCamera: (metrics: Partial<CameraMetrics>) => void;
  updateProtocol: (metrics: Partial<ProtocolMetrics>) => void;
  resetDiagnostics: () => void;
}

const defaultState: DiagnosticsState = {
  isOpen: false,
  senderWorker: { status: "Idle", latencyMs: 0, queueDepth: 0 },
  scannerWorker: { status: "Idle", latencyMs: 0, queueDepth: 0 },
  reconstructionWorker: { status: "Idle", latencyMs: 0, queueDepth: 0 },
  camera: { fps: 0, decodeLatencyMs: 0, droppedFrames: 0, decodedFrames: 0, duplicatePackets: 0, crcFailures: 0 },
  protocol: { activeVersion: 0, chunkSize: 0, payloadEfficiencyPercent: 0, totalPackets: 0, speedKbps: 0 },
};

const DiagnosticsContext = createContext<DiagnosticsContextType | undefined>(undefined);

export const DiagnosticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DiagnosticsState>(defaultState);

  const setIsOpen = useCallback((isOpen: boolean) => {
    setState((s) => ({ ...s, isOpen }));
  }, []);

  const updateSenderWorker = useCallback((stats: Partial<WorkerStats>) => {
    setState((s) => ({ ...s, senderWorker: { ...s.senderWorker, ...stats } }));
  }, []);

  const updateScannerWorker = useCallback((stats: Partial<WorkerStats>) => {
    setState((s) => ({ ...s, scannerWorker: { ...s.scannerWorker, ...stats } }));
  }, []);

  const updateReconstructionWorker = useCallback((stats: Partial<WorkerStats>) => {
    setState((s) => ({ ...s, reconstructionWorker: { ...s.reconstructionWorker, ...stats } }));
  }, []);

  const updateCamera = useCallback((metrics: Partial<CameraMetrics>) => {
    setState((s) => ({ ...s, camera: { ...s.camera, ...metrics } }));
  }, []);

  const updateProtocol = useCallback((metrics: Partial<ProtocolMetrics>) => {
    setState((s) => ({ ...s, protocol: { ...s.protocol, ...metrics } }));
  }, []);

  const resetDiagnostics = useCallback(() => {
    setState((s) => ({ ...defaultState, isOpen: s.isOpen }));
  }, []);

  return (
    <DiagnosticsContext.Provider
      value={{
        state,
        setIsOpen,
        updateSenderWorker,
        updateScannerWorker,
        updateReconstructionWorker,
        updateCamera,
        updateProtocol,
        resetDiagnostics,
      }}
    >
      {children}
    </DiagnosticsContext.Provider>
  );
};

export const useDiagnostics = () => {
  const context = useContext(DiagnosticsContext);
  if (context === undefined) {
    throw new Error("useDiagnostics must be used within a DiagnosticsProvider");
  }
  return context;
};
