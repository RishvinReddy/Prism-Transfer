import { TransferManifest, TransferPacket } from "@/types/transfer";
import { verifyCRC, verifySHA } from "@/lib/validator";
import { decompressData } from "@/lib/compressor";
import { decodeBase64Url } from "@/lib/encoder";
import { decryptData, buildAAD } from "@/lib/encryption";

export class ReconstructionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReconstructionError";
  }
}

/**
 * Reconstructs the original file from the received packets.
 * Pipeline: Sort -> Verify CRC -> Merge -> Verify SHA -> Decompress -> Blob
 */
export async function reconstructFile(
  manifest: TransferManifest,
  packets: TransferPacket[],
  options?: { encryptionPassphrase?: string }
): Promise<{ blob: Blob; metrics: { crcTimeMs: number; decryptTimeMs: number; decompressTimeMs: number; shaTimeMs: number } }> {
  if (packets.length !== manifest.totalDataPackets) {
    throw new ReconstructionError(`Missing packets. Expected ${manifest.totalDataPackets}, got ${packets.length}`);
  }

  // 1. Sort packets by index
  packets.sort((a, b) => a.index - b.index);

  const t0 = performance.now();

  // 2. Decode and Verify CRC for all packets (redundant check, but ensures safety)
  const decodedChunks: Uint8Array[] = [];
  let totalCompressedSize = 0;

  for (let i = 0; i < packets.length; i++) {
    const packet = packets[i];
    if (packet.index !== i) {
      throw new ReconstructionError(`Packet sequence error at index ${i}`);
    }

    if (!verifyCRC(packet)) {
      throw new ReconstructionError(`CRC32 validation failed for packet ${i}`);
    }

    const chunkData = typeof packet.payload === "string" ? decodeBase64Url(packet.payload) : packet.payload;
    decodedChunks.push(chunkData);
    totalCompressedSize += chunkData.length;
  }
  const t1 = performance.now();

  // 3. Merge chunks
  let mergedBuffer: Uint8Array = new Uint8Array(totalCompressedSize);
  let offset = 0;
  for (const chunk of decodedChunks) {
    mergedBuffer.set(chunk, offset);
    offset += chunk.length;
  }
  
  let decryptTimeMs = 0;
  
  if (manifest.encryption) {
    if (!options?.encryptionPassphrase) {
      throw new ReconstructionError("Passphrase required for encrypted transfer.");
    }
    
    const tDecrypt = performance.now();
    const aad = buildAAD({
      filename: manifest.filename,
      mimeType: manifest.mimeType,
      originalSize: manifest.originalSize,
      totalDataPackets: manifest.totalDataPackets,
      compressionAlgorithm: manifest.compressionAlgorithm
    });
    
    try {
      const decrypted = await decryptData(
        mergedBuffer,
        options.encryptionPassphrase,
        manifest.encryption,
        aad
      );
      
      // Update mergedBuffer reference with decrypted bytes
      mergedBuffer = decrypted;
      decryptTimeMs = Math.round(performance.now() - tDecrypt);
    } catch (err: any) {
      throw new ReconstructionError(err.message || "Decryption failed.");
    }
  }
  // 4. Decompress
  let decompressedData: Uint8Array;
  try {
    decompressedData = decompressData(mergedBuffer);
  } catch (error) {
    throw new ReconstructionError("Decompression failed");
  }
  const t2 = performance.now();

  if (decompressedData.length !== manifest.originalSize) {
    throw new ReconstructionError(
      `Size mismatch. Expected ${manifest.originalSize}, got ${decompressedData.length}`
    );
  }

  // 5. Verify SHA-256
  const isValidSha = await verifySHA(decompressedData as any, manifest.sha256);
  const t3 = performance.now();
  
  if (!isValidSha) {
    throw new ReconstructionError("Global SHA-256 verification failed. File is corrupted.");
  }

  // 6. Return as Blob ready for download
  return { 
    blob: new Blob([decompressedData as any], { type: manifest.mimeType }),
    metrics: {
      crcTimeMs: Math.round(t1 - t0),
      decryptTimeMs,
      decompressTimeMs: Math.round(t2 - t1),
      shaTimeMs: Math.round(t3 - t2)
    }
  };
}

/**
 * Triggers a download in the browser for the reconstructed Blob.
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
