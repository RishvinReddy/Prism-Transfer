import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Changelog — PrismTransfer Release Updates",
  description: "Read about the latest features, speed modes, and visual rendering upgrades added to the PrismTransfer optical protocol.",
  alternates: {
    canonical: "/changelog",
  },
};

export default function ChangelogPage() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link href="/" className="inline-flex items-center space-x-2 text-sm text-indigo-400 hover:text-indigo-300">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <div className="bg-card/25 backdrop-blur-xl border border-border/20 p-6 md:p-10 rounded-3xl space-y-6">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-indigo-400">
          <Clock className="w-4 h-4" />
          <span>Release Notes</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Changelog</h1>
        
        <div className="relative border-l border-zinc-800 ml-4 pl-6 space-y-8">
          <div className="space-y-2">
            <span className="absolute -left-[7px] w-3.5 h-3.5 rounded-full bg-indigo-500 border border-black" />
            <h3 className="font-extrabold text-foreground text-lg">v2.1.0 — Desktop Dashboard & UI Overhaul</h3>
            <span className="text-xs text-muted-foreground">August 4, 2026</span>
            <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1 mt-2">
              <li>Upgraded landing page vector artwork to support interactive 3D leaning rotation tilts.</li>
              <li>Redesigned the scanner viewfinder to incorporate a moving laser scan animation.</li>
              <li>Integrated live scrolling trace validation console logging chunk transmissions.</li>
            </ul>
          </div>
          <div className="space-y-2">
            <span className="absolute -left-[7px] w-3.5 h-3.5 rounded-full bg-zinc-800 border border-black" />
            <h3 className="font-extrabold text-foreground text-lg">v2.0.0 — Speed Modes Integration</h3>
            <span className="text-xs text-muted-foreground">July 2026</span>
            <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1 mt-2">
              <li>Added transmission speed sliders (10 FPS up to 45 FPS Turbo).</li>
              <li>Configured adaptive error correction redundancy variables (L, M, H levels).</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
