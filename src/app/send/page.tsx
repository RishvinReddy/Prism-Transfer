"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProcessedTransfer } from "@/lib/chunker";
import {
  Loader2,
  FileCheck,
  UploadCloud,
  Clock,
  HardDrive,
  File as FileIcon,
  Layers,
  QrCode,
  X,
  AlertCircle,
  FolderOpen,
  GripVertical,
  ChevronRight,
} from "lucide-react";
import { TransferController } from "@/features/transfer/TransferController";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { getStagedFile } from "@/lib/fileStager";
import { useSettings } from "@/contexts/settings";
import { useDiagnostics } from "@/contexts/diagnostics";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Collect all File objects from a DataTransfer (handles folders via webkitGetAsEntry). */
async function collectDroppedFiles(dataTransfer: DataTransfer): Promise<File[]> {
  const files: File[] = [];

  const readEntry = (entry: FileSystemEntry): Promise<void> =>
    new Promise<void>((resolve) => {
      if (entry.isFile) {
        (entry as FileSystemFileEntry).file((f) => {
          files.push(f);
          resolve();
        });
      } else if (entry.isDirectory) {
        const reader = (entry as FileSystemDirectoryEntry).createReader();
        const readAll = () =>
          reader.readEntries(async (entries) => {
            if (entries.length === 0) return resolve();
            await Promise.all(entries.map(readEntry));
            readAll();
          });
        readAll();
      }
    });

  const entries: FileSystemEntry[] = [];
  for (let i = 0; i < dataTransfer.items.length; i++) {
    const entry = dataTransfer.items[i].webkitGetAsEntry?.();
    if (entry) entries.push(entry);
  }

  if (entries.length > 0) {
    await Promise.all(entries.map(readEntry));
  } else {
    // Fallback: items API not available
    Array.from(dataTransfer.files).forEach((f) => files.push(f));
  }

  return files;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SendPage() {
  const { settings, updateSettings } = useSettings();
  
  // Telemetry (fail-safe)
  let diagnosticsCtx: ReturnType<typeof useDiagnostics> | null = null;
  try {
    diagnosticsCtx = useDiagnostics();
  } catch (e) {}

  // File queue
  const [fileQueue, setFileQueue] = React.useState<File[]>([]);
  const [queueIndex, setQueueIndex] = React.useState(0); // which file in the queue is active

  // Processing / transfer state
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [result, setResult] = React.useState<ProcessedTransfer | null>(null);
  const [isTransferring, setIsTransferring] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [inlineError, setInlineError] = React.useState<string | null>(null);

  // Drag-to-reorder state
  const dragIndexRef = React.useRef<number | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // ── Staged file from simulator / external trigger ────────────────────────
  React.useEffect(() => {
    const staged = getStagedFile();
    if (staged) addFilesToQueue([staged]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Reprocess current file when reliabilityMode changes ─────────────────
  React.useEffect(() => {
    const currentFile = fileQueue[queueIndex];
    if (currentFile && !isTransferring) {
      processFile(currentFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.reliabilityMode]);

  // ── File processing ──────────────────────────────────────────────────────
  const processFile = async (file: File) => {
    setIsProcessing(true);
    setResult(null);
    setInlineError(null);
    
    if (diagnosticsCtx) {
      diagnosticsCtx.updateSenderWorker({ status: "Running", latencyMs: 0 });
    }

    try {
      const worker = new Worker(new URL("../../workers/sender.worker.ts", import.meta.url));
      
      const processed = await new Promise<ProcessedTransfer>((resolve, reject) => {
        worker.onmessage = (e) => {
          if (e.data.success) {
            setResult(e.data.result);
            
            if (diagnosticsCtx) {
              diagnosticsCtx.updateSenderWorker({
                status: "Done",
                latencyMs: e.data.metrics?.latencyMs || 0,
                details: e.data.metrics?.details
              });
              
              const activeVersion = e.data.result.manifest.version;
              const chunkSize = e.data.result.manifest.chunkSize;
              const payloadEfficiencyPercent = Math.round(
                (e.data.result.manifest.originalSize / 
                 (e.data.result.manifest.totalDataPackets * e.data.result.manifest.chunkSize)) * 100
              );
              
              diagnosticsCtx.updateProtocol({
                activeVersion,
                chunkSize,
                payloadEfficiencyPercent,
                totalPackets: e.data.result.manifest.totalDataPackets
              });
            }
            resolve(e.data.result);
          } else {
            setInlineError(e.data.error || "Failed to process file");
            if (diagnosticsCtx) {
              diagnosticsCtx.updateSenderWorker({
                status: "Error",
                error: e.data.error
              });
            }
            reject(new Error(e.data.error));
          }
          worker.terminate();
        };
        worker.onerror = (e) => {
          reject(e);
          worker.terminate();
        };
        worker.postMessage({ file, options: settings });
      });

      setResult(processed);
    } catch (error) {
      console.error("Error processing file:", error);
      setInlineError("Failed to process file. It may be too large or unsupported.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Queue helpers ────────────────────────────────────────────────────────
  const addFilesToQueue = (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    setFileQueue((prev) => {
      const combined = [...prev, ...newFiles];
      // If nothing was previously queued, start processing the first new file
      if (prev.length === 0) {
        const firstFile = combined[0];
        setTimeout(() => processFile(firstFile), 0);
      }
      return combined;
    });
  };

  const removeFromQueue = (index: number) => {
    setFileQueue((prev) => {
      const next = prev.filter((_, i) => i !== index);
      // If we removed the currently active file, reset result
      if (index === queueIndex) {
        setResult(null);
        setInlineError(null);
        if (next.length > 0) {
          const newActive = Math.min(queueIndex, next.length - 1);
          setQueueIndex(newActive);
          setTimeout(() => processFile(next[newActive]), 0);
        } else {
          setQueueIndex(0);
        }
      } else if (index < queueIndex) {
        setQueueIndex((p) => p - 1);
      }
      return next;
    });
  };

  const clearQueue = () => {
    setFileQueue([]);
    setQueueIndex(0);
    setResult(null);
    setInlineError(null);
  };

  // ── Input handlers ───────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addFilesToQueue(Array.from(files));
    }
    // Reset input so same file can be re-added
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = await collectDroppedFiles(e.dataTransfer);
    addFilesToQueue(files);
  };

  // ── Queue reorder (drag handles) ─────────────────────────────────────────
  const handleDragStart = (index: number) => {
    dragIndexRef.current = index;
  };

  const handleDragEnterRow = (index: number) => {
    const from = dragIndexRef.current;
    if (from === null || from === index) return;
    setFileQueue((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(index, 0, moved);
      // Adjust active index if needed
      if (from === queueIndex) setQueueIndex(index);
      else if (from < queueIndex && index >= queueIndex) setQueueIndex((p) => p - 1);
      else if (from > queueIndex && index <= queueIndex) setQueueIndex((p) => p + 1);
      dragIndexRef.current = index;
      return next;
    });
  };

  // ── Transfer flow ────────────────────────────────────────────────────────
  const handleStartTransfer = () => {
    if (!result) return;
    setIsTransferring(true);
  };

  /** Called by TransferController when autoAdvance fires or user manually cancels */
  const handleTransferComplete = () => {
    const nextIndex = queueIndex + 1;
    if (nextIndex < fileQueue.length) {
      setQueueIndex(nextIndex);
      setIsTransferring(false);
      processFile(fileQueue[nextIndex]);
    } else {
      // All files done — return to upload screen
      setIsTransferring(false);
      setResult(null);
      setFileQueue([]);
      setQueueIndex(0);
    }
  };

  const handleCancelTransfer = () => {
    setIsTransferring(false);
  };

  // ── Render: active transfer ──────────────────────────────────────────────
  if (isTransferring && result) {
    const isLastFile = queueIndex >= fileQueue.length - 1;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center max-w-6xl mx-auto w-full px-4 space-y-8 mt-4"
      >
        {/* Queue progress indicator */}
        {fileQueue.length > 1 && (
          <div className="flex items-center space-x-2 text-xs text-muted-foreground font-medium">
            <span>File</span>
            <span className="font-mono font-bold text-foreground">{queueIndex + 1}</span>
            <span>of</span>
            <span className="font-mono font-bold text-foreground">{fileQueue.length}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-semibold truncate max-w-[200px]">
              {fileQueue[queueIndex]?.name}
            </span>
          </div>
        )}
        <TransferController
          transfer={result}
          onCancel={handleCancelTransfer}
          autoAdvance={!isLastFile}
          // When autoAdvance fires (not-last file), advance queue
        />
        {/* If this IS the last file, TransferController shows its own completion screen.
            "Send Again" / "Send New File" buttons inside it call onCancel, which
            takes us back to the upload screen via handleCancelTransfer. */}
      </motion.div>
    );
  }

  // ── Render: main upload / queue screen ───────────────────────────────────
  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto w-full px-4 space-y-8">
      <div className="text-center space-y-3 mt-4">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Send Files</h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
          Drag and drop files or folders to encode them into a secure optical transfer stream.
        </p>
      </div>

      <Card className="w-full bg-card/40 backdrop-blur-xl border-border/40 shadow-2xl rounded-2xl overflow-hidden">
        {/* Persistent Mode Selector */}
        <div className="flex flex-col sm:flex-row border-b border-border/40 p-4 gap-3 sm:justify-between sm:items-center bg-muted/10">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Transfer Mode
          </span>
          <div className="flex bg-muted rounded-lg p-0.5 text-xs font-medium self-start sm:self-auto">
            {(["reliable", "balanced", "speed", "turbo"] as const).map((m) => (
              <button
                key={m}
                onClick={() => updateSettings({ reliabilityMode: m })}
                className={cn(
                  "px-3 py-1.5 rounded-md capitalize transition-all",
                  settings.reliabilityMode === m
                    ? "bg-background text-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {m === "balanced" ? "standard" : m}
              </button>
            ))}
          </div>
        </div>

        <CardContent className="p-0">
          <AnimatePresence mode="wait">
            {/* ── Processing ── */}
            {isProcessing ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[350px] p-8 space-y-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                  <Loader2 className="h-12 w-12 text-primary animate-spin relative z-10" />
                </div>
                <div className="space-y-2 text-center">
                  <h3 className="font-semibold text-lg text-foreground">Encoding Payload...</h3>
                  <p className={`text-sm text-muted-foreground ${settings.reducedMotion ? "" : "animate-pulse"}`}>
                    {fileQueue.length > 1
                      ? `File ${queueIndex + 1} of ${fileQueue.length} — slicing and generating manifests`
                      : "Slicing file and generating manifests"}
                  </p>
                </div>
              </motion.div>
            ) : result ? (
              /* ── Ready ── */
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col p-8 w-full"
              >
                {/* Inline error banner */}
                <AnimatePresence>
                  {inlineError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-start space-x-3 p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400"
                    >
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{inlineError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                    <FileCheck className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl text-foreground line-clamp-1">
                      {result.manifest.filename}
                    </h3>
                    <p className="text-sm text-success font-medium">
                      {fileQueue.length > 1
                        ? `File ${queueIndex + 1} of ${fileQueue.length} — ready for transmission`
                        : "Ready for transmission"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex flex-col space-y-1 p-4 rounded-xl bg-muted/30 border border-border/40">
                    <span className="flex items-center text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      <HardDrive className="w-3 h-3 mr-1" /> Original Size
                    </span>
                    <span className="font-mono text-foreground">
                      {(result.manifest.originalSize / 1024).toFixed(2)} KB
                    </span>
                  </div>
                  <div className="flex flex-col space-y-1 p-4 rounded-xl bg-muted/30 border border-border/40">
                    <span className="flex items-center text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      <Layers className="w-3 h-3 mr-1" /> Compressed Size
                    </span>
                    <span className="font-mono text-primary">
                      {(result.manifest.compressedSize / 1024).toFixed(2)} KB
                    </span>
                  </div>
                  <div className="flex flex-col space-y-1 p-4 rounded-xl bg-muted/30 border border-border/40">
                    <span className="flex items-center text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      <QrCode className="w-3 h-3 mr-1" /> Total Packets
                    </span>
                    <span className="font-mono text-foreground">
                      {result.manifest.totalDataPackets} frames
                    </span>
                  </div>
                  <div className="flex flex-col space-y-1 p-4 rounded-xl bg-muted/30 border border-border/40">
                    <span className="flex items-center text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      <Clock className="w-3 h-3 mr-1" /> Est. Transfer
                    </span>
                    <span className="font-mono text-foreground">
                      ~{Math.max(1, Math.ceil(result.manifest.totalDataPackets / 10))} sec
                    </span>
                  </div>
                </div>

                {/* File queue (visible when > 1 file) */}
                {fileQueue.length > 1 && (
                  <div className="mb-6 rounded-xl border border-border/40 overflow-hidden">
                    <div className="flex justify-between items-center px-4 py-2 bg-muted/20 border-b border-border/40">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Queue ({fileQueue.length} files)
                      </span>
                      <button
                        onClick={clearQueue}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="divide-y divide-border/20">
                      {fileQueue.map((file, i) => (
                        <div
                          key={`${file.name}-${i}`}
                          draggable
                          onDragStart={() => handleDragStart(i)}
                          onDragEnter={() => handleDragEnterRow(i)}
                          onDragOver={(e) => e.preventDefault()}
                          className={cn(
                            "flex items-center space-x-3 px-4 py-2.5 text-sm transition-colors",
                            i === queueIndex
                              ? "bg-primary/5 text-foreground"
                              : "text-muted-foreground hover:bg-muted/20"
                          )}
                        >
                          <GripVertical className="w-4 h-4 shrink-0 text-muted-foreground/40 cursor-grab" />
                          <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                            i === queueIndex
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}>
                            {i + 1}
                          </div>
                          <FileIcon className="w-3.5 h-3.5 shrink-0" />
                          <span className="flex-1 truncate font-medium">{file.name}</span>
                          <span className="font-mono text-xs shrink-0">{formatSize(file.size)}</span>
                          <button
                            onClick={() => removeFromQueue(i)}
                            className="p-1 rounded hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                            title="Remove from queue"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={handleStartTransfer}
                    size="lg"
                    className="flex-1 rounded-xl shadow-lg shadow-primary/20 font-bold h-12 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  >
                    Start Optical Transfer
                    {fileQueue.length > 1 && (
                      <span className="ml-2 text-primary-foreground/70">
                        ({fileQueue.length} files)
                      </span>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setResult(null);
                      setInlineError(null);
                    }}
                    variant="outline"
                    size="lg"
                    className="rounded-xl h-12 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            ) : (
              /* ── Upload drop zone ── */
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col p-6"
              >
                {/* Inline error banner (shown if processFile fails before result is ready) */}
                <AnimatePresence>
                  {inlineError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-start space-x-3 p-4 mb-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400"
                    >
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{inlineError}</span>
                      <button onClick={() => setInlineError(null)} className="ml-auto">
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  className={cn(
                    "flex flex-col items-center justify-center min-h-[300px] m-0 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer",
                    isDragging
                      ? "border-primary bg-primary/5 scale-[0.99]"
                      : "border-border/60 bg-muted/10 hover:bg-muted/20 hover:border-primary/50"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div
                    className={cn(
                      "relative w-32 h-32 mb-6 flex items-center justify-center transition-transform duration-500",
                      isDragging && "scale-110"
                    )}
                  >
                    <div className="absolute inset-0 bg-primary/5 rounded-full blur-2xl" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent rounded-full border border-primary/20" />
                    <motion.div
                      animate={settings.reducedMotion ? {} : { y: [0, -8, 0] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                      className="relative z-10 p-4 bg-background rounded-2xl shadow-xl border border-border/50"
                    >
                      <UploadCloud className="w-10 h-10 text-primary" />
                    </motion.div>
                  </div>
                  <h3 className="font-bold text-xl text-foreground mb-2 tracking-tight">
                    Select files or a folder
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 text-center max-w-[280px] leading-relaxed">
                    Drag and drop files or entire folders here, or click to browse.
                  </p>
                  <div className="flex gap-3">
                    <Button variant="secondary" className="rounded-full pointer-events-none">
                      Select Files
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full pointer-events-none gap-2"
                    >
                      <FolderOpen className="w-4 h-4" />
                      Folder
                    </Button>
                  </div>

                  {/* Hidden file input — multiple + webkitdirectory via data-* */}
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    multiple
                    onChange={handleFileChange}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
