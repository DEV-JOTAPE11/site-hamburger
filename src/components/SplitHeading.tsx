"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { gsap, SplitText } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

type Mode = "lines" | "chars-float";

/**
 * Título que entra linha a linha por trás de uma máscara (lines) ou letra a
 * letra "esticando" com a rolagem (chars-float, porte do ScrollFloat).
 * O SplitText refaz a quebra quando a largura muda (autoSplit), então o
 * efeito vale igual no celular.
 */
export default function SplitHeading({
  as: Tag = "h2",
  className,
  children,
  mode = "lines",
  delay = 0,
}: {
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  children: ReactNode;
  mode?: Mode;
  delay?: number;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let split: SplitText | undefined;
    const ctx = gsap.context(() => {
      if (mode === "lines") {
        split = SplitText.create(el, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 115,
              rotate: 2.5,
              duration: 1.25,
              ease: "brasa",
              stagger: 0.09,
              delay,
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            }),
        });
      } else {
        split = SplitText.create(el, {
          type: "words,chars",
          autoSplit: true,
          onSplit: (self) =>
            gsap.fromTo(
              self.chars,
              { opacity: 0, yPercent: 120, scaleY: 2.3, scaleX: 0.7, transformOrigin: "50% 0%" },
              {
                opacity: 1,
                yPercent: 0,
                scaleY: 1,
                scaleX: 1,
                ease: "back.inOut(2)",
                stagger: 0.03,
                scrollTrigger: { trigger: el, start: "top bottom-=10%", end: "bottom center+=10%", scrub: true },
              },
            ),
        });
      }
    }, el);
    return () => {
      ctx.revert();
      split?.revert();
    };
  }, [mode, delay]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
