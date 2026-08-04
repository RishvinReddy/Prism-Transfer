"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Bug, CheckCircle2, XCircle, Clock } from "lucide-react";

export type DebugStageStatus = "PENDING" | "SUCCESS" | "ERROR" | "SKIPPED";

export interface DebugStage {
  name: string;
  status: DebugStageStatus;
  message: string;
  durationMs?: number;
}

export interface DebugSession {
  id: string;
  timestamp: number;
  stages: DebugStage[];
  rawPayloadPreview?: string;
  rawPayloadLength?: number;
  finalStatus: "SUCCESS" | "ERROR" | "DROPPED";
}

interface ReceiveDebuggerProps {
  sessions: DebugSession[];
}

export function ReceiveDebugger({ sessions }: ReceiveDebuggerProps) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sessions, null, 2));
    const dlAnchorElem = document.createElement("a");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `prism-transfer-debug-${Date.now()}.json`);
    dlAnchorElem.click();
  };

  if (sessions.length === 0) return null;

  return (
    <Card className="w-full max-w-md bg-black/90 border-border/50 text-green-400 font-mono text-xs overflow-hidden mt-4 shadow-xl">
      <div className="flex justify-between items-center p-3 border-b border-green-900/30 bg-black">
        <div className="flex items-center space-x-2">
          <Bug className="w-4 h-4 text-green-500" />
          <span className="font-bold uppercase tracking-wider text-green-500">Pipeline Debugger</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} className="h-7 text-[10px] border-green-800 text-green-400 hover:bg-green-900/50">
          <Download className="w-3 h-3 mr-1" /> Export JSON
        </Button>
      </div>

      <div className="flex flex-col h-[400px] overflow-y-auto">
        {sessions.map((session) => (
          <div key={session.id} className="border-b border-green-900/30 flex flex-col">
            <div 
              className={`flex items-center justify-between p-2 cursor-pointer hover:bg-green-900/20 ${session.finalStatus === 'ERROR' ? 'bg-red-900/10' : ''}`}
              onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
            >
              <div className="flex items-center space-x-2 truncate">
                {session.finalStatus === 'SUCCESS' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : session.finalStatus === 'ERROR' ? (
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                )}
                <span className="text-muted-foreground">{new Date(session.timestamp).toLocaleTimeString()}</span>
                <span className="font-bold truncate">{session.id}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                session.finalStatus === 'SUCCESS' ? 'bg-green-900/50 text-green-400' :
                session.finalStatus === 'ERROR' ? 'bg-red-900/50 text-red-400' :
                'bg-yellow-900/50 text-yellow-400'
              }`}>
                {session.finalStatus}
              </span>
            </div>

            {expandedId === session.id && (
              <div className="p-3 bg-black/50 space-y-3">
                {session.rawPayloadLength !== undefined && (
                  <div className="space-y-1">
                    <div className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">Payload Preview ({session.rawPayloadLength} bytes)</div>
                    <div className="bg-green-950/30 p-2 rounded text-green-300 break-all text-[10px]">
                      {session.rawPayloadPreview}
                    </div>
                  </div>
                )}
                <div className="space-y-1">
                  <div className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">Pipeline Execution</div>
                  {session.stages.map((stage, i) => (
                    <div key={i} className="flex flex-col border-l-2 border-green-900/50 pl-2 ml-1 py-1">
                      <div className="flex justify-between items-start">
                        <span className={`font-bold ${
                          stage.status === 'ERROR' ? 'text-red-400' :
                          stage.status === 'SUCCESS' ? 'text-green-400' :
                          'text-muted-foreground'
                        }`}>
                          {stage.name}
                        </span>
                        {stage.durationMs !== undefined && (
                          <span className="text-muted-foreground">{stage.durationMs.toFixed(1)}ms</span>
                        )}
                      </div>
                      {stage.message && (
                        <span className={`text-[10px] mt-0.5 ${stage.status === 'ERROR' ? 'text-red-300' : 'text-green-600'}`}>
                          {stage.message}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
