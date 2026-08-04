

export interface TransferManifest {
  version: number;
  transferId: string;
  filename: string;
  mimeType: string;
  originalSize: number;
  compressedSize: number;
  chunkSize: number;
  totalPackets: number;
  sha256: string;
  compressionAlgorithm: string;
  createdAt: number;
}

export interface TransferPacket {
  version: number;
  transferId: string;
  packetId: string; // transferId:index
  index: number;
  total: number;
  crc32: string; // hex string or number, let's use string for JSON safety/hex rep
  payload: string; // Base64URL encoded compressed binary chunk
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

export interface TransferOptions {
  compressionLevel?: number; // 0-9
  qrVersion?: number; // 1-40
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  chunkSizeOverride?: number; // Bytes of binary payload per chunk (before encoding)
}

export interface TransferStats {
  speedBytesPerSecond: number;
  progressPercentage: number;
  estimatedTimeRemainingMs: number;
  packetsReceived: number;
  totalPackets: number;
  missingPackets: number[];
}
