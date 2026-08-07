import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PrismProfile, ProfileManager } from "@/lib/profile";
import { TransferOptions, TransferStrategy } from "@/types/transfer";
import { Zap, ShieldCheck, Settings, CheckCircle2, AlertCircle } from "lucide-react";

export type TransferPreset = "turbo" | "balanced" | "reliable";

export interface AdvisorRecommendation {
  strategy: TransferStrategy;
  reasons: string[];
  estimatedTimeSec: number;
  confidence: number;
  reliabilityScore: number;
}

export function generateRecommendation(fileSize: number, profile: PrismProfile, forcePreset?: TransferPreset): AdvisorRecommendation {
  const isLarge = fileSize > 5 * 1024 * 1024; // > 5MB
  const isSmall = fileSize < 500 * 1024; // < 500KB
  
  const hasOptical = profile.optical !== undefined;
  const hasDisplay = profile.display !== undefined;

  let confidence = 50;
  let preset: TransferPreset = forcePreset || "balanced";
  let reasons: string[] = [];
  
  if (!forcePreset) {
    if (hasOptical && hasDisplay) {
    confidence = 90;
  } else if (hasOptical || hasDisplay) {
    confidence = 75;
  }

  // Basic rules engine
  if (profile.display && profile.display.score > 85 && isSmall) {
    preset = "turbo";
    reasons.push("Small file size and highly stable display");
    
    if (profile.optical && profile.optical.score > 85) {
      reasons.push("High optical reliability");
      confidence = 98;
    }
  } else if (isLarge || (profile.optical && profile.optical.score < 50) || (profile.display && profile.display.score < 50)) {
    preset = "reliable";
    if (isLarge) reasons.push("Large file size defaults to reliable parity");
    if (profile.optical && profile.optical.score < 50) reasons.push("Lower camera performance detected");
    if (profile.display && profile.display.score < 50) reasons.push("Display jitter detected");
  } else {
    preset = "balanced";
      reasons.push("Standard payload size");
      reasons.push("Balanced error correction");
    }
  } else {
    reasons.push(`User manually selected ${forcePreset} preset`);
  }

  // Confidence adjustments
  if (confidence < 70 && !hasOptical && !forcePreset) {
    reasons.push("Recommendation confidence is lower. Run the Optical Benchmark to improve.");
  }

  // Adaptive Strategy Selection
  let fps: number;
  let chunkSize: number;
  let qrVersion: number;
  let qrQuietZone: number;
  let parityRatio: number;

  if (preset === "turbo") {
    fps = profile.display && profile.display.score > 90 ? 60 : 40;
    chunkSize = profile.optical && profile.optical.score > 85 ? 800 : 500;
    qrVersion = 30; // High density
    qrQuietZone = 2; // Small quiet zone
    parityRatio = 0.05; // 5% redundancy (1 in 20)
  } else if (preset === "reliable") {
    fps = 15;
    chunkSize = 250;
    qrVersion = 10; // Low density
    qrQuietZone = 4; // Large quiet zone
    parityRatio = 0.25; // 25% redundancy (1 in 4)
  } else {
    fps = profile.display && profile.display.score > 70 ? 30 : 24;
    chunkSize = 400;
    qrVersion = 20; // Medium density
    qrQuietZone = 3; // Medium quiet zone
    parityRatio = 0.15; // 15% redundancy (1 in ~7)
  }

  const baseFrames = fileSize / chunkSize;
  const estimatedTimeSec = Math.max(1, Math.round((baseFrames * (1 + parityRatio)) / fps));

  const strategy: TransferStrategy = {
    preset,
    confidence,
    fps,
    chunkSize,
    qrVersion,
    qrQuietZone,
    parityRatio,
  };

  let reliabilityScore = 0;
  if (preset === "turbo") reliabilityScore = 89;
  else if (preset === "reliable") reliabilityScore = 99;
  else reliabilityScore = 96;

  return { strategy, reasons, estimatedTimeSec, confidence, reliabilityScore };
}

interface TransferAdvisorProps {
  file: File;
  onAccept: (strategy: TransferStrategy) => void;
  onCancel: () => void;
}

export function TransferAdvisor({ file, onAccept, onCancel }: TransferAdvisorProps) {
  const [profile, setProfile] = React.useState<PrismProfile | null>(null);
  const [recommendation, setRecommendation] = React.useState<AdvisorRecommendation | null>(null);
  const [selectedPreset, setSelectedPreset] = React.useState<TransferPreset | null>(null);

  React.useEffect(() => {
    const prof = ProfileManager.load();
    setProfile(prof);
    const rec = generateRecommendation(file.size, prof);
    setRecommendation(rec);
    setSelectedPreset(rec.strategy.preset);
  }, [file]);

  if (!recommendation || !profile) return null;

  const handleStart = () => {
    if (selectedPreset === recommendation.strategy.preset) {
      onAccept(recommendation.strategy);
    } else {
      const customRec = generateRecommendation(file.size, profile, selectedPreset!);
      onAccept(customRec.strategy);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto bg-card/50 backdrop-blur-md shadow-lg border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Transfer Advisor
        </CardTitle>
        <CardDescription>
          Analyzing device capabilities for {file.name}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Recommended</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  {recommendation.strategy.preset === "turbo" && "Turbo ⚡"}
                  {recommendation.strategy.preset === "balanced" && "Balanced ⭐"}
                  {recommendation.strategy.preset === "reliable" && "Reliable 🛡️"}
                </span>
                {selectedPreset === recommendation.strategy.preset && (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">~{recommendation.estimatedTimeSec}s</div>
              <div className="text-xs text-muted-foreground">{recommendation.reliabilityScore}% Reliability</div>
            </div>
          </div>
          
          <ul className="text-sm space-y-1 text-muted-foreground mt-3">
            {recommendation.reasons.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary">•</span> {r}
              </li>
            ))}
          </ul>
          
          <div className="mt-4 pt-3 border-t border-primary/10 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Confidence Score: {recommendation.confidence}%
            </span>
            {recommendation.confidence < 80 && (
              <a href="/settings" className="text-primary hover:underline">Run benchmarks</a>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">Other Profiles</p>
          <div className="grid grid-cols-3 gap-2">
            {(["turbo", "balanced", "reliable"] as TransferPreset[]).map(preset => (
              <button
                key={preset}
                onClick={() => setSelectedPreset(preset)}
                className={`p-3 text-center rounded-lg border text-sm transition-colors ${
                  selectedPreset === preset 
                    ? "border-primary bg-primary/10 text-primary font-medium" 
                    : "border-border hover:border-primary/50 hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                {preset === "turbo" && "⚡ Turbo"}
                {preset === "balanced" && "⭐ Balanced"}
                {preset === "reliable" && "🛡️ Reliable"}
              </button>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between border-t border-border/50 pt-6">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleStart} className="min-w-[120px]">
          Start Transfer
        </Button>
      </CardFooter>
    </Card>
  );
}
