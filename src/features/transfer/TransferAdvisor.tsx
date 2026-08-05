import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PrismProfile, ProfileManager } from "@/lib/profile";
import { TransferOptions } from "@/types/transfer";
import { Zap, ShieldCheck, Settings, CheckCircle2, AlertCircle } from "lucide-react";

export type TransferPreset = "turbo" | "balanced" | "reliable";

export interface AdvisorRecommendation {
  preset: TransferPreset;
  confidence: number;
  reasons: string[];
  estimatedTimeSec: number;
  reliabilityScore: number;
  options: TransferOptions;
}

export function generateRecommendation(fileSize: number, profile: PrismProfile): AdvisorRecommendation {
  const isLarge = fileSize > 5 * 1024 * 1024; // > 5MB
  const isSmall = fileSize < 500 * 1024; // < 500KB
  
  const hasOptical = profile.optical !== undefined;
  const hasDisplay = profile.display !== undefined;

  let confidence = 50;
  let preset: TransferPreset = "balanced";
  let reasons: string[] = [];
  
  if (hasOptical && hasDisplay) {
    confidence = 90;
  } else if (hasOptical || hasDisplay) {
    confidence = 75;
  }

  // Basic rules engine
  if (profile.display && profile.display > 85 && isSmall) {
    preset = "turbo";
    reasons.push("Small file size");
    reasons.push("Excellent display performance");
    if (profile.optical && profile.optical > 85) {
      reasons.push("High optical reliability");
      confidence = 98;
    }
  } else if (isLarge || (profile.optical && profile.optical < 50) || (profile.display && profile.display < 50)) {
    preset = "reliable";
    if (isLarge) reasons.push("Large file transfer");
    if (profile.optical && profile.optical < 50) reasons.push("Lower camera performance detected");
    if (profile.display && profile.display < 50) reasons.push("Display jitter detected");
  } else {
    preset = "balanced";
    reasons.push("Standard payload size");
    reasons.push("Balanced error correction");
  }

  // Confidence adjustments
  if (confidence < 70 && !hasOptical) {
    reasons.push("Recommendation confidence is lower. Run the Optical Benchmark to improve.");
  }

  // Generate options and estimates based on preset
  let options: TransferOptions;
  let estimatedTimeSec: number;
  let reliabilityScore: number;

  const baseFrames = fileSize / 500; // rough guess

  if (preset === "turbo") {
    options = { fps: 30, errorCorrectionLevel: "L" };
    estimatedTimeSec = Math.max(1, Math.round(baseFrames / 30));
    reliabilityScore = 89;
  } else if (preset === "reliable") {
    options = { fps: 15, errorCorrectionLevel: "H" };
    estimatedTimeSec = Math.max(1, Math.round((baseFrames * 1.3) / 15));
    reliabilityScore = 99;
  } else {
    options = { fps: 20, errorCorrectionLevel: "Q" };
    estimatedTimeSec = Math.max(1, Math.round((baseFrames * 1.15) / 20));
    reliabilityScore = 96;
  }

  return { preset, confidence, reasons, estimatedTimeSec, reliabilityScore, options };
}

interface TransferAdvisorProps {
  file: File;
  onAccept: (options: TransferOptions) => void;
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
    setSelectedPreset(rec.preset);
  }, [file]);

  if (!recommendation) return null;

  const handleStart = () => {
    if (selectedPreset === "turbo") {
      onAccept({ fps: 30, errorCorrectionLevel: "L" });
    } else if (selectedPreset === "reliable") {
      onAccept({ fps: 15, errorCorrectionLevel: "H" });
    } else {
      onAccept({ fps: 20, errorCorrectionLevel: "Q" });
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
                  {recommendation.preset === "turbo" && "Turbo ⚡"}
                  {recommendation.preset === "balanced" && "Balanced ⭐"}
                  {recommendation.preset === "reliable" && "Reliable 🛡️"}
                </span>
                {selectedPreset === recommendation.preset && (
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
