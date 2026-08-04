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
    return <div className="animate-pulse">Preparing transfer sequence...</div>;
  }

  return (
    <div className="flex flex-col items-center space-y-6 w-full">
      <div className="text-center space-y-1 mb-4">
        <h2 className="text-xl font-bold tracking-tight">Transmitting File</h2>
        <p className="text-muted-foreground text-sm">
          Point the receiving device's camera at this screen.
        </p>
      </div>

      <QRPlayer frames={frames} />

      <Button variant="ghost" onClick={onCancel} className="mt-8 text-muted-foreground hover:text-destructive">
        Cancel Transfer
      </Button>
    </div>
  );
}
