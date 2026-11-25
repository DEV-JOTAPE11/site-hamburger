"use client";

import { useEffect, useState } from "react";

import { ArrowIcon } from "@/components/Icons";
import { useStage } from "@/components/StageProvider";
import { brl } from "@/data/menu";
import { SITE } from "@/data/site";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

const SIZES = [
  { id: "simples", label: "Simples", meat: "1 carne · 120g", price: 34 },
  { id: "duplo", label: "Duplo", meat: "2 carnes · 240g", price: 44 },
  { id: "triplo", label: "Triplo", meat: "3 carnes · 360g", price: 54 },
] as const;

const SPECS = ["Blend acém + costela", "Cheddar inglês", "Bacon defumado"];

/**
 * Segunda seção: o hambúrguer da hero pousa numa placa de vidro fosco (estilo
 * Apple — translúcido, borda fina de luz, sombra macia) que flutua sobre um
 * painel laranja com a foto real da grelha. O vidro só "lê" como vidro porque
 * tem foto e cor atrás dele para desfocar.
 */
export default function Feature() {
  const { featureRef, featureSlotRef } = useStage();
  const [size, setSize] = useState(1);

  useEffect(() => {
    const el = featureRef.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(".feat__copy > *", {
        opacity: 0,
        y: 40,
        duration: 1.1,
        ease: "brasa",
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: "top 62%", once: true },
      });
      gsap.from(".feat__chip", {
        opacity: 0,
        scale: 0.85,
        y: 20,
        duration: 0.9,
        ease: "back.out(1.6)",
        stagger: 0.1,
        scrollTrigger: { trigger: ".feat__stage", start: "top 45%", once: true },
      });
      /* a foto da grelha desliza por trás do vidro — é o que dá vida ao blur */
      gsap.fromTo(
        ".feat__photo img",
        { yPercent: -12, scale: 1.15 },
        { yPercent: 8, scale: 1.05, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
      );
      gsap.fromTo(
        ".feat__outline",
        { xPercent: 12 },
        { xPercent: -12, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
      );
    }, el);
    return () => ctx.revert();
  }, [featureRef]);

  const s = SIZES[size];

  return (
    <section ref={featureRef} id="destaque" className="feat" aria-labelledby="feat-title">
      <div className="feat__wrap">
        <div className="feat__copy">
          <h2 id="feat-title" className="feat__name">
            The Brasa
            <em className="serif">o da casa</em>
          </h2>
          <p className="feat__desc">
            Pão brioche selado na manteiga, carne prensada na chapa a 230°C até formar crosta, bacon defumado
            crocante e cheddar inglês escorrendo pelas bordas. O hambúrguer que deu nome à casa.
          </p>

          <div className="sizes" role="radiogroup" aria-label="Tamanho">
            {SIZES.map((z, i) => (
              <button
                key={z.id}
                type="button"
                role="radio"
                aria-checked={i === size}
                className={`sizes__opt${i === size ? " is-on" : ""}`}
                onClick={() => setSize(i)}
              >
                <b>{z.label}</b>
                <small>{z.meat}</small>
              </button>
            ))}
          </div>

          <div className="feat__buy">
            <p className="feat__price" aria-live="polite">
              <span>{brl(s.price)}</span>
              <small>com fritas pequenas</small>
            </p>
            <a className="btn btn--orange" href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">
              Quero esse <ArrowIcon width={18} height={18} />
            </a>
          </div>
        </div>

        <div className="feat__stage">
          <div className="feat__panel" aria-hidden>
            <div className="feat__photo">
              <img src="/img/grelha.webp" alt="" width={1400} height={788} loading="lazy" />
            </div>
            <span className="feat__outline">BRASA</span>
          </div>

          <div className="glass feat__glass">
            <div ref={featureSlotRef} className="feat__slot">
              <img
                className="slot__img"
                src="/img/burger-hero.webp"
                alt="The Brasa: hambúrguer duplo com bacon e cheddar"
                width={1000}
                height={1344}
                loading="lazy"
                draggable={false}
              />
            </div>
            <span className="feat__base" aria-hidden />
          </div>

          <ul className="feat__chips">
            {SPECS.map((t) => (
              <li key={t} className="glass feat__chip">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
