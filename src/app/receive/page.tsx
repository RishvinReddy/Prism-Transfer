import * as React from "react";
import { PacketReceiver } from "@/features/scanner/PacketReceiver";

export default function ReceivePage() {
  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto w-full px-4 space-y-8">
      <div className="text-center space-y-3 mt-4">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Receive File</h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
          Point this device's camera at the sender's screen to scan the optical transfer stream.
        </p>
      </div>
      
      <PacketReceiver />
    </div>
  );
}
