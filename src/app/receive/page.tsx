"use client";

import { PacketReceiver } from "@/features/scanner/PacketReceiver";

export default function ReceivePage() {
  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto px-4 pt-6 pb-16">
      <PacketReceiver />
    </div>
  );
}
