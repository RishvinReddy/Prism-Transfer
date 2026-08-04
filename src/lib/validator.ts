import { TransferManifest, TransferPacket } from "@/types/transfer";
import { PROTOCOL_VERSION } from "@/constants/protocol";
import { calculateCRC32, calculateSHA256 } from "./checksum";
import { decodeBase64Url } from "./encoder";

/**
 * Validates that a parsed JSON object conforms to the TransferManifest schema.
 */
export function validateManifest(manifest: Partial<TransferManifest>): manifest is TransferManifest {
  if (!manifest) return false;
  
  const requiredFields = [
    "version", "transferId", "filename", "mimeType", 
    "originalSize", "compressedSize", "chunkSize", 
    "totalPackets", "sha256", "compressionAlgorithm"
  ];

  for (const field of requiredFields) {
    if (manifest[field as keyof TransferManifest] === undefined) {
      return false;
    }
  }

  if (manifest.version !== PROTOCOL_VERSION) {
    console.warn(`Manifest version mismatch. Expected ${PROTOCOL_VERSION}, got ${manifest.version}`);
  }

  return true;
}

/**
 * Validates that a parsed JSON object conforms to the TransferPacket schema.
 */
export function validatePacket(packet: Partial<TransferPacket>): packet is TransferPacket {
  if (!packet) return false;

  const requiredFields = [
    "version", "transferId", "packetId", "index", 
    "total", "crc32", "payload"
  ];

  for (const field of requiredFields) {
    if (packet[field as keyof TransferPacket] === undefined) {
      return false;
    }
  }

  return true;
}

/**
 * Verifies the integrity of a packet's payload against its CRC32 hash.
 */
export function verifyCRC(packet: TransferPacket): boolean {
  try {
    const chunkBytes = decodeBase64Url(packet.payload);
    const computedCrc = calculateCRC32(chunkBytes);
    return computedCrc === packet.crc32;
  } catch (error) {
    return false;
  }
}

/**
 * Verifies the integrity of the reconstructed file against the global SHA-256 hash.
 */
export async function verifySHA(reconstructedBuffer: ArrayBuffer, expectedSha256: string): Promise<boolean> {
  try {
    const computedSha = await calculateSHA256(reconstructedBuffer);
    return computedSha === expectedSha256;
  } catch (error) {
    return false;
  }
}
