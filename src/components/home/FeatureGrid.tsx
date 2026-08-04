"use client";

import * as React from "react";
import { Wifi, Shield, Globe, Package, QrCode, Zap, Lock, Database } from "lucide-react";
import { FadeUp, SectionLabel, SectionHeading } from "./shared";

const TRUST = [
  { icon: Wifi, label: "100% Offline", sub: "No Internet Required", color: "#6366f1" },
  { icon: Shield, label: "Private", sub: "No Cloud, No Tracking", color: "#22c55e" },
  { icon: Globe, label: "Cross-Platform", sub: "Any Modern Browser", color: "#06b6d4" },
  { icon: Package, label: "Open Architecture", sub: "Modern Web APIs", color: "#f59e0b" },
];

const FEATURES = [
  { icon: QrCode, title: "Adaptive QR", desc: "Automatic packet sizing for maximum scan reliability at any distance." },
  { icon: Zap, title: "Fast Compression", desc: "zlib compression reduces transfer size for faster delivery." },
  { icon: Lock, title: "Integrity Verification", desc: "CRC32 per-packet + SHA-256 end-to-end verification." },
  { icon: Database, title: "Offline Storage", desc: "IndexedDB caches incoming packets so nothing is lost between scans." },
  { icon: Wifi, title: "Progress Tracking", desc: "Live frame counter, percentage, and ETA during every transfer." },
  { icon: Package, title: "Installable PWA", desc: "Install directly from the browser. Works offline as a native-feeling app." },
];

export function TrustBadges() {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {TRUST.map((item, i) => {
          const Icon = item.icon;
          return (
            <FadeUp key={item.label} delay={i * 0.07}>
              <div className="flex flex-col items-center text-center p-5 rounded-2xl border border-border/30 bg-card/30 hover:border-primary/30 hover:bg-card/50 transition-all duration-300 group cursor-default h-full">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110"
                  style={{ background: `${item.color}18`, border: `1px solid ${item.color}30` }}
                >
                  <Icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <span className="font-semibold text-sm text-foreground">{item.label}</span>
                <span className="text-xs text-muted-foreground mt-1">{item.sub}</span>
              </div>
            </FadeUp>
          );
        })}
      </div>
    </section>
  );
}

export function FeatureGrid() {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-20">
      <FadeUp className="text-center mb-14">
        <SectionLabel>Features</SectionLabel>
        <SectionHeading>Everything you need</SectionHeading>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          A complete optical transfer stack built on modern browser APIs — nothing installed, nothing stored remotely.
        </p>
      </FadeUp>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <FadeUp key={f.title} delay={i * 0.06}>
              <div className="flex flex-col p-6 rounded-2xl border border-border/30 bg-card/40 hover:border-primary/30 hover:bg-card/60 hover:-translate-y-1 transition-all duration-300 group h-full">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </FadeUp>
          );
        })}
      </div>
    </section>
  );
}
