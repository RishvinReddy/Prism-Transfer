"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { processFileForTransfer, ProcessedTransfer } from "@/lib/chunker";
import { Loader2, FileCheck } from "lucide-react";
import { TransferController } from "@/features/transfer/TransferController";

export default function SendPage() {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [result, setResult] = React.useState<ProcessedTransfer | null>(null);
  const [isTransferring, setIsTransferring] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setResult(null);

    try {
      // Execute the Phase 2 File Engine pipeline
      const processed = await processFileForTransfer(file);
      setResult(processed);
      console.log("Transfer Manifest:", processed.manifest);
      console.log(`Generated ${processed.packets.length} data packets.`);
    } catch (error) {
      console.error("Error processing file:", error);
      alert("Failed to process file.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isTransferring && result) {
    return (
      <div className="flex flex-col items-center max-w-2xl mx-auto w-full space-y-8 mt-12">
        <TransferController 
          transfer={result} 
          onCancel={() => setIsTransferring(false)} 
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto w-full space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Send File</h1>
        <p className="text-muted-foreground">
          Select a file to begin generating the QR transfer sequence.
        </p>
      </div>
      
      <Card className="w-full bg-card/50 backdrop-blur border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle>File Selection</CardTitle>
          <CardDescription>Choose any file to process it through the PrismTransfer engine.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[250px] border-2 border-dashed border-border/50 rounded-lg m-6 bg-muted/20 relative overflow-hidden transition-colors hover:bg-muted/30">
          
          {isProcessing ? (
            <div className="flex flex-col items-center space-y-4 text-primary">
              <Loader2 className="h-10 w-10 animate-spin" />
              <p className="text-sm font-medium animate-pulse">Processing file through engine...</p>
            </div>
          ) : result ? (
            <div className="flex flex-col items-center space-y-4 p-6 text-center w-full">
              <FileCheck className="h-12 w-12 text-success" />
              <div className="space-y-1">
                <p className="font-semibold text-lg text-foreground">{result.manifest.filename}</p>
                <p className="text-sm text-muted-foreground">Original: {(result.manifest.originalSize / 1024).toFixed(2)} KB</p>
                <p className="text-sm text-muted-foreground">Compressed: {(result.manifest.compressedSize / 1024).toFixed(2)} KB</p>
                <p className="text-sm text-muted-foreground">Total Packets: {result.manifest.totalPackets}</p>
              </div>
              <div className="flex space-x-4 mt-6">
                <Button onClick={() => setIsTransferring(true)} size="lg" className="rounded-full shadow-md font-bold px-8">
                  Start Transfer
                </Button>
                <Button onClick={() => setResult(null)} variant="secondary" size="lg" className="rounded-full shadow-sm">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <p className="text-sm text-muted-foreground">Click to select or drag and drop a file here.</p>
              <Button onClick={() => fileInputRef.current?.click()} size="lg" className="rounded-full shadow-md hover:shadow-lg transition-all">
                Select File
              </Button>
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
