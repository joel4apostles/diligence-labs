import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/session-provider";
import { WalletProvider } from "@/components/providers/wallet-provider";
import { DiligencePrivyProvider } from "@/components/providers/privy-provider";
import { UnifiedAuthProvider } from "@/components/providers/unified-auth-provider";

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
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DiligencePrivyProvider>
          <AuthProvider>
            <WalletProvider>
              <UnifiedAuthProvider>
                {children}
              </UnifiedAuthProvider>
            </WalletProvider>
          </AuthProvider>
        </DiligencePrivyProvider>
      </body>
    </html>
  );
}
