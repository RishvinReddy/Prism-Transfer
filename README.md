# PrismTransfer

Fast, secure, offline file transfer via animated QR codes.

## Overview

PrismTransfer allows you to transmit files from one device to another completely offline. It achieves this by aggressively compressing the file, splitting it into hundreds of chunks, converting those chunks into an animated sequence of high-density QR codes, and broadcasting them on your screen. The receiving device uses its camera to scan the sequence, verify checksums in real-time, and perfectly reconstruct the original file.

## Features

- **100% Offline:** No Wi-Fi, Bluetooth, or cloud backend required.
- **Cross-Platform:** Works on any modern device with a screen, camera, and web browser.
- **Cryptographic Integrity:** SHA-256 and CRC32 verification ensures your file is never corrupted.
- **Adaptive Reliability:** Automatically ignores dropped frames and duplicate scans.
- **Progressive Web App (PWA):** Installs to your home screen and functions completely offline after the first visit.

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser.

## Deployment

PrismTransfer is an offline-first Next.js app optimized for deployment on Vercel.

```bash
npm run build
```

## Architecture

- **Next.js 15 (App Router)**
- **Tailwind CSS v4 & shadcn/ui**
- **html5-qrcode** for camera scanning
- **fflate** for synchronous DEFLATE compression
- **IndexedDB** (idb) for robust packet storage

## License
MIT License.
