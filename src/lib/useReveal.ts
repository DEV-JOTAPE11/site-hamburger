"use client";

import { useEffect, type RefObject } from "react";

/**
 * Entrada simples por IntersectionObserver, sem ScrollTrigger: cada
 * `[data-reveal]` dentro de `ref` ganha `.is-in` na primeira vez que aparece
 * e o CSS faz o resto. O `.rv` no container só existe com JS rodando, então
 * sem JS (ou antes da hidratação) nada fica escondido.
 */
export function useReveal(ref: RefObject<HTMLElement | null>, threshold = 0.2) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = root.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!("IntersectionObserver" in window)) return;
    root.classList.add("rv");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ref, threshold]);
}
