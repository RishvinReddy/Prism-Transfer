"use client";

import * as React from "react";

export interface AppSettings {
  fps: number;
  errorCorrectionLevel: "L" | "M" | "Q" | "H";
  compressionLevel: number;
  developerMode: boolean;
  cameraPreference: "environment" | "user";
  reducedMotion: boolean;
  reliabilityMode: "speed" | "balanced" | "reliable" | "turbo";
}

const defaultSettings: AppSettings = {
  fps: 15,
  errorCorrectionLevel: "M",
  compressionLevel: 9,
  developerMode: false,
  cameraPreference: "environment",
  reducedMotion: false,
  reliabilityMode: "balanced",
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}

const SettingsContext = React.createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<AppSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    // Detect the OS reduced-motion preference — used as the boot default
    // unless the user has already saved an explicit override in localStorage.
    const osPrefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    try {
      const stored = localStorage.getItem("prismtransfer_settings");
      if (stored) {
        const parsed = JSON.parse(stored);
        // If the user has never explicitly set reducedMotion, respect the OS preference.
        if (parsed.reducedMotion === undefined) {
          parsed.reducedMotion = osPrefersReduced;
        }
        setSettings({ ...defaultSettings, ...parsed });
      } else {
        // First visit — seed from OS
        setSettings((prev) => ({ ...prev, reducedMotion: osPrefersReduced }));
      }
    } catch (e) {
      console.warn("Failed to load settings", e);
    }
    setIsLoaded(true);
  }, []);

  const updateSettings = React.useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem("prismtransfer_settings", JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to save settings", e);
      }
      return updated;
    });
  }, []);

  if (!isLoaded) return null; // Avoid hydration mismatch

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = React.useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
