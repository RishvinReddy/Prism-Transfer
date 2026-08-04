"use client";

import * as React from "react";
import { ProcessedTransfer } from "@/lib/chunker";
import { serializeManifest, serializePacket } from "@/lib/serializer";
import { QRPlayer } from "@/features/qr/QRPlayer";
import { Button } from "@/components/ui/button";

export interface TransferControllerProps {
  transfer: ProcessedTransfer;
  onCancel: () => void;
}

export function TransferController({ transfer, onCancel }: TransferControllerProps) {
  const [frames, setFrames] = React.useState<string[]>([]);

  React.useEffect(() => {
    // Generate the serialized frames immediately when the controller mounts
    const serializedManifest = serializeManifest(transfer.manifest);
    const serializedPackets = transfer.packets.map(serializePacket);
    
    // The sequence is strictly: Manifest, then Packets 1..N
    setFrames([serializedManifest, ...serializedPackets]);
  }, [transfer]);

  if (frames.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full animate-pulse space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-muted-foreground font-medium">Preparing transfer sequence...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6 w-full relative">
      <div className="absolute inset-0 bg-primary/5 blur-3xl -z-10 rounded-full w-3/4 h-3/4 mx-auto top-1/2 -translate-y-1/2 pointer-events-none" />
      
      <div className="text-center space-y-2 mb-2">
        <h2 className="text-2xl font-extrabold tracking-tight">Transmitting Data</h2>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          Keep the receiving device steady. The transfer will repeat continuously until captured.
        </p>
      </div>

      <div className="relative p-1 rounded-3xl bg-gradient-to-b from-border/50 to-background shadow-2xl">
        <div className="p-4 bg-card/60 backdrop-blur-xl rounded-[22px] border border-border/40">
          <QRPlayer frames={frames} />
        </div>
      </div>

      <Button variant="ghost" onClick={onCancel} className="mt-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-full px-6">
        Stop Transfer
      </Button>
    </div>
  );
}
