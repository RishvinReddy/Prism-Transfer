"use client";

import Image from "next/image";

import * as React from "react";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import { ArrowRight, ExternalLink, Code2, Shield, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const expertiseTags = [
  { label: "Cybersecurity", icon: Shield },
  { label: "Blockchain", icon: Cpu },
  { label: "IoT", icon: Cpu },
  { label: "Full Stack", icon: Code2 },
  { label: "Next.js", icon: Code2 },
  { label: "TypeScript", icon: Code2 },
];

export function BuiltBy() {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="w-full max-w-5xl mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        {/* Divider label */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground/60 whitespace-nowrap">
            Built by
          </span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-border/50 to-transparent" />
        </div>

        {/* Card */}
        <div className="relative overflow-hidden rounded-3xl border border-border/30 bg-card/30 backdrop-blur-md p-8 md:p-10">
          {/* Background glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-cyan-500/5 rounded-full blur-[60px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">

            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="relative w-20 h-20 md:w-24 md:h-24">
                <div className="w-full h-full rounded-2xl overflow-hidden ring-2 ring-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.25)]">
                  <Image
                    src="/rishvin-reddy.png"
                    alt="Rishvin Reddy — Creator of PrismTransfer"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover object-top"
                    priority
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-background shadow-sm" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                  Rishvin Reddy
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  B.Tech Computer Science · Woxsen University · Founder,{" "}
                  <a
                    href="https://rishvinreddy.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Rishvin Labs
                  </a>
                </p>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                Software engineer specialising in cybersecurity, IoT, blockchain, and full-stack web development.
                Creator of PrismTransfer — a browser-based offline file transfer platform using animated QR codes.
                Building privacy-first, open-source tools under{" "}
                <a
                  href="https://rishvinreddy.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Rishvin Labs
                </a>
                .
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {expertiseTags.map(({ label }) => (
                  <span
                    key={label}
                    className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium"
                  >
                    {label}
                  </span>
                ))}
              </div>

              {/* Links */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href="https://rishvinreddy.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors group"
                >
                  View Portfolio
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </a>
                <span className="text-border/50">·</span>
                <a
                  href="https://github.com/RishvinReddy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                  GitHub
                </a>
                <span className="text-border/50">·</span>
                <a
                  href="https://linkedin.com/in/rishvinreddy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LinkedInIcon className="w-3.5 h-3.5" />
                  LinkedIn
                </a>
                <span className="text-border/50">·</span>
                <Link
                  href="/portfolio"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  More Projects
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
