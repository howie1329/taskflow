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
    <div className="grid min-h-dvh grid-rows-[auto_1fr] bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center px-4 lg:px-8">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-[color,opacity] duration-(--duration-ui) ease-(--ease-snap) hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="relative min-h-0">
        <div className="absolute inset-0 landing-radial-wash" />
        <div className="absolute inset-0 landing-grid-bg opacity-50" />

        <div className="relative flex min-h-full items-center justify-center px-4 py-10 lg:px-8 lg:py-12">
          {children}
        </div>
      </main>
    </div>
  );
}
