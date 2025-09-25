import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/session-provider";
import { DiligenceAuthProvider } from "@/components/providers/diligence-auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Diligence Labs - Expert Blockchain Consulting",
  description: "Strategic advisory, due diligence, and token launch consulting for blockchain projects. Expert guidance from conception to market success.",
  keywords: "blockchain consulting, token launch, due diligence, crypto advisory, defi consulting",
  authors: [{ name: "Diligence Labs" }],
  openGraph: {
    title: "Diligence Labs - Expert Blockchain Consulting",
    description: "Strategic advisory and due diligence for blockchain projects",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Diligence Labs - Expert Blockchain Consulting",
    description: "Strategic advisory and due diligence for blockchain projects",
  },
  robots: {
    index: true,
    follow: true,
  }
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Simplified authentication stack */}
        <AuthProvider>
          <DiligenceAuthProvider 
            providers={['email', 'google']}
            fallbackStrategy="email"
          >
            {children}
          </DiligenceAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}