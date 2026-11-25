"use client";

import { useEffect, useRef } from "react";

import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

const SHOTS = [
  { src: "/img/mordida.webp", w: 1000, h: 1777, alt: "Homem dando uma mordida num hambúrguer à noite", label: "Primeira mordida", note: "sem pressa, sem garfo" },
  { src: "/img/mesa-amigos.webp", w: 1100, h: 647, alt: "Amigas comendo hambúrguer no salão enquanto a garçonete serve", label: "Salão", note: "80 lugares, mesa pra turma" },
  { src: "/img/neon.webp", w: 1200, h: 1200, alt: "Rapaz encostado na parede com letreiro neon de hambúrguer", label: "Fachada", note: "o neon que acende às 18h" },
  { src: "/img/na-mao.webp", w: 1000, h: 666, alt: "Mãos segurando um hambúrguer com folhas e tomate", label: "Pra levar", note: "embrulhado no papel, quente" },
];

/**
 * "Um burger, os amigos e nenhuma pressa — no fim do dia": título grande e
 * quatro fotos altas da vida na casa, cada coluna andando numa velocidade.
 */
export default function Gallery() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const speeds = [-8, 6, -4, 10];
      gsap.utils.toArray<HTMLElement>(".shot").forEach((s, i) => {
        gsap.fromTo(
          s,
          { yPercent: speeds[i] },
          { yPercent: -speeds[i], ease: "none", scrollTrigger: { trigger: ".gallery__row", start: "top bottom", end: "bottom top", scrub: true } },
        );
      });
      gsap.from(".gallery__title > span", {
        yPercent: 110,
        duration: 1.2,
        ease: "brasa",
        stagger: 0.08,
        scrollTrigger: { trigger: ".gallery__title", start: "top 82%", once: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="gallery" aria-labelledby="gallery-title">
      <h2 id="gallery-title" className="gallery__title">
        <span>Um burger, os amigos</span>
        <span>e nenhuma pressa</span>
        <em className="serif">no fim do dia.</em>
      </h2>

      <ul className="gallery__row">
        {SHOTS.map((s) => (
          <li key={s.src} className="shot">
            <div className="shot__img">
              <img src={s.src} alt={s.alt} width={s.w} height={s.h} loading="lazy" />
            </div>
            <p className="shot__cap">
              <b>{s.label}</b>
              <span>{s.note}</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
