"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

const slideInFromRight = {
  initial: { x: "100%", opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: "-30%", opacity: 0 },
};

const slideOutToLeft = {
  initial: { x: 0, opacity: 1 },
  animate: { x: "-30%", opacity: 0 },
  exit: { x: "100%", opacity: 0 },
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export type TransitionVariant = "slideInRight" | "fade";

interface ChatPageTransitionProps {
  children: React.ReactNode;
  variant?: TransitionVariant;
  className?: string;
}

export function ChatPageTransition({
  children,
  variant = "fade",
  className,
}: ChatPageTransitionProps) {
  const pathname = usePathname();

  const transition = useMemo(() => {
    return variant === "slideInRight" ? slideInFromRight : fadeIn;
  }, [variant]);

  const exitTransition = useMemo(() => {
    return variant === "slideInRight" ? slideOutToLeft : fadeIn;
  }, [variant]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={transition}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          opacity: { duration: 0.15 },
        }}
        className={cn("w-full h-full", className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export { slideInFromRight, slideOutToLeft, fadeIn };
