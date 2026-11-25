"use client";

import { useEffect, useRef } from "react";

import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

const STEPS = [
  {
    t: "O blend",
    d: "Acém e costela moídos toda manhã, na proporção 80/20. Sem tempero na massa: só sal grosso na chapa.",
  },
  {
    t: "O smash",
    d: "A bolinha cai na chapa a 230°C e é prensada em um segundo. É aí que nasce a crosta escura e rendada.",
  },
  {
    t: "A montagem",
    d: "Brioche selado na manteiga, cheddar derretendo sobre a carne ainda na chapa e o molho da casa por último.",
  },
];

/**
 * Seção escura, como a do Hario V60 no vídeo: foto da brasa com um selo de
 * texto girando, e os três passos numerados que acendem conforme a rolagem.
 */
export default function Process() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.to(".process__ring", {
        rotate: 360,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
      });
      gsap.fromTo(
        ".process__photo img",
        { scale: 1.2, yPercent: -6 },
        { scale: 1.05, yPercent: 6, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
      );
      gsap.utils.toArray<HTMLElement>(".step").forEach((s) => {
        gsap.fromTo(
          s,
          { opacity: 0.18 },
          { opacity: 1, ease: "none", scrollTrigger: { trigger: s, start: "top 85%", end: "top 55%", scrub: true } },
        );
        gsap.from(s.querySelector(".step__line"), {
          scaleX: 0,
          transformOrigin: "0 50%",
          ease: "none",
          scrollTrigger: { trigger: s, start: "top 85%", end: "top 55%", scrub: true },
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="chapa" className="process" aria-labelledby="process-title">
      <div className="process__photo">
        <img src="/img/brasa.webp" alt="Hambúrgueres na grelha sobre a brasa acesa" width={1400} height={932} loading="lazy" />
        <svg className="process__ring" viewBox="0 0 200 200" aria-hidden>
          <defs>
            <path id="ring-c" d="M100 100m-80 0a80 80 0 1 1 160 0a80 80 0 1 1-160 0" />
          </defs>
          <text>
            <textPath href="#ring-c">brasa de verdade • chapa de ferro • desde 2019 • </textPath>
          </text>
        </svg>
      </div>

      <div className="process__copy">
        <h2 id="process-title" className="process__title">
          A chapa
          <em className="serif">em três tempos</em>
        </h2>
        <ol className="process__steps">
          {STEPS.map((s, i) => (
            <li key={s.t} className="step">
              <span className="step__n">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
              <span className="step__line" aria-hidden />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
