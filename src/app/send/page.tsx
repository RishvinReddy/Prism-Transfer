"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { processFileForTransfer, ProcessedTransfer } from "@/lib/chunker";
import { Loader2, FileCheck, UploadCloud, Clock, HardDrive, File as FileIcon, Layers, QrCode } from "lucide-react";
import { TransferController } from "@/features/transfer/TransferController";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export default function SendPage() {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [result, setResult] = React.useState<ProcessedTransfer | null>(null);
  const [isTransferring, setIsTransferring] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setResult(null);

    try {
      const processed = await processFileForTransfer(file);
      setResult(processed);
    } catch (error) {
      console.error("Error processing file:", error);
      alert("Failed to process file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  if (isTransferring && result) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center max-w-4xl mx-auto w-full px-4 space-y-8 mt-4"
      >
        <TransferController 
          transfer={result} 
          onCancel={() => setIsTransferring(false)} 
        />
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto w-full px-4 space-y-8">
      <div className="text-center space-y-3 mt-4">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Send File</h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
          Drag and drop any file to encode it into a secure, high-density optical transfer stream.
        </p>
      </div>
      
      <Card className="w-full bg-card/40 backdrop-blur-xl border-border/40 shadow-2xl rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div 
                key="processing"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[350px] p-8 space-y-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                  <Loader2 className="h-12 w-12 text-primary animate-spin relative z-10" />
                </div>
                <div className="space-y-2 text-center">
                  <h3 className="font-semibold text-lg text-foreground">Encoding Payload...</h3>
                  <p className="text-sm text-muted-foreground animate-pulse">Slicing file and generating manifests</p>
                </div>
              </motion.div>
            ) : result ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex flex-col p-8 w-full"
              >
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                    <FileCheck className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl text-foreground line-clamp-1">{result.manifest.filename}</h3>
                    <p className="text-sm text-success font-medium">Ready for transmission</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex flex-col space-y-1 p-4 rounded-xl bg-muted/30 border border-border/40">
                    <span className="flex items-center text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1"><HardDrive className="w-3 h-3 mr-1"/> Original Size</span>
                    <span className="font-mono text-foreground">{(result.manifest.originalSize / 1024).toFixed(2)} KB</span>
                  </div>
                  <div className="flex flex-col space-y-1 p-4 rounded-xl bg-muted/30 border border-border/40">
                    <span className="flex items-center text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1"><Layers className="w-3 h-3 mr-1"/> Compressed Size</span>
                    <span className="font-mono text-primary">{(result.manifest.compressedSize / 1024).toFixed(2)} KB</span>
                  </div>
                  <div className="flex flex-col space-y-1 p-4 rounded-xl bg-muted/30 border border-border/40">
                    <span className="flex items-center text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1"><QrCode className="w-3 h-3 mr-1"/> Total Packets</span>
                    <span className="font-mono text-foreground">{result.manifest.totalPackets} frames</span>
                  </div>
                  <div className="flex flex-col space-y-1 p-4 rounded-xl bg-muted/30 border border-border/40">
                    <span className="flex items-center text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1"><Clock className="w-3 h-3 mr-1"/> Est. Transfer</span>
                    <span className="font-mono text-foreground">~{Math.max(1, Math.ceil(result.manifest.totalPackets / 10))} sec</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={() => setIsTransferring(true)} size="lg" className="flex-1 rounded-xl shadow-lg shadow-primary/20 font-bold h-12 hover:scale-[1.02] active:scale-[0.98] transition-transform">
                    Start Optical Transfer
                  </Button>
                  <Button onClick={() => setResult(null)} variant="outline" size="lg" className="rounded-xl h-12 hover:scale-[1.02] active:scale-[0.98] transition-transform">
                    Cancel
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="upload"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className={cn(
                  "flex flex-col items-center justify-center min-h-[350px] p-8 m-4 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer",
                  isDragging ? "border-primary bg-primary/5 scale-[0.99]" : "border-border/60 bg-muted/10 hover:bg-muted/20 hover:border-primary/50"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className={cn(
                  "relative w-32 h-32 mb-6 flex items-center justify-center transition-transform duration-500",
                  isDragging && "scale-110"
                )}>
                  {/* Subtle decorative background for empty state */}
                  <div className="absolute inset-0 bg-primary/5 rounded-full blur-2xl" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent rounded-full border border-primary/20" />
                  
                  <motion.div 
                    animate={{ y: [0, -8, 0] }} 
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="relative z-10 p-4 bg-background rounded-2xl shadow-xl border border-border/50"
                  >
                    <UploadCloud className="w-10 h-10 text-primary" />
                  </motion.div>
                </div>
                <h3 className="font-bold text-xl text-foreground mb-2 tracking-tight">Select a file to transfer</h3>
                <p className="text-sm text-muted-foreground mb-8 text-center max-w-[280px] leading-relaxed">
                  Drag and drop your file here, or click to browse your local system.
                </p>
                <Button variant="secondary" className="rounded-full pointer-events-none">
                  Select File
                </Button>
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
