import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "전국 LNG발전소 현황",
  description: "전국 LNG발전소 및 기후·에너지 뉴스 정보",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import KakaoScript from "@/components/KakaoScript";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        <Header />
        <main className="flex-1 pt-20">
          {children}
        </main>
        <Footer />
        <KakaoScript />
      </body>
    </html>
  );
}
