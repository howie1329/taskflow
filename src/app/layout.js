import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import ThemesProvider from "@/presentation/styles/ThemesProvider";
import { JetBrains_Mono } from "next/font/google";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata = {
  title: "TaskFlow",
  description:
    "TaskFlow is a productivity application that helps you manage your tasks and notes.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`antialiase ${jetbrainsMono.variable}`}
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          <ThemesProvider>{children}</ThemesProvider>
          <Toaster position="bottom-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
