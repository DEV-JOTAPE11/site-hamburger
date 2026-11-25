"use client";

import { useEffect, useRef } from "react";

import { ArrowIcon } from "@/components/Icons";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * "Feito na chapa, na hora": texto à esquerda e a foto da cozinha abrindo
 * de dentro para fora quando entra na tela (o "Pra acompanhar o seu café").
 */
export default function Kitchen() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap
        .timeline({ scrollTrigger: { trigger: ".kitchen__frame", start: "top 85%", end: "center 50%", scrub: 0.6 } })
        .fromTo(".kitchen__frame", { clipPath: "inset(14% 18% 14% 18% round 40px)" }, { clipPath: "inset(0% 0% 0% 0% round 28px)", ease: "none" }, 0)
        .fromTo(".kitchen__frame img", { scale: 1.3 }, { scale: 1.05, ease: "none" }, 0);
      gsap.from(".kitchen__copy > *", {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "brasa",
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: "top 70%", once: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="casa" className="kitchen" aria-labelledby="kitchen-title">
      <div className="kitchen__copy">
        <h2 id="kitchen-title" className="kitchen__title">
          Feito na chapa,
          <em className="serif">na hora.</em>
        </h2>
        <p>
          Nada fica pronto esperando. A carne chega moída de manhã, vira bolinha na hora do pedido e vai direto
          pra chapa de ferro — prensada até a borda ficar rendada e crocante.
        </p>
        <a className="btn btn--line" href="#chapa">
          Como a gente faz <ArrowIcon width={18} height={18} />
        </a>
      </div>
      <div className="kitchen__frame">
        <img
          src="/img/chapa.webp"
          alt="Cozinheiro virando hambúrgueres na grelha com uma espátula"
          width={1400}
          height={903}
          loading="lazy"
        />
      </div>
    </section>
  );
}
