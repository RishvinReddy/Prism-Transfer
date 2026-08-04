import * as React from "react";
import Image from "next/image";
import { Metadata } from "next";
import Link from "next/link";
import {
  Shield, Code2, Cpu, Globe, BookOpen, FlaskConical,
  ExternalLink, ArrowRight, CheckCircle2, GraduationCap,
  Layers, Lock, Wifi, Braces,
} from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card } from "@/components/ui/card";

const CANONICAL = "https://prismtransfer-rishvinreddy.vercel.app";

export const metadata: Metadata = {
  title: "Rishvin Reddy — Creator of PrismTransfer & Founder of Rishvin Labs",
  description:
    "Rishvin Reddy (Erolla Rishvin Reddy) is a B.Tech Computer Science student at Woxsen University, specializing in cybersecurity, IoT, blockchain, and full-stack development. Creator of PrismTransfer and founder of Rishvin Labs.",
  alternates: {
    canonical: "/author/rishvin-reddy",
  },
  authors: [{ name: "Rishvin Reddy", url: "https://rishvinreddy.vercel.app" }],
  creator: "Rishvin Reddy",
  openGraph: {
    type: "profile",
    title: "Rishvin Reddy — Creator of PrismTransfer & Founder of Rishvin Labs",
    description:
      "B.Tech Computer Science student specializing in cybersecurity, IoT, blockchain, and full-stack development. Creator of PrismTransfer — offline file transfer via animated QR codes.",
    url: `${CANONICAL}/author/rishvin-reddy`,
    siteName: "PrismTransfer",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Rishvin Reddy — Creator of PrismTransfer",
      },
    ],
    firstName: "Rishvin",
    lastName: "Reddy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rishvin Reddy — Creator of PrismTransfer",
    description:
      "B.Tech CS student. Creator of PrismTransfer. Founder of Rishvin Labs. Building privacy-first, open-source browser tools.",
    creator: "@RishvinReddy",
    images: ["/logo.png"],
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

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const knowsAbout = [
  "Cybersecurity",
  "Full-Stack Development",
  "Next.js",
  "React",
  "TypeScript",
  "Node.js",
  "IoT",
  "Blockchain",
  "Digital Forensics",
  "QR Code Technologies",
  "Offline File Transfer",
  "Progressive Web Apps",
  "Privacy Engineering",
  "Computer Networks",
  "Software Engineering",
];

const skillGroups = [
  { label: "Languages", icon: Braces, items: ["TypeScript", "Python", "JavaScript", "C", "Solidity"] },
  { label: "Frontend", icon: Layers, items: ["Next.js", "React", "Tailwind CSS", "Framer Motion", "shadcn/ui"] },
  { label: "Security", icon: Shield, items: ["Cybersecurity", "Digital Forensics", "Cryptography", "CRC32/SHA-256", "Air-Gap Protocols"] },
  { label: "Emerging Tech", icon: Cpu, items: ["Blockchain", "IoT", "Smart Contracts", "Solidity", "IPFS"] },
];

const openSourceContributions = [
  {
    name: "PrismTransfer",
    role: "Creator & Maintainer",
    desc: "Browser-based optical file transfer via animated QR codes. Zero network, zero cloud, cryptographic integrity.",
    github: "https://github.com/RishvinReddy/Prism-Transfer",
    demo: `${CANONICAL}`,
    stars: "Open Source",
  },
];

const engineeringPrinciples = [
  { icon: Lock, title: "Privacy by Default", desc: "Build systems where privacy is the starting point, not a feature." },
  { icon: Wifi, title: "Offline First", desc: "Software should degrade gracefully and work without internet connectivity." },
  { icon: Globe, title: "Zero Vendor Lock-in", desc: "Tools built on open standards, no proprietary APIs or mandatory accounts." },
  { icon: FlaskConical, title: "Research-Driven", desc: "Ground every architectural decision in protocol research, not convention." },
];

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${CANONICAL}/author/rishvin-reddy#person`,
  "name": "Rishvin Reddy",
  "alternateName": "Erolla Rishvin Reddy",
  "description":
    "Rishvin Reddy is a software engineer and founder of Rishvin Labs, specializing in cybersecurity, full-stack web development, IoT systems, blockchain applications, and privacy-focused browser technologies. Creator of PrismTransfer, an offline file transfer platform using animated QR codes.",
  "url": "https://rishvinreddy.vercel.app",
  "image": `${CANONICAL}/rishvin-reddy.png`,
  "email": "",
  "jobTitle": "Software Engineer & Founder",
  "worksFor": {
    "@type": "Organization",
    "name": "Rishvin Labs",
    "url": "https://rishvinreddy.vercel.app",
  },
  "alumniOf": {
    "@type": "CollegeOrUniversity",
    "name": "Woxsen University",
    "url": "https://woxsen.edu.in",
  },
  "nationality": {
    "@type": "Country",
    "name": "India",
  },
  "hasCredential": {
    "@type": "EducationalOccupationalCredential",
    "credentialCategory": "degree",
    "name": "B.Tech Computer Science",
    "recognizedBy": {
      "@type": "CollegeOrUniversity",
      "name": "Woxsen University",
    },
  },
  "knowsAbout": knowsAbout,
  "sameAs": [
    "https://github.com/RishvinReddy",
    "https://rishvinreddy.vercel.app",
    "https://linkedin.com/in/rishvinreddy",
  ],
  "founder": [
    {
      "@type": "Organization",
      "name": "Rishvin Labs",
      "url": "https://rishvinreddy.vercel.app",
      "description": "Privacy-first engineering studio building open-source developer tools.",
    },
  ],
  "creator": [
    {
      "@type": "SoftwareApplication",
      "name": "PrismTransfer",
      "url": `${CANONICAL}`,
      "description": "Offline file transfer using animated QR codes.",
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "Any (Browser-based)",
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": CANONICAL },
    { "@type": "ListItem", "position": 2, "name": "Rishvin Reddy", "item": `${CANONICAL}/author/rishvin-reddy` },
  ],
};

export default function AuthorPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-16">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground/60" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-foreground transition-colors">PrismTransfer</Link>
          <span>/</span>
          <span className="text-muted-foreground">Rishvin Reddy</span>
        </nav>

        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-card/30 to-cyan-500/5 backdrop-blur-md p-8 md:p-12">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-cyan-500/8 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-start gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="relative w-24 h-24 md:w-32 md:h-32">
                <div className="w-full h-full rounded-2xl overflow-hidden ring-2 ring-indigo-500/40 shadow-[0_0_60px_rgba(99,102,241,0.35)]">
                  <Image
                    src="/rishvin-reddy.png"
                    alt="Rishvin Reddy — Creator of PrismTransfer and Founder of Rishvin Labs"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover object-top"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">Rishvin Reddy</h1>
                  <span className="text-xs text-muted-foreground/50 font-mono">(Erolla Rishvin Reddy)</span>
                </div>
                <p className="text-indigo-300 font-semibold">
                  Software Engineer · Founder of Rishvin Labs · Creator of PrismTransfer
                </p>
              </div>

              <p className="text-sm text-muted-foreground leading-loose max-w-2xl">
                B.Tech Computer Science student at Woxsen University, specializing in cybersecurity, IoT systems,
                blockchain applications, and full-stack web development. I build privacy-first, open-source tools
                designed to work without centralized infrastructure.
              </p>

              <p className="text-sm text-muted-foreground leading-loose max-w-2xl">
                PrismTransfer is my flagship project — a browser-based optical file transfer system that lets any
                two devices exchange files using nothing but a screen and a camera. No internet. No cloud.
                No accounts. Just photons.
              </p>

              {/* Links */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="https://rishvinreddy.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer me"
                  className="inline-flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <Globe className="w-4 h-4" /> Portfolio
                </a>
                <a
                  href="https://github.com/RishvinReddy"
                  target="_blank"
                  rel="noopener noreferrer me"
                  className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <GithubIcon className="w-4 h-4" /> GitHub
                </a>
                <a
                  href="https://linkedin.com/in/rishvinreddy"
                  target="_blank"
                  rel="noopener noreferrer me"
                  className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LinkedInIcon className="w-4 h-4" /> LinkedIn
                </a>
                <Link
                  href="/portfolio"
                  className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="w-4 h-4" /> All Projects
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why I Built PrismTransfer ──────────────────────── */}
      <section className="space-y-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full inline-block mb-3">
            The Story
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">Why I Built PrismTransfer</h2>
        </div>

        <div className="rounded-2xl border border-border/30 bg-card/30 p-6 md:p-8 space-y-4 text-sm text-muted-foreground leading-loose">
          <p>
            The idea came from a frustrating real-world problem: transferring a file between an iPhone and a Windows
            PC in a location with no internet and no shared network. AirDrop doesn't cross ecosystems. Bluetooth
            file transfer is a reliability nightmare. USB cables weren't available. Every cloud-based solution
            required both an internet connection and an account.
          </p>
          <p>
            I started thinking about what's universally available across every modern device: a screen and a camera.
            Every phone, every laptop, every tablet has both. The question became — can I encode enough data into
            a visual signal to transfer a meaningful file?
          </p>
          <p>
            QR codes are dense. DEFLATE compression is aggressive. And cameras are fast. The math worked out:
            if I split a compressed file into small chunks, encode each chunk into a QR code, and play them in
            sequence at 20+ frames per second, the receiving camera can decode each frame faster than the next
            one appears. Loop until all packets are received, reconstruct with SHA-256 verification, done.
          </p>
          <p>
            PrismTransfer is the result. 100% browser-native, zero network, cryptographically verified, and
            works on any platform with a modern browser.
          </p>
        </div>
      </section>

      {/* ── Mission ───────────────────────────────────────── */}
      <section className="space-y-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full inline-block mb-3">
            Mission
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">Engineering Philosophy</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {engineeringPrinciples.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 p-5 rounded-2xl border border-border/30 bg-card/30">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Education ─────────────────────────────────────── */}
      <section className="space-y-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full inline-block mb-3">
            Education
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">Academic Background</h2>
        </div>
        <div className="flex gap-4 p-6 rounded-2xl border border-border/30 bg-card/30">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-foreground">B.Tech Computer Science</p>
            <p className="text-sm text-indigo-300">Woxsen University, Hyderabad, India</p>
            <p className="text-xs text-muted-foreground">Specialization: Cybersecurity, IoT, Blockchain, Full-Stack Development</p>
          </div>
        </div>
      </section>

      {/* ── Skills ───────────────────────────────────────── */}
      <section className="space-y-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full inline-block mb-3">
            Technical Skills
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">Skills & Expertise</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {skillGroups.map(({ label, icon: Icon, items }) => (
            <Card key={label} className="p-5 bg-card/30 border border-border/30 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <h3 className="font-bold text-xs uppercase tracking-widest text-indigo-400">{label}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <span key={item} className="text-xs px-2.5 py-1 rounded-full bg-zinc-900/60 text-zinc-300 border border-zinc-800/60">
                    {item}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* All knowsAbout tags */}
        <div>
          <p className="text-xs text-muted-foreground/60 mb-3 font-medium uppercase tracking-widest">Also knows about</p>
          <div className="flex flex-wrap gap-2">
            {knowsAbout.map((k) => (
              <span key={k} className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/8 text-indigo-300/80 border border-indigo-500/15">
                {k}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Open Source ──────────────────────────────────── */}
      <section className="space-y-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full inline-block mb-3">
            Open Source
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">Featured Project</h2>
        </div>
        {openSourceContributions.map((oss) => (
          <div key={oss.name} className="relative overflow-hidden rounded-2xl border border-indigo-500/25 bg-gradient-to-br from-indigo-500/10 to-card/20 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-extrabold text-xl text-foreground">{oss.name}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full">{oss.stars}</span>
                </div>
                <p className="text-xs text-indigo-400 font-semibold">{oss.role}</p>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">{oss.desc}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <a
                  href={oss.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-foreground transition-colors border border-zinc-800 hover:border-zinc-600 px-3 py-2 rounded-xl bg-zinc-950/30"
                >
                  <GithubIcon className="w-3.5 h-3.5" /> GitHub
                </a>
                <a
                  href={oss.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors border border-indigo-500/30 hover:border-indigo-500/60 px-3 py-2 rounded-xl bg-indigo-500/5"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                </a>
              </div>
            </div>
          </div>
        ))}
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors group"
        >
          View all projects <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </section>

      {/* ── Connect ───────────────────────────────────────── */}
      <section>
        <div className="rounded-3xl border border-border/30 bg-card/30 p-8 md:p-10 text-center space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground">Connect</h2>
            <p className="text-sm text-muted-foreground mt-2">Open to collaboration, research, and interesting problems.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://rishvinreddy.vercel.app"
              target="_blank"
              rel="noopener noreferrer me"
              className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              <Globe className="w-4 h-4" /> Portfolio
            </a>
            <a
              href="https://github.com/RishvinReddy"
              target="_blank"
              rel="noopener noreferrer me"
              className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-xl border border-border/40 hover:border-border/80 bg-card/40 hover:bg-card/60 text-foreground transition-colors"
            >
              <GithubIcon className="w-4 h-4" /> GitHub
            </a>
            <a
              href="https://linkedin.com/in/rishvinreddy"
              target="_blank"
              rel="noopener noreferrer me"
              className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-xl border border-border/40 hover:border-border/80 bg-card/40 hover:bg-card/60 text-foreground transition-colors"
            >
              <LinkedInIcon className="w-4 h-4" /> LinkedIn
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
