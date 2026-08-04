import { nanoid } from "nanoid";
import {
  TransferManifest,
  TransferOptions,
  TransferPacket,
} from "@/types/transfer";
import { PROTOCOL_VERSION, DEFAULT_CHUNK_SIZE, DEFAULT_COMPRESSION } from "@/constants/protocol";
import { calculateCRC32, calculateSHA256 } from "./checksum";
import { compressData } from "./compressor";
import { encodeBase64Url } from "./encoder";

/**
 * Calculates the optimal chunk size based on QR version and error correction.
 * For now, returns a safe default of 800 bytes binary payload if not overridden.
 * This can be expanded later for dynamic capacity calculation.
 */
export function calculateOptimalChunkSize(options?: TransferOptions, totalCompressedSize?: number): number {
  if (options?.chunkSizeOverride) {
    return options.chunkSizeOverride;
  }

  const mode = options?.reliabilityMode || "balanced";
  switch (mode) {
    case "turbo":
      return 1000;
    case "speed":
      return 600;
    case "balanced":
      return 300;
    case "reliable":
      return 150;
    default:
      return 300;
  }
}

export interface ProcessedTransfer {
  manifest: TransferManifest;
  packets: TransferPacket[];
}

/**
 * Main engine function: Processes a File into a manifest and an array of packets.
 * Pipeline: File -> ArrayBuffer -> Uint8Array -> Compress -> SHA256 -> Chunk -> CRC32 -> Base64URL -> TransferPacket
 */
export async function processFileForTransfer(
  file: File,
  options?: TransferOptions
): Promise<ProcessedTransfer> {
  const transferId = nanoid();
  const createdAt = Date.now();
  // 1. Read File to ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  const originalSize = arrayBuffer.byteLength;

  // 2. Compute Global SHA-256 on the original uncompressed data
  const sha256 = await calculateSHA256(arrayBuffer);

  // 3. Compress the entire file
  const uncompressedData = new Uint8Array(arrayBuffer);
  const compressedData = compressData(uncompressedData, {
    level: (options?.compressionLevel ?? DEFAULT_COMPRESSION) as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
  });
  const compressedSize = compressedData.byteLength;
  
  // 4. Calculate chunk size based on options and compressed size
  const chunkSize = calculateOptimalChunkSize(options, compressedSize);

  // 5. Calculate chunks
  const totalPackets = Math.ceil(compressedSize / chunkSize) || 1;
  const packets: TransferPacket[] = [];

  // 5. Split, CRC32, and encode
  for (let index = 0; index < totalPackets; index++) {
    const start = index * chunkSize;
    const end = Math.min(start + chunkSize, compressedSize);
    const chunkBytes = compressedData.slice(start, end);

    // Compute CRC32 for the compressed chunk
    const crc32 = calculateCRC32(chunkBytes);

    // Encode to Base64URL
    const payload = encodeBase64Url(chunkBytes);

    const packet: TransferPacket = {
      version: PROTOCOL_VERSION,
      transferId,
      packetId: `${transferId}:${index}`,
      index,
      total: totalPackets,
      crc32,
      payload,
    };

    packets.push(packet);
  }

  // 6. Generate Manifest
  const manifest: TransferManifest = {
    version: PROTOCOL_VERSION,
    transferId,
    filename: file.name,
    mimeType: file.type || "application/octet-stream",
    originalSize,
    compressedSize,
    chunkSize,
    totalPackets,
    sha256,
    compressionAlgorithm: "deflate", // fflate zlibSync uses deflate
    createdAt,
  };

  return {
    manifest,
    packets,
  };
}
