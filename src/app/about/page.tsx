"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "motion/react";
import {
  Shield, Wifi, Globe, Package, Zap, Lock, CheckCircle2,
  ChevronDown, ArrowRight, ExternalLink,
  QrCode, Smartphone, Laptop, Camera, Download, FileCheck, Cpu
} from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ─── Animation helpers ────────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Transfer Animation ───────────────────────────────────────────────────────
function TransferAnimation() {
  const [step, setStep] = React.useState(0);
  const steps = [
    { icon: Laptop, label: "Sender" },
    { icon: QrCode, label: "QR Stream" },
    { icon: Camera, label: "Scanner" },
    { icon: Smartphone, label: "Receiver" },
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStep(prev => (prev + 1) % steps.length);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center space-x-2 md:space-x-4 py-8">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const isActive = i === step;
        const isPast = i < step;
        return (
          <React.Fragment key={i}>
            <motion.div
              animate={{
                scale: isActive ? 1.15 : 1,
                opacity: isActive ? 1 : isPast ? 0.6 : 0.35,
              }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center space-y-2"
            >
              <div
                className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center border transition-colors duration-300"
                style={{
                  background: isActive ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)",
                  borderColor: isActive ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.1)",
                  boxShadow: isActive ? "0 0 20px rgba(99,102,241,0.3)" : "none",
                }}
              >
                <Icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: isActive ? "#818cf8" : "#52525b" }} />
              </div>
              <span className="text-xs font-medium" style={{ color: isActive ? "#a5b4fc" : "#52525b" }}>{s.label}</span>
            </motion.div>
            {i < steps.length - 1 && (
              <motion.div
                className="flex-1 h-px max-w-8 md:max-w-12"
                animate={{ opacity: i < step ? 1 : 0.2 }}
                style={{ background: i < step ? "linear-gradient(90deg, #6366f1, #818cf8)" : "#27272a" }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── How It Works steps ───────────────────────────────────────────────────────
const HOW_STEPS = [
  { icon: Package, label: "Choose File", desc: "Select any file from your device." },
  { icon: Zap, label: "Compress", desc: "File is compressed using zlib." },
  { icon: Cpu, label: "Packetize", desc: "Split into fixed-size data packets." },
  { icon: QrCode, label: "QR Stream", desc: "Each packet becomes an animated QR code." },
  { icon: Camera, label: "Scan", desc: "Receiver camera decodes each frame." },
  { icon: FileCheck, label: "Rebuild", desc: "Packets reassembled in order." },
  { icon: Lock, label: "Verify SHA-256", desc: "Cryptographic integrity check." },
  { icon: Download, label: "Download", desc: "File saved to receiving device." },
];

// ─── Why PrismTransfer cards ──────────────────────────────────────────────────
const WHY_CARDS = [
  {
    icon: Wifi,
    title: "Completely Offline",
    desc: "Everything happens locally. No servers. No uploads. Works in airplane mode, dead zones, and secure facilities.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    desc: "Files never leave your devices. No cloud. No tracking. No accounts. No telemetry of any kind.",
  },
  {
    icon: Globe,
    title: "Cross-Platform",
    desc: "Works anywhere a modern browser runs — Windows, macOS, Linux, Android, iOS, and tablets.",
  },
  {
    icon: Package,
    title: "Zero Install",
    desc: "Open the URL. Scan. Transfer. Nothing to install, update, or configure.",
  },
];

// ─── Tech Stack cards ─────────────────────────────────────────────────────────
const TECH_STACKS = [
  {
    title: "Frontend",
    items: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS", "Framer Motion"],
  },
  {
    title: "Transfer Engine",
    items: ["QR Encoding (qrcode)", "zlib Compression", "CRC32 Validation", "SHA-256 Integrity"],
  },
  {
    title: "Storage & APIs",
    items: ["IndexedDB", "Browser File API", "Web Workers", "Canvas API"],
  },
  {
    title: "Scanning",
    items: ["html5-qrcode", "Camera API", "60 FPS Decoding", "Error Correction L/M/Q/H"],
  },
];

// ─── Security features ────────────────────────────────────────────────────────
const SECURITY = [
  "Offline by Default — No network calls ever made",
  "SHA-256 Integrity Verification on every transfer",
  "CRC32 Per-Packet Validation before storage",
  "No Third-Party Servers or CDNs for file data",
  "Local Browser Storage — nothing persists after download",
  "Open Protocol — inspect every byte in DevTools",
  "No Accounts — no identity tied to a transfer",
];

// ─── Roadmap ─────────────────────────────────────────────────────────────────
const ROADMAP = [
  {
    version: "v1.0",
    status: "released",
    items: ["Optical Transfer Engine", "QR Code Stream", "File Reconstruction", "SHA-256 Verification", "PWA Support"],
  },
  {
    version: "v1.1",
    status: "upcoming",
    items: ["Improved Decode Reliability", "Adaptive Epoch Timing", "Replay Mode", "Transfer History"],
  },
  {
    version: "v2.0",
    status: "planned",
    items: ["End-to-End Encryption", "ACK Protocol", "Resume Transfer", "Selective Retransmission", "Multi-file Transfers"],
  },
];

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: "Does PrismTransfer require internet?", a: "No. It works 100% offline. No network connection is needed at any point." },
  { q: "Is Bluetooth or Wi-Fi required?", a: "No. The only requirement is a screen on one device and a camera on another." },
  { q: "Can I transfer between Android and iPhone?", a: "Yes. Because it runs in any modern browser, it works across all platforms and operating systems." },
  { q: "Are my files uploaded anywhere?", a: "Never. Files are processed entirely in the browser. Nothing leaves your device." },
  { q: "Is PrismTransfer open source?", a: "Yes. The full source code is available on GitHub under the MIT License." },
  { q: "What is the maximum file size?", a: "Practically limited by RAM and transfer time. Smaller files (< 5 MB) are recommended for reliable optical transfer." },
  { q: "What if my transfer is interrupted?", a: "The sender loops the QR stream continuously. The receiver will resume collecting packets until 100% is reached." },
];

// ─── Stats ────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "100%", label: "Offline" },
  { value: "0", label: "Servers" },
  { value: "5+", label: "Platforms" },
  { value: "SHA-256", label: "Integrity" },
];

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div
      className="border-b border-border/40 last:border-0"
      onClick={() => setOpen(o => !o)}
    >
      <button className="flex items-center justify-between w-full py-5 text-left group">
        <span className="font-medium text-foreground group-hover:text-primary transition-colors">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="text-muted-foreground text-sm pb-5 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-xs font-semibold uppercase tracking-[0.15em] text-primary/80 bg-primary/10 px-3 py-1 rounded-full mb-4">
      {children}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AboutPage() {
  return (
    <div className="flex flex-col items-center w-full overflow-x-hidden">

      {/* ── 1. Hero ─────────────────────────────────────── */}
      <section className="w-full max-w-5xl mx-auto px-4 pt-12 pb-20 text-center">
        <FadeUp>
          <SectionLabel>About PrismTransfer</SectionLabel>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
            Offline file transfer using<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              nothing but a camera.
            </span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Secure. Private. Cross-platform. Open by design.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://github.com/RishvinReddy/Prism-Transfer"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8 font-semibold")}
            >
              <GithubIcon className="w-4 h-4 mr-2" /> View Source
            </a>
            <Link
              href="/send"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full px-8 font-semibold")}
            >
              Try It Now <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </FadeUp>

        {/* Transfer Animation */}
        <FadeUp delay={0.15}>
          <div className="mt-12 mx-auto max-w-md p-6 rounded-3xl border border-border/30 bg-card/30 backdrop-blur-md">
            <TransferAnimation />
            <p className="text-xs text-muted-foreground text-center mt-2 tracking-wide">
              Optical transfer — screen to camera, zero network
            </p>
          </div>
        </FadeUp>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* ── 2. What is PrismTransfer ────────────────────── */}
      <section className="w-full max-w-5xl mx-auto px-4 py-20 text-center">
        <FadeUp>
          <SectionLabel>What is PrismTransfer?</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-6">
            A new way to transfer files
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            PrismTransfer is a browser-based optical file transfer application that allows two devices to
            exchange files using animated QR codes.
          </p>
        </FadeUp>
        <FadeUp delay={0.1} className="mt-10 grid grid-cols-2 md:grid-cols-5 gap-4 max-w-2xl mx-auto">
          {["No Wi-Fi", "No Bluetooth", "No Internet", "No USB", "No Install"].map(label => (
            <div
              key={label}
              className="flex flex-col items-center justify-center p-4 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              <span className="text-2xl mb-2">✕</span>
              {label}
            </div>
          ))}
        </FadeUp>
        <FadeUp delay={0.15} className="mt-6">
          <p className="text-muted-foreground">
            Only a <span className="text-foreground font-semibold">screen</span> and a <span className="text-foreground font-semibold">camera.</span>
          </p>
        </FadeUp>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* ── 3. Why PrismTransfer ────────────────────────── */}
      <section className="w-full max-w-5xl mx-auto px-4 py-20">
        <FadeUp className="text-center mb-12">
          <SectionLabel>Why PrismTransfer?</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Built for the real world
          </h2>
        </FadeUp>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {WHY_CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <FadeUp key={card.title} delay={i * 0.08}>
                <Card className="p-6 bg-card/40 border border-border/30 rounded-2xl hover:border-primary/30 hover:bg-card/60 transition-all duration-300 group h-full">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">{card.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
                </Card>
              </FadeUp>
            );
          })}
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* ── 4. How It Works ─────────────────────────────── */}
      <section className="w-full max-w-5xl mx-auto px-4 py-20">
        <FadeUp className="text-center mb-12">
          <SectionLabel>How It Works</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Eight steps. Zero servers.
          </h2>
        </FadeUp>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {HOW_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <FadeUp key={step.label} delay={i * 0.06}>
                <div className="relative flex flex-col items-center text-center p-5 rounded-2xl border border-border/30 bg-card/30 hover:border-primary/30 hover:bg-card/50 transition-all duration-300">
                  <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground mb-1">{step.label}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </FadeUp>
            );
          })}
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* ── 5. Stats ──────────────────────────────────────── */}
      <section className="w-full max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
            <FadeUp key={stat.label} delay={i * 0.08}>
              <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-border/30 bg-card/30">
                <span className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-2">
                  {stat.value}
                </span>
                <span className="text-sm text-muted-foreground font-medium">{stat.label}</span>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* ── 6. Technology Stack ─────────────────────────── */}
      <section className="w-full max-w-5xl mx-auto px-4 py-20">
        <FadeUp className="text-center mb-12">
          <SectionLabel>Technology Stack</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Modern. Lean. Open.
          </h2>
        </FadeUp>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {TECH_STACKS.map((stack, i) => (
            <FadeUp key={stack.title} delay={i * 0.08}>
              <Card className="p-5 bg-card/40 border border-border/30 rounded-2xl h-full">
                <h3 className="font-semibold text-sm text-primary mb-4 uppercase tracking-wider">{stack.title}</h3>
                <ul className="space-y-2">
                  {stack.items.map(item => (
                    <li key={item} className="flex items-center text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mr-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            </FadeUp>
          ))}
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* ── 7. Security ─────────────────────────────────── */}
      <section className="w-full max-w-5xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <FadeUp>
            <SectionLabel>Security & Privacy</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
              Secure by design,<br />not by promise.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              PrismTransfer has no servers to breach, no accounts to compromise, and no data to leak.
              The only path your file travels is from one screen to one camera.
            </p>
          </FadeUp>
          <FadeUp delay={0.1}>
            <div className="space-y-3">
              {SECURITY.map((feature, i) => (
                <div key={i} className="flex items-start space-x-3 p-4 rounded-xl bg-card/40 border border-border/30">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* ── 8. Roadmap ──────────────────────────────────── */}
      <section className="w-full max-w-5xl mx-auto px-4 py-20">
        <FadeUp className="text-center mb-14">
          <SectionLabel>Roadmap</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Where we're headed
          </h2>
        </FadeUp>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ROADMAP.map((phase, i) => (
            <FadeUp key={phase.version} delay={i * 0.1}>
              <Card className={cn(
                "p-6 rounded-2xl border h-full",
                phase.status === "released"
                  ? "bg-green-500/5 border-green-500/20"
                  : phase.status === "upcoming"
                  ? "bg-primary/5 border-primary/20"
                  : "bg-card/30 border-border/30"
              )}>
                <div className="flex items-center justify-between mb-5">
                  <span className="font-mono font-bold text-lg text-foreground">{phase.version}</span>
                  <span className={cn(
                    "text-xs px-2.5 py-1 rounded-full font-medium",
                    phase.status === "released" ? "bg-green-500/15 text-green-400" :
                    phase.status === "upcoming" ? "bg-primary/15 text-primary" :
                    "bg-zinc-800 text-zinc-500"
                  )}>
                    {phase.status === "released" ? "Released" : phase.status === "upcoming" ? "Upcoming" : "Planned"}
                  </span>
                </div>
                <ul className="space-y-2.5">
                  {phase.items.map(item => (
                    <li key={item} className="flex items-center text-sm text-muted-foreground space-x-2">
                      {phase.status === "released"
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        : <span className="w-3.5 h-3.5 rounded-full border border-muted-foreground/40 flex-shrink-0" />
                      }
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </FadeUp>
          ))}
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* ── 9. FAQ ──────────────────────────────────────── */}
      <section className="w-full max-w-3xl mx-auto px-4 py-20">
        <FadeUp className="text-center mb-12">
          <SectionLabel>FAQ</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Common questions
          </h2>
        </FadeUp>
        <FadeUp delay={0.1}>
          <Card className="p-4 md:p-6 bg-card/40 border border-border/30 rounded-2xl divide-y divide-border/40">
            {FAQS.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </Card>
        </FadeUp>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* ── 10. Creator ─────────────────────────────────── */}
      <section className="w-full max-w-5xl mx-auto px-4 py-20">
        <FadeUp className="text-center mb-10">
          <SectionLabel>Meet the Creator</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Built by a real person</h2>
        </FadeUp>
        <FadeUp delay={0.1}>
          <Card className="max-w-xl mx-auto p-8 bg-card/40 border border-border/30 rounded-3xl text-center">
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl font-extrabold text-primary border border-primary/30 bg-primary/10">
              R
            </div>
            <h3 className="font-bold text-2xl text-foreground mb-1">Rishvin Reddy</h3>
            <p className="text-muted-foreground text-sm mb-4">B.Tech Computer Science</p>
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              {["Blockchain", "IoT", "Cybersecurity", "Web Dev"].map(tag => (
                <span key={tag} className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-center gap-3">
              <a
                href="https://github.com/RishvinReddy"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full")}
              >
                <GithubIcon className="w-4 h-4 mr-2" /> GitHub
              </a>
              <a
                href="https://github.com/RishvinReddy/Prism-Transfer"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full")}
              >
                <ExternalLink className="w-4 h-4 mr-2" /> Project Repo
              </a>
            </div>
          </Card>
        </FadeUp>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* ── 11. Final CTA ────────────────────────────────── */}
      <section className="w-full max-w-5xl mx-auto px-4 py-24 text-center">
        <FadeUp>
          <div className="relative p-10 md:p-16 rounded-3xl border border-border/30 bg-card/30 backdrop-blur-md overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50%] h-[50%] bg-primary/10 blur-[80px] pointer-events-none" />

            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4 relative z-10">
              Ready to transfer files?
            </h2>
            <p className="text-muted-foreground text-lg mb-10 relative z-10">
              No setup. No account. Just open and start.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <Link
                href="/send"
                className={cn(buttonVariants({ size: "lg" }), "rounded-full font-bold px-10 h-14 shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] transition-all hover:scale-105")}
              >
                Send a File
              </Link>
              <Link
                href="/receive"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full font-bold px-10 h-14 border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all")}
              >
                Receive a File
              </Link>
            </div>
          </div>
        </FadeUp>
      </section>

    </div>
  );
}
