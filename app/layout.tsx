import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

import { GlobalErrorBoundary } from "@/components/errors/GlobalErrorBoundary";
import { RootProvider } from "@/providers/RootProvider";

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
  title: "DashNotes — Workspace notes with AI chat and agents",
  description:
    "Capture notes and files, ask with citations, and let an agent act on your workspace knowledge.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <GlobalErrorBoundary>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <RootProvider>
            {children}
            <Toaster />
          </RootProvider>
        </body>
      </html>
    </GlobalErrorBoundary>
  );
}
