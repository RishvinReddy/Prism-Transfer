import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Development Roadmap — PrismTransfer Features",
  description: "Check the future roadmap for PrismTransfer, including multi-threaded WASM decoders and custom layout parameters.",
  alternates: {
    canonical: "/roadmap",
  },
};

export default function RoadmapPage() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link href="/" className="inline-flex items-center space-x-2 text-sm text-indigo-400 hover:text-indigo-300">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <div className="bg-card/25 backdrop-blur-xl border border-border/20 p-6 md:p-10 rounded-3xl space-y-6">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Development Roadmap</h1>
        
        <div className="text-muted-foreground text-sm md:text-base leading-relaxed space-y-6">
          <p>
            We are working to optimize our optical transfer mechanics. Here is a timeline of planned enhancements:
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-zinc-950/20 border border-zinc-900 rounded-xl space-y-1.5">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-1 rounded">Q3 2026 — In Progress</span>
              <h4 className="font-bold text-foreground">WebAssembly Compression Modules</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Transition the chunking, compression, and checksum pipelines to high-performance Rust WASM engines to speed up large files pre-rendering.</p>
            </div>
            
            <div className="p-4 bg-zinc-950/20 border border-zinc-900 rounded-xl space-y-1.5">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-2 py-1 rounded">Q4 2026 — Planned</span>
              <h4 className="font-bold text-foreground">Multi-Camera Feed Scanner</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Incorporate multiple cameras feed decoding support to read optical frames on split monitors concurrently, doubling raw visual data transfer capacity.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
