import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bearing | Find the right onchain agent",
  description: "An evidence-first marketplace for BNB Smart Chain agents.",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f4f2ec",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} style={{ colorScheme: "light" }}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
