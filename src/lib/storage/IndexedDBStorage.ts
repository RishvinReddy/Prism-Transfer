import { openDB, IDBPDatabase } from "idb";
import { TransferManifest, TransferPacket } from "@/types/transfer";
import { StorageAdapter } from "./StorageAdapter";

interface PrismTransferDB {
  manifests: {
    key: string; // transferId
    value: TransferManifest;
  };
  packets: {
    key: string; // packetId (transferId:index)
    value: TransferPacket;
    indexes: { "by-transferId": string };
  };
}

export class IndexedDBStorage implements StorageAdapter {
  private dbPromise: Promise<any> | null = null;

  private getDB() {
    if (!this.dbPromise) {
      this.dbPromise = openDB("PrismTransferDB", 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains("manifests")) {
            db.createObjectStore("manifests", { keyPath: "transferId" });
          }
          if (!db.objectStoreNames.contains("packets")) {
            const packetStore = db.createObjectStore("packets", {
              keyPath: "packetId",
            });
            packetStore.createIndex("by-transferId", "transferId");
          }
        },
      });
    }
    return this.dbPromise;
  }

  async saveManifest(manifest: TransferManifest): Promise<void> {
    const db = await this.getDB();
    await db.put("manifests", manifest);
  }

  async getManifest(transferId: string): Promise<TransferManifest | undefined> {
    const db = await this.getDB();
    return db.get("manifests", transferId);
  }

  async savePacket(packet: TransferPacket): Promise<boolean> {
    const db = await this.getDB();
    const existing = await db.get("packets", packet.packetId);
    if (existing) {
      return false; // It's a duplicate
    }
    await db.put("packets", packet);
    return true;
  }

  async getReceivedPacketIndexes(transferId: string): Promise<number[]> {
    const db = await this.getDB();
    const packets: TransferPacket[] = await db.getAllFromIndex("packets", "by-transferId", transferId);
    return packets.map((p) => p.index);
  }

  async getAllPackets(transferId: string): Promise<TransferPacket[]> {
    const db = await this.getDB();
    return db.getAllFromIndex("packets", "by-transferId", transferId);
  }

  async clearTransfer(transferId: string): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction(["manifests", "packets"], "readwrite");
    tx.objectStore("manifests").delete(transferId);

    const index = tx.objectStore("packets").index("by-transferId");
    let cursor = await index.openCursor(transferId);
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
    
    await tx.done;
  }
}
