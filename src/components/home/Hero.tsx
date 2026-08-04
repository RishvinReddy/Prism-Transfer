"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Send, ScanLine, UploadCloud, Shield, Check, Info } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { GithubIcon } from "./shared";
import { stageFile } from "@/lib/fileStager";
import { DataTransferIllustration } from "./DataTransferIllustration";

export function Hero() {
  const router = useRouter();
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    stageFile(file);
    router.push("/send");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <section className="relative w-full min-h-[92vh] flex flex-col items-center justify-center px-6 overflow-hidden py-12 md:py-20">
      {/* Large background gradient blobs */}
      <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[5%] w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Text & Actions */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-widest text-primary/80 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span>Air-Gapped Optical File Sharing</span>
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] max-w-2xl">
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
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed"
          >
            PrismTransfer securely moves files between devices using animated QR codes —
            no internet, no Bluetooth, no cables, and no cloud. Works completely client-side in your browser.
          </motion.p>

          {/* Main CTA Links */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center lg:justify-start gap-4"
          >
            <Link
              href="/send"
              className={cn(
                buttonVariants({ size: "lg" }),
                "rounded-full font-bold px-8 h-12 text-sm shadow-[0_0_30px_rgba(99,102,241,0.25)] hover:shadow-[0_0_40px_rgba(99,102,241,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all"
              )}
            >
              <Send className="w-4 h-4 mr-2" />
              Send File
            </Link>
            <Link
              href="/receive"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-full font-bold px-8 h-12 text-sm border-border/50 hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.02] transition-all"
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
                "rounded-full font-semibold px-6 h-12 text-sm text-muted-foreground hover:text-foreground transition-all"
              )}
            >
              <GithubIcon className="w-4 h-4 mr-2" />
              View Source
            </a>
          </motion.div>
        </div>

        {/* Right Column: Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="lg:col-span-5 w-full flex justify-center items-center"
        >
          <DataTransferIllustration />
        </motion.div>
      </div>

        {/* Grid of Micro-Modules / Interactive Cards */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-8 pt-8 border-t border-border/20"
        >
          {/* Card 1: Interactive Quick Send */}
          <Card
            className={cn(
              "flex flex-col justify-between p-6 bg-card/40 border border-border/30 rounded-2xl transition-all duration-300 hover:border-indigo-500/40 relative overflow-hidden group cursor-pointer",
              isDragging && "border-indigo-500 bg-indigo-500/5 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full">
                  Quick Action
                </span>
                <UploadCloud className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-foreground text-left">Drag & Drop to Send</h3>
                <p className="text-sm text-muted-foreground text-left leading-relaxed">
                  Drop any file directly here to begin packetizing and generate the QR stream instantly.
                </p>
              </div>
            </div>
            <div className="mt-6 border-2 border-dashed border-border/50 group-hover:border-indigo-500/40 rounded-xl p-4 transition-colors flex items-center justify-center">
              <span className="text-xs font-semibold text-muted-foreground group-hover:text-indigo-400 transition-colors">
                {isDragging ? "Drop your file here" : "Browse or Drop File"}
              </span>
            </div>
          </Card>

          {/* Card 2: Quick Receive Portal */}
          <Link href="/receive">
            <Card className="flex flex-col justify-between p-6 bg-card/40 border border-border/30 rounded-2xl hover:border-cyan-500/40 transition-all duration-300 relative overflow-hidden group h-full cursor-pointer">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full">
                    Receiver
                  </span>
                  <ScanLine className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-lg text-foreground text-left">Scan & Reassemble</h3>
                  <p className="text-sm text-muted-foreground text-left leading-relaxed">
                    Activate the receiver scanner viewport to read high-frequency QR streams.
                  </p>
                </div>
              </div>
              
              {/* Mock Viewfinder Scanner UI inside card */}
              <div className="mt-6 h-20 relative bg-black/30 rounded-xl overflow-hidden flex items-center justify-center border border-border/20 group-hover:border-cyan-500/20 transition-all">
                {/* corner brackets */}
                <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t border-l border-cyan-400/50 group-hover:border-cyan-400 transition-colors" />
                <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t border-r border-cyan-400/50 group-hover:border-cyan-400 transition-colors" />
                <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b border-l border-cyan-400/50 group-hover:border-cyan-400 transition-colors" />
                <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b border-r border-cyan-400/50 group-hover:border-cyan-400 transition-colors" />
                
                {/* animated scanner target line */}
                <div className="w-3/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-[pulse_2s_infinite]" />
                
                <span className="text-[10px] font-mono text-cyan-400/60 uppercase tracking-widest group-hover:text-cyan-400 transition-colors">
                  Open Scanner
                </span>
              </div>
            </Card>
          </Link>

          {/* Card 3: Trust Checkbox Sandbox Info */}
          <Card className="flex flex-col justify-between p-6 bg-card/40 border border-border/30 rounded-2xl transition-all duration-300 relative overflow-hidden group cursor-default h-full">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full">
                  Security Sandbox
                </span>
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-foreground text-left">Air-Gap Trust Model</h3>
                <p className="text-sm text-muted-foreground text-left leading-relaxed">
                  PrismTransfer operates completely sandboxed inside the client's browser layer.
                </p>
              </div>
            </div>
            
            {/* mini checkmark list */}
            <div className="mt-6 space-y-2 text-xs text-muted-foreground text-left">
              {[
                "100% Serverless file reassembly",
                "Zero telemetry or network logs",
                "SHA-256 integrity auto-checked"
              ].map((text) => (
                <div key={text} className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
    </section>
  );
}
