import { describe, it, expect } from "vitest";
import { calculateCRC32, calculateSHA256 } from "@/lib/checksum";

describe("Checksum module", () => {
  it("calculates CRC32 correctly for a known string", () => {
    const data = new TextEncoder().encode("Hello Prism");
    const crc = calculateCRC32(data);
    // Known CRC32 for "Hello Prism" is 0x6e9ec59b
    expect(crc).toBe(0x6e9ec59b);
  });

  it("calculates SHA-256 correctly for a known string", async () => {
    const data = new TextEncoder().encode("Hello Prism");
    const sha = await calculateSHA256(data);
    
    // Check against expected hex hash
    const expectedHash = "7bc432d56a73c1d47f9eefccbb97a7a10271bf386cdd24ebbb1b376b3ab2e88a";
    expect(sha).toBe(expectedHash);
  });
});
