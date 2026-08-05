"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/settings";
import { PrismProfile, ProfileManager } from "@/lib/profile";
import { BenchmarkEngine } from "@/lib/benchmark";
import { Loader2, Activity, Cpu, MonitorPlay, HardDrive, Camera } from "lucide-react";

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const [profile, setProfile] = React.useState<PrismProfile | null>(null);
  const [runningCore, setRunningCore] = React.useState(false);
  const [runningOptical, setRunningOptical] = React.useState(false);

  React.useEffect(() => {
    setProfile(ProfileManager.load());
  }, []);

  const handleRunCore = async () => {
    setRunningCore(true);
    const results = await BenchmarkEngine.runCoreBenchmarks();
    ProfileManager.updateScore("cpu", results.cpu);
    ProfileManager.updateScore("display", results.display);
    ProfileManager.updateScore("storage", results.storage);
    setProfile(ProfileManager.load());
    setRunningCore(false);
  };

  const handleRunOptical = async () => {
    setRunningOptical(true);
    const results = await BenchmarkEngine.runOpticalBenchmark();
    ProfileManager.updateScore("optical", results.optical);
    setProfile(ProfileManager.load());
    setRunningOptical(false);
  };

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto w-full px-4 space-y-8 pb-12">
      <div className="text-center space-y-2 mt-4">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Configure how PrismTransfer generates and receives data.
        </p>
      </div>

      <Card className="w-full bg-card/50 backdrop-blur-md shadow-lg border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">Prism Profile</CardTitle>
          </div>
          <CardDescription>
            Your device's performance profile. Used by the Transfer Advisor to automatically select the optimal transfer settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg border border-border/50">
              <Cpu className="h-5 w-5 mb-2 text-blue-400" />
              <span className="text-xs text-muted-foreground">CPU</span>
              <span className="text-lg font-bold">{profile?.cpu ?? "--"}</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg border border-border/50">
              <MonitorPlay className="h-5 w-5 mb-2 text-green-400" />
              <span className="text-xs text-muted-foreground">Display</span>
              <span className="text-lg font-bold">{profile?.display ?? "--"}</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg border border-border/50">
              <HardDrive className="h-5 w-5 mb-2 text-orange-400" />
              <span className="text-xs text-muted-foreground">Storage</span>
              <span className="text-lg font-bold">{profile?.storage ?? "--"}</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg border border-border/50">
              <Camera className="h-5 w-5 mb-2 text-purple-400" />
              <span className="text-xs text-muted-foreground">Optical</span>
              <span className="text-lg font-bold">{profile?.optical ?? "--"}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 border-t border-border/50 pt-6">
          <Button 
            variant="default" 
            className="w-full sm:w-auto" 
            onClick={handleRunCore} 
            disabled={runningCore || runningOptical}
          >
            {runningCore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Run Core Benchmark
          </Button>
          <Button 
            variant="secondary" 
            className="w-full sm:w-auto" 
            onClick={handleRunOptical} 
            disabled={runningCore || runningOptical}
          >
            {runningOptical && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Run Optical Benchmark
          </Button>
        </CardFooter>
      </Card>

      <Card className="w-full bg-card/50 backdrop-blur-md shadow-lg border-border/50">
        <CardHeader>
          <CardTitle className="text-xl">Transfer Preferences</CardTitle>
          <CardDescription>Adjust the speed, chunk size, and reliability of your transfers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label htmlFor="fps" className="text-base font-semibold">Playback Speed (FPS)</Label>
              <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-1 rounded-md">{settings.fps} fps</span>
            </div>
            <Slider 
              id="fps"
              value={[settings.fps]} 
              min={1} max={30} step={1} 
              className="py-4"
              onValueChange={(val) => updateSettings({ fps: Array.isArray(val) ? val[0] : (val as number) })} 
            />
            <p className="text-xs text-muted-foreground">Higher FPS transfers files faster but requires a better camera on the receiving device.</p>
          </div>

          <div className="space-y-3 pt-4 border-t border-border/50">
            <Label className="text-base font-semibold">QR Error Correction</Label>
            <Select 
              value={settings.errorCorrectionLevel} 
              onValueChange={(val: any) => updateSettings({ errorCorrectionLevel: val })}
            >
              <SelectTrigger className="w-full bg-muted/50">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Low (L) - 7% recovery, fastest transfer</SelectItem>
                <SelectItem value="M">Medium (M) - 15% recovery, balanced</SelectItem>
                <SelectItem value="Q">Quartile (Q) - 25% recovery, reliable</SelectItem>
                <SelectItem value="H">High (H) - 30% recovery, most robust</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Determines how much optical interference the stream can survive.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full bg-card/50 backdrop-blur-md shadow-lg border-border/50">
        <CardHeader>
          <CardTitle className="text-xl">Scanner</CardTitle>
          <CardDescription>Configure camera hardware and developer diagnostics.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="space-y-3">
            <Label className="text-base font-semibold">Camera Preference</Label>
            <Select 
              value={settings.cameraPreference} 
              onValueChange={(val: any) => updateSettings({ cameraPreference: val })}
            >
              <SelectTrigger className="w-full bg-muted/50">
                <SelectValue placeholder="Select camera" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="environment">Rear Camera (Recommended)</SelectItem>
                <SelectItem value="user">Front Camera</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="space-y-1">
              <Label className="text-base font-semibold">Developer Diagnostics</Label>
              <p className="text-xs text-muted-foreground">Show real-time performance metrics during transfers.</p>
            </div>
            <Switch 
              checked={settings.developerMode} 
              onCheckedChange={(checked) => updateSettings({ developerMode: checked })} 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
