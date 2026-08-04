import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "@/components/home/shared";

export const metadata: Metadata = {
  title: "Open Source Repository and License — PrismTransfer",
  description: "Check the PrismTransfer open source GitHub repository, contributors guide, and license agreements.",
  alternates: {
    canonical: "/open-source",
  },
};

export default function OpenSourcePage() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link href="/" className="inline-flex items-center space-x-2 text-sm text-indigo-400 hover:text-indigo-300">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <div className="bg-card/25 backdrop-blur-xl border border-border/20 p-6 md:p-10 rounded-3xl space-y-6">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-indigo-400">
          <GithubIcon className="w-4 h-4" />
          <span>MIT License</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Open Source Ecosystem</h1>
        
        <div className="text-muted-foreground text-sm md:text-base leading-relaxed space-y-4">
          <p>
            PrismTransfer is proud to be **100% free and open-source software**. We welcome developer contributions, forks, and integrations under the permissive MIT License terms.
          </p>

          <h3 className="text-lg font-bold text-foreground mt-6">Contributing to the Protocol</h3>
          <p>
            Feel free to inspect our code structure, optimize chunking algorithms, submit bug issues, or build layout themes. Let's make optical offline sharing standard across the open web!
          </p>

          <div className="pt-6 border-t border-zinc-800/40">
            <a 
              href="https://github.com/RishvinReddy/Prism-Transfer" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block w-full md:w-auto"
            >
              <Button size="lg" className="w-full md:w-auto h-12 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20">
                <GithubIcon className="w-5 h-5 mr-2" /> Explore Repository on GitHub
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
