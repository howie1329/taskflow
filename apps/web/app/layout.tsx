import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import ConvexClientProvider from "@/components/convex/ConvexClientProvider";
import { Toaster } from "@/components/ui/sonner";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});


const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Taskflow — Your AI-assisted workplace",
  description:
    "Solo productivity system: capture ideas, organize projects and tasks, manage notes, schedule your day, and get AI help without tab-hopping.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html
        lang="en"
        className={`${fontSans.variable} ${fontMono.variable} antialiased mobile-safe`}
        suppressHydrationWarning
      >
        <head>
          <meta
            name="theme-color"
            content="oklch(0.9821 0 0)"
            media="(prefers-color-scheme: light)"
          />
          <meta
            name="theme-color"
            content="oklch(0.1776 0 0)"
            media="(prefers-color-scheme: dark)"
          />
        </head>
        <body className="font-sans antialiased mobile-safe">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ConvexClientProvider>
              {children}
              <Toaster />
            </ConvexClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
