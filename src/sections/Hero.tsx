"use client";

import type { CSSProperties } from "react";
import { useEffect } from "react";

import { ArrowDownIcon, ArrowIcon } from "@/components/Icons";
import { useStage } from "@/components/StageProvider";
import { gsap } from "@/lib/gsap";
import { hasFinePointer, prefersReducedMotion } from "@/lib/motion";

/**
 * Ingredientes recortados (fotos reais, sem fundo) em volta do hambúrguer 3D
 * explodido. `depth` vai de 0 (longe: pequeno, desfocado, mexe pouco) a 1
 * (perto: nítido, mexe muito). Os das bordas saem parcialmente da tela, como
 * a pizza e o hambúrguer na tábua da referência.
 */
interface Bit {
  src: string;
  w: number;
  h: number;
  x: string;
  y: string;
  s: string;
  r: number;
  depth: number;
  front?: boolean;
  m: { x: string; y: string; s: string } | null;
}

const B = "/img/bits/";
const BITS: Bit[] = [
  /* bordas */
  { src: `${B}fritas-saco.webp`, w: 620, h: 598, x: "-7%", y: "30%", s: "25vw", r: -16, depth: 0.85, m: { x: "-22%", y: "58%", s: "48vw" } },
  { src: `${B}burger-borda.webp`, w: 1100, h: 789, x: "79%", y: "40%", s: "30vw", r: -8, depth: 0.9, m: { x: "70%", y: "62%", s: "52vw" } },
  /* espalhados */
  { src: `${B}fritas-caindo.webp`, w: 640, h: 353, x: "70%", y: "13%", s: "15vw", r: 14, depth: 0.3, m: null },
  { src: `${B}pimenta.webp`, w: 346, h: 286, x: "23%", y: "62%", s: "8vw", r: -28, depth: 0.7, front: true, m: { x: "8%", y: "46%", s: "20vw" } },
  { src: `${B}pimenta.webp`, w: 346, h: 286, x: "66%", y: "60%", s: "6vw", r: 150, depth: 0.55, front: true, m: null },
  { src: `${B}pimenta.webp`, w: 346, h: 286, x: "13%", y: "13%", s: "4vw", r: 60, depth: 0.15, m: null },
  { src: `${B}tomate.webp`, w: 328, h: 420, x: "27%", y: "48%", s: "4.6vw", r: -30, depth: 0.35, m: { x: "80%", y: "36%", s: "14vw" } },
  { src: `${B}tomate.webp`, w: 328, h: 420, x: "88%", y: "16%", s: "5vw", r: 32, depth: 0.25, m: null },
  { src: `${B}alface.webp`, w: 501, h: 520, x: "70%", y: "44%", s: "6vw", r: 24, depth: 0.45, m: null },
];

/**
 * Hero no desenho da image copy.png: fundo laranja, título gigante branco no
 * topo, o hambúrguer 3D "explodindo" no centro com ingredientes em volta e
 * uma onda creme na base (com uma segunda onda laranja-clara atrás).
 *
 * O hambúrguer é desenhado pelo <Burger3D /> (canvas fixo); aqui fica o slot
 * que define onde ele mora — e a foto estática, que aparece sem WebGL ou com
 * movimento reduzido.
 */
export default function Hero() {
  const { heroRef, heroSlotRef } = useStage();

  useEffect(() => {
    const el = heroRef.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const bits = gsap.utils.toArray<HTMLElement>(".bit");

      gsap.set(".hero__title .line > span", { yPercent: 110 });
      gsap.set([".hero__foot > *"], { opacity: 0, y: 24 });
      gsap.set(".bit__mv", { opacity: 0, scale: 0.3 });
      gsap.set(".wave", { yPercent: 40 });

      /* entrada: título sobe, onda assenta, ingredientes "explodem" para o lugar */
      const tl = gsap.timeline({ defaults: { ease: "brasa" }, delay: 0.1 });
      tl.to(".hero__title .line > span", { yPercent: 0, duration: 1.3, stagger: 0.09 }, 0)
        .to(".wave", { yPercent: 0, duration: 1.6, stagger: 0.08 }, 0.1)
        .to(".bit__mv", { opacity: 1, scale: 1, duration: 1.6, stagger: { each: 0.05, from: "center" } }, 0.6)
        .to(".hero__foot > *", { opacity: 1, y: 0, duration: 1, stagger: 0.08 }, 1);

      /* flutuação ociosa */
      bits.forEach((b, i) => {
        const d = Number(b.dataset.depth);
        gsap.to(b.querySelector(".bit__in"), {
          y: 8 + d * 14,
          rotation: (i % 2 ? 1 : -1) * (3 + d * 5),
          duration: 2.6 + (i % 4) * 0.55,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: i * 0.2,
        });
      });

      /* rolagem: título e peças se afastam em velocidades diferentes */
      const out = gsap.timeline({ scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
      out.to(".hero__title", { yPercent: -35, opacity: 0.2, ease: "none" }, 0);
      out.to(".wave--back", { yPercent: -18, ease: "none" }, 0);
      bits.forEach((b, i) => {
        const d = Number(b.dataset.depth);
        const edge = b.classList.contains("bit--edge");
        out.to(
          b,
          edge
            ? { xPercent: i === 0 ? -40 : 40, yPercent: -30, rotation: i === 0 ? -12 : 12, ease: "none" }
            : { yPercent: -(60 + d * 220), rotation: (i % 2 ? 1 : -1) * (10 + d * 30), ease: "none" },
          0,
        );
      });

      /* ponteiro: parallax por profundidade */
      if (hasFinePointer()) {
        const movers = bits.map((b) => {
          const mv = b.querySelector(".bit__mv")!;
          return {
            d: Number(b.dataset.depth),
            x: gsap.quickTo(mv, "x", { duration: 1.3, ease: "power3.out" }),
            y: gsap.quickTo(mv, "y", { duration: 1.3, ease: "power3.out" }),
          };
        });
        const move = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          for (const m of movers) {
            m.x(nx * -60 * (0.2 + m.d));
            m.y(ny * -44 * (0.2 + m.d));
          }
        };
        el.addEventListener("pointermove", move);
        return () => el.removeEventListener("pointermove", move);
      }
    }, el);

    return () => ctx.revert();
  }, [heroRef]);

  return (
    <section ref={heroRef} id="inicio" className="hero" aria-label="Brasa Burger — sinta a diferença">
      <div className="hero__bg" aria-hidden>
        <span className="hero__glow" />
      </div>

      <h1 className="hero__title">
        <span className="sr-only">Brasa Burger: hambúrguer smash na chapa em Pinheiros. </span>
        <span className="line" aria-hidden>
          <span>Sinta a</span>
        </span>
        <span className="line" aria-hidden>
          <span>diferença</span>
        </span>
      </h1>

      <div className="bits" aria-hidden>
        {BITS.map((b, i) => (
          <div
            key={i}
            className={`bit${b.front ? " bit--front" : ""}${b.m ? "" : " bit--desk"}${i < 2 ? " bit--edge" : ""}`}
            data-depth={b.depth}
            style={
              {
                "--x": b.x,
                "--y": b.y,
                "--s": b.s,
                "--r": `${b.r}deg`,
                "--blur": `${Math.max(0, (0.4 - b.depth) * 6).toFixed(1)}px`,
                "--mx": b.m?.x,
                "--my": b.m?.y,
                "--ms": b.m?.s,
              } as CSSProperties
            }
          >
            <div className="bit__mv">
              <img className="bit__in" src={b.src} alt="" width={b.w} height={b.h} draggable={false} />
            </div>
          </div>
        ))}
      </div>

      <svg className="wave wave--back" viewBox="0 0 1440 260" preserveAspectRatio="none" aria-hidden>
        <path d="M0 120 C 180 40 360 40 540 110 S 900 210 1080 130 S 1340 40 1440 80 L1440 260 L0 260 Z" />
      </svg>
      <svg className="wave wave--front" viewBox="0 0 1440 260" preserveAspectRatio="none" aria-hidden>
        <path d="M0 170 C 200 90 380 100 560 160 S 920 250 1100 170 S 1360 100 1440 130 L1440 260 L0 260 Z" />
      </svg>

      <div ref={heroSlotRef} className="hero__slot">
        <img
          className="slot__img"
          src="/img/burger-hero.webp"
          alt="Hambúrguer duplo com bacon, cheddar derretido, alface e tomate no pão brioche"
          width={1000}
          height={1344}
          fetchPriority="high"
          draggable={false}
        />
      </div>

      <div className="hero__foot">
        <p className="hero__sub">
          Smash na chapa, brioche na manteiga
          <br /> e cheddar escorrendo. Desde 2019.
        </p>
        <a className="btn btn--deep" href="#cardapio">
          Ver cardápio <ArrowIcon width={18} height={18} />
        </a>
        <a className="hero__scroll" href="#destaque">
          Role e veja ele montar
          <i>
            <ArrowDownIcon width={16} height={16} />
          </i>
        </a>
      </div>
    </section>
  );
}
