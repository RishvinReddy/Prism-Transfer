"use client";

import { motion, AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";
import { useSettings } from "@/contexts/settings";
import * as React from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // `useSettings` will throw if outside provider. 
  // In Next.js App Router, `template.tsx` sits *inside* `layout.tsx` so it IS inside SettingsProvider.
  return (
    <TransitionWrapper pathname={pathname}>
      {children}
    </TransitionWrapper>
  );
}

function TransitionWrapper({ children, pathname }: { children: React.ReactNode, pathname: string }) {
  // It's possible for this to run on the server before settings load, or throw if something is weird.
  let reducedMotion = false;
  try {
    const { settings } = useSettings();
    reducedMotion = settings?.reducedMotion || false;
  } catch (e) {
    // Silently fallback if context is missing on server
  }

  const shouldAnimate = !reducedMotion;

  if (!shouldAnimate) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
