import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { comparisons } from "@/data/seoContent";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, ArrowLeftRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Compare PrismTransfer with Local Sharing Alternatives",
  description: "Check how PrismTransfer stacks up against Apple AirDrop, Google Quick Share, Snapdrop, LocalSend, and traditional wireless protocols.",
  alternates: {
    canonical: "/compare",
  },
};

export default function CompareIndexPage() {
  const breadcrumbItems = [
    { name: "Home", item: "https://prismtransfer-rishvinreddy.vercel.app" },
    { name: "Compare", item: "https://prismtransfer-rishvinreddy.vercel.app/compare" },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Schema Injection */}
      <JsonLd type="BreadcrumbList" data={{ items: breadcrumbItems }} />

      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Ecosystem Comparisons</h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-xl">
          Check side-by-side reviews of how our visual air-gapped protocol compares with traditional local sharing tools.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {comparisons.map((item) => (
          <Link key={item.slug} href={`/compare/${item.slug}`}>
            <Card className="bg-card/20 backdrop-blur-xl border border-border/30 hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.08)] transition-all duration-300 rounded-2xl h-full flex flex-col justify-between group cursor-pointer">
              <CardHeader className="space-y-2 p-6">
                <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 uppercase tracking-widest">
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>{item.category}</span>
                </div>
                <CardTitle className="text-lg font-bold text-foreground group-hover:text-indigo-400 transition-colors">
                  {item.title}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 flex justify-end">
                <span className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
                  <span>Read Comparison</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
