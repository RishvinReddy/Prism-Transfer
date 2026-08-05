import { getProtocolEnvelopeReserve, getProtocolExpansion, PROTOCOL_VERSION } from "@/constants/protocol";

/**
 * QR capacity lookup table — binary byte capacity per QR version + EC level.
 * Source: ISO/IEC 18004:2015 Table 1 (byte-mode capacity after EC codewords).
 *
 * Only versions 10–40 are listed; versions 1–9 are too small for meaningful
 * binary payloads and are excluded from the adaptive engine.
 */
const QR_CAPACITY_TABLE: ReadonlyArray<{
  version: number;
  ec: "L" | "M" | "Q" | "H";
  bytes: number;
}> = [
  // Version 10
  { version: 10, ec: "L", bytes: 346 },
  { version: 10, ec: "M", bytes: 272 },
  { version: 10, ec: "Q", bytes: 192 },
  { version: 10, ec: "H", bytes: 154 },
  // Version 11
  { version: 11, ec: "L", bytes: 415 },
  { version: 11, ec: "M", bytes: 321 },
  { version: 11, ec: "Q", bytes: 235 },
  { version: 11, ec: "H", bytes: 180 },
  // Version 12
  { version: 12, ec: "L", bytes: 491 },
  { version: 12, ec: "M", bytes: 367 },
  { version: 12, ec: "Q", bytes: 287 },
  { version: 12, ec: "H", bytes: 206 },
  // Version 13
  { version: 13, ec: "L", bytes: 549 },
  { version: 13, ec: "M", bytes: 425 },
  { version: 13, ec: "Q", bytes: 331 },
  { version: 13, ec: "H", bytes: 244 },
  // Version 14
  { version: 14, ec: "L", bytes: 651 },
  { version: 14, ec: "M", bytes: 505 },
  { version: 14, ec: "Q", bytes: 362 },
  { version: 14, ec: "H", bytes: 261 },
  // Version 15
  { version: 15, ec: "L", bytes: 733 },
  { version: 15, ec: "M", bytes: 567 },
  { version: 15, ec: "Q", bytes: 412 },
  { version: 15, ec: "H", bytes: 295 },
  // Version 16
  { version: 16, ec: "L", bytes: 815 },
  { version: 16, ec: "M", bytes: 631 },
  { version: 16, ec: "Q", bytes: 450 },
  { version: 16, ec: "H", bytes: 325 },
  // Version 17
  { version: 17, ec: "L", bytes: 901 },
  { version: 17, ec: "M", bytes: 701 },
  { version: 17, ec: "Q", bytes: 504 },
  { version: 17, ec: "H", bytes: 367 },
  // Version 18
  { version: 18, ec: "L", bytes: 991 },
  { version: 18, ec: "M", bytes: 775 },
  { version: 18, ec: "Q", bytes: 560 },
  { version: 18, ec: "H", bytes: 397 },
  // Version 19
  { version: 19, ec: "L", bytes: 1085 },
  { version: 19, ec: "M", bytes: 857 },
  { version: 19, ec: "Q", bytes: 624 },
  { version: 19, ec: "H", bytes: 445 },
  // Version 20 ← default QR_TARGET_VERSION (97×97 modules)
  { version: 20, ec: "L", bytes: 1156 },
  { version: 20, ec: "M", bytes: 919 },
  { version: 20, ec: "Q", bytes: 666 },
  { version: 20, ec: "H", bytes: 485 },
  // Version 21
  { version: 21, ec: "L", bytes: 1258 },
  { version: 21, ec: "M", bytes: 992 },
  { version: 21, ec: "Q", bytes: 711 },
  { version: 21, ec: "H", bytes: 512 },
  // Version 22
  { version: 22, ec: "L", bytes: 1364 },
  { version: 22, ec: "M", bytes: 1066 },
  { version: 22, ec: "Q", bytes: 779 },
  { version: 22, ec: "H", bytes: 568 },
  // Version 23
  { version: 23, ec: "L", bytes: 1474 },
  { version: 23, ec: "M", bytes: 1171 },
  { version: 23, ec: "Q", bytes: 857 },
  { version: 23, ec: "H", bytes: 614 },
  // Version 24
  { version: 24, ec: "L", bytes: 1588 },
  { version: 24, ec: "M", bytes: 1273 },
  { version: 24, ec: "Q", bytes: 911 },
  { version: 24, ec: "H", bytes: 664 },
  // Version 25
  { version: 25, ec: "L", bytes: 1706 },
  { version: 25, ec: "M", bytes: 1367 },
  { version: 25, ec: "Q", bytes: 997 },
  { version: 25, ec: "H", bytes: 718 },
  // Version 26
  { version: 26, ec: "L", bytes: 1828 },
  { version: 26, ec: "M", bytes: 1465 },
  { version: 26, ec: "Q", bytes: 1059 },
  { version: 26, ec: "H", bytes: 754 },
  // Version 27
  { version: 27, ec: "L", bytes: 1921 },
  { version: 27, ec: "M", bytes: 1528 },
  { version: 27, ec: "Q", bytes: 1125 },
  { version: 27, ec: "H", bytes: 808 },
  // Version 28
  { version: 28, ec: "L", bytes: 2051 },
  { version: 28, ec: "M", bytes: 1628 },
  { version: 28, ec: "Q", bytes: 1190 },
  { version: 28, ec: "H", bytes: 871 },
  // Version 29
  { version: 29, ec: "L", bytes: 2185 },
  { version: 29, ec: "M", bytes: 1732 },
  { version: 29, ec: "Q", bytes: 1264 },
  { version: 29, ec: "H", bytes: 911 },
  // Version 30
  { version: 30, ec: "L", bytes: 2323 },
  { version: 30, ec: "M", bytes: 1840 },
  { version: 30, ec: "Q", bytes: 1351 },
  { version: 30, ec: "H", bytes: 985 },
  // Version 35
  { version: 35, ec: "L", bytes: 3057 },
  { version: 35, ec: "M", bytes: 2431 },
  { version: 35, ec: "Q", bytes: 1754 },
  { version: 35, ec: "H", bytes: 1286 },
  // Version 40
  { version: 40, ec: "L", bytes: 2953 },
  { version: 40, ec: "M", bytes: 2331 },
  { version: 40, ec: "Q", bytes: 1663 },
  { version: 40, ec: "H", bytes: 1273 },
];

// ─── Public API ──────────────────────────────────────────────────────────────

export interface QRSettings {
  version: number;
  errorCorrection: "L" | "M" | "Q" | "H";
  chunkSize: number;
}

/**
 * Returns the raw byte capacity of a QR code at a given version and EC level.
 * Returns 0 if the combination is not in the table (not a supported version).
 */
export function getQRCapacityBytes(
  version: number,
  ecLevel: "L" | "M" | "Q" | "H"
): number {
  const entry = QR_CAPACITY_TABLE.find(
    (r) => r.version === version && r.ec === ecLevel
  );
  return entry?.bytes ?? 0;
}

/**
 * Computes the maximum binary chunk size (bytes before Base64URL encoding)
 * that fits inside one QR frame at the given version and EC level.
 *
 * Formula:
 *   max_base64_chars = capacity_bytes - envelope_reserve
 *   max_binary_bytes = floor(max_base64_chars / BASE64_EXPANSION)
 *   safe_chunk_bytes = floor(max_binary_bytes * safetyFactor)
 *
 * @param version      QR version (10–40). Use QR_TARGET_VERSION for default.
 * @param ecLevel      Error correction level ("L" | "M" | "Q" | "H").
 * @param safetyFactor 0.0–1.0 throttle applied on top of capacity.
 *                     1.0 = use full available capacity.
 *                     0.85 = leave 15% headroom for camera jitter.
 * @returns Maximum safe binary payload bytes per QR frame (>= 50 minimum).
 */
export function computeMaxChunkSize(
  version: number,
  ecLevel: "L" | "M" | "Q" | "H",
  safetyFactor: number = 1.0
): number {
  const capacityBytes = getQRCapacityBytes(version, ecLevel);
  if (capacityBytes === 0) {
    // Unknown version/EC combination — fall back to a safe minimum
    return 150;
  }

  const availableForPayload = capacityBytes - getProtocolEnvelopeReserve(PROTOCOL_VERSION);
  if (availableForPayload <= 0) return 50;

  // Base64URL encoded string chars → binary bytes (for V3, factor is 1.0)
  const maxBinaryBytes = Math.floor(availableForPayload / getProtocolExpansion(PROTOCOL_VERSION));

  // Apply safety factor and enforce floor
  return Math.max(50, Math.floor(maxBinaryBytes * safetyFactor));
}

/**
 * Calculates the best QR parameters based on a scoring heuristic that
 * prioritises highest reliable throughput.
 *
 * Kept for backward-compatibility with the Simulator page.
 */
export function calculateBestQRSettings(): QRSettings {
  let bestScore = 0;
  let bestSettings: QRSettings = { version: 20, errorCorrection: "M", chunkSize: 800 };

  for (const config of QR_CAPACITY_TABLE) {
    const chunkSize = computeMaxChunkSize(config.version, config.ec, 0.85);

    // Reliability penalty: higher versions are harder to scan on cheap cameras
    let reliability = 1.0;
    if (config.version > 25) reliability *= 0.8;
    if (config.version > 35) reliability *= 0.6;
    if (config.ec === "L") reliability *= 0.9;

    const score = config.bytes * reliability * chunkSize;

    if (score > bestScore) {
      bestScore = score;
      bestSettings = {
        version: config.version,
        errorCorrection: config.ec,
        chunkSize,
      };
    }
  }

  return bestSettings;
}
