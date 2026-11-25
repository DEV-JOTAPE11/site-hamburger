"use client";

import { useEffect, useRef } from "react";

import { ArrowIcon, WhatsIcon } from "@/components/Icons";
import { SITE } from "@/data/site";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

/** "Brasa em casa": foto real da entrega de um lado, painel areia do outro. */
export default function Delivery() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".delivery__photo img",
        { yPercent: -10 },
        { yPercent: 10, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
      );
      gsap.from(".delivery__panel > *", {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "brasa",
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: "top 65%", once: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="delivery" aria-labelledby="delivery-title">
      <div className="delivery__photo">
        <img
          src="/img/delivery.webp"
          alt="Atendente entregando um saco de papel com o pedido para o cliente"
          width={1400}
          height={2097}
          loading="lazy"
        />
      </div>
      <div className="delivery__panel">
        <h2 id="delivery-title" className="delivery__title">
          Brasa
          <em className="serif">em casa</em>
        </h2>
        <p>
          Saco de papel, caixa que segura o calor e fritas separadas pra chegar crocante. Entregamos em até 6 km
          de Pinheiros, todos os dias em que a chapa está acesa.
        </p>
        <ul className="delivery__facts">
          <li>
            <b>30–45</b> min
          </li>
          <li>
            <b>6</b> km de raio
          </li>
          <li>
            <b>0</b> fritas murchas
          </li>
        </ul>
        <div className="delivery__ctas">
          <a className="btn btn--deep" href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">
            <WhatsIcon width={18} height={18} /> WhatsApp
          </a>
          <a className="btn btn--line" href={SITE.ifood} target="_blank" rel="noopener noreferrer">
            iFood <ArrowIcon width={18} height={18} />
          </a>
        </div>
      </div>
    </section>
  );
}
