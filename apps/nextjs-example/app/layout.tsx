import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
// Package styles: tokens + all component CSS. base.css is optional global defaults.
import "@heigin/ui/styles.css";
import "@heigin/ui/base.css";
import "./globals.css";
import { AppShell } from "./_components/app-shell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "HeiGin UI · Next.js example",
  description: "A CRM-style app built with @heigin/ui and mock data.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN" className={inter.variable}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
