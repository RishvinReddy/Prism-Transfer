import { TransferManifest, TransferPacket } from "@/types/transfer";
import { PROTOCOL_VERSION } from "@/constants/protocol";
import { calculateCRC32, calculateSHA256 } from "./checksum";
import { decodeBase64Url } from "./encoder";

// ─── V2 validation (compact field names) ─────────────────────────────────────

const MANIFEST_V2_REQUIRED = ["v", "t", "f", "m", "os", "cs", "ck", "n", "h", "ca"] as const;
const PACKET_V2_REQUIRED   = ["v", "t", "id", "i", "n", "c", "d"] as const;

// ─── V1 validation (verbose field names) ─────────────────────────────────────

const MANIFEST_V1_REQUIRED = [
  "version", "transferId", "filename", "mimeType",
  "originalSize", "compressedSize", "chunkSize",
  "totalDataPackets", "sha256", "compressionAlgorithm",
] as const;

const PACKET_V1_REQUIRED = [
  "version", "transferId", "packetId", "index",
  "total", "crc32", "payload",
] as const;

// ─── Protocol version detection ───────────────────────────────────────────────

function isV2Packet(obj: Record<string, unknown>): boolean {
  // V2 packets carry a short "v" number field AND "d" (payload alias)
  return typeof obj.v === "number" && obj.v >= 2 && "d" in obj;
}

function isV2Manifest(obj: Record<string, unknown>): boolean {
  // V2 manifests use k:"M" as discriminator
  return obj.k === "M";
}

// ─── Manifest validation ──────────────────────────────────────────────────────

export function validateManifest(
  manifest: Partial<TransferManifest>
): manifest is TransferManifest {
  return validateManifestDetailed(manifest).valid;
}

export function validateManifestDetailed(
  manifest: Partial<TransferManifest> | Record<string, unknown> | null
): { valid: boolean; reason?: string } {
  if (!manifest) return { valid: false, reason: "Manifest is null or undefined" };

  const obj = manifest as Record<string, unknown>;

  if (isV2Manifest(obj)) {
    // ── V2 path ──
    for (const field of MANIFEST_V2_REQUIRED) {
      if (obj[field] === undefined) {
        return { valid: false, reason: `V2 manifest missing field: ${field}` };
      }
    }
    // Version check against the compact "v" field
    if (typeof obj.v === "number" && obj.v !== PROTOCOL_VERSION) {
      return {
        valid: false,
        reason: `Protocol version mismatch. Expected ${PROTOCOL_VERSION}, got ${obj.v}`,
      };
    }
    return { valid: true };
  }

  // ── V1 path (backward-compat fallback) ──
  for (const field of MANIFEST_V1_REQUIRED) {
    if ((manifest as any)[field] === undefined) {
      return { valid: false, reason: `V1 manifest missing field: ${field}` };
    }
  }
  if ((manifest as any).version !== undefined && (manifest as any).version !== 1) {
    return {
      valid: false,
      reason: `Unsupported V1 manifest version: ${(manifest as any).version}`,
    };
  }

  return { valid: true };
}

// ─── Packet validation ────────────────────────────────────────────────────────

export function validatePacket(
  packet: Partial<TransferPacket>
): packet is TransferPacket {
  return validatePacketDetailed(packet).valid;
}

export function validatePacketDetailed(
  packet: Partial<TransferPacket> | Record<string, unknown> | null
): { valid: boolean; reason?: string } {
  if (!packet) return { valid: false, reason: "Packet is null or undefined" };

  const obj = packet as Record<string, unknown>;

  if (isV2Packet(obj)) {
    // ── V2 path ──
    for (const field of PACKET_V2_REQUIRED) {
      if (obj[field] === undefined) {
        return { valid: false, reason: `V2 packet missing field: ${field}` };
      }
    }
    return { valid: true };
  }

  // ── V1 path (backward-compat fallback) ──
  for (const field of PACKET_V1_REQUIRED) {
    if ((packet as any)[field] === undefined) {
      return { valid: false, reason: `V1 packet missing field: ${field}` };
    }
  }

  return { valid: true };
}

// ─── Integrity checks ─────────────────────────────────────────────────────────

/**
 * Verifies CRC32 integrity of a packet's payload.
 * Works for both v1 (payload field) and v2 (d field on wire; normalized to payload after deserialization).
 */
export function verifyCRC(packet: TransferPacket): boolean {
  try {
    const chunkBytes = typeof packet.payload === "string" ? decodeBase64Url(packet.payload) : packet.payload;
    const computedCrc = calculateCRC32(chunkBytes);
    return computedCrc === packet.crc32;
  } catch {
    return false;
  }
}

/**
 * Verifies SHA-256 of the fully reconstructed file against the manifest hash.
 */
export async function verifySHA(
  reconstructedBuffer: BufferSource,
  expectedSha256: string
): Promise<boolean> {
  try {
    const computedSha = await calculateSHA256(reconstructedBuffer);
    return computedSha === expectedSha256;
  } catch {
    return false;
  }
}
