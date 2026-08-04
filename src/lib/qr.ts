/**
 * Determines the optimal QR version, error correction level, and chunk size
 * based on a scoring heuristic that prioritizes highest reliable throughput.
 */

export interface QRSettings {
  version: number;
  errorCorrection: "L" | "M" | "Q" | "H";
  chunkSize: number;
}

// Simplified lookup table mapping QR version & EC to Max Byte Capacity (for alphanumeric/binary)
// We use a subset of popular high-density versions for video transfers.
// Data from standard ISO/IEC 18004
const QR_CAPACITIES = [
  { version: 15, ec: "L", bytes: 1251 },
  { version: 15, ec: "M", bytes: 991 },
  { version: 20, ec: "L", bytes: 2061 },
  { version: 20, ec: "M", bytes: 1634 },
  { version: 25, ec: "L", bytes: 3057 },
  { version: 25, ec: "M", bytes: 2431 },
  { version: 30, ec: "L", bytes: 4238 },
  { version: 30, ec: "M", bytes: 3391 },
  { version: 40, ec: "L", bytes: 7089 },
  { version: 40, ec: "M", bytes: 5596 },
];

/**
 * Calculates the best QR parameters based on the desired target parameters or
 * evaluates the entire matrix to find the highest score.
 */
export function calculateBestQRSettings(): QRSettings {
  let bestScore = 0;
  let bestSettings: QRSettings = { version: 20, errorCorrection: "M", chunkSize: 800 };

  for (const config of QR_CAPACITIES) {
    // 1. Capacity (Bytes)
    const capacity = config.bytes;
    
    // We reserve some bytes for the JSON envelope and base64 overhead
    const effectiveChunkSize = Math.floor((capacity - 150) * 0.75); // Base64URL inflates by ~33%
    
    if (effectiveChunkSize <= 0) continue;

    // 2. Scan Reliability Factor
    // Lower versions are easier to scan. L is harder to scan in motion than M.
    let reliability = 1.0;
    if (config.version > 25) reliability *= 0.8; // High density starts getting blurry on cheap cameras
    if (config.version > 35) reliability *= 0.6;
    if (config.ec === "L") reliability *= 0.9;
    
    // 3. Transfer Speed Factor
    // Bigger capacity = fewer frames = faster transfer, assuming it can be scanned
    const transferSpeed = effectiveChunkSize;

    // The Score Function
    const score = capacity * reliability * transferSpeed;

    if (score > bestScore) {
      bestScore = score;
      bestSettings = {
        version: config.version,
        errorCorrection: config.ec as "L" | "M",
        chunkSize: effectiveChunkSize,
      };
    }
  }

  return bestSettings;
}
