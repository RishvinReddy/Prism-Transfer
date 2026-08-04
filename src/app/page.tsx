import * as React from "react";
import { Hero } from "@/components/home/Hero";
import { LiveTransferDemo } from "@/components/home/LiveTransferDemo";
import { TrustBadges, FeatureGrid } from "@/components/home/FeatureGrid";
import { HowItWorks } from "@/components/home/HowItWorks";
import { PerformanceStats } from "@/components/home/PerformanceStats";
import { ComparisonTable } from "@/components/home/ComparisonTable";
import { SecuritySection } from "@/components/home/SecuritySection";
import { SupportedPlatforms, TechStack } from "@/components/home/TechStack";
import { FAQ } from "@/components/home/FAQ";
import { CTA } from "@/components/home/CTA";
import { BuiltBy } from "@/components/home/BuiltBy";

function Divider() {
  return <div className="w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />;
}

export default function HomePage() {
  return (
    <div className="flex flex-col items-center w-full overflow-x-hidden">
      <Hero />
      <LiveTransferDemo />
      <TrustBadges />
      <Divider />
      <FeatureGrid />
      <Divider />
      <HowItWorks />
      <Divider />
      <PerformanceStats />
      <Divider />
      <ComparisonTable />
      <Divider />
      <SecuritySection />
      <Divider />
      <SupportedPlatforms />
      <Divider />
      <TechStack />
      <Divider />
      <FAQ />
      <Divider />
      <CTA />
      <Divider />
      <BuiltBy />
    </div>
  );
}
