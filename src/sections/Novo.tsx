"use client";

import { useEffect, useRef } from "react";

import { ArrowIcon } from "@/components/Icons";
import { SITE } from "@/data/site";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

const FACTS = [
  { n: "24h", t: "marinado no leitelho" },
  { n: "1", t: "sobrecoxa inteira" },
  { n: "3", t: "pimentas no molho" },
];

/**
 * "Novo no balcão": o lançamento da vez. A palavra gigante passa por trás da
 * janela em arco com a foto, e a foto sobe um pouco mais devagar que a
 * página — o mesmo jogo do "Novo drink" do vídeo.
 */
export default function Novo() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const st = { trigger: el, start: "top bottom", end: "bottom top", scrub: true };
      gsap.fromTo(".novo__big", { xPercent: 10 }, { xPercent: -22, ease: "none", scrollTrigger: st });
      gsap.fromTo(".novo__arch img", { yPercent: -8, scale: 1.12 }, { yPercent: 8, scale: 1.02, ease: "none", scrollTrigger: st });
      gsap.from(".novo__arch", {
        clipPath: "inset(30% 12% 0% 12% round 999px 999px 32px 32px)",
        duration: 1.4,
        ease: "brasa",
        scrollTrigger: { trigger: ".novo__arch", start: "top 80%", once: true },
      });
      gsap.from(".novo__copy > *", {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "brasa",
        stagger: 0.08,
        scrollTrigger: { trigger: ".novo__copy", start: "top 78%", once: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="novo" aria-labelledby="novo-title">
      <div className="novo__copy">
        <h2 id="novo-title" className="display novo__title">
          Novo
          <em className="serif">no balcão</em>
        </h2>
        <h3 className="novo__name">Crispy Picante</h3>
        <p className="novo__desc">
          Sobrecoxa marinada por um dia inteiro, empanada duas vezes no panko e frita na hora. Vai no brioche com
          picles da casa e maionese de pimenta defumada.
        </p>
        <dl className="novo__facts">
          {FACTS.map((f) => (
            <div key={f.t}>
              <dt>{f.n}</dt>
              <dd>{f.t}</dd>
            </div>
          ))}
        </dl>
        <a className="btn btn--deep" href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">
          Experimentar <ArrowIcon width={18} height={18} />
        </a>
      </div>

      <div className="novo__visual">
        <span className="novo__big" aria-hidden>
          Crispy
        </span>
        <div className="novo__arch">
          <img
            src="/img/crispy-mao.webp"
            alt="Mão segurando um hambúrguer de frango crispy com fritas ao fundo"
            width={1100}
            height={1375}
            loading="lazy"
          />
        </div>
        <span className="novo__seal" aria-hidden>
          <svg viewBox="0 0 120 120">
            <defs>
              <path id="seal-c" d="M60 60m-44 0a44 44 0 1 1 88 0a44 44 0 1 1-88 0" />
            </defs>
            <text>
              <textPath href="#seal-c">picante de verdade • picante de verdade • </textPath>
            </text>
          </svg>
          <img src="/img/pimenta.webp" alt="" width={346} height={286} />
        </span>
      </div>
    </section>
  );
}
