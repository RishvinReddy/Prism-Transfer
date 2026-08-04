import * as React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { comparisons } from "@/data/seoContent";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check, Shield, Zap } from "lucide-react";

interface ComparePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return comparisons.map((c) => ({
    slug: c.slug,
  }));
}

export async function generateMetadata({ params }: ComparePageProps): Promise<Metadata> {
  const { slug } = await params;
  const compare = comparisons.find((c) => c.slug === slug);
  if (!compare) return {};

  return {
    title: compare.title,
    description: compare.description,
    alternates: {
      canonical: `/compare/${slug}`,
    },
  };
}

export default async function ComparePage({ params }: ComparePageProps) {
  const { slug } = await params;
  const compare = comparisons.find((c) => c.slug === slug);
  if (!compare) notFound();

  // Create breadcrumb items
  const breadcrumbItems = [
    { name: "Home", item: "https://prismtransfer-rishvinreddy.vercel.app" },
    { name: "Compare", item: "https://prismtransfer-rishvinreddy.vercel.app/compare" },
    { name: compare.title, item: `https://prismtransfer-rishvinreddy.vercel.app/compare/${slug}` },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Schema Markup */}
      <JsonLd type="BreadcrumbList" data={{ items: breadcrumbItems }} />
      {compare.faqs && <JsonLd type="FAQPage" data={{ questions: compare.faqs }} />}
      
      {/* WebApplication structured markup for trust */}
      <JsonLd 
        type="WebApplication" 
        data={{
          name: "PrismTransfer",
          description: "Secure offline file transfer via animated QR codes.",
          url: "https://prismtransfer-rishvinreddy.vercel.app",
          features: ["Air-Gapped visual transfer", "100% Serverless", "SHA-256 Verification"]
        }}
      />

      <Link href="/" className="inline-flex items-center space-x-2 text-sm text-indigo-400 hover:text-indigo-300">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <article className="prose prose-invert max-w-none bg-card/25 backdrop-blur-xl border border-border/20 p-6 md:p-10 rounded-3xl space-y-6">
        <header className="space-y-4 border-b border-border/10 pb-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full">
            Product Comparisons
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            {compare.title}
          </h1>
        </header>

        {/* Semantic Content Render */}
        <div 
          className="text-muted-foreground leading-relaxed space-y-6 text-sm md:text-base markdown-body"
          dangerouslySetInnerHTML={{
            __html: compare.content
              .replace(/# (.*)/g, '<h1 class="text-2xl md:text-3xl font-extrabold text-foreground mt-8 mb-4">$1</h1>')
              .replace(/## (.*)/g, '<h2 class="text-xl md:text-2xl font-bold text-foreground mt-8 mb-3">$1</h2>')
              .replace(/### (.*)/g, '<h3 class="text-lg md:text-xl font-bold text-foreground mt-6 mb-2">$1</h3>')
              .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-foreground">$1</strong>')
              .replace(/\| --- \| --- \| --- \|/g, "")
              .replace(/\| ([^|]+) \| ([^|]+) \| ([^|]+) \|/g, (_, a, b, c) => {
                if (a.includes("Feature")) {
                  return `<tr class="border-b border-zinc-800"><th class="py-3 text-left font-bold text-foreground">${a}</th><th class="py-3 text-left font-bold text-foreground">${b}</th><th class="py-3 text-left font-bold text-foreground">${c}</th></tr>`;
                }
                return `<tr class="border-b border-zinc-900/50"><td class="py-3 text-zinc-400">${a}</td><td class="py-3 text-zinc-400">${b}</td><td class="py-3 text-zinc-400">${c}</td></tr>`;
              })
              .replace(/\|/g, "")
          }}
        />

        {/* Side-by-Side highlight card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-8 border-t border-border/10">
          <Card className="bg-zinc-950/20 border-zinc-800/40 p-5 rounded-2xl flex flex-col justify-between">
            <div className="space-y-3">
              <span className="flex items-center text-xs font-bold text-indigo-400 uppercase tracking-wider">
                <Zap className="w-4 h-4 mr-2" /> Speed & Size
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                PrismTransfer is highly optimized for transferring compressed documents, screenshots, metadata, and security keys. For massive gigabyte files, local networking transfers (where supported) remain faster.
              </p>
            </div>
          </Card>
          <Card className="bg-zinc-950/20 border-zinc-800/40 p-5 rounded-2xl flex flex-col justify-between">
            <div className="space-y-3">
              <span className="flex items-center text-xs font-bold text-green-400 uppercase tracking-wider">
                <Shield className="w-4 h-4 mr-2" /> Safety First
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Visual transfer bypasses radio frequencies (RF) entirely. This makes it immune to remote interception, sniffing, or man-in-the-middle hacks common to Bluetooth.
              </p>
            </div>
          </Card>
        </div>
      </article>

      {/* Internal Links for semantic SEO */}
      <section className="bg-card/10 border border-border/20 p-6 rounded-2xl space-y-4">
        <h3 className="font-bold text-lg text-foreground">Explore Other Comparisons</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {comparisons.filter(c => c.slug !== slug).slice(0, 3).map((item) => (
            <Link 
              key={item.slug} 
              href={`/compare/${item.slug}`}
              className="p-3 bg-zinc-950/20 hover:bg-zinc-900/30 border border-zinc-800/40 hover:border-indigo-500/30 rounded-xl transition-all text-xs font-bold text-indigo-400 block text-left"
            >
              {item.title.split(":")[0]}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
