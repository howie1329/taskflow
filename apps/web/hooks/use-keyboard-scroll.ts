"use client";

import { useEffect, useRef } from "react";

interface UseKeyboardScrollOptions {
  enabled?: boolean;
  behavior?: "auto" | "smooth";
}

/**
 * Hook to scroll element into view when keyboard appears on mobile
 */
export function useKeyboardScroll(
  elementRef: React.RefObject<HTMLElement | null>,
  options: UseKeyboardScrollOptions = {},
) {
  const { enabled = true, behavior = "smooth" } = options;
  const lastHeightRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const visualViewport = window.visualViewport;

      if (!visualViewport) return;

      // Keyboard is appearing (height decreased significantly)
      if (lastHeightRef.current - currentHeight > 100) {
        setTimeout(() => {
          elementRef.current?.scrollIntoView({
            behavior,
            block: "end",
            inline: "nearest",
          });
        }, 50);
      }

      lastHeightRef.current = currentHeight;
    };

    // Track initial height
    lastHeightRef.current = window.innerHeight;

    window.addEventListener("resize", handleResize);
    window.visualViewport?.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.visualViewport?.removeEventListener("resize", handleResize);
    };
  }, [enabled, behavior, elementRef]);
}
