"use client";

import * as React from "react";
import { motion, useInView } from "motion/react";
import { Package, Zap, Cpu, QrCode, Camera, FileCheck, Lock, Download } from "lucide-react";
import { FadeUp, SectionLabel, SectionHeading } from "./shared";

const STEPS = [
  { icon: Package, label: "Choose File", desc: "Select any file from your device." },
  { icon: Zap, label: "Compress", desc: "zlib compresses the file to reduce size." },
  { icon: Cpu, label: "Packetize", desc: "Split into fixed-size data chunks." },
  { icon: QrCode, label: "QR Stream", desc: "Each packet encoded as a QR frame." },
  { icon: Camera, label: "Scan", desc: "Receiver camera decodes each frame at 60 FPS." },
  { icon: FileCheck, label: "Rebuild", desc: "Packets reassembled in the correct order." },
  { icon: Lock, label: "Verify", desc: "CRC32 + SHA-256 integrity check." },
  { icon: Download, label: "Download", desc: "File saved to the receiving device." },
];

export function HowItWorks() {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-20">
      <FadeUp className="text-center mb-14">
        <SectionLabel>How It Works</SectionLabel>
        <SectionHeading>Eight steps. Zero servers.</SectionHeading>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          From file selection to download — the entire process happens between your two devices.
        </p>
      </FadeUp>

      <div ref={ref} className="relative">
        {/* Connector line (desktop) */}
        <div className="hidden lg:block absolute top-10 left-[calc(12.5%/2)] right-[calc(12.5%/2)] h-px bg-gradient-to-r from-transparent via-border to-transparent z-0" />

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.07, ease: "easeOut" }}
                className="relative flex flex-col items-center text-center group"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-card border border-border/40 flex items-center justify-center mb-4 group-hover:border-primary/40 group-hover:bg-primary/5 transition-all duration-300 shadow-sm">
                    <Icon className="w-5 h-5 text-primary/70 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-primary">{i + 1}</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-foreground leading-tight">{step.label}</span>
                <span className="text-[11px] text-muted-foreground mt-1 leading-snug px-1">{step.desc}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
