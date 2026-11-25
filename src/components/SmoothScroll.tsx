"use client";

import { useEffect } from "react";
import type Lenis from "lenis";

import { prefersReducedMotion } from "@/lib/motion";

/**
 * Rolagem suave (Lenis) no mesmo relógio do GSAP: o ticker do GSAP alimenta
 * o Lenis e o Lenis avisa o ScrollTrigger na mesma volta — os efeitos com
 * scrub nunca tremem. No toque o Lenis deixa a rolagem nativa.
 */
let instance: Lenis | null = null;
export const getLenis = () => instance;

export function scrollToTarget(target: string | HTMLElement, offset = -80) {
  if (instance) {
    instance.scrollTo(target, { offset, duration: 1.4 });
    return;
  }
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: "smooth" });
}

export default function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const [{ default: LenisCtor }, { gsap, ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("@/lib/gsap"),
      ]);
      if (cancelled) return;

      const lenis = new LenisCtor({ duration: 1.15, anchors: { offset: -80 } });
      instance = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (t: number) => lenis.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      cleanup = () => {
        gsap.ticker.remove(tick);
        gsap.ticker.lagSmoothing(500, 33);
        lenis.destroy();
        instance = null;
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return null;
}
