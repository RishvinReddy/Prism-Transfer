import { openDB, IDBPDatabase } from "idb";
import { TransferManifest, TransferPacket } from "@/types/transfer";

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

let dbPromise: Promise<any> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB("PrismTransferDB", 1, {
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
  return dbPromise;
}

export async function saveManifest(manifest: TransferManifest): Promise<void> {
  const db = await getDB();
  await db.put("manifests", manifest);
}

export async function getManifest(transferId: string): Promise<TransferManifest | undefined> {
  const db = await getDB();
  return db.get("manifests", transferId);
}

/**
 * Saves a packet. Returns true if it was newly saved, false if it was already present.
 */
export async function savePacket(packet: TransferPacket): Promise<boolean> {
  const db = await getDB();
  // Check if packet exists to avoid overwriting and to know if it's a duplicate
  const existing = await db.get("packets", packet.packetId);
  if (existing) {
    return false; // It's a duplicate
  }
  await db.put("packets", packet);
  return true;
}

export async function getReceivedPacketIndexes(transferId: string): Promise<number[]> {
  const db = await getDB();
  const packets: TransferPacket[] = await db.getAllFromIndex("packets", "by-transferId", transferId);
  return packets.map((p) => p.index);
}

export async function getAllPackets(transferId: string): Promise<TransferPacket[]> {
  const db = await getDB();
  return db.getAllFromIndex("packets", "by-transferId", transferId);
}

export async function clearTransfer(transferId: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(["manifests", "packets"], "readwrite");
  tx.objectStore("manifests").delete(transferId);

  // Delete all packets for this transfer
  const index = tx.objectStore("packets").index("by-transferId");
  let cursor = await index.openCursor(transferId);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  
  await tx.done;
}
