import { TransferManifest, TransferPacket } from "@/types/transfer";

/**
 * Serializes a data packet into a JSON string optimized for QR encoding.
 */
export function serializePacket(packet: TransferPacket): string {
  // We can compress keys in the future if needed, but standard JSON is fine for MVP
  // Format matches the specified protocol exactly.
  return JSON.stringify(packet);
}

/**
 * Deserializes a JSON string back into a TransferPacket.
 */
export function deserializePacket(json: string): TransferPacket {
  try {
    return JSON.parse(json) as TransferPacket;
  } catch (error) {
    throw new Error("Failed to deserialize packet");
  }
}

/**
 * Serializes the initial manifest packet.
 */
export function serializeManifest(manifest: TransferManifest): string {
  return JSON.stringify({ type: "manifest", ...manifest });
}

/**
 * Deserializes a manifest packet.
 */
export function deserializeManifest(json: string): TransferManifest {
  try {
    const parsed = JSON.parse(json);
    if (parsed.type === "manifest") {
      delete parsed.type;
    }
    return parsed as TransferManifest;
  } catch (error) {
    throw new Error("Failed to deserialize manifest");
  }
}

/**
 * Estimates the byte size of a serialized packet before generating the QR code.
 * Useful for adaptive QR sizing to ensure the payload fits within capacity.
 */
export function estimateSerializedPacketSize(packet: TransferPacket): number {
  // In JavaScript, a standard string uses UTF-16, but we care about the UTF-8 byte length
  // that will be encoded into the QR code.
  const jsonString = serializePacket(packet);
  return new Blob([jsonString]).size;
}

export function estimateSerializedManifestSize(manifest: TransferManifest): number {
  const jsonString = serializeManifest(manifest);
  return new Blob([jsonString]).size;
}
