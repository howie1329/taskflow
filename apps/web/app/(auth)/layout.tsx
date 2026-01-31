import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Authentication | Taskflow",
  description: "Sign in to your Taskflow account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr] bg-background">
      {/* Top header: minimal, distraction-free */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="container flex h-14 items-center justify-between px-4">
          <Link
            href="/"
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </header>

      {/* Main content: centered 2-column layout on desktop */}
      <main className="relative">
        {/* Background effects */}
        <div className="absolute inset-0 landing-radial-wash" />
        <div className="absolute inset-0 landing-grid-bg opacity-50" />

        {/* Content */}
        <div className="relative h-full flex items-center justify-center p-4">
          {children}
        </div>
      </main>
    </div>
  );
}
