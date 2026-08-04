"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { FadeUp, SectionLabel, SectionHeading } from "./shared";

const CHECKS = [
  "Offline by Default — zero network calls",
  "No Accounts — no identity tied to a transfer",
  "Files never leave your devices",
  "Local-only browser processing",
  "SHA-256 end-to-end integrity verification",
  "CRC32 per-packet validation",
  "Open source — inspect every byte",
  "Browser sandbox isolation",
];

export function SecuritySection() {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <FadeUp>
          <SectionLabel>Security & Privacy</SectionLabel>
          <SectionHeading className="mb-4">
            Secure by design,<br />not by promise.
          </SectionHeading>
          <p className="text-muted-foreground leading-relaxed text-base">
            PrismTransfer has no servers to breach, no accounts to compromise,
            and no data to leak. The only path your file travels is from one screen
            to one camera. That's the entire attack surface.
          </p>
          <div className="mt-6 inline-flex items-center space-x-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400 font-medium">Verified offline operation</span>
          </div>
        </FadeUp>
        <FadeUp delay={0.1}>
          <div className="grid grid-cols-1 gap-3">
            {CHECKS.map((item, i) => (
              <div
                key={i}
                className="flex items-start space-x-3 p-4 rounded-xl bg-card/40 border border-border/30 hover:border-green-500/20 hover:bg-green-500/5 transition-all duration-300"
              >
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
