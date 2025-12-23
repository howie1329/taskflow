"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export default function ThemesProvider({ children }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
