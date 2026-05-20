import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ToastContainer } from "@/components/ui/Toast";
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
  title: {
    default: "OpenClaw Skill Shop",
    template: "%s - OpenClaw Skill Shop",
  },
  description: "OpenClaw Skill 线上商店 — 发现和分享优质技能包",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 via-gray-50/95 to-gray-100/50">
        <ToastContainer>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ToastContainer>
      </body>
    </html>
  );
}
