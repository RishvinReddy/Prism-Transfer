"use client";

import * as React from "react";
import Link from "next/link";
import { Send, ScanLine } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FadeUp } from "./shared";

export function CTA() {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-16 pb-24">
      <FadeUp>
        <div className="relative text-center p-12 md:p-20 rounded-3xl border border-border/30 bg-card/30 backdrop-blur-md overflow-hidden">
          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[60%] bg-primary/10 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 right-[20%] w-[30%] h-[40%] bg-cyan-500/6 blur-[80px] pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-4">
              Ready to transfer files?
            </h2>
            <p className="text-muted-foreground text-lg mb-12 max-w-md mx-auto">
              No setup. No account. No internet. Just open and start.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/send"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "rounded-full font-bold px-10 h-14 text-base shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_50px_rgba(99,102,241,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                )}
              >
                <Send className="w-5 h-5 mr-2" /> Send a File
              </Link>
              <Link
                href="/receive"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-full font-bold px-10 h-14 text-base border-border/50 hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.02] transition-all"
                )}
              >
                <ScanLine className="w-5 h-5 mr-2" /> Receive a File
              </Link>
            </div>
          </div>
        </div>
      </FadeUp>
    </section>
  );
}
