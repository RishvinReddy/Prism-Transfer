"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileUp, Play, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { validateManifestDetailed, validatePacketDetailed } from "@/lib/validator";
import { packetStore } from "@/lib/storage";
import { reconstructFile, downloadBlob } from "@/features/scanner/reconstructionEngine";
import { TransferManifest, TransferPacket } from "@/types/transfer";

export default function SimulatorPage() {
  const [packets, setPackets] = React.useState<string[]>([]);
  const [isRunning, setIsRunning] = React.useState(false);
  const [logs, setLogs] = React.useState<{ id: number; msg: string; type: "info" | "error" | "success" }[]>([]);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const addLog = (msg: string, type: "info" | "error" | "success" = "info") => {
    setLogs((prev) => [...prev, { id: Date.now() + Math.random(), msg, type }]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          setPackets(json);
          addLog(`Loaded ${json.length} simulation packets.`, "success");
        } else {
          addLog("Invalid JSON format. Expected an array of strings.", "error");
        }
      } catch (err) {
        addLog("Failed to parse JSON file.", "error");
      }
    };
    reader.readAsText(file);
  };

  const runSimulation = async () => {
    if (packets.length === 0) return;
    setIsRunning(true);
    setLogs([]);
    addLog(`Starting simulation for ${packets.length} frames...`, "info");

    let manifest: TransferManifest | null = null;
    let receivedCount = 0;
    
    try {
      for (let i = 0; i < packets.length; i++) {
        const frame = packets[i];
        let parsed: any;
        try {
          parsed = JSON.parse(frame);
        } catch (e) {
          addLog(`[Frame ${i}] JSON parse failed.`, "error");
          continue;
        }

        if (parsed.type === "manifest") {
          if (!manifest) {
            delete parsed.type;
            const { valid, reason } = validateManifestDetailed(parsed);
            if (valid) {
              manifest = parsed as TransferManifest;
              await packetStore.saveManifest(manifest);
              addLog(`[Frame ${i}] Valid Manifest saved. Expected packets: ${manifest.totalDataPackets}`, "success");
            } else {
              addLog(`[Frame ${i}] Manifest validation failed: ${reason}`, "error");
            }
          }
        } else {
          if (manifest) {
            const { valid, reason } = validatePacketDetailed(parsed);
            if (valid && parsed.transferId === manifest.transferId) {
              const p = parsed as TransferPacket;
              const isNew = await packetStore.savePacket(p);
              if (isNew) {
                receivedCount++;
                addLog(`[Frame ${i}] Saved Packet ${p.index} (${receivedCount}/${manifest.totalDataPackets})`, "info");
              }
            } else {
              if (!valid) addLog(`[Frame ${i}] Packet validation failed: ${reason}`, "error");
              else addLog(`[Frame ${i}] Transfer ID mismatch`, "error");
            }
          } else {
            addLog(`[Frame ${i}] Data packet arrived before manifest. Dropped.`, "error");
          }
        }
      }

      if (manifest && receivedCount >= manifest.totalDataPackets) {
        addLog("All packets received. Starting reconstruction...", "info");
        const storedPackets = await packetStore.getAllPackets(manifest.transferId);
        const { blob } = await reconstructFile(manifest, storedPackets);
        addLog(`Reconstruction successful. Blob size: ${blob.size} bytes. Verified SHA.`, "success");
        downloadBlob(blob, "SIMULATED_" + manifest.filename);
        await packetStore.clearTransfer(manifest.transferId);
        addLog("Transfer cleared from DB.", "info");
      } else {
        addLog(`Simulation finished, but only ${receivedCount}/${manifest?.totalDataPackets || '?'} packets were stored.`, "error");
      }

    } catch (e: any) {
      addLog(`Simulation aborted with exception: ${e.message}`, "error");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      <Card className="w-full max-w-2xl bg-zinc-950 border-zinc-800 p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-cyan-400">Offline Pipeline Simulator</h1>
          <p className="text-zinc-400 text-sm">Upload a `simulation-packets.json` file exported from the sender to verify the software receive pipeline (JSON Parse → Validate → IndexedDB → Reconstruct) without involving the camera.</p>
        </div>

        <div className="flex items-center space-x-4">
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="text-black">
            <FileUp className="w-4 h-4 mr-2" />
            Load Packets
          </Button>

          <Button 
            onClick={runSimulation} 
            disabled={packets.length === 0 || isRunning}
            className="bg-cyan-600 hover:bg-cyan-500 text-white"
          >
            {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
            Run Simulation
          </Button>
        </div>

        <div className="bg-black border border-zinc-800 rounded-lg p-4 h-[400px] overflow-y-auto font-mono text-xs space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start space-x-2">
              {log.type === "info" && <span className="text-zinc-500">▶</span>}
              {log.type === "success" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
              {log.type === "error" && <XCircle className="w-4 h-4 text-red-500" />}
              <span className={`flex-1 ${
                log.type === "success" ? "text-green-400" :
                log.type === "error" ? "text-red-400" :
                "text-zinc-300"
              }`}>
                {log.msg}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-zinc-600 italic">No logs yet. Load packets and run simulation.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
