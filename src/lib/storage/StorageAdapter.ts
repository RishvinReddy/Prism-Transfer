import { TransferManifest, TransferPacket } from "@/types/transfer";

export interface StorageAdapter {
  saveManifest(manifest: TransferManifest): Promise<void>;
  getManifest(transferId: string): Promise<TransferManifest | undefined>;
  savePacket(packet: TransferPacket): Promise<boolean>;
  getReceivedPacketIndexes(transferId: string): Promise<number[]>;
  getAllPackets(transferId: string): Promise<TransferPacket[]>;
  clearTransfer(transferId: string): Promise<void>;
}
