/// <reference lib="webworker" />
import { reconstructFile, ReconstructionError } from "@/features/scanner/reconstructionEngine";
import { TransferManifest, TransferPacket } from "@/types/transfer";
import { decodeBase64Url, encodeBase64Url } from "@/lib/encoder";
import { calculateCRC32 } from "@/lib/checksum";
import { RecoveryRegistry } from "@/lib/recovery";

export type ReconstructionWorkerRequest = 
  | { type: "reconstructFile"; manifest: TransferManifest; packets: TransferPacket[] }
  | { type: "recoverParity"; missingIndex: number; packets: TransferPacket[]; parityPacket: TransferPacket; manifest?: TransferManifest };

self.onmessage = async (event: MessageEvent<ReconstructionWorkerRequest>) => {
  const req = event.data;
  if (req.type === "reconstructFile") {
    try {
      const { manifest, packets } = req;
    
    const t0 = performance.now();
    // Perform sorting, decompression, CRC and SHA256 checks in the worker
    const { blob, metrics } = await reconstructFile(manifest, packets);
    
    // Blob is structured cloneable, we can send it directly
    self.postMessage({ 
      success: true, 
      blob,
      metrics: {
        latencyMs: Math.round(performance.now() - t0),
        details: metrics
      }
    });
    } catch (error: any) {
      self.postMessage({ type: "reconstructFile", success: false, error: error.message || "Unknown reconstruction error" });
    }
  } else if (req.type === "recoverParity") {
    try {
      const { missingIndex, packets, parityPacket } = req;
      const t0 = performance.now();
      
      const getBinary = (p: TransferPacket) => typeof p.payload === "string" ? decodeBase64Url(p.payload) : p.payload;
      
      const parityBin = getBinary(parityPacket);
      
      const algoName = req.manifest?.parityAlgorithm || "xor";
      const algo = RecoveryRegistry[algoName];
      if (!algo) {
        throw new Error(`Unsupported recovery algorithm: ${algoName}`);
      }

      const dataChunks = packets.map(getBinary);
      const recoveredBin = algo.recoverPacket(missingIndex, dataChunks, parityBin, parityBin.length);
      
      const crc32 = calculateCRC32(recoveredBin);
      const payload = parityPacket.version >= 3 ? recoveredBin : encodeBase64Url(recoveredBin);
      
      const recoveredPacket: TransferPacket = {
        version: parityPacket.version,
        transferId: parityPacket.transferId,
        packetId: `${parityPacket.transferId}:${missingIndex}`,
        kind: "data",
        index: missingIndex,
        total: parityPacket.total,
        crc32,
        payload,
      };
      
      self.postMessage({ type: "recoverParity", success: true, missingIndex, recoveredPacket, latencyMs: performance.now() - t0 });
    } catch (error: any) {
      self.postMessage({ type: "recoverParity", success: false, error: error.message || "Unknown parity recovery error" });
    }
  }
};
