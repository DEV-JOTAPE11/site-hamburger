"use client";

import { useEffect, useRef } from "react";

import { PlusIcon } from "@/components/Icons";
import { SIDES, brl } from "@/data/menu";
import { SITE } from "@/data/site";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * A palavra "COMBOS" gigante com os dois "O" trocados por fotos redondas
 * (o "DOCES" com o brownie do vídeo). Abaixo, os acompanhamentos andam na
 * horizontal enquanto a seção fica presa — só no desktop; no toque vira um
 * carrossel nativo com snap.
 */
export default function Combos() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = root.current;
    const tr = track.current;
    if (!el || !tr || prefersReducedMotion()) return;

    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      /* letras sobem uma a uma; as fotos giram para dentro do lugar do "O" */
      gsap.from(".combos__letter", {
        yPercent: 100,
        opacity: 0,
        duration: 1.1,
        ease: "brasa",
        stagger: 0.05,
        scrollTrigger: { trigger: ".combos__word", start: "top 82%", once: true },
      });
      gsap.from(".combos__o", {
        scale: 0,
        rotate: -120,
        duration: 1.3,
        ease: "back.out(1.4)",
        stagger: 0.12,
        scrollTrigger: { trigger: ".combos__word", start: "top 82%", once: true },
      });
      gsap.to(".combos__o img", {
        rotate: 90,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
      });

      mm.add("(min-width: 900px)", () => {
        const dist = () => Math.max(0, tr.scrollWidth - tr.clientWidth);
        gsap.to(tr, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: ".combos__rail",
            start: "center 52%",
            end: () => `+=${dist()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
      });
    }, el);

    return () => {
      mm.revert();
      ctx.revert();
    };
  }, []);

  return (
    <section ref={root} id="combos" className="combos" aria-labelledby="combos-title">
      <h2 id="combos-title" className="combos__word" aria-label="Combos">
        <span className="combos__letter">C</span>
        <span className="combos__o" aria-hidden>
          <img src="/img/onion-fritando.webp" alt="" width={900} height={900} loading="lazy" />
        </span>
        <span className="combos__letter">M</span>
        <span className="combos__letter">B</span>
        <span className="combos__o" aria-hidden>
          <img src="/img/fritas-hero.webp" alt="" width={700} height={875} loading="lazy" />
        </span>
        <span className="combos__letter">S</span>
      </h2>

      <div className="combos__intro">
        <p>
          Todo burger vira combo com <b>fritas + refri</b> por mais {brl(14)}. Ou monte do seu jeito com os
          acompanhamentos da casa.
        </p>
      </div>

      <div className="combos__rail">
        <ul ref={track} className="combos__track">
          {SIDES.map((s, i) => (
            <li key={s.id} className={`side tone-${s.tone}`}>
              <div className="side__img">
                <img src={s.img} alt={s.name} width={900} height={1125} loading="lazy" />
              </div>
              <div className="side__body">
                <span className="side__n">{String(i + 1).padStart(2, "0")}</span>
                <h3>{s.name}</h3>
                <p>{s.desc}</p>
                <div className="side__foot">
                  <span>{brl(s.price)}</span>
                  <a
                    href={`${SITE.whatsapp}%20${encodeURIComponent(s.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Adicionar ${s.name}`}
                  >
                    <PlusIcon width={18} height={18} />
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
