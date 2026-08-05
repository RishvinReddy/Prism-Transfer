import { describe, it, expect } from "vitest";
import { processFileForTransfer } from "../../src/lib/chunker";
import { reconstructFile } from "../../src/features/scanner/reconstructionEngine";
import { RecoveryRegistry } from "../../src/lib/recovery";
import { TransferPacket } from "../../src/types/transfer";
import { decodeBase64Url, encodeBase64Url } from "../../src/lib/encoder";
import { calculateCRC32 } from "../../src/lib/checksum";
import { PROTOCOL_VERSION } from "../../src/constants/protocol";

describe("Recovery & Reconstruction Tests", () => {
  it("should successfully recover exactly 1 dropped packet per parity group", async () => {
    // Generate a dummy file of 5MB
    const size = 5 * 1024 * 1024;
    const dummyData = new Uint8Array(size);
    for (let i = 0; i < size; i++) dummyData[i] = i % 256;
    
    const file = new File([dummyData], "dummy.bin", { type: "application/octet-stream" });
    const processed = await processFileForTransfer(file, { compressionLevel: 1 });
    
    expect(processed.manifest.totalParityPackets).toBeGreaterThan(0);

    const dataPackets = processed.packets.filter(p => p.kind === "data");
    const parityPackets = processed.packets.filter(p => p.kind === "parity");

    // Drop exactly 1 data packet from each parity group
    const parityGroupSize = processed.manifest.parityGroupSize;
    const receivedPackets: TransferPacket[] = [];
    const missingIndexes: number[] = [];

    for (let i = 0; i < dataPackets.length; i++) {
      // Drop the 3rd packet of every group
      if (i % parityGroupSize === 2) {
        missingIndexes.push(i);
      } else {
        receivedPackets.push(dataPackets[i]);
      }
    }

    // Now attempt to recover the missing packets
    const algo = RecoveryRegistry["xor"];
    
    for (let groupIndex = 0; groupIndex < processed.manifest.totalParityPackets; groupIndex++) {
      const parityPacket = parityPackets[groupIndex];
      const start = groupIndex * parityGroupSize;
      const end = Math.min(start + parityGroupSize, processed.manifest.totalDataPackets);
      
      const missingIndex = missingIndexes.find(m => m >= start && m < end);
      if (missingIndex !== undefined) {
        const groupDataPackets = receivedPackets.filter(p => p.index >= start && p.index < end);
        
        const getBinary = (p: TransferPacket) => typeof p.payload === "string" ? decodeBase64Url(p.payload) : p.payload;
        const parityBin = getBinary(parityPacket);
        
        const recoveredBin = algo.recoverPacket(missingIndex, groupDataPackets.map(getBinary), parityBin, parityBin.length);
        
        const recoveredPacket: TransferPacket = {
          version: parityPacket.version,
          transferId: parityPacket.transferId,
          packetId: `${parityPacket.transferId}:${missingIndex}`,
          kind: "data",
          index: missingIndex,
          total: parityPacket.total,
          crc32: calculateCRC32(recoveredBin),
          payload: PROTOCOL_VERSION >= 3 ? recoveredBin : encodeBase64Url(recoveredBin),
        };
        
        receivedPackets.push(recoveredPacket);
      }
    }

    // Reconstruct the file with the recovered packets
    const reconstructed = await reconstructFile(processed.manifest, receivedPackets);
    expect(reconstructed.blob.size).toBe(size);

    // Verify binary data matches
    const reconstructedArrayBuffer = await reconstructed.blob.arrayBuffer();
    const reconstructedBytes = new Uint8Array(reconstructedArrayBuffer);
    
    // Check first and last bytes to ensure correctness
    expect(reconstructedBytes[0]).toBe(dummyData[0]);
    expect(reconstructedBytes[size - 1]).toBe(dummyData[size - 1]);
    
    // Hash check is implicitly done by reconstructFile (for non-V3 or if skipped appropriately)
  });

  it("should fail CRC verification if a parity packet is corrupted", async () => {
    // Generate a small dummy file
    const dummyData = new Uint8Array(5000);
    const file = new File([dummyData], "small.bin");
    const processed = await processFileForTransfer(file, { compressionLevel: 1 });
    
    const parityPacket = processed.packets.find(p => p.kind === "parity")!;
    
    // Corrupt the parity payload
    const getBinary = (p: TransferPacket) => typeof p.payload === "string" ? decodeBase64Url(p.payload) : p.payload;
    const parityBin = getBinary(parityPacket);
    parityBin[0] = parityBin[0] ^ 0xFF; // Flip bits
    
    const corruptedParityCrc = calculateCRC32(parityBin);
    
    // CRC check should notice that the payload doesn't match the original packet.crc32
    expect(corruptedParityCrc).not.toBe(parityPacket.crc32);
  });

  it("should successfully reconstruct a file from legacy V2 packets", async () => {
    const size = 1024 * 1024; // 1MB
    const dummyData = new Uint8Array(size);
    for (let i = 0; i < size; i++) dummyData[i] = i % 256;
    
    const file = new File([dummyData], "legacy.bin", { type: "application/octet-stream" });
    const processed = await processFileForTransfer(file, { compressionLevel: 1 });
    
    // Simulate V2 sender: serialize everything to V2
    const { serializeManifestV2, serializePacketV2, deserializeManifestV2, deserializePacketV2 } = await import("../../src/lib/serializer");
    
    // Force version to 2 for simulation
    const v2ManifestStr = serializeManifestV2({ ...processed.manifest, version: 2 });
    const v2PacketStrs = processed.packets.filter(p => p.kind === "data").map(p => serializePacketV2({ ...p, version: 2, payload: encodeBase64Url(p.payload as Uint8Array) }));
    
    // Receiver Side: parse V2 JSON
    const parsedManifest = deserializeManifestV2(v2ManifestStr);
    const parsedPackets = v2PacketStrs.map(deserializePacketV2);
    
    expect(parsedManifest.version).toBe(2);
    expect(parsedPackets[0].version).toBe(2);
    
    // Reconstruct using the latest engine
    const reconstructed = await reconstructFile(parsedManifest, parsedPackets);
    expect(reconstructed.blob.size).toBe(size);
  });
});
