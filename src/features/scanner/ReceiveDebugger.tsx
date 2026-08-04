"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Bug, CheckCircle2, XCircle, Clock, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export type DebugStageStatus = "PENDING" | "SUCCESS" | "ERROR" | "SKIPPED";

export interface DebugStage {
  name: string;
  status: DebugStageStatus;
  message: string;
}

export interface DebugPacket {
  id: string; // usually the packet index or 'manifest'
  timestamp: number;
  stages: DebugStage[];
  rawPayloadPreview?: string;
  rawPayloadLength?: number;
  finalStatus: "SUCCESS" | "ERROR" | "DROPPED";
}

interface ReceiveDebuggerProps {
  packets: DebugPacket[];
}

export function ReceiveDebugger({ packets }: ReceiveDebuggerProps) {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(packets, null, 2));
    const dlAnchorElem = document.createElement("a");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `prism-transfer-debug-${Date.now()}.json`);
    dlAnchorElem.click();
  };

  if (packets.length === 0) return null;

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          variant="outline" 
          className="rounded-full shadow-2xl bg-black/80 backdrop-blur-md border-green-900/50 text-green-400 hover:text-green-300 hover:bg-black/90 font-mono text-xs"
          onClick={() => setIsDrawerOpen(true)}
        >
          <Bug className="w-4 h-4 mr-2" /> Developer Diagnostics
        </Button>
      </div>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
            >
              <Card className="w-full max-w-4xl bg-black/95 backdrop-blur-xl border-t border-border/50 border-l border-r rounded-t-3xl text-green-400 font-mono text-xs shadow-2xl">
                <div className="flex justify-between items-center p-4 border-b border-green-900/30">
                  <div className="flex items-center space-x-2">
                    <Bug className="w-4 h-4 text-green-500" />
                    <span className="font-bold uppercase tracking-wider text-green-500">Pipeline Debugger</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Button variant="outline" size="sm" onClick={handleExport} className="h-7 text-[10px] border-green-800 text-green-400 hover:bg-green-900/50">
                      <Download className="w-3 h-3 mr-1" /> Export JSON
                    </Button>
                    <button onClick={() => setIsDrawerOpen(false)} className="text-muted-foreground hover:text-white transition-colors">
                      <ChevronDown className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col h-[60vh] max-h-[600px] overflow-y-auto p-2">
                  {packets.map((packet, idx) => (
                    <div key={`${packet.id}-${idx}`} className="border-b border-green-900/30 flex flex-col">
                      <div 
                        className={`flex items-center justify-between p-3 cursor-pointer hover:bg-green-900/20 rounded-md my-1 ${packet.finalStatus === 'ERROR' ? 'bg-red-900/10' : ''}`}
                        onClick={() => setExpandedId(expandedId === `${packet.id}-${idx}` ? null : `${packet.id}-${idx}`)}
                      >
                        <div className="flex items-center space-x-3 truncate">
                          {packet.finalStatus === 'SUCCESS' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : packet.finalStatus === 'ERROR' ? (
                            <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                          )}
                          <span className="text-muted-foreground">{new Date(packet.timestamp).toLocaleTimeString()}</span>
                          <span className="font-bold truncate">Packet: {packet.id}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          packet.finalStatus === 'SUCCESS' ? 'bg-green-900/50 text-green-400' :
                          packet.finalStatus === 'ERROR' ? 'bg-red-900/50 text-red-400' :
                          'bg-yellow-900/50 text-yellow-400'
                        }`}>
                          {packet.finalStatus}
                        </span>
                      </div>

                      {expandedId === `${packet.id}-${idx}` && (
                        <div className="p-4 m-2 bg-black/50 rounded-lg space-y-4 border border-green-900/30">
                          {packet.rawPayloadLength !== undefined && (
                            <div className="space-y-1">
                              <div className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">Payload Preview ({packet.rawPayloadLength} bytes)</div>
                              <div className="bg-green-950/30 p-2 rounded text-green-300 break-all text-[10px]">
                                {packet.rawPayloadPreview}
                              </div>
                            </div>
                          )}
                          <div className="space-y-2">
                            <div className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">Pipeline Execution</div>
                            <div className="flex flex-col space-y-1">
                              {packet.stages.map((stage, i) => (
                                <div key={i} className="flex flex-col pl-3 py-1">
                                  <div className="flex items-center space-x-2">
                                    {stage.status === 'SUCCESS' && <span className="text-green-500 font-bold">✓</span>}
                                    {stage.status === 'ERROR' && <span className="text-red-500 font-bold">✗</span>}
                                    {stage.status === 'SKIPPED' && <span className="text-yellow-500 font-bold">~</span>}
                                    <span className={`font-bold ${
                                      stage.status === 'ERROR' ? 'text-red-400' :
                                      stage.status === 'SUCCESS' ? 'text-green-400' :
                                      'text-muted-foreground'
                                    }`}>
                                      {stage.name}
                                    </span>
                                  </div>
                                  {stage.message && (
                                    <span className={`text-[10px] ml-4 mt-0.5 ${stage.status === 'ERROR' ? 'text-red-300' : 'text-green-600'}`}>
                                      {stage.message}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
