export interface RecoveryAlgorithm {
  name: string;
  encodeParity(dataChunks: Uint8Array[], chunkSize: number): Uint8Array;
  recoverPacket(missingIndex: number, dataChunks: Uint8Array[], parityChunk: Uint8Array, chunkSize: number): Uint8Array;
}

export const XORRecovery: RecoveryAlgorithm = {
  name: "xor",
  
  encodeParity(dataChunks: Uint8Array[], chunkSize: number): Uint8Array {
    const parityBytes = new Uint8Array(chunkSize);
    for (const chunk of dataChunks) {
      for (let b = 0; b < chunk.length; b++) {
        parityBytes[b] ^= chunk[b];
      }
    }
    return parityBytes;
  },

  recoverPacket(missingIndex: number, dataChunks: Uint8Array[], parityChunk: Uint8Array, chunkSize: number): Uint8Array {
    const recoveredBin = new Uint8Array(chunkSize);
    
    // Start with parity bytes
    recoveredBin.set(parityChunk);
    
    // XOR all received data packets
    for (const chunk of dataChunks) {
      for (let i = 0; i < chunk.length; i++) {
        recoveredBin[i] ^= chunk[i];
      }
    }
    
    return recoveredBin;
  }
};

export const RecoveryRegistry: Record<string, RecoveryAlgorithm> = {
  "xor": XORRecovery
};
