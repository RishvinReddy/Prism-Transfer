import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SettingsProvider } from "@/contexts/settings";

const CANONICAL = "https://prismtransfer-rishvinreddy.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL),
  title: {
    default: "PrismTransfer — Fast, Secure Offline File Transfer via Animated QR Codes",
    template: "%s | PrismTransfer",
  },
  description:
    "Transfer files instantly using animated QR codes. No internet, no cables, no Bluetooth, no accounts. Privacy-first, serverless browser-based file sharing.",
  applicationName: "PrismTransfer",
  authors: [{ name: "Rishvin Reddy", url: "https://rishvinreddy.vercel.app" }],
  publisher: "Rishvin Labs",
  creator: "Rishvin Reddy",
  category: "Technology",
  keywords: [
    "offline file transfer",
    "QR code file transfer",
    "browser file sharing",
    "secure file transfer",
    "offline sharing",
    "QR transfer",
    "cross platform file transfer",
    "privacy",
    "air gap",
    "animated QR",
    "PWA",
    "web app",
    "Rishvin Reddy",
    "Rishvin Labs",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: CANONICAL,
    title: "PrismTransfer — Fast, Secure Offline File Transfer",
    description: "Transfer files using animated QR codes. No Internet. No Bluetooth. No Cables.",
    siteName: "PrismTransfer",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "PrismTransfer - Fast Secure Offline File Sharing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PrismTransfer — Fast, Secure Offline File Transfer",
    description: "Fast, secure offline file transfer using animated QR codes.",
    creator: "@RishvinReddy",
    images: ["/logo.png"],
  },
  other: {
    "author": "Rishvin Reddy",
    "creator": "Rishvin Reddy",
    "publisher": "Rishvin Labs",
    "copyright": "Rishvin Reddy",
    "application-name": "PrismTransfer",
  },
};

// Global JSON-LD schemas injected on every page
const globalSchemas = [
  // Person
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${CANONICAL}/author/rishvin-reddy#person`,
    "name": "Rishvin Reddy",
    "alternateName": "Erolla Rishvin Reddy",
    "description":
      "Rishvin Reddy is a software engineer and founder of Rishvin Labs, specializing in cybersecurity, full-stack web development, IoT systems, blockchain applications, and privacy-focused browser technologies. Creator of PrismTransfer, an offline file transfer platform using animated QR codes.",
    "url": "https://rishvinreddy.vercel.app",
    "image": `${CANONICAL}/rishvin-reddy.png`,
    "jobTitle": "Software Engineer & Founder",
    "worksFor": {
      "@type": "Organization",
      "name": "Rishvin Labs",
      "url": "https://rishvinreddy.vercel.app",
    },
    "alumniOf": {
      "@type": "CollegeOrUniversity",
      "name": "Woxsen University",
      "url": "https://woxsen.edu.in",
    },
    "nationality": { "@type": "Country", "name": "India" },
    "knowsAbout": [
      "Cybersecurity",
      "Full-Stack Development",
      "Next.js",
      "React",
      "TypeScript",
      "Node.js",
      "IoT",
      "Blockchain",
      "Digital Forensics",
      "QR Code Technologies",
      "Offline File Transfer",
      "Progressive Web Apps",
      "Privacy Engineering",
      "Computer Networks",
      "Software Engineering",
    ],
    "sameAs": [
      "https://github.com/RishvinReddy",
      "https://rishvinreddy.vercel.app",
      "https://linkedin.com/in/rishvinreddy",
    ],
    "founder": {
      "@type": "Organization",
      "name": "Rishvin Labs",
      "url": "https://rishvinreddy.vercel.app",
    },
    "creator": {
      "@type": "SoftwareApplication",
      "name": "PrismTransfer",
      "url": CANONICAL,
    },
  },
  // Organization
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${CANONICAL}#organization`,
    "name": "Rishvin Labs",
    "url": "https://rishvinreddy.vercel.app",
    "logo": `${CANONICAL}/logo.png`,
    "description":
      "Privacy-first engineering studio building open-source developer tools. Founded by Rishvin Reddy. Flagship product: PrismTransfer.",
    "founder": {
      "@type": "Person",
      "@id": `${CANONICAL}/author/rishvin-reddy#person`,
      "name": "Rishvin Reddy",
    },
    "foundingDate": "2026",
    "sameAs": [
      "https://github.com/RishvinReddy",
      "https://rishvinreddy.vercel.app",
    ],
    "makesOffer": {
      "@type": "Offer",
      "itemOffered": {
        "@type": "SoftwareApplication",
        "name": "PrismTransfer",
        "url": CANONICAL,
      },
    },
  },
  // WebSite
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${CANONICAL}#website`,
    "name": "PrismTransfer",
    "url": CANONICAL,
    "description": "Transfer files using animated QR codes. No internet. No cloud. No accounts.",
    "author": {
      "@type": "Person",
      "@id": `${CANONICAL}/author/rishvin-reddy#person`,
      "name": "Rishvin Reddy",
    },
    "publisher": {
      "@type": "Organization",
      "@id": `${CANONICAL}#organization`,
      "name": "Rishvin Labs",
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${CANONICAL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary flex flex-col relative`}
      >
        {/* Global JSON-LD Schemas */}
        {globalSchemas.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}

        {/* Subtle Background Orbs */}
        <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none -z-50" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none -z-50" />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SettingsProvider>
            <Navbar />
            <main className="flex-1 flex flex-col container mx-auto px-0 max-w-none py-8">
              {children}
            </main>
            <Footer />
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}



