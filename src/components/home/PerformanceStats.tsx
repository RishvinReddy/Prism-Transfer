"use client";

import * as React from "react";
import { motion, useInView } from "motion/react";
import { FadeUp, SectionLabel, SectionHeading } from "./shared";

const STATS = [
  { value: 0, suffix: "", label: "Servers", display: "0" },
  { value: 100, suffix: "%", label: "Offline", display: "100%" },
  { value: 256, suffix: "-bit", label: "SHA Integrity", display: "256-bit" },
  { value: 5, suffix: "+", label: "Platforms", display: "5+" },
];

function AnimatedCounter({ value, suffix, display }: { value: number; suffix: string; display: string }) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = React.useState(0);
  const startedRef = React.useRef(false);

  React.useEffect(() => {
    if (!inView || startedRef.current) return;
    startedRef.current = true;
    const duration = 1400;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {value === 0 ? display : value <= 10 ? `${count}${suffix}` : display}
    </span>
  );
}

export function PerformanceStats() {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-20">
      <FadeUp className="text-center mb-14">
        <SectionLabel>By the Numbers</SectionLabel>
        <SectionHeading>Built to be different</SectionHeading>
      </FadeUp>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {STATS.map((stat, i) => (
          <FadeUp key={stat.label} delay={i * 0.08}>
            <div className="flex flex-col items-center text-center p-8 rounded-2xl border border-border/30 bg-card/30 hover:bg-card/50 hover:border-primary/30 transition-all duration-300">
              <span className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-2">
                <AnimatedCounter {...stat} />
              </span>
              <span className="text-sm text-muted-foreground font-medium">{stat.label}</span>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}
