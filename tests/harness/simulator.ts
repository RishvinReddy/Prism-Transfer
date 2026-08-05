import { TransferManifest, TransferPacket } from "../../src/types/transfer";
import { processFileForTransfer, ProcessedTransfer } from "../../src/lib/chunker";
import { TransferOptions } from "../../src/types/transfer";
import { reconstructFile } from "../../src/features/scanner/reconstructionEngine";
import { MemoryStorage } from "../../src/lib/storage/MemoryStorage";
import { validateManifestDetailed, validatePacketDetailed } from "../../src/lib/validator";
import { FaultInjectionEngine, SimulationScenario } from "./scenario";

export interface SimulatorResult {
  manifest: TransferManifest;
  sentPackets: number;
  receivedPackets: number;
  duplicateCount: number;
  corruptCount: number;
  recoveredCount: number;
  reconstructedSize: number;
  durationMs: number;
  success: boolean;
  error?: string;
}

export class TransferSimulator {
  private store = new MemoryStorage();

  async runScenario(
    payload: Uint8Array,
    settings: TransferOptions,
    scenario: SimulationScenario
  ): Promise<SimulatorResult> {
    const startTime = Date.now();
    
    // 1. Virtual Sender
    const file = new File([payload as any], "simulated.bin", { type: "application/octet-stream" });
    const processed: ProcessedTransfer = await processFileForTransfer(file, settings);
    
    // 2. Transport & Fault Injection
    const injector = new FaultInjectionEngine(scenario);
    const transmittedPackets = injector.processStream(processed.packets);
    
    // 3. Virtual Receiver
    let receivedCount = 0;
    let duplicateCount = 0;
    let corruptCount = 0;
    let recoveredCount = 0; // We'll compute this indirectly

    // Save manifest
    await this.store.saveManifest(processed.manifest);

    for (const packet of transmittedPackets) {
      // Validate packet (simulate receiver logic)
      const { valid } = validatePacketDetailed(packet);
      if (!valid) {
        corruptCount++;
        continue;
      }

      // Save to store
      const isNew = await this.store.savePacket(packet);
      if (isNew) {
        receivedCount++;
      } else {
        duplicateCount++;
      }
    }

    // Attempt reconstruction
    let success = false;
    let reconstructedSize = 0;
    let error: string | undefined = undefined;

    try {
      const storedPackets = await this.store.getAllPackets(processed.manifest.transferId);
      
      // We pass the storedPackets to reconstruction engine. The engine itself will
      // attempt parity recovery if necessary.
      const result = await reconstructFile(processed.manifest, storedPackets);
      
      reconstructedSize = result.blob.size;
      
      // A successful reconstruction means it passed the CRC / SHA checks
      success = true;
      
      // Calculate recovered packets: 
      // If we received fewer data packets than required, but it succeeded, it must have recovered them.
      const receivedDataPackets = storedPackets.filter(p => p.kind === "data").length;
      if (receivedDataPackets < processed.manifest.totalDataPackets) {
        recoveredCount = processed.manifest.totalDataPackets - receivedDataPackets;
      }
      
    } catch (e: any) {
      success = false;
      error = e.message;
    } finally {
      await this.store.clearTransfer(processed.manifest.transferId);
    }

    const durationMs = Date.now() - startTime;

    return {
      manifest: processed.manifest,
      sentPackets: processed.packets.length,
      receivedPackets: receivedCount,
      duplicateCount,
      corruptCount,
      recoveredCount,
      reconstructedSize,
      durationMs,
      success,
      error
    };
  }
}
