"use client";

import * as React from "react";
import { FadeUp, SectionLabel, SectionHeading } from "./shared";

// Platform icons as clean SVG components
const platforms = [
  { name: "Windows", icon: "⊞", color: "#0078d4" },
  { name: "macOS", icon: "⌘", color: "#888" },
  { name: "Linux", icon: "🐧", color: "#f97316" },
  { name: "Android", icon: "⬡", color: "#3ddc84" },
  { name: "iPhone", icon: "◉", color: "#555" },
  { name: "Chrome", icon: "◈", color: "#4285f4" },
  { name: "Safari", icon: "◎", color: "#006cff" },
  { name: "Firefox", icon: "◉", color: "#ff7139" },
  { name: "Edge", icon: "◌", color: "#0078d4" },
];

const TECH = [
  {
    title: "Frontend",
    accent: "#6366f1",
    items: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS"],
  },
  {
    title: "Transfer Engine",
    accent: "#8b5cf6",
    items: ["QR Encoding", "zlib Compression", "CRC32", "SHA-256"],
  },
  {
    title: "Storage & APIs",
    accent: "#06b6d4",
    items: ["IndexedDB", "File System API", "Canvas API", "Web Workers"],
  },
  {
    title: "Scanning",
    accent: "#22c55e",
    items: ["html5-qrcode", "Camera API", "60 FPS Decode", "Error Correction"],
  },
];

export function SupportedPlatforms() {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-20">
      <FadeUp className="text-center mb-12">
        <SectionLabel>Supported Platforms</SectionLabel>
        <SectionHeading>Runs everywhere</SectionHeading>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          Any device with a modern browser can send or receive files.
        </p>
      </FadeUp>
      <FadeUp delay={0.1}>
        <div className="flex flex-wrap justify-center gap-4">
          {platforms.map((p, i) => (
            <div
              key={p.name}
              className="flex flex-col items-center space-y-2 p-4 rounded-2xl border border-border/30 bg-card/30 hover:border-primary/30 hover:bg-card/50 transition-all duration-300 min-w-[80px]"
            >
              <span className="text-2xl" style={{ color: p.color }}>{p.icon}</span>
              <span className="text-xs font-medium text-muted-foreground">{p.name}</span>
            </div>
          ))}
        </div>
      </FadeUp>
    </section>
  );
}

export function TechStack() {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-20">
      <FadeUp className="text-center mb-14">
        <SectionLabel>Technology</SectionLabel>
        <SectionHeading>Modern. Lean. Open.</SectionHeading>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          Built on stable, open web standards — no proprietary dependencies.
        </p>
      </FadeUp>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {TECH.map((stack, i) => (
          <FadeUp key={stack.title} delay={i * 0.07}>
            <div className="p-6 rounded-2xl border border-border/30 bg-card/40 hover:border-primary/30 hover:bg-card/60 transition-all duration-300 h-full">
              <div
                className="w-2 h-5 rounded-full mb-4"
                style={{ background: stack.accent }}
              />
              <h3 className="font-semibold text-sm uppercase tracking-wide mb-4" style={{ color: stack.accent }}>
                {stack.title}
              </h3>
              <ul className="space-y-2">
                {stack.items.map(item => (
                  <li key={item} className="flex items-center text-sm text-muted-foreground space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: stack.accent }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}
