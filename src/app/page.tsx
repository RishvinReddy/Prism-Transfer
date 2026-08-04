"use client";

import * as React from "react";
import Link from "next/link";
import { motion, Variants } from "motion/react";
import { ArrowRight, QrCode, Shield, Smartphone, Zap, Book, Cpu } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FADE_UP_ANIMATION_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", damping: 20, stiffness: 100 } },
};

const STAGGER_CHILD_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", damping: 20, stiffness: 100 } },
};

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center overflow-hidden">
      
      {/* Subtle Background Gradients */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#6366f1_100%)] dark:[background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#6366f1_100%)] opacity-20 pointer-events-none" />

      {/* Hero Section */}
      <motion.div 
        initial="hidden"
        animate="show"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.15,
            },
          },
        }}
        className="flex flex-col items-center justify-center space-y-8 pt-20 pb-16 md:pt-32 md:pb-24 text-center max-w-4xl mx-auto px-4"
      >
        <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="space-y-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground">
            Transfer files using nothing
            <br />
            but a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">camera.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-[42rem] mx-auto leading-relaxed pt-2">
            Offline. Private. Cross-platform.
          </p>
        </motion.div>

        <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6 w-full">
          <Link 
            href="/send" 
            className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto rounded-full font-semibold px-8 h-12 shadow-[0_0_20px_-3px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_0px_rgba(99,102,241,0.6)] transition-all")}
          >
            Send File
          </Link>
          <Link 
            href="/receive" 
            className="group flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Receive on another device
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
        
        {/* Abstract Hero Animation */}
        <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="pt-16 w-full max-w-lg mx-auto">
          <div className="relative flex items-center justify-between p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-md shadow-2xl">
            <Smartphone className="w-12 h-12 text-muted-foreground" />
            
            <div className="flex-1 flex flex-col items-center px-4">
              <motion.div 
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="w-16 h-16 rounded-lg border-2 border-primary border-dashed flex items-center justify-center bg-primary/10"
              >
                <QrCode className="w-8 h-8 text-primary" />
              </motion.div>
              <div className="flex items-center space-x-1 mt-3">
                <motion.div 
                  className="h-1 bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100px" }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
              </div>
            </div>

            <Smartphone className="w-12 h-12 text-primary" />
          </div>
        </motion.div>

      </motion.div>

      {/* Feature Cards */}
      <motion.div 
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          hidden: {},
          show: {
            transition: { staggerChildren: 0.1 },
          },
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full px-4 mt-8 pb-20"
      >
        {[
          { icon: Zap, title: "No Internet Required", desc: "Completely offline. Send files anywhere, even in a dead zone." },
          { icon: Shield, title: "End-to-End Privacy", desc: "Your data never leaves your devices or touches a server." },
          { icon: Smartphone, title: "Cross Platform", desc: "Works seamlessly on any device with a modern browser." },
          { icon: QrCode, title: "Fast Optical Transfer", desc: "Data is encoded into high-density QR streams instantly." },
        ].map((feature, i) => (
          <motion.div 
            key={i} 
            variants={STAGGER_CHILD_VARIANTS}
            className="flex flex-col p-6 rounded-2xl border border-border/40 bg-card/40 hover:bg-card/60 transition-colors backdrop-blur-sm"
          >
            <feature.icon className="h-6 w-6 text-primary mb-4" />
            <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* How It Works */}
      <div className="w-full max-w-4xl px-4 py-20 border-t border-border/40">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">How It Works</h2>
          <p className="text-muted-foreground">Four simple steps to optical data transfer.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { num: "01", title: "Select", desc: "Choose a file to send from your device." },
            { num: "02", title: "Generate", desc: "File is sliced into animated QR codes." },
            { num: "03", title: "Scan", desc: "Scan the stream with the receiving device." },
            { num: "04", title: "Download", desc: "File reconstructs and downloads instantly." },
          ].map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center relative group">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-mono font-bold text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {step.num}
              </div>
              <h3 className="font-medium text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
              {i < 3 && <div className="hidden md:block absolute top-6 left-[60%] w-full h-[1px] bg-border/50" />}
            </div>
          ))}
        </div>
      </div>

      {/* Live Stats / Attributes */}
      <div className="w-full px-4 py-16 border-t border-border/40 bg-card/20 backdrop-blur-sm">
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-sm font-medium text-muted-foreground max-w-4xl mx-auto">
          <div className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-primary" /> Fully Offline</div>
          <div className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-primary" /> Browser-Based</div>
          <div className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-primary" /> No Installation Required</div>
          <div className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-primary" /> Open Source</div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-border/40 mt-auto">
        <div className="container flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground max-w-5xl px-4">
          <div className="flex space-x-4 mb-4 md:mb-0">
            <span className="flex items-center"><Cpu className="w-3 h-3 mr-1"/> PrismTransfer v1.0.0</span>
            <span>MIT License</span>
            <span>Built by Rishvin Reddy</span>
          </div>
          <div className="flex space-x-6">
            <Link href="https://github.com/RishvinReddy/Prism-Transfer" target="_blank" className="flex items-center hover:text-foreground transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 mr-1"
              >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
              GitHub
            </Link>
            <Link href="/about" className="flex items-center hover:text-foreground transition-colors">
              <Book className="w-4 h-4 mr-1" /> Documentation
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

// Simple internal icon for CheckCircle2
function CheckCircle2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
