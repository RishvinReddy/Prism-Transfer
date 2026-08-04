"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Send, ScanLine } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GithubIcon } from "./shared";

export function Hero() {
  return (
    <section className="relative w-full min-h-[92vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Large background gradient blobs */}
      <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] bg-indigo-500/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[5%] w-[400px] h-[400px] bg-cyan-500/6 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-widest text-primary/80 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span>Open Source · Privacy First · Offline</span>
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05]">
            <span className="text-foreground">Transfer Files</span>
            <br />
            <span className="text-foreground">Using Nothing</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400">
              but a Camera.
            </span>
          </h1>
        </motion.div>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          PrismTransfer moves files between devices using animated QR codes —
          no internet, no Bluetooth, no cables, and no cloud. Works in your browser.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/send"
            className={cn(
              buttonVariants({ size: "lg" }),
              "rounded-full font-bold px-8 h-14 text-base shadow-[0_0_30px_rgba(99,102,241,0.35)] hover:shadow-[0_0_40px_rgba(99,102,241,0.55)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            )}
          >
            <Send className="w-4 h-4 mr-2" />
            Send File
          </Link>
          <Link
            href="/receive"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "rounded-full font-bold px-8 h-14 text-base border-border/50 hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.02] transition-all"
            )}
          >
            <ScanLine className="w-4 h-4 mr-2" />
            Receive File
          </Link>
          <a
            href="https://github.com/RishvinReddy/Prism-Transfer"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              "rounded-full font-semibold px-8 h-14 text-base text-muted-foreground hover:text-foreground transition-all"
            )}
          >
            <GithubIcon className="w-4 h-4 mr-2" />
            View Source
          </a>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="flex flex-col items-center space-y-2 pt-4 text-muted-foreground/40"
        >
          <span className="text-xs tracking-widest uppercase">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          >
            <ArrowRight className="w-4 h-4 rotate-90" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
