import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink, Code2, Shield, Globe, Cpu } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Portfolio — Rishvin Reddy | PrismTransfer Creator & Rishvin Labs Founder",
  description: "Engineering projects by Rishvin Reddy: PrismTransfer, ChainForensics, NetInspect, and more. B.Tech Computer Science student specializing in cybersecurity, IoT, and full-stack development.",
  alternates: {
    canonical: "/portfolio",
  },
  openGraph: {
    title: "Portfolio — Rishvin Reddy",
    description: "Engineering projects by Rishvin Reddy, creator of PrismTransfer and founder of Rishvin Labs.",
    url: "https://prismtransfer-rishvinreddy.vercel.app/portfolio",
  },
};

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

const projects = [
  {
    name: "PrismTransfer",
    tagline: "Offline file transfer via animated QR codes",
    description:
      "A browser-based, fully serverless file transfer platform. Compresses files locally, encodes them into a high-frequency animated QR code stream, and reconstructs them on the receiving device's camera — with zero network connectivity required.",
    tags: ["Next.js", "TypeScript", "fflate", "jsQR", "IndexedDB", "PWA"],
    category: "Featured",
    featured: true,
    github: "https://github.com/RishvinReddy/Prism-Transfer",
    demo: "https://prismtransfer-rishvinreddy.vercel.app",
    color: "from-indigo-500/20 to-cyan-500/10",
    border: "border-indigo-500/30",
  },
  {
    name: "ChainForensics",
    tagline: "Blockchain transaction forensics tool",
    description:
      "A forensics and analytics tool for tracing blockchain transactions, wallet clustering, and identifying suspicious on-chain patterns. Designed for cybersecurity researchers and digital forensics professionals.",
    tags: ["Blockchain", "Python", "Digital Forensics", "Cybersecurity", "Web3"],
    category: "Cybersecurity",
    featured: false,
    github: "https://github.com/RishvinReddy",
    demo: null,
    color: "from-amber-500/10 to-orange-500/5",
    border: "border-amber-500/20",
  },
  {
    name: "NetInspect",
    tagline: "Real-time network traffic inspector",
    description:
      "A lightweight network packet inspection and analysis tool built for network security monitoring and intrusion detection. Supports protocol-level analysis and visual traffic graphs.",
    tags: ["Python", "Scapy", "React", "Network Security", "IoT"],
    category: "IoT & Networks",
    featured: false,
    github: "https://github.com/RishvinReddy",
    demo: null,
    color: "from-emerald-500/10 to-teal-500/5",
    border: "border-emerald-500/20",
  },
  {
    name: "Rishvin Labs",
    tagline: "Privacy-first engineering studio",
    description:
      "An independent software engineering studio focused on building privacy-first, open-source developer tools. PrismTransfer is the flagship project. More tools in development.",
    tags: ["Open Source", "Privacy Engineering", "Browser Tools", "PWA"],
    category: "Studio",
    featured: false,
    github: "https://github.com/RishvinReddy",
    demo: "https://rishvinreddy.vercel.app",
    color: "from-violet-500/10 to-purple-500/5",
    border: "border-violet-500/20",
  },
];

export default function PortfolioPage() {
  const breadcrumbItems = [
    { name: "Home", item: "https://prismtransfer-rishvinreddy.vercel.app" },
    { name: "Portfolio", item: "https://prismtransfer-rishvinreddy.vercel.app/portfolio" },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-12">
      <JsonLd type="BreadcrumbList" data={{ items: breadcrumbItems }} />

      {/* Inline Person+WebSite schema for this page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Portfolio — Rishvin Reddy",
            "description": "Engineering projects by Rishvin Reddy, creator of PrismTransfer and founder of Rishvin Labs.",
            "url": "https://prismtransfer-rishvinreddy.vercel.app/portfolio",
            "author": {
              "@type": "Person",
              "name": "Rishvin Reddy",
              "url": "https://rishvinreddy.vercel.app",
            },
          }),
        }}
      />

      {/* Header */}
      <div className="space-y-6">
        <Link href="/author/rishvin-reddy" className="inline-flex items-center space-x-2 text-sm text-indigo-400 hover:text-indigo-300">
          <ArrowLeft className="w-4 h-4" />
          <span>About Rishvin Reddy</span>
        </Link>

        <div className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full inline-block">
            Engineering Projects
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Portfolio
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl leading-relaxed">
            Privacy-first, open-source tools built by{" "}
            <Link href="/author/rishvin-reddy" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Rishvin Reddy
            </Link>{" "}
            under{" "}
            <a href="https://rishvinreddy.vercel.app" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Rishvin Labs
            </a>
            .
          </p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project, idx) => (
          <div
            key={project.name}
            className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br ${project.color} ${project.border} backdrop-blur-md p-6 md:p-8 flex flex-col justify-between space-y-6 group transition-all duration-300 hover:shadow-[0_0_40px_rgba(99,102,241,0.08)]`}
          >
            {project.featured && (
              <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                Featured
              </span>
            )}

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  {project.category}
                </span>
                <h2 className="text-2xl font-extrabold text-foreground">{project.name}</h2>
                <p className="text-sm font-medium text-indigo-300">{project.tagline}</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span key={tag} className="text-[10px] px-2.5 py-1 rounded-full bg-zinc-900/60 text-zinc-400 border border-zinc-800/60 font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-foreground transition-colors border border-zinc-800/60 hover:border-zinc-600 px-3 py-2 rounded-xl bg-zinc-950/30"
              >
                <GithubIcon className="w-3.5 h-3.5" /> GitHub
              </a>
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors border border-indigo-500/30 hover:border-indigo-500/60 px-3 py-2 rounded-xl bg-indigo-500/5"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Author CTA */}
      <div className="bg-card/25 border border-border/20 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <p className="font-bold text-foreground">More about the builder</p>
          <p className="text-xs text-muted-foreground">Engineering philosophy, skills, education, and open-source contributions.</p>
        </div>
        <Link href="/author/rishvin-reddy">
          <Button className="rounded-xl font-bold h-10 px-5 bg-indigo-600 hover:bg-indigo-500 text-white">
            View Author Page <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
