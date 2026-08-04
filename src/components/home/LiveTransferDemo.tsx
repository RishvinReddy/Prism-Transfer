"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Laptop, QrCode, Camera, Smartphone } from "lucide-react";
import { FadeUp } from "./shared";

const STEPS = [
  { icon: Laptop, label: "Sender", color: "#6366f1" },
  { icon: QrCode, label: "QR Stream", color: "#8b5cf6" },
  { icon: Camera, label: "Scanner", color: "#06b6d4" },
  { icon: Smartphone, label: "Receiver", color: "#22c55e" },
];

function FlowDot({ active }: { active: boolean }) {
  return (
    <motion.div
      className="w-2 h-2 rounded-full flex-shrink-0"
      animate={{
        scale: active ? [1, 1.4, 1] : 1,
        opacity: active ? 1 : 0.25,
        backgroundColor: active ? "#6366f1" : "#27272a",
      }}
      transition={{ duration: 0.4 }}
    />
  );
}

export function LiveTransferDemo() {
  const [active, setActive] = React.useState(0);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActive(prev => {
        const next = (prev + 1) % STEPS.length;
        setProgress(0);
        return next;
      });
    }, 1100);
    return () => clearInterval(interval);
  }, []);

  // Progress within current step
  React.useEffect(() => {
    setProgress(0);
    const t = setInterval(() => setProgress(p => Math.min(p + 3, 100)), 30);
    return () => clearInterval(t);
  }, [active]);

  return (
    <FadeUp className="w-full max-w-5xl mx-auto px-4 mb-4">
      <div className="relative rounded-3xl border border-border/30 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden p-8 md:p-12">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-primary/8 blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center space-y-8">
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">Live Transfer Demo</p>
            <p className="text-muted-foreground text-sm max-w-sm">
              Watch data flow optically from one device to another — no network required.
            </p>
          </div>

          {/* Flow diagram */}
          <div className="flex items-center justify-center space-x-3 md:space-x-6 w-full max-w-lg mx-auto">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = i === active;
              const isPast = i < active;
              return (
                <React.Fragment key={step.label}>
                  <motion.div
                    className="flex flex-col items-center space-y-3"
                    animate={{ scale: isActive ? 1.12 : 1, opacity: isActive ? 1 : isPast ? 0.55 : 0.3 }}
                    transition={{ duration: 0.35 }}
                  >
                    <div
                      className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center border transition-all duration-300"
                      style={{
                        background: isActive ? `${step.color}20` : "rgba(255,255,255,0.03)",
                        borderColor: isActive ? `${step.color}60` : "rgba(255,255,255,0.08)",
                        boxShadow: isActive ? `0 0 24px ${step.color}40` : "none",
                      }}
                    >
                      <Icon
                        className="w-6 h-6 md:w-7 md:h-7 transition-colors duration-300"
                        style={{ color: isActive ? step.color : "#52525b" }}
                      />
                    </div>
                    <span
                      className="text-xs font-medium transition-colors duration-300"
                      style={{ color: isActive ? step.color : "#52525b" }}
                    >
                      {step.label}
                    </span>
                  </motion.div>

                  {i < STEPS.length - 1 && (
                    <div className="flex-1 flex items-center justify-center space-x-1 max-w-[48px]">
                      {[0, 1, 2].map(dot => (
                        <FlowDot key={dot} active={i < active || (i === active - 1 && progress > dot * 33)} />
                      ))}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Current step label */}
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="text-center"
          >
            <span className="text-sm font-semibold text-foreground">{STEPS[active].label}</span>
            <div className="w-40 h-1 bg-muted/40 rounded-full mt-2 overflow-hidden mx-auto">
              <motion.div
                className="h-full rounded-full"
                style={{ background: STEPS[active].color, width: `${progress}%` }}
                transition={{ duration: 0.03 }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </FadeUp>
  );
}
