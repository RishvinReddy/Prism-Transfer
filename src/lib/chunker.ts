import { nanoid } from "nanoid";
import {
  TransferManifest,
  TransferOptions,
  TransferPacket,
} from "@/types/transfer";
import {
  PROTOCOL_VERSION,
  DEFAULT_COMPRESSION,
  QR_TARGET_VERSION,
  PARITY_GROUP_SIZE,
} from "@/constants/protocol";
import { calculateCRC32, calculateSHA256 } from "./checksum";
import { compressData } from "./compressor";
import { encodeBase64Url } from "./encoder";
import { computeMaxChunkSize } from "./qr";
import { RecoveryRegistry } from "./recovery";
import { encryptData, buildAAD } from "./encryption";

// ─── Mode → EC level + safety factor ─────────────────────────────────────────
//
// Safety factor controls how much of the theoretical QR capacity we actually use:
//   1.00 = use every available byte (highest throughput, least headroom)
//   0.85 = leave 15% headroom (recommended for balanced scanning reliability)
//   0.75 = conservative (for low-quality cameras / H error correction)
//
// EC level choice rationale:
//   turbo    L  — maximum payload, minimum redundancy; good lighting required
//   speed    M  — standard redundancy; works in most lighting conditions
//   balanced M  — same EC as speed but with a safety factor to reduce scan errors
//   reliable H  — 30% error correction; works in difficult conditions
//
const MODE_CONFIG: Record<
  NonNullable<TransferOptions["reliabilityMode"]>,
  { ecLevel: "L" | "M" | "Q" | "H"; safetyFactor: number }
> = {
  turbo:    { ecLevel: "L", safetyFactor: 1.00 },
  speed:    { ecLevel: "M", safetyFactor: 1.00 },
  balanced: { ecLevel: "M", safetyFactor: 0.85 },
  reliable: { ecLevel: "H", safetyFactor: 0.75 },
};

/**
 * Calculates the optimal chunk size (binary bytes before Base64URL encoding)
 * by deriving it from the actual ISO QR capacity table.
 *
 * Replaces the old hardcoded lookup table:
 *   turbo    1000  → now ~617  bytes (EC=L,  v20, factor=1.00)
 *   speed     600  → now ~519  bytes (EC=M,  v20, factor=1.00)
 *   balanced  300  → now ~441  bytes (EC=M,  v20, factor=0.85)
 *   reliable  150  → now ~272  bytes (EC=H,  v20, factor=0.75)
 *
 * Note: "turbo" EC=L has *less* error-correcting capacity than "speed" EC=M,
 * but packs *more* payload per frame — the trade-off is intentional.
 */
export function calculateOptimalChunkSize(
  options?: TransferOptions,
  _totalCompressedSize?: number
): number {
  // Explicit override always wins
  if (options?.chunkSizeOverride) {
    return options.chunkSizeOverride;
  }

  const mode = options?.reliabilityMode ?? "balanced";
  const ecOverride = options?.errorCorrectionLevel;
  const versionOverride = options?.qrVersion ?? QR_TARGET_VERSION;

  const modeConf = MODE_CONFIG[mode] ?? MODE_CONFIG.balanced;
  const ecLevel = ecOverride ?? modeConf.ecLevel;

  return computeMaxChunkSize(versionOverride, ecLevel, modeConf.safetyFactor);
}

// ─── Public types ─────────────────────────────────────────────────────────────

export interface ProcessedTransfer {
  manifest: TransferManifest;
  packets: TransferPacket[];
  metrics?: {
    shaTimeMs: number;
    compressTimeMs: number;
    chunkTimeMs: number;
  };
}

// ─── Main pipeline ────────────────────────────────────────────────────────────

/**
 * Processes a File into a manifest and an array of ready-to-transmit packets.
 *
 * Pipeline:
 *   File → ArrayBuffer → Uint8Array
 *     → SHA-256 (original)
 *     → Compress (zlib/deflate)
 *     → Chunk (capacity-aware)
 *     → CRC32 per chunk
 *     → Base64URL encode
 *     → TransferPacket[]
 *     → TransferManifest
 */
export async function processFileForTransfer(
  file: File,
  options?: TransferOptions
): Promise<ProcessedTransfer> {
  const transferId = nanoid();
  const createdAt = Date.now();

  // 1. Read file
  const arrayBuffer = await file.arrayBuffer();
  const originalSize = arrayBuffer.byteLength;

  // 2. SHA-256 of original (uncompressed) data — used for final integrity check
  const t0 = performance.now();
  const sha256 = await calculateSHA256(arrayBuffer);
  const t1 = performance.now();

  // 3. Compress
  const uncompressedData = new Uint8Array(arrayBuffer);
  let payloadBytes = compressData(uncompressedData, {
    level: (options?.compressionLevel ?? DEFAULT_COMPRESSION) as
      | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
  });
  
  let encryptionMetadata;
  if (options?.encryptionPassphrase) {
    const aad = buildAAD({
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      originalSize,
      totalDataPackets: Math.ceil(payloadBytes.byteLength / calculateOptimalChunkSize(options, payloadBytes.byteLength)), // Approximate, will be exact if chunkSize doesn't change
      compressionAlgorithm: "deflate"
    });
    
    // We need the exact chunk size and packet count before encryption so we can lock AAD
    const tempChunkSize = calculateOptimalChunkSize(options, payloadBytes.byteLength);
    // Actually, encrypting adds 16 bytes (tag), which might change chunk count. Let's compute after encrypt.
    // Wait! AAD needs totalDataPackets. If we encrypt first, size increases by 16 bytes (tag).
    // Let's compute exact packet count for AAD
    const encryptedSize = payloadBytes.byteLength + 16;
    const finalChunkSize = calculateOptimalChunkSize(options, encryptedSize);
    const finalDataPackets = Math.ceil(encryptedSize / finalChunkSize) || 1;
    
    const finalAad = buildAAD({
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      originalSize,
      totalDataPackets: finalDataPackets,
      compressionAlgorithm: "deflate"
    });

    const encResult = await encryptData(payloadBytes, options.encryptionPassphrase, finalAad);
    payloadBytes = encResult.ciphertext;
    encryptionMetadata = encResult.metadata;
    
    // Clear passphrase reference immediately
    options.encryptionPassphrase = undefined;
  }
  
  const compressedSize = payloadBytes.byteLength;
  const t2 = performance.now();

  // 4. Determine chunk size from real QR capacity
  const chunkSize = calculateOptimalChunkSize(options, compressedSize);

  // 5. Slice → CRC32 → Base64URL → TransferPacket
  const totalDataPackets = Math.ceil(compressedSize / chunkSize) || 1;
  const packets: TransferPacket[] = [];
  
  // Store raw binary chunks to generate parity
  const rawChunks: Uint8Array[] = [];

  for (let index = 0; index < totalDataPackets; index++) {
    const start = index * chunkSize;
    const end = Math.min(start + chunkSize, compressedSize);
    const chunkBytes = payloadBytes.slice(start, end);
    rawChunks.push(chunkBytes);

    const crc32 = calculateCRC32(chunkBytes);
    const payload = PROTOCOL_VERSION >= 3 ? chunkBytes : encodeBase64Url(chunkBytes);

    packets.push({
      version:    PROTOCOL_VERSION,
      transferId,
      packetId:   `${transferId}:${index}`,
      kind:       "data",
      index,
      total:      totalDataPackets,
      crc32,
      payload,
    });
  }
  
  // 5.5 Generate Parity Packets
  const activeParityGroupSize = options?.parityGroupSize ?? PARITY_GROUP_SIZE;
  const totalParityPackets = Math.ceil(totalDataPackets / activeParityGroupSize);
  for (let pIndex = 0; pIndex < totalParityPackets; pIndex++) {
    const parityBytes = new Uint8Array(chunkSize);
    const startIndex = pIndex * activeParityGroupSize;
    const endIndex = Math.min(startIndex + activeParityGroupSize, totalDataPackets);
    
    const algo = RecoveryRegistry["xor"];
    if (algo) {
      const parityBytes = algo.encodeParity(rawChunks.slice(startIndex, endIndex), chunkSize);
      const crc32 = calculateCRC32(parityBytes);
      const payload = PROTOCOL_VERSION >= 3 ? parityBytes : encodeBase64Url(parityBytes);
      const index = totalDataPackets + pIndex;
      
      packets.push({
        version:    PROTOCOL_VERSION,
        transferId,
        packetId:   `${transferId}:${index}`,
        kind:       "parity",
        index,
        total:      totalDataPackets,
        crc32,
        payload,
      });
    }
  }
  const t3 = performance.now();

  // 6. Manifest
  const manifest: TransferManifest = {
    version:              PROTOCOL_VERSION,
    transferId,
    filename:             file.name,
    mimeType:             file.type || "application/octet-stream",
    originalSize,
    compressedSize,
    chunkSize,
    totalDataPackets,
    totalParityPackets,
    parityGroupSize:      activeParityGroupSize,
    parityAlgorithm:      "xor",
    sha256,
    compressionAlgorithm: "deflate",
    createdAt,
    ...(encryptionMetadata ? { encryption: encryptionMetadata } : {})
  };

  return { 
    manifest, 
    packets,
    metrics: {
      shaTimeMs: Math.round(t1 - t0),
      compressTimeMs: Math.round(t2 - t1),
      chunkTimeMs: Math.round(t3 - t2)
    }
  };
}
