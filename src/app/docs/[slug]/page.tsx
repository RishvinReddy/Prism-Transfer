import * as React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { docs } from "@/data/seoContent";
import { JsonLd } from "@/components/seo/JsonLd";
import { cn } from "@/lib/utils";
import { ArrowLeft, Book, HelpCircle, ShieldAlert, Terminal } from "lucide-react";

interface DocPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return docs.map((d) => ({
    slug: d.slug,
  }));
}

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = docs.find((d) => d.slug === slug);
  if (!doc) return {};

  return {
    title: doc.title,
    description: doc.description,
    alternates: {
      canonical: `/docs/${slug}`,
    },
  };
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;
  const doc = docs.find((d) => d.slug === slug);
  if (!doc) notFound();

  // Create breadcrumb items
  const breadcrumbItems = [
    { name: "Home", item: "https://prismtransfer-rishvinreddy.vercel.app" },
    { name: "Docs", item: "https://prismtransfer-rishvinreddy.vercel.app/docs" },
    { name: doc.title, item: `https://prismtransfer-rishvinreddy.vercel.app/docs/${slug}` },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Schema Injection */}
      <JsonLd type="BreadcrumbList" data={{ items: breadcrumbItems }} />
      <JsonLd 
        type="WebApplication" 
        data={{
          name: "PrismTransfer",
          description: "Secure offline file transfer via animated QR codes.",
          url: "https://prismtransfer-rishvinreddy.vercel.app",
          features: ["Air-Gapped visual transfer", "100% Serverless", "SHA-256 Verification"]
        }}
      />

      {/* Sidebar Navigation */}
      <aside className="lg:col-span-3 flex flex-col space-y-4 bg-zinc-950/20 backdrop-blur-xl border border-zinc-800/40 p-5 rounded-2xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/10 pb-2 flex items-center space-x-2">
          <Book className="w-4 h-4 text-indigo-400" />
          <span>Documentation</span>
        </h3>
        <nav className="flex flex-col space-y-1">
          {docs.map((d) => (
            <Link
              key={d.slug}
              href={`/docs/${d.slug}`}
              className={cn(
                "px-3 py-2 text-xs font-bold rounded-lg transition-all text-left truncate",
                d.slug === slug
                  ? "bg-indigo-600 text-white font-extrabold"
                  : "text-muted-foreground hover:text-foreground hover:bg-zinc-900/30"
              )}
            >
              {d.title.split("—")[0]}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <article className="lg:col-span-9 prose prose-invert max-w-none bg-card/25 backdrop-blur-xl border border-border/20 p-6 md:p-10 rounded-3xl space-y-6">
        <header className="space-y-4 border-b border-border/10 pb-6">
          <Link href="/docs" className="inline-flex items-center space-x-2 text-xs text-indigo-400 hover:text-indigo-300 lg:hidden">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Docs</span>
          </Link>
          
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full inline-block">
            {doc.category}
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            {doc.title}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            {doc.description}
          </p>
        </header>

        {/* Semantic Content Render */}
        <div 
          className="text-muted-foreground leading-relaxed space-y-6 text-sm md:text-base"
          dangerouslySetInnerHTML={{
            __html: doc.content
              .replace(/# (.*)/g, '<h1 class="text-2xl md:text-3xl font-extrabold text-foreground mt-8 mb-4">$1</h1>')
              .replace(/## (.*)/g, '<h2 class="text-xl md:text-2xl font-bold text-foreground mt-8 mb-3">$1</h2>')
              .replace(/### (.*)/g, '<h3 class="text-lg md:text-xl font-bold text-foreground mt-6 mb-2">$1</h3>')
              .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-foreground">$1</strong>')
              .replace(/- `([^`]+)`/g, '<li><code class="text-indigo-400">$1</code></li>')
              .replace(/- (.*)/g, '<li>$1</li>')
          }}
        />

        {/* Dynamic Warning Alert on security page */}
        {slug === "security" && (
          <div className="flex items-start space-x-3 p-4 bg-yellow-950/10 border border-yellow-900/30 rounded-xl mt-6">
            <ShieldAlert className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-yellow-500 text-xs">Security Advisory</h4>
              <p className="text-[11px] text-yellow-500/80 leading-relaxed">PrismTransfer operates over visible channels. Do not broadcast sensitive documents in public, unshielded environments where optical surveillance (cameras, onlookers) could record the QR sequence.</p>
            </div>
          </div>
        )}
      </article>

    </div>
  );
}
