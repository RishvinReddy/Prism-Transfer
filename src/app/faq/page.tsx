import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ) — PrismTransfer",
  description: "Answers to common questions about air-gapped visual file transfers, QR stream chunking limits, and browser camera viewports.",
  alternates: {
    canonical: "/faq",
  },
};

const faqs = [
  {
    q: "How does offline file transfer work using QR codes?",
    a: "PrismTransfer takes your file, compresses it locally, hashes it using SHA-256, splits it into small chunks, and encodes each chunk into a sequence of high-density QR codes. The receiving device's camera scans this stream in real-time, validates each chunk using CRC-32, and reconstructs the original file completely serverless inside the browser.",
  },
  {
    q: "Is an internet connection required?",
    a: "No! PrismTransfer is a Progressive Web App (PWA) that caches locally. It operates completely serverless and client-side, requiring no internet, cellular connection, Wi-Fi router, or cables.",
  },
  {
    q: "What is the maximum file size I can send?",
    a: "For optimal scanning reliability, we recommend files under 10MB (such as documents, PDFs, photos, and ZIP archives). Larger files generate more QR frames, which take longer to scan depending on camera lens quality and brightness.",
  },
  {
    q: "Is it secure?",
    a: "Yes, it is highly secure. It enforces a physical 'air-gap'. Because the devices do not establish a radio-frequency (RF) wireless connection (like Bluetooth or Wi-Fi Direct), the transfer is immune to remote wireless interception or middleman snooping.",
  },
  {
    q: "Which browsers are supported?",
    a: "PrismTransfer is compatible with modern browsers that support HTML5 getUserMedia (Camera API) and IndexedDB, including Google Chrome, Apple Safari, Mozilla Firefox, Microsoft Edge, and Opera on iOS, Android, macOS, Windows, and Linux.",
  }
];

export default function FAQPage() {
  const breadcrumbItems = [
    { name: "Home", item: "https://prismtransfer-rishvinreddy.vercel.app" },
    { name: "FAQ", item: "https://prismtransfer-rishvinreddy.vercel.app/faq" },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Schema Injection */}
      <JsonLd type="BreadcrumbList" data={{ items: breadcrumbItems }} />
      <JsonLd type="FAQPage" data={{ questions: faqs }} />

      <Link href="/" className="inline-flex items-center space-x-2 text-sm text-indigo-400 hover:text-indigo-300">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-indigo-400">
          <HelpCircle className="w-4 h-4" />
          <span>Customer Support</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Frequently Asked Questions</h1>
        <p className="text-muted-foreground text-sm">
          Everything you need to know about air-gapped optical file sharing.
        </p>
      </div>

      <div className="space-y-4 mt-6">
        {faqs.map((f, idx) => (
          <Card key={idx} className="bg-card/25 backdrop-blur-xl border border-border/20 rounded-2xl p-6 space-y-2">
            <h3 className="font-bold text-foreground text-base md:text-lg flex items-start space-x-2">
              <span className="text-indigo-400 font-extrabold">Q:</span>
              <span>{f.q}</span>
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed pl-6">
              {f.a}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
