"use client";

import * as React from "react";
import Link from "next/link";
import { Info, Send, ScanLine, Settings, CheckCircle2, ShieldAlert } from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="w-full border-t border-border/30 bg-card/10 backdrop-blur-md">
      <div className="w-full max-w-6xl mx-auto px-6 py-12 md:py-16">
        
        {/* Footer Top: Multi-Column layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          
          {/* Column 1: Brand Info */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2 font-extrabold text-lg text-foreground hover:opacity-85 transition-opacity">
              <span>◈ PrismTransfer</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Optical file transfer using animated QR codes. No internet. No servers. Simply secure.
            </p>
            <div className="flex items-center space-x-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span>100% Client-Side Only</span>
            </div>
          </div>

          {/* Column 2: Product Actions */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/send" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <Send className="w-4 h-4" /> Send File
                </Link>
              </li>
              <li>
                <Link href="/receive" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <ScanLine className="w-4 h-4" /> Receive File
                </Link>
              </li>
              <li>
                <Link href="/settings" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors flex items-center gap-2">
                  <Info className="w-4 h-4" /> About & Privacy
                </Link>
              </li>
              <li>
                <a 
                  href="https://github.com/RishvinReddy/Prism-Transfer" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <GithubIcon className="w-4 h-4" /> GitHub Source
                </a>
              </li>
              <li>
                <Link href="/simulator" className="hover:text-foreground transition-colors flex items-center gap-2">
                  <span className="text-sm">⬢</span> Chunker Simulator
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Development */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Developer</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Built by <span className="text-foreground font-semibold">Rishvin Reddy</span></li>
              <li>B.Tech Computer Science</li>
              <li>
                <a 
                  href="https://github.com/RishvinReddy" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-foreground transition-colors inline-flex items-center gap-1.5"
                >
                  GitHub Profile ↗
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="pt-8 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground/60 gap-4">
          <div className="flex items-center space-x-4">
            <span>© 2025 PrismTransfer. MIT License.</span>
            <span className="hidden sm:inline text-border/40">|</span>
            <span className="hidden sm:inline">Version 1.0.0</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
            <span>All systems operational (Offline verification complete)</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
