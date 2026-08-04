import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Technical Whitepaper: Optical QR Sharing — PrismTransfer",
  description: "Read the technical whitepaper detailing the design, chunking formulas, and security compliance of PrismTransfer.",
  alternates: {
    canonical: "/whitepaper",
  },
};

export default function WhitepaperPage() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link href="/" className="inline-flex items-center space-x-2 text-sm text-indigo-400 hover:text-indigo-300">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <div className="bg-card/25 backdrop-blur-xl border border-border/20 p-6 md:p-10 rounded-3xl space-y-6">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Technical Specification Whitepaper</h1>
        
        <div className="text-muted-foreground text-sm md:text-base leading-relaxed space-y-6">
          <p>
            This document outlines the architecture, data structures, and mathematical algorithms behind the **PrismTransfer Visual Data Protocol**.
          </p>

          <h3 className="text-lg font-bold text-foreground mt-6">1. Chunker Slicing Formulas</h3>
          <p>
            Let S represent the compressed byte array of size N. For an optimal chunk size C computed from transmission parameters, we slice S into K chunks where:
            K = Math.ceil(N / C).
            Each chunk is mapped to a payload base64url encoded representation.
          </p>

          <h3 className="text-lg font-bold text-foreground mt-6">2. Optical Feed Sync Epochs</h3>
          <p>
            To prevent camera scan duplication, we define a sync epoch duration. During this interval, identical packets are debounced on the receiver side to prevent index pointer loops.
          </p>
        </div>
      </div>
    </div>
  );
}
