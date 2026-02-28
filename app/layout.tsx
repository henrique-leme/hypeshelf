import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConvexClerkProvider } from "@/components/providers/convex-clerk-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/error-boundary";
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
  title: "HypeShelf",
  description: "Collect and share the stuff you're hyped about.",
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
        <ConvexClerkProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
              <ErrorBoundary>{children}</ErrorBoundary>
            </main>
            <Footer />
          </div>
          <Toaster />
        </ConvexClerkProvider>
      </body>
    </html>
  );
}
