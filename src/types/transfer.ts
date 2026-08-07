import type { EncryptionMetadata } from "@/lib/encryption";

export interface TransferManifest {
  version: number;
  transferId: string;
  filename: string;
  mimeType: string;
  originalSize: number;
  compressedSize: number;
  chunkSize: number;
  totalDataPackets: number;
  totalParityPackets: number;
  parityGroupSize: number;
  parityAlgorithm: "none" | "xor";
  sha256: string;
  compressionAlgorithm: string;
  createdAt: number;
  /** Present only when the transfer is passphrase-encrypted (AES-256-GCM). */
  encryption?: EncryptionMetadata;
}

export interface TransferPacket {
  version: number;
  transferId: string;
  packetId: string; // transferId:index
  kind: "data" | "parity";
  index: number;
  total: number; // totalDataPackets
  crc32: string; // hex string
  payload: string | Uint8Array; // Base64URL string (v1/v2) or raw bytes (v3)
}

export enum TransferState {
  Idle = "idle",
  Processing = "processing", // Chunking, compressing, hashing
  Ready = "ready", // Ready to transmit (Send)
  Transferring = "transferring", // Currently displaying/scanning QRs
  Reconstructing = "reconstructing", // Scanning done, verifying and assembling
  Completed = "completed",
  Error = "error",
}

export interface ErrorCorrectionProfile {
  parityRatio: number;
  groupSize: number;
  redundancy: number; // percentage
}

export interface TransferStrategy {
  fps: number;
  chunkSize: number;
  qrVersion: number;
  qrQuietZone: number;
  parityRatio: number;
  preset: "turbo" | "balanced" | "reliable";
  confidence: number;
}

export interface TransferOptions {
  compressionLevel?: number; // 0-9
  qrVersion?: number; // 1-40
  qrQuietZone?: number;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  chunkSizeOverride?: number; // Bytes of binary payload per chunk (before encoding)
  reliabilityMode?: "speed" | "balanced" | "reliable" | "turbo";
  fps?: number; // Playback FPS override
  parityGroupSize?: number;
  /** Optional passphrase for AES-256-GCM end-to-end encryption.
   *  Never stored or transmitted — lives only in worker memory during processing. */
  encryptionPassphrase?: string;
}

export interface TransferStats {
  speedBytesPerSecond: number;
  progressPercentage: number;
  estimatedTimeRemainingMs: number;
  packetsReceived: number;
  totalPackets: number;
  missingPackets: number[];
}
