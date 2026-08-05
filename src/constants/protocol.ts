// ─── Protocol Version ────────────────────────────────────────────────────────
// v1: original JSON protocol with verbose field names
// v2: compact JSON protocol with short field names (lower envelope overhead)
// v3: zero-copy binary framing
export const PROTOCOL_VERSION = 3;

// ─── QR Parameters ───────────────────────────────────────────────────────────
export const DEFAULT_CHUNK_SIZE = 220;          // Legacy fallback only
export const DEFAULT_COMPRESSION = 9;           // fflate zlib level
export const DEFAULT_QR_VERSION = 20;           // ISO 18004 version 1–40
export const QR_TARGET_VERSION = 20;            // Pinned: 97×97 modules, reliable at arm's length
export const DEFAULT_ERROR_CORRECTION = "M";    // L | M | Q | H
export const MAX_FILENAME_LENGTH = 255;
export const DEFAULT_FPS = 10;

// ─── Serialization constants ──────────────────────────────────────────────────
// Used by chunker.ts to compute usable binary payload per QR frame.
export const BASE64_EXPANSION = 4 / 3;

export function getProtocolEnvelopeReserve(version: number): number {
  if (version >= 3) {
    // V3 Binary Header (28 bytes) + Data fields (8 bytes) = 36 bytes
    return 36;
  }
  // V2 JSON compact fields ({"v":2,"t":"...","id":"...","i":999,"n":999,"c":"<8>","d":"..."})
  return 50;
}

export function getProtocolExpansion(version: number): number {
  if (version >= 3) return 1.0; // Raw binary, no base64 overhead!
  return BASE64_EXPANSION;
}
