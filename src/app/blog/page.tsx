import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/data/seoContent";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, BookOpen, Calendar, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog & Insights — Optical QR Sharing Technology | PrismTransfer",
  description: "Learn about the architecture behind air-gapped visual file sharing, local IndexedDB configurations, and browser camera viewports.",
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogPage() {
  const breadcrumbItems = [
    { name: "Home", item: "https://prismtransfer-rishvinreddy.vercel.app" },
    { name: "Blog", item: "https://prismtransfer-rishvinreddy.vercel.app/blog" },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Schema Injection */}
      <JsonLd type="BreadcrumbList" data={{ items: breadcrumbItems }} />

      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Tech Blog & Insights</h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-xl">
          Deep dives, optimization guides, and specifications regarding camera-to-camera serverless transfers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {blogPosts.map((item) => (
          <Link key={item.slug} href={`/blog/${item.slug}`}>
            <Card className="bg-card/20 backdrop-blur-xl border border-border/30 hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.08)] transition-all duration-300 rounded-2xl h-full flex flex-col justify-between group cursor-pointer">
              <CardHeader className="space-y-2 p-6">
                <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 uppercase tracking-widest">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{item.category}</span>
                </div>
                <CardTitle className="text-lg font-bold text-foreground group-hover:text-indigo-400 transition-colors">
                  {item.title}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 flex flex-col space-y-3">
                <div className="flex space-x-4 text-[10px] text-muted-foreground font-medium">
                  <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> Aug 4, 2026</span>
                  <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> 5 min</span>
                </div>
                <div className="flex justify-end pt-2 border-t border-zinc-900/40">
                  <span className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
