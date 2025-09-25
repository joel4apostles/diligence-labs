import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/accessibility.css";
import { AuthProvider } from "@/components/providers/session-provider";
import { WalletProvider } from "@/components/providers/wallet-provider";
import { DiligencePrivyProvider } from "@/components/providers/privy-provider";
import { UnifiedAuthProvider } from "@/components/providers/unified-auth-provider";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AccessibilityProvider, SkipToContent, AccessibilityMenu } from "@/components/ui/accessibility";
import { AccessibilityChecker } from "@/components/ui/accessibility-checker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Diligence Labs - Blockchain Consulting & Advisory",
  description: "Diligence Labs provides expert blockchain consulting, advisory services, due diligence, and strategic guidance for blockchain projects.",
  keywords: "blockchain consulting, cryptocurrency advisory, due diligence, blockchain strategy, crypto consulting",
  authors: [{ name: "Diligence Labs" }],
  openGraph: {
    title: "Diligence Labs - Blockchain Consulting & Advisory",
    description: "Expert blockchain consulting and advisory services with transparent guidance and proven results.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="dark light" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SkipToContent />
        <ErrorBoundary>
          <AccessibilityProvider>
            <DiligencePrivyProvider>
              <AuthProvider>
                <WalletProvider>
                  <UnifiedAuthProvider>
                    <main id="main-content" role="main">
                      {children}
                    </main>
                    <AccessibilityMenu />
                    <AccessibilityChecker />
                  </UnifiedAuthProvider>
                </WalletProvider>
              </AuthProvider>
            </DiligencePrivyProvider>
          </AccessibilityProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
