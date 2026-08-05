import { TransferPacket } from "../../src/types/transfer";
import { calculateCRC32 } from "../../src/lib/checksum";

export interface SimulationScenario {
  seed: number;
  lossRate: number;       // 0.0 to 1.0 (probability of losing a packet)
  corruptionRate: number; // 0.0 to 1.0 (probability of flipping bits)
  duplicationRate: number;// 0.0 to 1.0 (probability of sending a packet twice)
  reorderRate: number;    // 0.0 to 1.0 (probability of swapping adjacent packets)
  burstLoss?: number;     // number of consecutive packets to drop periodically
  burstInterval?: number; // how often to trigger a burst loss
}

// Simple seeded PRNG (Linear Congruential Generator)
export class PRNG {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return this.seed / 2147483647;
  }
}

export class ScenarioGenerator {
  static createRandom(seed: number = Math.floor(Math.random() * 1000000)): SimulationScenario {
    const rng = new PRNG(seed);
    return {
      seed,
      lossRate: rng.next() * 0.1,         // up to 10% random loss
      corruptionRate: rng.next() * 0.05,  // up to 5% corruption
      duplicationRate: rng.next() * 0.1,  // up to 10% dupes
      reorderRate: rng.next() * 0.05,     // up to 5% reorder
      burstLoss: Math.floor(rng.next() * 5),
      burstInterval: Math.floor(rng.next() * 50) + 10,
    };
  }
}

export class FaultInjectionEngine {
  private rng: PRNG;
  private scenario: SimulationScenario;

  constructor(scenario: SimulationScenario) {
    this.scenario = scenario;
    this.rng = new PRNG(scenario.seed);
  }

  processStream(packets: TransferPacket[]): TransferPacket[] {
    let result: TransferPacket[] = [];
    let packetCount = 0;
    let inBurst = 0;

    for (let i = 0; i < packets.length; i++) {
      let packet = packets[i];
      packetCount++;

      // Burst loss
      if (this.scenario.burstLoss && this.scenario.burstInterval) {
        if (inBurst > 0) {
          inBurst--;
          continue; // Drop packet
        }
        if (packetCount % this.scenario.burstInterval === 0) {
          inBurst = this.scenario.burstLoss;
          continue; // Drop packet
        }
      }

      // Random loss
      if (this.rng.next() < this.scenario.lossRate) {
        continue;
      }

      // Corruption
      if (this.rng.next() < this.scenario.corruptionRate) {
        packet = this.corruptPacket(packet);
      }

      result.push(packet);

      // Duplication
      if (this.rng.next() < this.scenario.duplicationRate) {
        result.push(packet);
      }
    }

    // Reordering
    if (this.scenario.reorderRate > 0) {
      for (let i = 0; i < result.length - 1; i++) {
        if (this.rng.next() < this.scenario.reorderRate) {
          const temp = result[i];
          result[i] = result[i + 1];
          result[i + 1] = temp;
          i++; // skip next to avoid cascading swaps
        }
      }
    }

    return result;
  }

  private corruptPacket(packet: TransferPacket): TransferPacket {
    // Clone packet
    const corrupted = { ...packet };
    
    // Randomly decide what to corrupt (CRC vs Payload vs Headers)
    const type = this.rng.next();
    
    if (type < 0.33) {
      // Corrupt CRC
      corrupted.crc32 = "BADCRC";
    } else if (type < 0.66) {
      // Corrupt payload (flip a byte)
      if (typeof corrupted.payload === "string") {
        corrupted.payload = corrupted.payload.substring(1) + "X";
      } else {
        const newPayload = new Uint8Array(corrupted.payload);
        if (newPayload.length > 0) newPayload[0] ^= 0xFF;
        corrupted.payload = newPayload;
      }
    } else {
      // Corrupt header index
      corrupted.index = 999999;
    }
    
    return corrupted;
  }
}
