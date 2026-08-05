// Precomputed CRC-32 table
const makeCRCTable = () => {
  let c;
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }
  return crcTable;
};

const crcTable = makeCRCTable();

/**
 * Calculates a standard CRC-32 hash for a Uint8Array.
 * Pure TS, deterministic, and lightweight.
 */
export function calculateCRC32(data: Uint8Array): string {
  let crc = 0 ^ -1;
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ data[i]) & 0xff];
  }
  crc = (crc ^ -1) >>> 0;
  return crc.toString(16).padStart(8, "0");
}

/**
 * Calculates a SHA-256 hash using the Web Crypto API.
 */
export async function calculateSHA256(data: BufferSource): Promise<string> {
  let validData: Uint8Array;
  if (data instanceof ArrayBuffer) {
    validData = new Uint8Array(data);
  } else if (ArrayBuffer.isView(data)) {
    validData = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  } else {
    validData = new Uint8Array(data as any);
  }

  const hashBuffer = await crypto.subtle.digest("SHA-256", validData as BufferSource);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}
