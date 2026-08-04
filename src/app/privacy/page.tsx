import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Serverless File Transfer | PrismTransfer",
  description: "Read PrismTransfer's privacy commitments. No data is stored, cached, logged, or uploaded to servers. Completely client-side security.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link href="/" className="inline-flex items-center space-x-2 text-sm text-indigo-400 hover:text-indigo-300">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <div className="bg-card/25 backdrop-blur-xl border border-border/20 p-6 md:p-10 rounded-3xl space-y-6">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-indigo-400">
          <Shield className="w-4 h-4" />
          <span>Legals</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Privacy Policy</h1>
        
        <div className="text-muted-foreground text-sm md:text-base leading-relaxed space-y-4">
          <p>
            At PrismTransfer, we prioritize your data privacy above everything else. Our system is engineered around a **100% serverless, zero-telemetry architecture**.
          </p>
          
          <h3 className="text-lg font-bold text-foreground mt-6">1. Zero Cloud Storage</h3>
          <p>
            PrismTransfer does not upload your files, metadata, filenames, or coordinates to any cloud storage or remote servers. All chunking, compression, and mathematical processes run locally inside your browser sandbox.
          </p>

          <h3 className="text-lg font-bold text-foreground mt-6">2. Zero Analytics or Logs</h3>
          <p>
            We do not track your organic behavior, session duration, user account, IP address, or camera telemetry. The system operates locally without telemetry trackers.
          </p>

          <h3 className="text-lg font-bold text-foreground mt-6">3. Local browser storage</h3>
          <p>
            Reassembled chunks are cached temporarily using the client's browser **IndexedDB** database. They are deleted immediately upon successful download compilation or cancel actions.
          </p>
        </div>
      </div>
    </div>
  );
}
