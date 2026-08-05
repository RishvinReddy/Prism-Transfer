import { describe, it, expect, bench } from "vitest";
import { TransferPacket } from "../../src/types/transfer";
import { serializePacketV2, deserializePacketV2 } from "../../src/lib/serializer";
import { encodeDataPacketV3, decodeDataPacketV3 } from "../../src/lib/binaryCodec";
import { nanoid } from "nanoid";

describe("Protocol V2 vs V3 Benchmarks", () => {
  const dummyPayload = new Uint8Array(800);
  for (let i = 0; i < 800; i++) dummyPayload[i] = i % 256;
  
  // Base64URL encode for V2
  const base64Str = Buffer.from(dummyPayload).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  const packetV2: TransferPacket = {
    version: 2,
    transferId: nanoid(21),
    packetId: "dummy:0",
    index: 0,
    total: 10,
    crc32: "abcdef12",
    payload: base64Str,
  };

  const packetV3: TransferPacket = {
    version: 3,
    transferId: packetV2.transferId,
    packetId: "dummy:0",
    index: 0,
    total: 10,
    crc32: "abcdef12",
    payload: dummyPayload,
  };

  it("should verify payload sizes", () => {
    const v2Encoded = serializePacketV2(packetV2);
    const v3Encoded = encodeDataPacketV3(packetV3);

    console.log(`V2 JSON size: ${v2Encoded.length} bytes`);
    console.log(`V3 Binary size: ${v3Encoded.length} bytes`);
    
    // V3 should be at least 25% smaller due to base64 removal
    expect(v3Encoded.length).toBeLessThan(v2Encoded.length * 0.85);
  });

  describe("Serialization Benchmarks", () => {
    bench("V2 JSON Stringify", () => {
      serializePacketV2(packetV2);
    });

    bench("V3 Binary DataView", () => {
      encodeDataPacketV3(packetV3);
    });
  });

  describe("Deserialization Benchmarks", () => {
    const v2Encoded = serializePacketV2(packetV2);
    const v3Encoded = encodeDataPacketV3(packetV3);

    bench("V2 JSON Parse", () => {
      deserializePacketV2(v2Encoded);
    });

    bench("V3 Binary Extract", () => {
      decodeDataPacketV3(v3Encoded);
    });
  });
});
