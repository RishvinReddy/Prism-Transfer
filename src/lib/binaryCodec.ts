import { TransferManifest, TransferPacket } from "@/types/transfer";

/**
 * Protocol V3: Custom Binary Framing
 *
 * Magic Byte: 0x03
 * Packet Types: 0x00 (Manifest), 0x01 (Data)
 * 
 * Standard Header (25 bytes):
 * [0]   uint8: Version (0x03)
 * [1]   uint8: Packet Type
 * [2]   uint8: Flags (Reserved)
 * [3-23] 21 bytes: Transfer ID (ASCII NanoID)
 * [24-27] uint32: Header CRC32 (Not enforced in this file, left as 0 for now)
 * 
 * Manifest Packet (Type 0x00):
 * [28-35] uint64 (bigint): Total Size (original file size)
 * [36-39] uint32: Chunk Count (totalDataPackets)
 * [40-41] uint16: totalParityPackets
 * [42-43] uint16: parityGroupSize
 * [44]    uint8: parityAlgorithm (0=none, 1=xor)
 * [45-46] uint16: Filename Length (N)
 * [47 ... 47+N-1] UTF-8 Filename
 * [47+N] uint8: MIME Type Length (M)
 * [48+N ... 48+N+M-1] UTF-8 MIME Type
 * 
 * Data Packet (Type 0x01) / Parity Packet (Type 0x02):
 * [28-31] uint32: Chunk Index
 * [32-35] uint32: Payload CRC32
 * [36...] raw payload bytes (zero-copy extraction)
 */

const V3_MAGIC = 0x03;
const TYPE_MANIFEST = 0x00;
const TYPE_DATA = 0x01;
const TYPE_PARITY = 0x02;
const HEADER_SIZE = 28; // Standard Header (25) + 3 bytes padding/alignment? Let's stick to spec.

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function hexToUint32(hex: string): number {
  return parseInt(hex, 16);
}

function uint32ToHex(num: number): string {
  return num.toString(16).padStart(8, "0");
}

function encodeTransferId(id: string, view: DataView, offset: number) {
  for (let i = 0; i < 21; i++) {
    view.setUint8(offset + i, id.charCodeAt(i));
  }
}

function decodeTransferId(view: DataView, offset: number): string {
  let id = "";
  for (let i = 0; i < 21; i++) {
    id += String.fromCharCode(view.getUint8(offset + i));
  }
  return id;
}

export function encodeDataPacketV3(packet: TransferPacket): Uint8Array {
  const payloadBytes = packet.payload as Uint8Array;
  const envelopeSize = 36;
  const buffer = new Uint8Array(envelopeSize + payloadBytes.length);
  const view = new DataView(buffer.buffer);

  view.setUint8(0, V3_MAGIC);
  view.setUint8(1, packet.kind === "parity" ? TYPE_PARITY : TYPE_DATA);
  view.setUint8(2, 0); // flags
  encodeTransferId(packet.transferId, view, 3);
  view.setUint32(24, 0, false); // Header CRC

  view.setUint32(28, packet.index, false); 
  view.setUint32(32, hexToUint32(packet.crc32), false);

  buffer.set(payloadBytes, 36); 

  return buffer;
}

export function decodeDataPacketV3(buffer: Uint8Array): TransferPacket {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  
  if (view.getUint8(0) !== V3_MAGIC) throw new Error("Not a V3 packet");
  const typeByte = view.getUint8(1);
  if (typeByte !== TYPE_DATA && typeByte !== TYPE_PARITY) throw new Error("Not a Data or Parity packet");

  const transferId = decodeTransferId(view, 3);
  const index = view.getUint32(28, false);
  const crc32 = uint32ToHex(view.getUint32(32, false));
  
  // Zero-copy payload extraction
  const payload = buffer.subarray(36);

  return {
    version: 3,
    transferId,
    packetId: `${transferId}:${index}`,
    kind: typeByte === TYPE_PARITY ? "parity" : "data",
    index,
    total: 0, // In V3, total packets is only in Manifest to save space
    crc32,
    payload
  };
}

export function encodeManifestPacketV3(manifest: TransferManifest): Uint8Array {
  const filenameBytes = textEncoder.encode(manifest.filename);
  const mimeBytes = textEncoder.encode(manifest.mimeType);

  // Header (28) + size(8) + count(4) + parityFields(5) + nameLen(2) + name(N) + mimeLen(1) + mime(M)
  const envelopeSize = 28 + 8 + 4 + 5 + 2 + filenameBytes.length + 1 + mimeBytes.length;
  const buffer = new Uint8Array(envelopeSize);
  const view = new DataView(buffer.buffer);

  view.setUint8(0, V3_MAGIC);
  view.setUint8(1, TYPE_MANIFEST);
  view.setUint8(2, 0);
  encodeTransferId(manifest.transferId, view, 3);
  view.setUint32(24, 0, false);

  // BigInt for total size (8 bytes)
  view.setBigUint64(28, BigInt(manifest.originalSize), false);
  view.setUint32(36, manifest.totalDataPackets, false);
  view.setUint16(40, manifest.totalParityPackets, false);
  view.setUint16(42, manifest.parityGroupSize, false);
  view.setUint8(44, manifest.parityAlgorithm === "xor" ? 1 : 0);
  
  view.setUint16(45, filenameBytes.length, false);
  buffer.set(filenameBytes, 47);
  
  const mimeOffset = 47 + filenameBytes.length;
  view.setUint8(mimeOffset, mimeBytes.length);
  buffer.set(mimeBytes, mimeOffset + 1);

  return buffer;
}

export function decodeManifestPacketV3(buffer: Uint8Array): TransferManifest {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  if (view.getUint8(0) !== V3_MAGIC) throw new Error("Not a V3 packet");
  if (view.getUint8(1) !== TYPE_MANIFEST) throw new Error("Not a Manifest packet");

  const transferId = decodeTransferId(view, 3);
  const originalSize = Number(view.getBigUint64(28, false));
  const totalDataPackets = view.getUint32(36, false);
  const totalParityPackets = view.getUint16(40, false);
  const parityGroupSize = view.getUint16(42, false);
  const parityAlgorithm = view.getUint8(44) === 1 ? "xor" : "none";
  
  const nameLen = view.getUint16(45, false);
  
  const filenameBytes = buffer.subarray(47, 47 + nameLen);
  const filename = textDecoder.decode(filenameBytes);

  const mimeOffset = 47 + nameLen;
  const mimeLen = view.getUint8(mimeOffset);
  const mimeBytes = buffer.subarray(mimeOffset + 1, mimeOffset + 1 + mimeLen);
  const mimeType = textDecoder.decode(mimeBytes);

  return {
    version: 3,
    transferId,
    filename,
    mimeType,
    originalSize,
    totalDataPackets,
    totalParityPackets,
    parityGroupSize,
    parityAlgorithm,
    // Note: V3 drops chunk size/compression algo strings from manifest to save space, 
    // assuming fixed defaults (e.g., DEFLATE) and dynamic chunks. 
    // We populate with defaults for type compatibility.
    compressedSize: 0,
    chunkSize: 0,
    sha256: "",
    compressionAlgorithm: "deflate-raw",
    createdAt: Date.now()
  };
}

export function isV3Packet(buffer: Uint8Array): boolean {
  return buffer.length > 0 && buffer[0] === V3_MAGIC;
}
