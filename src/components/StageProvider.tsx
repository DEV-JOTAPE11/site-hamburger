"use client";

import { createContext, useContext, useMemo, useRef, type ReactNode, type RefObject } from "react";

/**
 * Refs partilhadas entre a hero e a seção de destaque. O hambúrguer voa de
 * uma para a outra durante a rolagem, então as duas pontas precisam se
 * enxergar. Como o GSAP mexe direto no DOM, isso vive em refs — nada
 * re-renderiza no meio do voo.
 */
export interface StageRefs {
  heroRef: RefObject<HTMLElement | null>;
  heroSlotRef: RefObject<HTMLDivElement | null>;
  featureRef: RefObject<HTMLElement | null>;
  featureSlotRef: RefObject<HTMLDivElement | null>;
}

const StageContext = createContext<StageRefs | null>(null);

export function StageProvider({ children }: { children: ReactNode }) {
  const heroRef = useRef<HTMLElement | null>(null);
  const heroSlotRef = useRef<HTMLDivElement | null>(null);
  const featureRef = useRef<HTMLElement | null>(null);
  const featureSlotRef = useRef<HTMLDivElement | null>(null);
  const value = useMemo<StageRefs>(() => ({ heroRef, heroSlotRef, featureRef, featureSlotRef }), []);
  return <StageContext.Provider value={value}>{children}</StageContext.Provider>;
}

export function useStage(): StageRefs {
  const ctx = useContext(StageContext);
  if (!ctx) throw new Error("useStage precisa estar dentro de <StageProvider>.");
  return ctx;
}
