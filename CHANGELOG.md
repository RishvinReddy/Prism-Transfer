# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-08-04

### Added
- **End-to-End Transfer Pipeline:** Fully functional optical data transfer using QR codes.
- **Protocol:** Version 1.0 JSON protocol with stable IDs and manifests.
- **Integrity Verification:** In-house CRC32 on every packet and Web Crypto SHA-256 for the reconstructed payload.
- **Compression:** Synchronous entire-file DEFLATE compression via `fflate`.
- **Packet Storage:** IndexedDB integration for robust duplicate-handling and large file transfers.
- **Adaptive QR:** Dynamic heuristic scoring for version, chunk size, and error correction.
- **Developer Dashboard:** Live performance benchmarking, including KB/s, decode latency, and FPS.
- **Progressive Web App (PWA):** Offline support with Service Worker and manifest installation.
- **Testing Suite:** Vitest and Playwright configuration.

### Changed
- Refined UI with custom glassmorphic Indigo/Cyan/Slate theme.
- Configured dynamic theme toggles and responsive layouts.
