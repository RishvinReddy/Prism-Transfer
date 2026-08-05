import { TransferManifest, TransferPacket } from "@/types/transfer";

// ─── V2 Wire Format (compact field names) ────────────────────────────────────
//
// Reduces per-packet JSON envelope from ~135 bytes to ~45 bytes.
// Gain: ~90 bytes freed per frame ≈ 20% more data per QR frame.
//
// Packet field map:
//   version      → v
//   transferId   → t
//   packetId     → id
//   index        → i
//   total        → n
//   crc32        → c
//   payload      → d
//
// Manifest field map (additionally):
//   type              → k   (discriminator: "M" for manifest)
//   filename          → f
//   mimeType          → m
//   originalSize      → os
//   compressedSize    → cs
//   chunkSize         → ck
//   totalPackets      → n
//   sha256            → h
//   compressionAlgorithm → ca
//   createdAt         → at

interface WirePacketV2 {
  v: number;
  t: string;
  id: string;
  i: number;
  n: number;
  c: string;
  d: string;
}

interface WireManifestV2 {
  k: "M";       // discriminator — "M" for manifest (replaces type:"manifest")
  v: number;
  t: string;    // transferId
  f: string;    // filename
  m: string;    // mimeType
  os: number;   // originalSize
  cs: number;   // compressedSize
  ck: number;   // chunkSize
  n: number;    // totalPackets
  h: string;    // sha256
  ca: string;   // compressionAlgorithm
  at: number;   // createdAt
}

// ─── V2 Serializers ──────────────────────────────────────────────────────────

export function serializePacketV2(packet: TransferPacket): string {
  const wire: WirePacketV2 = {
    v:  packet.version,
    t:  packet.transferId,
    id: packet.packetId,
    i:  packet.index,
    n:  packet.total,
    c:  packet.crc32,
    d:  packet.payload,
  };
  return JSON.stringify(wire);
}

export function deserializePacketV2(json: string): TransferPacket {
  const w = JSON.parse(json) as WirePacketV2;
  return {
    version:    w.v,
    transferId: w.t,
    packetId:   w.id,
    index:      w.i,
    total:      w.n,
    crc32:      w.c,
    payload:    w.d,
  };
}

export function serializeManifestV2(manifest: TransferManifest): string {
  const wire: WireManifestV2 = {
    k:  "M",
    v:  manifest.version,
    t:  manifest.transferId,
    f:  manifest.filename,
    m:  manifest.mimeType,
    os: manifest.originalSize,
    cs: manifest.compressedSize,
    ck: manifest.chunkSize,
    n:  manifest.totalPackets,
    h:  manifest.sha256,
    ca: manifest.compressionAlgorithm,
    at: manifest.createdAt,
  };
  return JSON.stringify(wire);
}

export function deserializeManifestV2(json: string): TransferManifest {
  const w = JSON.parse(json) as WireManifestV2;
  return {
    version:              w.v,
    transferId:           w.t,
    filename:             w.f,
    mimeType:             w.m,
    originalSize:         w.os,
    compressedSize:       w.cs,
    chunkSize:            w.ck,
    totalPackets:         w.n,
    sha256:               w.h,
    compressionAlgorithm: w.ca,
    createdAt:            w.at,
  };
}

// ─── V1 Serializers (backward-compat, kept for one release cycle) ─────────────

/** @deprecated Use serializePacketV2. Kept for v1 receiver fallback. */
export function serializePacketV1(packet: TransferPacket): string {
  return JSON.stringify(packet);
}

/** @deprecated Use deserializePacketV2. Kept for v1 packet fallback on receiver. */
export function deserializePacketV1(json: string): TransferPacket {
  try {
    return JSON.parse(json) as TransferPacket;
  } catch {
    throw new Error("Failed to deserialize v1 packet");
  }
}

/** @deprecated Use serializeManifestV2. */
export function serializeManifestV1(manifest: TransferManifest): string {
  return JSON.stringify({ type: "manifest", ...manifest });
}

/** @deprecated Use deserializeManifestV2. */
export function deserializeManifestV1(json: string): TransferManifest {
  try {
    const parsed = JSON.parse(json);
    if (parsed.type === "manifest") {
      delete parsed.type;
    }
    return parsed as TransferManifest;
  } catch {
    throw new Error("Failed to deserialize v1 manifest");
  }
}

// ─── Public API — points to V2 ───────────────────────────────────────────────
// All callers (TransferController, QRPlayer, etc.) import these names.
// Swapping to V2 here is invisible to callers.

/** Serialize a packet for QR encoding (v2 compact format). */
export const serializePacket = serializePacketV2;

/** Serialize a manifest for QR encoding (v2 compact format). */
export const serializeManifest = serializeManifestV2;

// ─── Size estimation utilities ────────────────────────────────────────────────

/** Estimates the byte size of a v2 serialized packet (UTF-8 byte count). */
export function estimateSerializedPacketSize(packet: TransferPacket): number {
  return new Blob([serializePacketV2(packet)]).size;
}

/** Estimates the byte size of a v2 serialized manifest (UTF-8 byte count). */
export function estimateSerializedManifestSize(manifest: TransferManifest): number {
  return new Blob([serializeManifestV2(manifest)]).size;
}

// ─── Protocol version detection ───────────────────────────────────────────────

/** Returns true if a raw JSON string is a v2 packet or manifest. */
export function isV2Wire(raw: string): boolean {
  // V2 uses the compact "v" field directly; v1 used "version"
  try {
    const obj = JSON.parse(raw);
    return typeof obj.v === "number" && obj.v >= 2;
  } catch {
    return false;
  }
}

/** Returns true if a raw JSON string is a v2 manifest (discriminator k:"M"). */
export function isV2Manifest(raw: string): boolean {
  try {
    const obj = JSON.parse(raw);
    return obj.k === "M";
  } catch {
    return false;
  }
}
