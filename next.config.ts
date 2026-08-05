import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Block this page from being loaded in a frame
  { key: "X-Frame-Options", value: "DENY" },
  // Legacy XSS filter for older browsers
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // Only send origin on same-origin requests; no referrer on cross-origin
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Restrict what APIs can be invoked by third-party embeds.
  // camera=() allows only same-origin pages (i.e. /receive) to request camera.
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(), geolocation=(), payment=()",
  },
  // CSP in report-only mode: captures violations without breaking anything while
  // we audit third-party dependencies. Tighten to Content-Security-Policy once
  // all violations are resolved.
  {
    key: "Content-Security-Policy-Report-Only",
    value: [
      "default-src 'self'",
      // Next.js inline scripts & eval for HMR (development only; production will be tighter)
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      // camera frames (blob:) needed by QR scanner; data: for QR generator canvas
      "img-src 'self' data: blob:",
      "media-src 'self' blob:",
      "connect-src 'self'",
      "worker-src 'self' blob:",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ── Security headers on every route ──────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  // ── Image optimisation ────────────────────────────────────────────────────
  images: {
    // Allow serving optimised images from the same origin and localhost in dev
    remotePatterns: [
      { protocol: "https", hostname: "prismtransfer.app" },
      { protocol: "http", hostname: "localhost" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // ── Redirects ─────────────────────────────────────────────────────────────
  // Placeholder structure ready for future blog/docs slug redirects.
  // async redirects() {
  //   return [];
  // },
};

export default nextConfig;
