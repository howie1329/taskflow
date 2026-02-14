"use client";

import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type InspectorPortalContextValue = {
  target: HTMLElement | null;
  setTarget: (target: HTMLElement | null) => void;
  activeCount: number;
  incrementActive: () => void;
  decrementActive: () => void;
};

const InspectorPortalContext =
  createContext<InspectorPortalContextValue | null>(null);

function useInspectorPortalContext() {
  const context = useContext(InspectorPortalContext);
  if (!context) {
    throw new Error("Inspector portal components must be used within InspectorPortalProvider.");
  }
  return context;
}

export function InspectorPortalProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [activeCount, setActiveCount] = useState(0);
  const incrementActive = useCallback(() => {
    setActiveCount((count) => count + 1);
  }, []);
  const decrementActive = useCallback(() => {
    setActiveCount((count) => Math.max(0, count - 1));
  }, []);

  const value = useMemo<InspectorPortalContextValue>(
    () => ({
      target,
      setTarget,
      activeCount,
      incrementActive,
      decrementActive,
    }),
    [target, activeCount, incrementActive, decrementActive],
  );

  return (
    <InspectorPortalContext.Provider value={value}>
      {children}
    </InspectorPortalContext.Provider>
  );
}

export function InspectorPortalTarget({ className }: { className?: string }) {
  const { setTarget } = useInspectorPortalContext();

  return (
    <div
      ref={(node) => setTarget(node)}
      className={className}
      data-slot="inspector-portal-target"
    />
  );
}

export function InspectorPortal({ children }: { children: ReactNode }) {
  const { target, incrementActive, decrementActive } = useInspectorPortalContext();

  useEffect(() => {
    incrementActive();
    return () => decrementActive();
  }, [incrementActive, decrementActive]);

  if (!target) {
    return null;
  }

  return createPortal(children, target);
}

export function useInspectorPortalState() {
  const { activeCount } = useInspectorPortalContext();
  return { activeCount };
}
