import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";

import { CartProvider } from "@/components/cart/cart-provider";
import { AppShell } from "@/components/layout/app-shell";
import { ThemeProvider } from "@/components/theme/theme-provider";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "blinkit · Category Quest",
  description: "Explore new categories, spin for rewards — Category Quest MVP",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0C831F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider>
          <CartProvider>
            <AppShell>{children}</AppShell>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
