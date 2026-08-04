<div align="center">

<img src="public/logo.png" alt="PrismTransfer Logo" width="180" height="180" />

# PrismTransfer

### Transfer Files Using Nothing But a Camera.

**No internet · No Bluetooth · No cables · No accounts · No limits**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-prismtransfer--rishvinreddy.vercel.app-6366f1?style=for-the-badge)](https://prismtransfer-rishvinreddy.vercel.app)
[![GitHub Stars](https://img.shields.io/github/stars/RishvinReddy/Prism-Transfer?style=for-the-badge&color=f59e0b)](https://github.com/RishvinReddy/Prism-Transfer)
[![License: MIT](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![PWA](https://img.shields.io/badge/PWA-Ready-5a0fc8?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)

<br/>

> *The world's first fully air-gapped, serverless, browser-based optical file transfer system.  
> Drop any file. Watch it become light. Capture it with a camera. Done.*

<br/>

---

</div>

## 📖 Table of Contents

- [What is PrismTransfer?](#-what-is-prismtransfer)
- [How It Works](#-how-it-works)
- [Protocol Specification](#-protocol-specification-v1)
- [Technical Architecture](#-technical-architecture)
- [File Pipeline (Deep Dive)](#-the-complete-file-pipeline)
- [QR Capacity & Optimization](#-qr-code-capacity--optimization)
- [Security Model](#-security-model)
- [Settings & Speed Modes](#-settings--speed-modes)
- [Reliability & Error Recovery](#-reliability--error-recovery)
- [Progressive Web App](#-progressive-web-app-pwa)
- [SEO Architecture](#-seo-architecture)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment & Deployment](#-environment--deployment)
- [Browser Support](#-browser-support)
- [Performance Benchmarks](#-performance-benchmarks)
- [Contributing](#-contributing)
- [Roadmap](#-roadmap)
- [FAQ](#-faq)
- [License](#-license)

---

## 🔭 What is PrismTransfer?

PrismTransfer is a **100% browser-native, serverless optical file transfer system**. It converts any file into a high-frequency animated QR code stream that plays on the sender's screen and is captured in real-time by the receiver's camera.

No packets are sent over a network. No cloud storage is involved. No pairing handshake happens. The entire data path is **photons → photoreceptor → browser sandbox**.

### Why does this exist?

| Problem | Traditional Solutions | PrismTransfer |
|---|---|---|
| Cross-platform (iPhone → Windows) | ❌ AirDrop (Apple-only) | ✅ Works everywhere |
| Air-gap security compliance | ❌ All wireless protocols emit RF | ✅ Zero RF emissions |
| No internet in remote areas | ❌ Cloud services fail | ✅ Works completely offline |
| No account or app install | ❌ Most tools need apps | ✅ Just a browser URL |
| Privacy (files never leave device) | ❌ Cloud uploads your data | ✅ 100% local processing |

---

## ✨ How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│                       SENDER DEVICE                                  │
│                                                                       │
│  File Drop ──► Compress ──► SHA-256 ──► Chunk ──► CRC32 ──► Base64 │
│                                    │                                  │
│                                    └──► Generate Manifest            │
│                                                                       │
│  Render: [MANIFEST QR] → [PACKET 0] → [PACKET 1] → ... → [PACKET N]│
│           └───────────────── Animated at N fps ─────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
                         │ (Light / Photons)
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       RECEIVER DEVICE                                 │
│                                                                       │
│  Camera ──► jsQR decode ──► Debounce ──► Validate CRC ──► Store IDB│
│                                                                       │
│  When all packets received:                                           │
│  Sort ──► Verify CRC ──► Merge ──► SHA-256 ──► Decompress ──► Save │
└─────────────────────────────────────────────────────────────────────┘
```

### Step-by-Step User Flow

```
SENDER                              RECEIVER
  │                                    │
  │ 1. Open /send                      │ 1. Open /receive
  │ 2. Drop file into zone             │ 2. Grant camera permission
  │ 3. File is processed locally       │ 3. Point camera at screen
  │ 4. QR sequence begins playing      │
  │                                    │
  │ ←──── Photon data stream ──────────│
  │                                    │
  │                                    │ 4. Manifest scanned → session begins
  │                                    │ 5. Packets scanned & stored in IDB
  │                                    │ 6. Progress bar fills
  │                                    │ 7. SHA-256 verified
  │                                    │ 8. File reconstructed & downloaded
```

---

## 📡 Protocol Specification v1

Every frame in the QR stream contains a JSON payload conforming to the **PrismTransfer Optical Transfer Protocol (OTP) v1**.

### Frame Types

#### Type 1: Manifest Frame (first frame always)

```json
{
  "type": "manifest",
  "version": 1,
  "transferId": "V1StGXR8_Z5jdHi6B",
  "filename": "design-mockup.pdf",
  "mimeType": "application/pdf",
  "originalSize": 2457600,
  "compressedSize": 1843200,
  "chunkSize": 300,
  "totalPackets": 6144,
  "sha256": "a1b2c3d4e5f6...",
  "compressionAlgorithm": "deflate",
  "createdAt": 1754381512345
}
```

#### Type 2: Data Packet Frame

```json
{
  "version": 1,
  "transferId": "V1StGXR8_Z5jdHi6B",
  "packetId": "V1StGXR8_Z5jdHi6B:0",
  "index": 0,
  "total": 6144,
  "crc32": "a1b2c3d4",
  "payload": "eJzt3X1sW9d5x_..."
}
```

### Field Reference

| Field | Type | Description |
|---|---|---|
| `version` | `number` | Protocol version (always `1`) |
| `transferId` | `string` | Nanoid — unique session identifier |
| `packetId` | `string` | `{transferId}:{index}` — unique packet key |
| `index` | `number` | Zero-based packet position |
| `total` | `number` | Total number of data packets |
| `crc32` | `string` | 8-char hex CRC32 of the raw compressed chunk |
| `payload` | `string` | Base64URL-encoded compressed binary chunk |
| `sha256` | `string` | Global SHA-256 hex of the original uncompressed file |
| `compressionAlgorithm` | `string` | Always `"deflate"` (zlib via fflate) |

### Sequence Diagram

```
QR Frame Index:  0          1          2          3    ...    N
Frame Type:   MANIFEST   PACKET[0]  PACKET[1]  PACKET[2] ... PACKET[N-1]
              │           │          │          │
              ▼           ▼          ▼          ▼
Scanner:    Store       Store      Store      Store ...  Reconstruct
```

The receiver **loops** the stream until it captures all N packets. Duplicate packets are silently discarded via IndexedDB deduplication. Missing packets are automatically collected on subsequent loop iterations.

---

## 🏗️ Technical Architecture

```
prism-transfer/
├── src/
│   ├── app/                    ← Next.js App Router pages
│   │   ├── layout.tsx          ← Global layout + SEO metadata
│   │   ├── page.tsx            ← Home landing page
│   │   ├── send/               ← Sender flow
│   │   ├── receive/            ← Receiver flow
│   │   ├── settings/           ← User preferences
│   │   ├── about/              ← About page
│   │   ├── blog/[slug]/        ← Dynamic blog posts (SSG)
│   │   ├── compare/[slug]/     ← Programmatic comparisons (SSG)
│   │   ├── docs/[slug]/        ← Documentation pages (SSG)
│   │   ├── guides/[slug]/      ← How-to guides with HowTo schema
│   │   ├── faq/                ← FAQPage with JSON-LD
│   │   ├── sitemap.ts          ← Dynamic XML sitemap (58 pages)
│   │   └── robots.ts           ← Robots directives + AI crawlers
│   │
│   ├── features/               ← Feature-scoped modules
│   │   ├── qr/                 ← QR generation & player
│   │   │   ├── QRGenerator.tsx ← qrcode.js wrapper component
│   │   │   ├── QRPlayer.tsx    ← Animated frame sequencer + dashboard
│   │   │   └── ThroughputGraph.tsx  ← Live speed chart
│   │   │
│   │   ├── scanner/            ← Camera-based QR decoding
│   │   │   ├── QRScanner.tsx   ← Camera viewport component
│   │   │   ├── PacketReceiver.tsx  ← Full receiver state machine
│   │   │   ├── ReceiveDebugger.tsx ← Dev mode trace console
│   │   │   ├── useQRScanner.ts ← jsQR camera hook
│   │   │   ├── useProgressTracker.ts ← Bitset-based progress
│   │   │   └── reconstructionEngine.ts ← File assembly pipeline
│   │   │
│   │   ├── transfer/           ← Sender orchestration
│   │   │   └── TransferController.tsx
│   │   │
│   │   ├── storage/            ← Persistence layer
│   │   │   └── packetStore.ts  ← IndexedDB (idb) CRUD operations
│   │   │
│   │   └── developer/          ← Dev tools
│   │       └── DeveloperDashboard.tsx
│   │
│   ├── lib/                    ← Core processing engines
│   │   ├── chunker.ts          ← Main file processing pipeline
│   │   ├── checksum.ts         ← CRC32 + SHA-256
│   │   ├── compressor.ts       ← fflate zlib wrapper
│   │   ├── encoder.ts          ← Base64URL encode/decode
│   │   ├── serializer.ts       ← JSON packet serialization
│   │   ├── validator.ts        ← Schema + integrity validation
│   │   ├── qr.ts               ← QR capacity optimizer
│   │   └── fileStager.ts       ← File read utilities
│   │
│   ├── components/             ← Reusable UI components
│   │   ├── navbar.tsx
│   │   ├── footer.tsx
│   │   ├── seo/JsonLd.tsx      ← JSON-LD schema injector
│   │   ├── home/               ← Landing page components
│   │   └── ui/                 ← shadcn/ui base primitives
│   │
│   ├── contexts/
│   │   └── settings.tsx        ← Global app settings (localStorage)
│   │
│   ├── data/
│   │   └── seoContent.ts       ← Static content for SSG pages
│   │
│   ├── constants/
│   │   └── protocol.ts         ← Protocol constants
│   │
│   └── types/
│       └── transfer.ts         ← TypeScript interfaces
│
├── public/
│   ├── logo.png
│   ├── icon-192x192.png
│   ├── icon-512x512.png
│   └── apple-touch-icon.png
│
├── package.json
└── next.config.ts
```

---

## 🔬 The Complete File Pipeline

### Sender Pipeline

```
File (Blob/File object)
  │
  ▼
① ArrayBuffer
  ├── originalSize = byteLength
  └── ──► SHA-256 hash (Web Crypto API)
            └── stores as manifest.sha256
  │
  ▼
② Uint8Array
  └── ──► zlibSync(data, { level: 9 })  ← fflate DEFLATE
            └── compressedData: Uint8Array
                └── compressedSize = byteLength
  │
  ▼
③ Chunking  (chunkSize determined by reliabilityMode)
  │
  ├── Turbo:    chunkSize = 1000 bytes
  ├── Speed:    chunkSize = 600 bytes
  ├── Balanced: chunkSize = 300 bytes  (default)
  └── Reliable: chunkSize = 150 bytes
  │
  ▼
④ For each chunk[i]:
  ├── crc32 = calculateCRC32(chunk)      ← CRC-32 lookup table
  ├── payload = encodeBase64Url(chunk)   ← URL-safe, no padding
  └── packet = { version, transferId, packetId, index, total, crc32, payload }
  │
  ▼
⑤ Manifest Assembly
  └── { type:"manifest", ...all metadata }
  │
  ▼
⑥ Serialization → JSON.stringify()
  │
  ▼
⑦ QR Code Rendering (qrcode.js, size 1024px)
  └── Animated at FPS rate (10–45 fps configurable)
```

### Receiver Pipeline

```
Camera Feed (getUserMedia, 30fps)
  │
  ▼
① Canvas.getImageData() → jsQR.decode()
  │
  ▼
② Debounce Check
  └── lastScannedRef.current === packetId ?
      ├── YES → DROP (duplicate in same epoch)
      └── NO  → CONTINUE
  │
  ▼
③ JSON.parse(decodedText)
  │
  ▼
④ Type Routing
  ├── "manifest" → validateManifestDetailed()
  │                └── Save to IDB (manifests store)
  │                └── tracker.resetProgress(totalPackets)
  │
  └── "packet"  → validatePacketDetailed()
                   └── verifyCRC(packet)
                   └── savePacket(packet) → IDB (packets store)
                   └── tracker.markPacketReceived(index)
  │
  ▼
⑤ Completion Check: receivedCount === totalPackets
  │
  ▼
⑥ reconstructFile(manifest, packets)
  ├── Sort by index
  ├── CRC32 re-verify per chunk
  ├── Merge into single Uint8Array
  ├── decompressData() ← fflate unzlib
  ├── Size verification (decompressed vs originalSize)
  └── SHA-256 global verification (Web Crypto API)
  │
  ▼
⑦ new Blob([data], { type: mimeType })
  └── downloadBlob(blob, filename) → browser download
```

---

## 📐 QR Code Capacity & Optimization

PrismTransfer uses a **scoring heuristic** to select the optimal QR version and error correction level based on real-world scanning reliability:

```typescript
// QR Capacity Lookup (ISO/IEC 18004)
const QR_CAPACITIES = [
  { version: 15, ec: "L", bytes: 1251 },
  { version: 15, ec: "M", bytes: 991  },
  { version: 20, ec: "L", bytes: 2061 },
  { version: 20, ec: "M", bytes: 1634 },  // ← Default
  { version: 25, ec: "L", bytes: 3057 },
  { version: 25, ec: "M", bytes: 2431 },
  { version: 30, ec: "L", bytes: 4238 },
  { version: 30, ec: "M", bytes: 3391 },
  { version: 40, ec: "L", bytes: 7089 },
  { version: 40, ec: "M", bytes: 5596 },
];

// Scoring formula:
// score = capacity × reliability × effectiveChunkSize
// effectiveChunkSize = floor((capacity - 150) × 0.75)
// (150 bytes reserved for JSON envelope; ×0.75 accounts for Base64URL ~33% overhead)
```

### Error Correction Level Reference

| Level | Redundancy | Best For |
|---|---|---|
| **L** | 7% | Turbo mode — clean, high-quality screens |
| **M** | 15% | Standard — most use cases (default) |
| **Q** | 25% | Slightly noisy environments |
| **H** | 30% | Reliable mode — small phone screens, distance |

---

## 🔐 Security Model

PrismTransfer is engineered from the ground up as a **zero-trust, zero-network security tool**.

### Why It's Fundamentally Secure

```
Traditional Transfer (Wi-Fi Direct / Bluetooth):

Device A ──RF Signal──► [Router/Hotspot/Air] ──► Device B
          ↑ interception possible here ↑

PrismTransfer (Visual / Photon Transfer):

Device A ──[Screen pixels]──► [Camera lens] ──► Device B
         ↑ only light travels; no RF ↑
```

### Triple-Layer Integrity Verification

```
Layer 1: Per-Packet CRC-32
  ├── Computed on sender for each chunk (before encoding)
  ├── Transmitted inside packet JSON
  └── Re-verified on receiver before storage and again at reconstruction

Layer 2: Global SHA-256
  ├── Computed on sender from the ORIGINAL uncompressed file
  ├── Transmitted in the manifest frame
  └── Verified on receiver after full decompression

Layer 3: Size Verification
  ├── originalSize stored in manifest
  └── Compared against decompressed output byte count
```

### CRC-32 Implementation

```typescript
// Precomputed lookup table (pure TypeScript, no dependencies)
export function calculateCRC32(data: Uint8Array): string {
  let crc = 0 ^ -1;
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ data[i]) & 0xff];
  }
  crc = (crc ^ -1) >>> 0;
  return crc.toString(16).padStart(8, "0");
}
// Output: 8-character lowercase hex string (e.g. "a1b2c3d4")
```

### SHA-256 Implementation

```typescript
// Native Web Crypto API — hardware-accelerated, zero dependencies
export async function calculateSHA256(data: BufferSource): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}
```

### Trust Properties

| Property | Guarantee |
|---|---|
| **No cloud upload** | File bytes never leave the local device |
| **No account** | Zero authentication, zero identity tracking |
| **No telemetry** | No analytics, no logs, no beacons |
| **No network** | Works with airplane mode on both devices |
| **Sandboxed** | Runs in browser's security sandbox |
| **Air-gapped** | No RF signals of any kind emitted |
| **Cryptographic** | SHA-256 + CRC-32 double-verification |

---

## ⚙️ Settings & Speed Modes

All settings are persisted in `localStorage` under the key `prismtransfer_settings`.

### Reliability Modes

| Mode | FPS | Chunk Size | EC Level | Best For |
|---|---|---|---|---|
| 🔴 **Reliable** | 10 fps | 150 bytes | H (30%) | Maximum reliability, small/dirty screens |
| 🟡 **Balanced** | 20 fps | 300 bytes | M (15%) | Default — most environments |
| 🟢 **Speed** | 30 fps | 600 bytes | M (15%) | Clean setups, close distance |
| ⚡ **Turbo** | 45 fps | 1000 bytes | L (7%) | Ideal conditions, high-res screens |

### Full Settings Schema

```typescript
interface AppSettings {
  fps: number;                              // 10–45
  errorCorrectionLevel: "L"|"M"|"Q"|"H";   // QR error redundancy
  compressionLevel: number;                 // 0–9 (fflate level)
  developerMode: boolean;                   // Shows trace console + protocol details
  cameraPreference: "environment"|"user";   // Rear or front camera
  reducedMotion: boolean;                   // Accessibility setting
  reliabilityMode: "speed"|"balanced"|"reliable"|"turbo";
}
```

### Advanced Controls (Transfer Dashboard)

During an active QR transfer, the **Transfer Dashboard** (right panel) exposes:

- **FPS Slider:** 10, 15, 20, 30, 45 fps real-time adjustment
- **Sync Epoch Duration:** 500ms / 1000ms / 1500ms — pause between loops
- **Manual Complete Override:** Trigger completion screen instantly (dev)
- **Live Throughput Graph:** Real-time MB/s chart
- **Protocol Details Panel:** EC level, CRC status, SHA-256 prefix, chunk size

---

## 🔄 Reliability & Error Recovery

### Duplicate Frame Handling

The receiver uses a **time-based debounce** to suppress duplicate reads within the same sync epoch:

```typescript
// Debounce: if the same packetId was scanned within the epoch window
if (lastScannedRef.current && lastScannedRef.current.id === packetId) {
  const elapsed = now - lastScannedRef.current.time;
  if (elapsed < debounceMs) {
    // DROP — same packet seen too recently
    return;
  }
}
```

### Automatic Session Reset

If the sender starts a **new transfer** without the receiver refreshing:

```typescript
// Detect new session from a different transferId in the manifest
const isNewSession = !manifest || parsed.transferId !== manifest.transferId;

if (isNewSession) {
  await clearTransfer(manifest.transferId); // Flush previous IDB data
  tracker.resetProgress(m.totalPackets);    // Reset progress to 0%
  setManifest(m);                           // Update to new session
}
```

### Missing Packet Recovery

The sender **loops** the entire QR sequence indefinitely until the receiver signals completion. Any packets missed during one loop iteration are automatically picked up on the next loop. The receiver's `useProgressTracker` hook maintains a **bitset** of received packet indices to efficiently detect gaps.

```typescript
// O(1) lookup to check if a packet was already received
const received = new Set<number>();
const missingPackets = Array.from({ length: total }, (_, i) => i)
  .filter(i => !received.has(i));
```

---

## 📱 Progressive Web App (PWA)

PrismTransfer ships as a full **Progressive Web App**, enabling installation on any device and offline use after the first visit.

### PWA Manifest

```json
{
  "name": "PrismTransfer",
  "short_name": "PrismTransfer",
  "description": "Fast, secure, offline file transfer via QR codes.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#09090b",
  "theme_color": "#6366f1",
  "icons": [
    { "src": "/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Offline Capability

After first load, the Next.js static build is cached by the browser. Both `/send` and `/receive` pages are fully functional with no network connection.

---

## 🔍 SEO Architecture

PrismTransfer is built as an **SEO-first web application**, targeting thousands of search queries related to offline file sharing.

### Sitemap Coverage (58 static pages)

```
Static Routes:
  / /about /send /receive /settings /simulator
  /faq /privacy /security /terms /changelog
  /roadmap /whitepaper /open-source

Content Hubs:
  /guides          → 11 how-to articles
  /blog            → 5 in-depth tech posts
  /docs            → 10 documentation pages
  /compare         → 8 competitor comparisons

Programmatic SSG:
  /guides/[slug]           (generateStaticParams)
  /blog/[slug]             (generateStaticParams)
  /docs/[slug]             (generateStaticParams)
  /compare/[slug]          (generateStaticParams)
```

### JSON-LD Schema Types Implemented

| Schema | Pages |
|---|---|
| `WebApplication` | All pages |
| `Organization` | Home, About |
| `FAQPage` | /faq, comparison pages |
| `HowTo` | /guides/[slug] |
| `BreadcrumbList` | All content pages |
| `BlogPosting` | /blog/[slug] |

### Target Keywords

**Primary:** `offline file transfer`, `QR code file transfer`, `browser file sharing`, `secure file transfer`, `air gap file transfer`

**Long-tail:** `how to transfer files using qr code`, `offline file transfer without internet`, `cross platform file sharing without wifi`, `secure air gapped file transfer browser`

### Robots Configuration

```
User-agent: *              → Allow: /
User-agent: GPTBot         → Allow: / (AI-indexed)
User-agent: ClaudeBot      → Allow: /
User-agent: PerplexityBot  → Allow: /
User-agent: Applebot       → Allow: /
Sitemap: https://prismtransfer-rishvinreddy.vercel.app/sitemap.xml
```

---

## 🗂️ Project Structure

```
src/
├── app/
│   ├── layout.tsx              ← Global metadata, OG, Twitter cards
│   ├── sitemap.ts              ← Dynamic XML sitemap
│   ├── robots.ts               ← Robots.txt with AI crawler rules
│   ├── manifest.ts             ← PWA manifest
│   ├── page.tsx                ← Landing page
│   ├── send/page.tsx           ← File upload + transfer flow
│   ├── receive/page.tsx        ← Camera scanner + receiver flow
│   ├── settings/page.tsx       ← Settings panel
│   ├── about/page.tsx          ← About & team
│   ├── blog/
│   │   ├── page.tsx            ← Blog index
│   │   └── [slug]/page.tsx     ← Dynamic blog posts (SSG)
│   ├── compare/
│   │   ├── page.tsx            ← Comparison index
│   │   └── [slug]/page.tsx     ← Dynamic comparisons (SSG)
│   ├── docs/
│   │   ├── page.tsx            ← Docs index with sidebar
│   │   └── [slug]/page.tsx     ← Dynamic docs pages (SSG)
│   ├── guides/
│   │   ├── page.tsx            ← Guide index
│   │   └── [slug]/page.tsx     ← Dynamic guides with HowTo schema
│   ├── faq/page.tsx            ← FAQ with FAQPage JSON-LD
│   ├── privacy/page.tsx
│   ├── security/page.tsx
│   ├── terms/page.tsx
│   ├── changelog/page.tsx
│   ├── roadmap/page.tsx
│   ├── whitepaper/page.tsx
│   └── open-source/page.tsx
│
├── features/
│   ├── qr/
│   │   ├── QRGenerator.tsx     ← qrcode.js canvas renderer
│   │   ├── QRPlayer.tsx        ← Frame sequencer + dashboard UI
│   │   └── ThroughputGraph.tsx ← Live MB/s chart
│   ├── scanner/
│   │   ├── QRScanner.tsx       ← Camera feed component
│   │   ├── PacketReceiver.tsx  ← Core receiver state machine
│   │   ├── ReceiveDebugger.tsx ← Developer trace console
│   │   ├── useQRScanner.ts     ← jsQR RAF scanning hook
│   │   ├── useProgressTracker.ts ← Packet bitset tracker
│   │   └── reconstructionEngine.ts ← File assembly & verification
│   ├── transfer/
│   │   └── TransferController.tsx ← Sender orchestration
│   ├── storage/
│   │   └── packetStore.ts      ← IndexedDB CRUD (idb library)
│   └── developer/
│       └── DeveloperDashboard.tsx
│
├── lib/
│   ├── chunker.ts              ← Main processing pipeline
│   ├── checksum.ts             ← CRC32 + SHA-256
│   ├── compressor.ts           ← fflate zlibSync/unzlibSync
│   ├── encoder.ts              ← Base64URL encode/decode
│   ├── serializer.ts           ← JSON packet serialization
│   ├── validator.ts            ← Schema + CRC + SHA validation
│   ├── qr.ts                   ← QR capacity optimizer
│   └── fileStager.ts           ← File utilities
│
├── components/
│   ├── navbar.tsx
│   ├── footer.tsx
│   ├── theme-provider.tsx
│   ├── seo/JsonLd.tsx          ← Structured data injector
│   ├── home/
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── DataTransferIllustration.tsx
│   │   └── shared.tsx
│   └── ui/                     ← shadcn/ui primitives
│
├── contexts/
│   └── settings.tsx            ← AppSettings context + localStorage
│
├── data/
│   └── seoContent.ts           ← Static content for SSG pages
│
├── constants/
│   └── protocol.ts             ← Protocol version, defaults
│
└── types/
    └── transfer.ts             ← TypeScript interfaces
```

---

## 🛠️ Tech Stack

### Core

| Technology | Version | Role |
|---|---|---|
| **Next.js** | 16.3.0 | App Router, SSG, Metadata API |
| **React** | 19.2.8 | UI framework |
| **TypeScript** | 5.x | Type safety across entire codebase |

### Processing & Algorithms

| Library | Version | Role |
|---|---|---|
| **fflate** | 0.8.3 | DEFLATE compression/decompression (sync, no WASM) |
| **jsQR** | 1.4.0 | QR code decoding from camera frames |
| **qrcode** | 1.5.4 | QR code generation for sender frames |
| **nanoid** | 5.1.16 | Unique transfer session IDs |
| **idb** | 8.0.3 | Promise-based IndexedDB wrapper |

### UI & Styling

| Library | Version | Role |
|---|---|---|
| **Tailwind CSS** | 4.x | Utility-first styling |
| **shadcn/ui** | 4.16.1 | Premium component library |
| **Motion** | 12.43.0 | Framer Motion animations |
| **Lucide React** | 1.28.0 | Icon library |
| **Geist** | 1.7.2 | Vercel's design system fonts |
| **next-themes** | 0.4.6 | Dark/light mode theming |

### Development

| Tool | Role |
|---|---|
| **Vitest** | Unit testing |
| **Playwright** | End-to-end testing |
| **Testing Library** | React component testing |
| **ESLint** | Code quality |
| **Sharp** | Image optimization |

### Infrastructure

| Service | Role |
|---|---|
| **Vercel** | Deployment, Edge CDN, automatic CI/CD |
| **GitHub** | Source control, version management |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+
- A modern browser with camera support (Chrome, Safari, Firefox, Edge)

### Installation

```bash
# Clone the repository
git clone https://github.com/RishvinReddy/Prism-Transfer.git
cd Prism-Transfer

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Development Commands

```bash
npm run dev      # Start development server (Turbopack)
npm run build    # Build production bundle (Next.js SSG)
npm run start    # Start production server locally
npm run lint     # Run ESLint
```

### Testing

```bash
# Unit tests (Vitest)
npx vitest

# E2E tests (Playwright)
npx playwright test

# Component tests
npx vitest --ui
```

---

## 🌐 Environment & Deployment

### Environment Variables

PrismTransfer is fully serverless — **no environment variables are required** for basic operation. All processing happens client-side.

### Deployment to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

Or simply push to your GitHub repository — Vercel auto-deploys from the `main` branch.

### Production URL

```
https://prismtransfer-rishvinreddy.vercel.app
```

### next.config.ts

```typescript
// Standard Next.js configuration
// No server-side features required
// All routes are static or client-side
```

### Canonical URLs

All pages use absolute canonical URLs based on:
```
https://prismtransfer-rishvinreddy.vercel.app
```

---

## 🌍 Browser Support

| Browser | Sender | Receiver | PWA Install |
|---|---|---|---|
| Chrome 90+ | ✅ | ✅ | ✅ |
| Safari 15+ (iOS/macOS) | ✅ | ✅ | ✅ (Add to Home Screen) |
| Firefox 88+ | ✅ | ✅ | ✅ |
| Edge 90+ | ✅ | ✅ | ✅ |
| Samsung Internet 14+ | ✅ | ✅ | ✅ |
| Opera 77+ | ✅ | ✅ | ✅ |

### Required Browser APIs

| API | Used For |
|---|---|
| `navigator.mediaDevices.getUserMedia` | Camera access for QR scanning |
| `crypto.subtle.digest` | SHA-256 computation |
| `IndexedDB` (via idb) | Packet persistence during transfer |
| `URL.createObjectURL` | Download trigger for reconstructed file |
| `Canvas 2D` | Frame extraction for jsQR decoding |
| `LocalStorage` | Settings persistence |
| `Service Worker` | PWA offline caching |

---

## 📊 Performance Benchmarks

### Transfer Speed (Theoretical)

These numbers assume clean camera conditions and 100% scan success rate:

| Mode | FPS | Chunk Size | Throughput |
|---|---|---|---|
| Turbo | 45 fps | 1000B | ~45 KB/s (raw) |
| Speed | 30 fps | 600B | ~18 KB/s (raw) |
| Balanced | 20 fps | 300B | ~6 KB/s (raw) |
| Reliable | 10 fps | 150B | ~1.5 KB/s (raw) |

> **Note:** These are raw data throughput values. Effective file transfer speed depends on fflate compression ratio (typically 40–70% reduction for typical documents), camera scan success rate, and lighting conditions.

### Compression Ratios

| File Type | Typical Ratio | Notes |
|---|---|---|
| PDF (text) | 60–75% reduction | High entropy text compresses well |
| PNG Image | 5–15% reduction | Already compressed format |
| JPEG Image | 2–5% reduction | Minimal gain |
| ZIP Archive | 0–3% reduction | Already deflated |
| Plain Text | 70–85% reduction | Excellent compression |
| JSON/CSV | 65–80% reduction | Highly compressible |

### Lighthouse Scores (Target)

| Metric | Target |
|---|---|
| Performance | 100 |
| SEO | 100 |
| Accessibility | 95+ |
| Best Practices | 100 |
| LCP | < 1.5s |
| CLS | < 0.05 |
| INP | < 100ms |
| TTFB | < 200ms |

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

### Bug Reports

1. Search [existing issues](https://github.com/RishvinReddy/Prism-Transfer/issues) first
2. Include browser version, OS, camera hardware
3. Describe exact steps to reproduce
4. Attach developer console logs if available

### Feature Development

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/Prism-Transfer.git

# Create feature branch
git checkout -b feat/your-feature-name

# Make your changes and commit
git commit -m "feat: describe your change"

# Push and open PR
git push origin feat/your-feature-name
```

### Commit Convention

```
feat:     New feature
fix:      Bug fix
docs:     Documentation only
style:    Formatting changes
refactor: Code restructuring without behavior change
perf:     Performance improvement
test:     Adding or updating tests
chore:    Build tools, dependencies
```

### Areas Welcome for Contribution

- 🔬 **Protocol improvements** — Better compression, adaptive chunking
- 📸 **Scanner optimization** — Multi-camera support, adaptive exposure
- 🎨 **UI themes** — Light mode polish, custom color schemes
- 🌍 **Internationalization** — Multi-language support
- ♿ **Accessibility** — ARIA, keyboard navigation improvements
- 🧪 **Test coverage** — Unit tests for lib functions, E2E tests

---

## 🗺️ Roadmap

### v2.x (Current)
- ✅ Full transfer dashboard with live stats
- ✅ Turbo / Speed / Balanced / Reliable modes
- ✅ Automatic session reset on new transfer
- ✅ Complete SEO architecture (58 pages, JSON-LD schemas)
- ✅ Dynamic sitemap + robots.txt

### v3.0 (In Progress)
- [ ] **WebAssembly Compression** — Rust-based chunker for 10x faster processing
- [ ] **Adaptive QR sizing** — Dynamic version selection per-frame
- [ ] **QR Code Fountain Codes** — Forward error correction for truly lossless air-gaps
- [ ] **Multiple file transfer** — Batch mode with ZIP-on-the-fly

### v4.0 (Planned)
- [ ] **Multi-camera sync** — Two cameras scanning simultaneously for 2x speed
- [ ] **Custom color themes** — Colorized QR patterns for brand integration
- [ ] **Embedded preview** — Preview image files before receiving completes
- [ ] **Transfer pause/resume** — Save partial progress to IDB across sessions

### Long-term Vision
- [ ] **WebAssembly QR decoder** — Replace jsQR for faster frame parsing
- [ ] **Hardware acceleration** — GPU-based QR generation via WebGL
- [ ] **Developer SDK** — npm package for chunker + QR pipeline integration

---

## ❓ FAQ

<details>
<summary><strong>How does offline file transfer via QR codes work?</strong></summary>

PrismTransfer converts your file into compressed binary data, splits it into chunks, encodes each chunk into a QR code image, and animates them rapidly on your screen. The receiving device's camera scans each QR frame in sequence and reassembles the original file entirely within the browser.

</details>

<details>
<summary><strong>What is the maximum file size I can transfer?</strong></summary>

There is no hard limit — PrismTransfer handles any file your browser can read via the File API. However, for practical scan reliability:
- **Recommended:** Under 5MB for typical QR session durations
- **Viable:** 5–25MB with Speed or Turbo mode
- **Patience required:** 25MB+ (many scan loops needed)

</details>

<details>
<summary><strong>Why does the receiver sometimes miss packets?</strong></summary>

Missed packets are normal and expected — the sender loops the entire QR sequence. On each loop, the receiver picks up any previously missed packets. Common causes of missed frames: camera not aligned, screen glare, too-high FPS for the camera hardware. Reduce FPS in the Transfer Dashboard or switch to Reliable mode.

</details>

<details>
<summary><strong>Is my file data secure?</strong></summary>

Yes — cryptographically guaranteed:
1. Files are processed locally in your browser sandbox
2. No data is uploaded to any server (ever)
3. Each chunk is CRC-32 verified before storage
4. The complete file is SHA-256 verified before download
5. The physical air-gap prevents any wireless interception

</details>

<details>
<summary><strong>Can it work between iPhone and Windows PC?</strong></summary>

Absolutely — this is one of PrismTransfer's core use cases. Any device with a web browser can be sender or receiver, regardless of OS or manufacturer.

</details>

<details>
<summary><strong>Does it require an internet connection?</strong></summary>

No. PrismTransfer is a PWA that caches locally. After your first visit, both the `/send` and `/receive` pages work with airplane mode on.

</details>

<details>
<summary><strong>What happens if the QR stream is interrupted?</strong></summary>

Nothing is lost. The receiver retains all packets it has collected in IndexedDB. When the sender resumes, the receiver continues collecting from where it left off (since duplicate packets are ignored and missing ones are collected on subsequent loops).

</details>

<details>
<summary><strong>Why Base64URL instead of raw binary in QR codes?</strong></summary>

QR codes encode data as text (ASCII/UTF-8). Binary data must be text-encoded to fit. Base64URL is chosen over standard Base64 because it avoids `+`, `/`, and `=` characters that have special meaning in URLs and can confuse some QR decoders.

</details>

---

## 📚 Related Reading

- [QR Code Capacity Standard (ISO/IEC 18004)](https://www.iso.org/standard/62021.html)
- [fflate Documentation](https://github.com/101arrowz/fflate)
- [jsQR Library](https://github.com/cozmo/jsQR)
- [Web Crypto API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto)
- [IndexedDB — MDN](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [getUserMedia API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)

---

## 📜 License

```
MIT License

Copyright (c) 2026 Rishvin Reddy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

<div align="center">

**Built by [Rishvin Reddy](https://github.com/RishvinReddy) · [Rishvin Labs](https://github.com/RishvinReddy)**

[🌐 Live Demo](https://prismtransfer-rishvinreddy.vercel.app) · [📖 Documentation](https://prismtransfer-rishvinreddy.vercel.app/docs) · [🐛 Report Bug](https://github.com/RishvinReddy/Prism-Transfer/issues) · [💡 Request Feature](https://github.com/RishvinReddy/Prism-Transfer/issues)

<br/>

*If PrismTransfer saved you — leave a ⭐ on GitHub!*

</div>
