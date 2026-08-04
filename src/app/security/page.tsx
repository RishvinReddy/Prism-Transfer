import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Security & Air-Gap Compliance — PrismTransfer",
  description: "Learn about the security model behind PrismTransfer. Zero RF signals, sandboxed operations, and SHA-256 validation details.",
  alternates: {
    canonical: "/security",
  },
};

export default function SecurityPage() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link href="/" className="inline-flex items-center space-x-2 text-sm text-indigo-400 hover:text-indigo-300">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <div className="bg-card/25 backdrop-blur-xl border border-border/20 p-6 md:p-10 rounded-3xl space-y-6">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-indigo-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Security Model</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Security Architecture</h1>
        
        <div className="text-muted-foreground text-sm md:text-base leading-relaxed space-y-4">
          <p>
            PrismTransfer is designed from the ground up for high-security environments, leveraging a **physical air-gap** visual transfer path to isolate devices.
          </p>

          <h3 className="text-lg font-bold text-foreground mt-6">1. Physical Air-Gap (No RF Emissions)</h3>
          <p>
            Traditional local sharing options (Bluetooth, Wi-Fi Direct) require active radio emissions. PrismTransfer packetizes data visually on-screen, allowing files to cross system barriers without exposing wireless interfaces to remote snooping.
          </p>

          <h3 className="text-lg font-bold text-foreground mt-6">2. Integrity Checking</h3>
          <p>
            Each chunk is checked in real-time by a **CRC-32 checksum** validator. The final reconstructed payload is verified against a global **SHA-256 hash** manifest to ensure that the saved file is identical to the source.
          </p>

          <h3 className="text-lg font-bold text-foreground mt-6">3. Sandbox Execution</h3>
          <p>
            Operating inside the browser container ensures the script cannot access your system files, background commands, or network credentials.
          </p>
        </div>
      </div>
    </div>
  );
}
