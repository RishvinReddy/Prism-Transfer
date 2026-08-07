"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PrismProfile, ProfileManager } from "@/lib/profile";
import { BenchmarkRunner } from "@/lib/benchmark/runner";
import { 
  Activity, Cpu, MonitorPlay, HardDrive, 
  Camera, Eye, Zap, Layers, FileDown, 
  History, PlayCircle, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

function ScoreBar({ score, label, icon: Icon, colorClass }: { score?: number; label: string; icon: any; colorClass: string }) {
  const displayScore = score ?? 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <Icon className={cn("w-4 h-4", colorClass.replace("bg-", "text-"))} />
          {label}
        </div>
        <span className="font-mono font-bold text-muted-foreground">{score !== undefined ? score : "--"}</span>
      </div>
      <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${displayScore}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full", colorClass)}
        />
      </div>
    </div>
  );
}

export default function BenchmarkPage() {
  const [profile, setProfile] = React.useState<PrismProfile | null>(null);
  const [isRunning, setIsRunning] = React.useState(false);
  const [currentTest, setCurrentTest] = React.useState<string | null>(null);

  React.useEffect(() => {
    setProfile(ProfileManager.load());
  }, []);

  const handleRunFullBenchmark = async () => {
    setIsRunning(true);
    const runner = new BenchmarkRunner(true); // include optical
    
    const results = await runner.runAll((moduleName) => {
      setCurrentTest(moduleName);
    });

    ProfileManager.updateBenchmarks(results);
    setProfile(ProfileManager.load());
    setIsRunning(false);
    setCurrentTest(null);
  };

  const exportReport = () => {
    if (!profile) return;
    const report = {
      timestamp: new Date().toISOString(),
      browser: navigator.userAgent,
      prismScore: profile.prismScore,
      benchmarks: {
        cpu: profile.cpu,
        memory: profile.memory,
        storage: profile.storage,
        display: profile.display,
        vision: profile.vision,
        optical: profile.optical,
        transfer: profile.transfer,
      },
      recommendation: profile.prismScore && profile.prismScore > 85 ? "Turbo" : 
                      profile.prismScore && profile.prismScore > 60 ? "Balanced" : "Reliable"
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prism-benchmark-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!profile) return null;

  let recommendation = "Balanced";
  let confidence = "75%";
  if (profile.prismScore) {
    if (profile.prismScore > 85) { recommendation = "Turbo"; confidence = "98%"; }
    else if (profile.prismScore > 60) { recommendation = "Balanced"; confidence = "85%"; }
    else { recommendation = "Reliable"; confidence = "90%"; }
  }

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto w-full px-4 space-y-8 pb-12">
      <div className="text-center space-y-2 mt-4">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Prism Benchmark Suite</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Accurate, repeatable diagnostics for the Transfer Advisor.
        </p>
      </div>

      <Card className="w-full bg-card/40 backdrop-blur-xl border-primary/20 shadow-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        
        <CardContent className="pt-8 space-y-8 relative z-10">
          
          {/* Header Score section */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-6 border-b border-border/40">
            <div className="text-center md:text-left space-y-1">
              <span className="uppercase tracking-widest text-xs font-bold text-muted-foreground">Overall Score</span>
              <div className="flex items-baseline justify-center md:justify-start gap-2">
                <span className="text-6xl font-black">{profile.prismScore ?? "--"}</span>
                <span className="text-xl text-muted-foreground">/ 100</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-1 text-yellow-500 mt-2">
                {Array.from({length: 5}).map((_, i) => (
                  <svg key={i} className={`w-5 h-5 ${profile.prismScore && profile.prismScore > i * 20 ? "fill-current" : "fill-muted text-muted"}`} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <Button 
                size="lg" 
                className="font-bold rounded-xl h-14"
                onClick={handleRunFullBenchmark}
                disabled={isRunning}
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Running {currentTest}...
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-5 h-5 mr-2" />
                    Run Full Benchmark
                  </>
                )}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={exportReport}>
                  <FileDown className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                <Button variant="outline" className="flex-1" disabled>
                  <History className="w-4 h-4 mr-2" />
                  History
                </Button>
              </div>
            </div>
          </div>

          {/* Module Bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <ScoreBar score={profile.cpu?.score} label="CPU" icon={Cpu} colorClass="bg-blue-500" />
            <ScoreBar score={profile.memory?.score} label="Memory" icon={Layers} colorClass="bg-cyan-500" />
            <ScoreBar score={profile.storage?.score} label="Storage" icon={HardDrive} colorClass="bg-orange-500" />
            <ScoreBar score={profile.display?.score} label="Display" icon={MonitorPlay} colorClass="bg-green-500" />
            <ScoreBar score={profile.vision?.score} label="Vision Engine" icon={Eye} colorClass="bg-indigo-500" />
            <ScoreBar score={profile.optical?.score} label="Optical Hardware" icon={Camera} colorClass="bg-pink-500" />
            
            <div className="md:col-span-2 pt-2">
              <ScoreBar score={profile.transfer?.score} label="Transfer Pipeline (E2E)" icon={Zap} colorClass="bg-primary" />
            </div>
          </div>

          {/* Recommendation */}
          {profile.prismScore !== undefined && (
            <div className="p-4 bg-muted/50 rounded-xl border border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="space-y-1 text-center md:text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recommended Strategy</p>
                <p className="text-xl font-bold">{recommendation}</p>
              </div>
              <div className="space-y-1 text-center md:text-right">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Confidence</p>
                <p className="text-xl font-mono font-bold text-primary">{confidence}</p>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
