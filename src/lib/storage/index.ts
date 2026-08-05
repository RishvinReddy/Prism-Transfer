import { IndexedDBStorage } from "./IndexedDBStorage";
import { MemoryStorage } from "./MemoryStorage";
import { StorageAdapter } from "./StorageAdapter";

// In a real browser environment, use IndexedDB.
// In Node.js / test environments, use MemoryStorage.
export const packetStore: StorageAdapter = 
  typeof window !== "undefined" && typeof window.indexedDB !== "undefined" 
    ? new IndexedDBStorage()
    : new MemoryStorage();

export type { StorageAdapter };
export { IndexedDBStorage, MemoryStorage };
