"use client";

import * as React from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2 group transition-opacity hover:opacity-80", className)}
    >
      <div className="flex items-center justify-center text-primary">
        <span className="text-2xl leading-none font-sans select-none">◈</span>
      </div>
      <span className="font-bold text-xl tracking-tight text-foreground">
        PrismTransfer
      </span>
    </Link>
  );
}
