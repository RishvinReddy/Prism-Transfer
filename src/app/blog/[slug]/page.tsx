import * as React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { blogPosts } from "@/data/seoContent";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Clock, Calendar, Shield } from "lucide-react";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((bp) => ({
    slug: bp.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((bp) => bp.slug === slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = blogPosts.find((bp) => bp.slug === slug);
  if (!post) notFound();

  // Create breadcrumb items
  const breadcrumbItems = [
    { name: "Home", item: "https://prismtransfer-rishvinreddy.vercel.app" },
    { name: "Blog", item: "https://prismtransfer-rishvinreddy.vercel.app/blog" },
    { name: post.title, item: `https://prismtransfer-rishvinreddy.vercel.app/blog/${slug}` },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Schema Injection */}
      <JsonLd type="BreadcrumbList" data={{ items: breadcrumbItems }} />
      
      {/* Article Schema for Google Rich Snippet */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.description,
            "author": {
              "@type": "Person",
              "name": "Rishvin Reddy",
              "url": "https://github.com/RishvinReddy"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Rishvin Labs",
              "logo": {
                "@type": "ImageObject",
                "url": "https://prismtransfer-rishvinreddy.vercel.app/icon-512x512.png"
              }
            },
            "datePublished": "2026-08-04",
            "dateModified": "2026-08-04",
            "mainEntityOfPage": `https://prismtransfer-rishvinreddy.vercel.app/blog/${slug}`
          })
        }}
      />

      <Link href="/blog" className="inline-flex items-center space-x-2 text-sm text-indigo-400 hover:text-indigo-300">
        <ArrowLeft className="w-4 h-4" />
        <span>All Articles</span>
      </Link>

      <article className="prose prose-invert max-w-none bg-card/25 backdrop-blur-xl border border-border/20 p-6 md:p-10 rounded-3xl space-y-6">
        <header className="space-y-4 border-b border-border/10 pb-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full inline-block">
            {post.category}
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground font-medium pt-2">
            <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> August 4, 2026</span>
            <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> 5 min read</span>
            <span className="flex items-center"><Shield className="w-3.5 h-3.5 mr-1" /> Verified Article</span>
          </div>
        </header>

        {/* Semantic Content Render */}
        <div 
          className="text-muted-foreground leading-relaxed space-y-6 text-sm md:text-base"
          dangerouslySetInnerHTML={{
            __html: post.content
              .replace(/# (.*)/g, '<h1 class="text-2xl md:text-3xl font-extrabold text-foreground mt-8 mb-4">$1</h1>')
              .replace(/## (.*)/g, '<h2 class="text-xl md:text-2xl font-bold text-foreground mt-8 mb-3">$1</h2>')
              .replace(/### (.*)/g, '<h3 class="text-lg md:text-xl font-bold text-foreground mt-6 mb-2">$1</h3>')
              .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-foreground">$1</strong>')
          }}
        />
      </article>

      {/* Internal Links */}
      <section className="bg-card/10 border border-border/20 p-6 rounded-2xl space-y-4">
        <h3 className="font-bold text-lg text-foreground">Recent Blog Articles</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {blogPosts.filter(bp => bp.slug !== slug).slice(0, 3).map((item) => (
            <Link 
              key={item.slug} 
              href={`/blog/${item.slug}`}
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
