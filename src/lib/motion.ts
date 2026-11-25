/** `true` quando o sistema pede menos animação. Seguro no servidor. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Ponteiro fino (mouse/trackpad) — parallax de ponteiro só existe nele. */
export function hasFinePointer(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Curva suave 0→1 (derivada zero nas pontas). */
export const smoothstep = (t: number) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};
/** Easing in-out cúbico. */
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
