import { describe, it, expect } from "vitest";
import { calculateCRC32, calculateSHA256 } from "@/lib/checksum";

describe("Checksum module", () => {
  it("calculates CRC32 correctly for a known string", () => {
    const data = new TextEncoder().encode("Hello Prism");
    const crc = calculateCRC32(data);
    // Known CRC32 for "Hello Prism" is "feb118af"
    expect(crc).toBe("feb118af");
  });

  it("calculates SHA-256 correctly for a known string", async () => {
    const data = new TextEncoder().encode("Hello Prism");
    const sha = await calculateSHA256(data);
    
    // Check against expected hex hash
    const expectedHash = "4df296e4a03c0f6b54f61a4c03ac922035993810c90ff64180129296caf2b810";
    expect(sha).toBe(expectedHash);
  });
});
