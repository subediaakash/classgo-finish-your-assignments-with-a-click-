import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Aleo } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/common/nav-bar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const aleo = Aleo({
  variable: "--font-aleo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Detox It",
  description: "A Detoxification Journey",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${aleo.variable} antialiased`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
