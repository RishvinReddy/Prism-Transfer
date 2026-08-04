import { zlibSync, unzlibSync } from "fflate";

export interface CompressionOptions {
  level?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9; // 0-9
}

/**
 * Compresses a Uint8Array using zlib via fflate.
 * Level 9 provides the best compression ratio but is slower.
 */
export function compressData(
  data: Uint8Array,
  options?: CompressionOptions
): Uint8Array {
  return zlibSync(data, { level: options?.level ?? 9 });
}

/**
 * Decompresses a Uint8Array using zlib via fflate.
 */
export function decompressData(data: Uint8Array): Uint8Array {
  return unzlibSync(data);
}
