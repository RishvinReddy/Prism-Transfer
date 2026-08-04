"use client";

import * as React from "react";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { FadeUp, SectionLabel, SectionHeading } from "./shared";

type CellVal = boolean | "partial";
interface Row { feature: string; prism: CellVal; bt: CellVal; airdrop: CellVal; cloud: CellVal; }
const ROWS: Row[] = [
  { feature: "No Internet Required", prism: true, bt: true, airdrop: true, cloud: false },
  { feature: "Cross-Platform", prism: true, bt: "partial", airdrop: false, cloud: true },
  { feature: "Browser-Based", prism: true, bt: false, airdrop: false, cloud: true },
  { feature: "No Installation", prism: true, bt: false, airdrop: false, cloud: "partial" },
  { feature: "No Cloud Storage", prism: true, bt: true, airdrop: true, cloud: false },
  { feature: "Open Source", prism: true, bt: false, airdrop: false, cloud: false },
  { feature: "Works Offline", prism: true, bt: true, airdrop: true, cloud: false },
];

function Cell({ val }: { val: boolean | "partial" }) {
  if (val === true) return <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />;
  if (val === "partial") return <AlertCircle className="w-5 h-5 text-amber-400 mx-auto" />;
  return <XCircle className="w-5 h-5 text-zinc-600 mx-auto" />;
}

export function ComparisonTable() {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-20">
      <FadeUp className="text-center mb-14">
        <SectionLabel>Comparison</SectionLabel>
        <SectionHeading>How we stack up</SectionHeading>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          No other free tool is fully offline, cross-platform, and browser-native at the same time.
        </p>
      </FadeUp>
      <FadeUp delay={0.1}>
        <div className="overflow-x-auto rounded-2xl border border-border/30">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-card/60">
                <th className="text-left p-4 pl-6 font-semibold text-muted-foreground">Feature</th>
                <th className="text-center p-4 font-bold text-primary">PrismTransfer</th>
                <th className="text-center p-4 font-semibold text-muted-foreground">Bluetooth</th>
                <th className="text-center p-4 font-semibold text-muted-foreground">AirDrop</th>
                <th className="text-center p-4 font-semibold text-muted-foreground">Cloud Drive</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr
                  key={row.feature}
                  className={`border-b border-border/20 last:border-0 transition-colors hover:bg-card/30 ${i % 2 === 0 ? "bg-card/10" : ""}`}
                >
                  <td className="p-4 pl-6 text-foreground font-medium">{row.feature}</td>
                  <td className="p-4 text-center bg-primary/5"><Cell val={row.prism} /></td>
                  <td className="p-4 text-center"><Cell val={row.bt} /></td>
                  <td className="p-4 text-center"><Cell val={row.airdrop} /></td>
                  <td className="p-4 text-center"><Cell val={row.cloud} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground/60 mt-3 text-center">
          ⚠️ = Partial support · ✕ = Not supported
        </p>
      </FadeUp>
    </section>
  );
}
