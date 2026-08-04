import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service — PrismTransfer",
  description: "Read PrismTransfer's terms of service and usage conditions.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link href="/" className="inline-flex items-center space-x-2 text-sm text-indigo-400 hover:text-indigo-300">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <div className="bg-card/25 backdrop-blur-xl border border-border/20 p-6 md:p-10 rounded-3xl space-y-6">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Terms of Service</h1>
        
        <div className="text-muted-foreground text-sm md:text-base leading-relaxed space-y-4">
          <p>
            By using PrismTransfer, you agree to the following terms and usage guidelines.
          </p>

          <h3 className="text-lg font-bold text-foreground mt-6">1. Open Source & Fair Use</h3>
          <p>
            PrismTransfer is open-source software provided "as is", without warranty of any kind. You are free to modify and deploy the project locally under the MIT License guidelines.
          </p>

          <h3 className="text-lg font-bold text-foreground mt-6">2. Liability</h3>
          <p>
            Rishvin Labs and the creators of PrismTransfer are not responsible for any file corruptions, hardware scanner malfunctions, or operational losses incurred during transfers.
          </p>
        </div>
      </div>
    </div>
  );
}
