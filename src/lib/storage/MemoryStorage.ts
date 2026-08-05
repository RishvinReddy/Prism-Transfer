import { TransferManifest, TransferPacket } from "@/types/transfer";
import { StorageAdapter } from "./StorageAdapter";

export class MemoryStorage implements StorageAdapter {
  private manifests = new Map<string, TransferManifest>();
  private packets = new Map<string, TransferPacket>(); // key: packetId

  async saveManifest(manifest: TransferManifest): Promise<void> {
    this.manifests.set(manifest.transferId, manifest);
  }

  async getManifest(transferId: string): Promise<TransferManifest | undefined> {
    return this.manifests.get(transferId);
  }

  async savePacket(packet: TransferPacket): Promise<boolean> {
    if (this.packets.has(packet.packetId)) {
      return false; // Duplicate
    }
    this.packets.set(packet.packetId, packet);
    return true;
  }

  async getReceivedPacketIndexes(transferId: string): Promise<number[]> {
    const indexes: number[] = [];
    for (const packet of this.packets.values()) {
      if (packet.transferId === transferId) {
        indexes.push(packet.index);
      }
    }
    return indexes;
  }

  async getAllPackets(transferId: string): Promise<TransferPacket[]> {
    const transferPackets: TransferPacket[] = [];
    for (const packet of this.packets.values()) {
      if (packet.transferId === transferId) {
        transferPackets.push(packet);
      }
    }
    return transferPackets;
  }

  async clearTransfer(transferId: string): Promise<void> {
    this.manifests.delete(transferId);
    
    // Find all packets for this transfer and delete them
    const keysToDelete: string[] = [];
    for (const [key, packet] of this.packets.entries()) {
      if (packet.transferId === transferId) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.packets.delete(key));
  }
}
