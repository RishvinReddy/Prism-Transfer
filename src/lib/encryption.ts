/**
 * PrismTransfer End-to-End Encryption
 *
 * Algorithm : AES-256-GCM  (authenticated encryption)
 * KDF       : PBKDF2 / SHA-256  (configurable iterations — stored in metadata)
 * AAD       : Manifest metadata bytes (filename + MIME + sizes + algorithm tag)
 *             — tampered manifest fields will cause auth-tag failure on decrypt
 *
 * Nothing here is async-hidden from the caller; every function is explicitly
 * async so the scheduler can breathe between the heavy PBKDF2 call and the
 * actual cipher operation.
 */

// ── Public metadata shape ─────────────────────────────────────────────────────

export interface EncryptionMetadata {
  enabled: boolean;
  algorithm: "AES-256-GCM";
  kdf: "PBKDF2";
  /** Iteration count stored here so future versions can increase it without
   *  breaking existing encrypted transfers. */
  iterations: number;
  /** Random 16-byte salt, hex-encoded */
  salt: string;
  /** Random 12-byte IV, hex-encoded */
  iv: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_ITERATIONS = 200_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;
const TAG_LENGTH = 128; // AES-GCM auth tag bits

// ── Helpers ───────────────────────────────────────────────────────────────────

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return arr;
}

/**
 * Build the Additional Authenticated Data (AAD) buffer from manifest fields.
 * Authenticating the manifest means any tampering with filename, MIME type,
 * file size, chunk count, or algorithm tag will cause AES-GCM to reject the
 * ciphertext — even with the correct passphrase.
 */
export function buildAAD(params: {
  filename: string;
  mimeType: string;
  originalSize: number;
  totalDataPackets: number;
  compressionAlgorithm: string;
}): Uint8Array {
  const enc = new TextEncoder();
  const tag = `prism|${params.filename}|${params.mimeType}|${params.originalSize}|${params.totalDataPackets}|${params.compressionAlgorithm}`;
  return enc.encode(tag);
}

// ── Key derivation ────────────────────────────────────────────────────────────

/**
 * Derives a 256-bit AES-GCM key from a passphrase + salt via PBKDF2.
 * The returned CryptoKey is non-extractable.
 */
async function deriveKey(
  passphrase: string,
  salt: Uint8Array,
  iterations: number = DEFAULT_ITERATIONS
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false, // non-extractable
    ["encrypt", "decrypt"]
  );
}

// ── Encrypt ───────────────────────────────────────────────────────────────────

export interface EncryptResult {
  ciphertext: Uint8Array;
  metadata: EncryptionMetadata;
}

/**
 * Encrypts `data` with AES-256-GCM using a PBKDF2-derived key.
 *
 * @param data        - Plaintext bytes (already compressed by the chunker)
 * @param passphrase  - User-supplied passphrase (cleared from caller after this returns)
 * @param aad         - Additional Authenticated Data (manifest fields)
 * @param iterations  - PBKDF2 iteration count (defaults to 200,000)
 */
export async function encryptData(
  data: Uint8Array,
  passphrase: string,
  aad: Uint8Array,
  iterations: number = DEFAULT_ITERATIONS
): Promise<EncryptResult> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));

  const key = await deriveKey(passphrase, salt, iterations);

  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource, additionalData: aad as BufferSource, tagLength: TAG_LENGTH },
    key,
    data as BufferSource
  );

  return {
    ciphertext: new Uint8Array(ciphertextBuffer),
    metadata: {
      enabled: true,
      algorithm: "AES-256-GCM",
      kdf: "PBKDF2",
      iterations,
      salt: bytesToHex(salt),
      iv: bytesToHex(iv),
    },
  };
}

// ── Decrypt ───────────────────────────────────────────────────────────────────

/**
 * Decrypts `ciphertext` using the passphrase and encryption metadata.
 * Throws if the passphrase is wrong or if the ciphertext / AAD was tampered with.
 *
 * @param ciphertext  - Encrypted bytes from the reconstructed packets
 * @param passphrase  - User-supplied passphrase (caller must clear after this)
 * @param metadata    - EncryptionMetadata from the manifest
 * @param aad         - Additional Authenticated Data — must match sender's AAD exactly
 */
export async function decryptData(
  ciphertext: Uint8Array,
  passphrase: string,
  metadata: EncryptionMetadata,
  aad: Uint8Array
): Promise<Uint8Array> {
  const salt = hexToBytes(metadata.salt);
  const iv = hexToBytes(metadata.iv);

  const key = await deriveKey(passphrase, salt, metadata.iterations);

  let plaintextBuffer: ArrayBuffer;
  try {
    plaintextBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as BufferSource, additionalData: aad as BufferSource, tagLength: TAG_LENGTH },
      key,
      ciphertext as BufferSource
    );
  } catch {
    // AES-GCM auth-tag failure — wrong passphrase OR tampered data/manifest
    throw new Error(
      "Decryption failed. Verify the passphrase and try again."
    );
  }

  return new Uint8Array(plaintextBuffer);
}

// ── Passphrase strength ───────────────────────────────────────────────────────

export type PassphraseStrength = "Weak" | "Fair" | "Strong" | "Very Strong";

/** Scores a passphrase purely by length + character-class diversity. */
export function scorePassphrase(p: string): { strength: PassphraseStrength; score: number } {
  if (!p) return { strength: "Weak", score: 0 };

  let score = 0;
  if (p.length >= 8)  score += 1;
  if (p.length >= 12) score += 1;
  if (p.length >= 16) score += 1;
  if (/[a-z]/.test(p)) score += 1;
  if (/[A-Z]/.test(p)) score += 1;
  if (/[0-9]/.test(p)) score += 1;
  if (/[^a-zA-Z0-9]/.test(p)) score += 1;

  const strength: PassphraseStrength =
    score >= 6 ? "Very Strong" :
    score >= 4 ? "Strong" :
    score >= 2 ? "Fair" : "Weak";

  return { strength, score };
}
