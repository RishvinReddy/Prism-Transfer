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
    <div className="w-full relative animate-in fade-in zoom-in-95 duration-300">
      <QRPlayer frames={frames} manifest={transfer.manifest} onCancel={onCancel} />
    </div>
  );
}
