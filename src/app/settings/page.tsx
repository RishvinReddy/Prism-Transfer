"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings } from "@/contexts/settings";

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto w-full space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure how PrismTransfer generates and receives data.
        </p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Transfer Options</CardTitle>
          <CardDescription>Adjust the speed and reliability of your transfers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label htmlFor="fps" className="text-base">Playback Speed (FPS)</Label>
              <span className="text-sm font-mono">{settings.fps} fps</span>
            </div>
            <Slider 
              id="fps"
              value={[settings.fps]} 
              min={1} max={30} step={1} 
              onValueChange={(val) => updateSettings({ fps: Array.isArray(val) ? val[0] : (val as number) })} 
            />
            <p className="text-xs text-muted-foreground">Higher FPS transfers files faster but requires a better camera on the receiving device.</p>
          </div>

          <div className="space-y-3">
            <Label className="text-base">QR Error Correction</Label>
            <Select 
              value={settings.errorCorrectionLevel} 
              onValueChange={(val: any) => updateSettings({ errorCorrectionLevel: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Low (L) - 7% recovery, fastest transfer</SelectItem>
                <SelectItem value="M">Medium (M) - 15% recovery, balanced</SelectItem>
                <SelectItem value="Q">Quartile (Q) - 25% recovery, reliable</SelectItem>
                <SelectItem value="H">High (H) - 30% recovery, most robust</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-base">Camera Preference</Label>
            <Select 
              value={settings.cameraPreference} 
              onValueChange={(val: any) => updateSettings({ cameraPreference: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select camera" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="environment">Rear Camera (Recommended)</SelectItem>
                <SelectItem value="user">Front Camera</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Developer Options</CardTitle>
          <CardDescription>Advanced metrics and diagnostic overlays.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Developer Dashboard</Label>
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
