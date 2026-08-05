// ─── Protocol Version ────────────────────────────────────────────────────────
// v1: original JSON protocol with verbose field names
// v2: compact JSON protocol with short field names (lower envelope overhead)
export const PROTOCOL_VERSION = 2;

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
//
// Base64URL expands binary by factor 4/3 ≈ 1.334
// e.g. 900 binary bytes → ~1,200 chars of Base64URL
export const BASE64_EXPANSION = 4 / 3;

// Bytes reserved for the JSON envelope after Upgrade 1 (compact field names).
// Breakdown: {"v":2,"t":"<21>","id":"<21:3>","i":999,"n":999,"c":"<8>","d":"..."} ≈ 45 bytes
export const ENVELOPE_RESERVE_BYTES = 50;
