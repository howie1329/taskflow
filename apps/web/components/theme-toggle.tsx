"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Sun02Icon, Moon02Icon } from "@hugeicons/core-free-icons";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <HugeiconsIcon
        icon={resolvedTheme === "dark" ? Sun02Icon : Moon02Icon}
        className="h-4 w-4"
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
