import * as React from "react";
import { PacketReceiver } from "@/features/scanner/PacketReceiver";

export default function ReceivePage() {
  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto w-full space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Receive File</h1>
        <p className="text-muted-foreground">
          Point this device's camera at the sender's screen to scan the QR transfer sequence.
        </p>
      </div>
      
      <PacketReceiver />
    </div>
  );
}
