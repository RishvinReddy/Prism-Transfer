import * as React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { guides } from "@/data/seoContent";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Clock, PlayCircle } from "lucide-react";

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return guides.map((g) => ({
    slug: g.slug,
  }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = guides.find((g) => g.slug === slug);
  if (!guide) return {};

  return {
    title: guide.title,
    description: guide.description,
    alternates: {
      canonical: `/guides/${slug}`,
    },
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = guides.find((g) => g.slug === slug);
  if (!guide) notFound();

  // Create breadcrumb items
  const breadcrumbItems = [
    { name: "Home", item: "https://prismtransfer-rishvinreddy.vercel.app" },
    { name: "Guides", item: "https://prismtransfer-rishvinreddy.vercel.app/guides" },
    { name: guide.title, item: `https://prismtransfer-rishvinreddy.vercel.app/guides/${slug}` },
  ];

  // HowTo step configuration for schema structured data
  const schemaSteps = guide.steps?.map((s) => ({
    name: s.title,
    text: s.desc,
  })) || [
    { name: "Open App", text: "Open PrismTransfer in your browser window." },
    { name: "Scan Stream", text: "Align receiver camera with sending screens." }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Schema Injection */}
      <JsonLd type="BreadcrumbList" data={{ items: breadcrumbItems }} />
      <JsonLd 
        type="HowTo" 
        data={{
          name: guide.title,
          description: guide.description,
          steps: schemaSteps
        }}
      />
      {guide.faqs && <JsonLd type="FAQPage" data={{ questions: guide.faqs }} />}

      <Link href="/guides" className="inline-flex items-center space-x-2 text-sm text-indigo-400 hover:text-indigo-300">
        <ArrowLeft className="w-4 h-4" />
        <span>All Guides</span>
      </Link>

      <article className="prose prose-invert max-w-none bg-card/25 backdrop-blur-xl border border-border/20 p-6 md:p-10 rounded-3xl space-y-6">
        <header className="space-y-4 border-b border-border/10 pb-6">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-indigo-400">
            <BookOpen className="w-4 h-4" />
            <span>How-To Guides</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            {guide.title}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            {guide.description}
          </p>
        </header>

        {/* Semantic Content Render */}
        <div 
          className="text-muted-foreground leading-relaxed space-y-6 text-sm md:text-base"
          dangerouslySetInnerHTML={{
            __html: guide.content
              .replace(/# (.*)/g, '<h1 class="text-2xl md:text-3xl font-extrabold text-foreground mt-8 mb-4">$1</h1>')
              .replace(/## (.*)/g, '<h2 class="text-xl md:text-2xl font-bold text-foreground mt-8 mb-3">$1</h2>')
              .replace(/### (.*)/g, '<h3 class="text-lg md:text-xl font-bold text-foreground mt-6 mb-2">$1</h3>')
              .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-foreground">$1</strong>')
          }}
        />

        {/* Step-by-Step Render if available */}
        {guide.steps && (
          <div className="space-y-6 mt-8 pt-8 border-t border-border/10">
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Step-by-Step Instructions</h2>
            <div className="grid grid-cols-1 gap-4">
              {guide.steps.map((step, idx) => (
                <div key={idx} className="flex items-start space-x-4 p-4 rounded-xl bg-zinc-950/20 border border-zinc-900">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-sm flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-foreground">{step.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA to use the app */}
        <div className="mt-10 p-6 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-foreground">Ready to try PrismTransfer?</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">Secure offline file sharing is entirely serverless in your web browser. No accounts or cables.</p>
          </div>
          <Link href="/send">
            <Button className="h-12 px-6 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20">
              <PlayCircle className="w-5 h-5 mr-2" /> Start Sending Files
            </Button>
          </Link>
        </div>
      </article>

      {/* Internal Links */}
      <section className="bg-card/10 border border-border/20 p-6 rounded-2xl space-y-4">
        <h3 className="font-bold text-lg text-foreground">Related Guides & Tutorials</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {guides.filter(g => g.slug !== slug).slice(0, 3).map((item) => (
            <Link 
              key={item.slug} 
              href={`/guides/${item.slug}`}
              className="p-3 bg-zinc-950/20 hover:bg-zinc-900/30 border border-zinc-800/40 hover:border-indigo-500/30 rounded-xl transition-all text-xs font-bold text-indigo-400 block text-left"
            >
              {item.title}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
