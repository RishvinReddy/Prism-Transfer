import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SettingsProvider } from "@/contexts/settings";

export const metadata: Metadata = {
  metadataBase: new URL("https://prismtransfer-rishvinreddy.vercel.app"),
  title: {
    default: "PrismTransfer — Fast, Secure Offline File Transfer via Animated QR Codes",
    template: "%s | PrismTransfer"
  },
  description: "Transfer files instantly using animated QR codes. No internet, no cables, no Bluetooth, no accounts. Privacy-first, serverless browser-based file sharing.",
  applicationName: "PrismTransfer",
  authors: [{ name: "Rishvin Reddy", url: "https://github.com/RishvinReddy" }],
  publisher: "Rishvin Labs",
  creator: "Rishvin Reddy",
  category: "Technology",
  keywords: [
    "offline file transfer", "QR code file transfer", "browser file sharing", 
    "secure file transfer", "offline sharing", "QR transfer", 
    "cross platform file transfer", "privacy", "air gap", "animated QR", 
    "PWA", "web app"
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
    url: "https://prismtransfer-rishvinreddy.vercel.app",
    title: "PrismTransfer — Fast, Secure Offline File Transfer",
    description: "Transfer files using animated QR codes. No Internet. No Bluetooth. No Cables.",
    siteName: "PrismTransfer",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "PrismTransfer - Fast Secure Offline File Sharing",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PrismTransfer — Fast, Secure Offline File Transfer",
    description: "Fast, secure offline file transfer using animated QR codes.",
    creator: "@RishvinReddy",
    images: ["/logo.png"],
  },
};

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
