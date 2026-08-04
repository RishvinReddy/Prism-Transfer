"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { FadeUp, SectionLabel, SectionHeading } from "./shared";

const FAQS = [
  { q: "Does PrismTransfer require internet?", a: "No. It works 100% offline. The app is a static PWA — no network connection is needed at any point during file transfer." },
  { q: "Is Bluetooth or Wi-Fi required?", a: "No. The only physical requirement is a screen on the sending device and a camera on the receiving device." },
  { q: "Can I transfer between Android and iPhone?", a: "Yes. Because PrismTransfer runs in any modern browser, it works across all platforms and operating systems without any compatibility issues." },
  { q: "Are my files uploaded anywhere?", a: "Never. All processing happens inside your browser. Files are not sent to any server — they travel optically from screen to camera." },
  { q: "How secure is the transfer?", a: "Every packet is validated with CRC32 and the complete file is verified with SHA-256. There are no third-party servers involved, so there is nothing to intercept." },
  { q: "Is it open source?", a: "Yes. The full source code is available on GitHub under the MIT License. You are welcome to inspect, fork, and contribute." },
  { q: "What browsers are supported?", a: "Any modern browser with Camera API support: Chrome, Safari, Firefox, and Edge on both desktop and mobile." },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="border-b border-border/30 last:border-0" onClick={() => setOpen(o => !o)}>
      <button className="flex items-center justify-between w-full py-5 text-left group">
        <span className="font-medium text-foreground group-hover:text-primary transition-colors pr-4">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="text-sm text-muted-foreground pb-5 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  return (
    <section className="w-full max-w-3xl mx-auto px-4 py-20">
      <FadeUp className="text-center mb-12">
        <SectionLabel>FAQ</SectionLabel>
        <SectionHeading>Common questions</SectionHeading>
      </FadeUp>
      <FadeUp delay={0.1}>
        <div className="rounded-2xl border border-border/30 bg-card/40 divide-y divide-border/30 px-4 md:px-8">
          {FAQS.map(f => <FAQItem key={f.q} {...f} />)}
        </div>
      </FadeUp>
    </section>
  );
}
