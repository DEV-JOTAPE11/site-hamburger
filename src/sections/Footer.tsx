"use client";

import { useEffect, useRef } from "react";

import { NAV, SITE } from "@/data/site";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Rodapé com a marca gigante e o hambúrguer no meio dela — o fechamento do
 * vídeo, agora com a mesma foto da hero girando devagar com a rolagem.
 */
export default function Footer() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap
        .timeline({ scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom", scrub: true } })
        .fromTo(".foot__burger", { yPercent: 40, rotateY: -50, scale: 0.8 }, { yPercent: 0, rotateY: 0, scale: 1, ease: "none" }, 0)
        .fromTo(".foot__mark span", { yPercent: 30 }, { yPercent: 0, ease: "none", stagger: 0.04 }, 0);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <footer ref={root} className="foot">
      <div className="foot__cols">
        <div>
          <h3>Brasa Burger</h3>
          <p>Hamburgueria de chapa em Pinheiros. Smash, brioche e brasa desde 2019.</p>
        </div>
        <nav aria-label="Rodapé">
          <h3>Navegue</h3>
          {NAV.map((n) => (
            <a key={n.href} href={n.href}>
              {n.label}
            </a>
          ))}
        </nav>
        <div>
          <h3>Contato</h3>
          <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">
            {SITE.phoneDisplay}
          </a>
          <a href={SITE.instagram} target="_blank" rel="noopener noreferrer">
            {SITE.instagramHandle}
          </a>
          <p>
            {SITE.address.street} · {SITE.address.neighborhood}
          </p>
        </div>
      </div>

      <div className="foot__brand" aria-hidden>
        <p className="foot__mark">
          {"BRASA".split("").map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </p>
        <div className="foot__persp">
          <img className="foot__burger" src="/img/burger-hero.webp" alt="" width={1000} height={1344} loading="lazy" />
        </div>
      </div>

      <p className="foot__legal">
        © {new Date().getFullYear()} Brasa Burger · marca fictícia · fotos reais via Pexels
      </p>
    </footer>
  );
}
