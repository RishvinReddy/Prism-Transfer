"use client";

import * as React from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2 group", className)}
    >
      <div className="relative flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden shadow-lg border border-border/50">
        <img src="/logo.png" alt="PrismTransfer Logo" className="w-full h-full object-cover relative z-10" />
      </div>
      <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
        Prism<span className="text-primary font-extrabold">Transfer</span>
      </span>
    </Link>
  );
}
