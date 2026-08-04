/**
 * Encodes a Uint8Array into a Base64URL string.
 * Base64URL is safe for QR codes and URLs, avoiding +, /, and = padding.
 */
export function encodeBase64Url(data: Uint8Array): string {
  // Convert Uint8Array to binary string safely
  let binaryString = "";
  // We use a loop to avoid stack overflow with String.fromCharCode.apply on large arrays
  // (though chunks will typically be small, it's safer)
  const len = data.byteLength;
  for (let i = 0; i < len; i++) {
    binaryString += String.fromCharCode(data[i]);
  }

  // Standard Base64
  const base64 = typeof btoa !== "undefined" ? btoa(binaryString) : Buffer.from(binaryString, "binary").toString("base64");

  // Convert to Base64URL
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Decodes a Base64URL string back into a Uint8Array.
 */
export function decodeBase64Url(base64Url: string): Uint8Array {
  // Convert Base64URL to Standard Base64
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

  // Add padding if necessary
  const padLength = (4 - (base64.length % 4)) % 4;
  base64 += "=".repeat(padLength);

  // Decode Base64 to binary string
  const binaryString = typeof atob !== "undefined" ? atob(base64) : Buffer.from(base64, "base64").toString("binary");

  // Convert binary string to Uint8Array
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}
