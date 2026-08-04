"use client";

import * as React from "react";
import Link from "next/link";
import { GithubIcon } from "./shared";

const NAV_LINKS = [
  { label: "Send", href: "/send" },
  { label: "Receive", href: "/receive" },
  { label: "About", href: "/about" },
  { label: "GitHub", href: "https://github.com/RishvinReddy/Prism-Transfer", external: true },
];

export function HomeFooter() {
  return (
    <footer className="w-full border-t border-border/30 bg-card/20 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-extrabold tracking-tight text-foreground">◈ PrismTransfer</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Offline file transfer using animated QR codes. No internet. No cloud. Just light.
            </p>
            <span className="inline-block text-xs text-muted-foreground/50 font-mono">v1.0 · MIT License</span>
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Navigate</h4>
            <ul className="space-y-2">
              {NAV_LINKS.map(link => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1"
                    >
                      <GithubIcon className="w-3.5 h-3.5" />
                      <span>{link.label}</span>
                    </a>
                  ) : (
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Project info */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Project</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Built by <span className="text-foreground font-medium">Rishvin Reddy</span></li>
              <li>B.Tech Computer Science</li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-xs font-medium">Active Development</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground/50 space-y-2 sm:space-y-0">
          <span>© 2025 PrismTransfer. Released under the MIT License.</span>
          <span>Made with precision — no internet required to use.</span>
        </div>
      </div>
    </footer>
  );
}
