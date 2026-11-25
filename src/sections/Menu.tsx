"use client";

import { useEffect, useRef, useState } from "react";

import { PlusIcon } from "@/components/Icons";
import SplitHeading from "@/components/SplitHeading";
import { BURGERS, CATEGORIES, brl, type Category } from "@/data/menu";
import { SITE } from "@/data/site";
import { Flip, gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Cardápio: título condensado + serifa itálica, filtros em pílula e a grade
 * de cartões coloridos. Cada cartão tem a janela em arco da referência com a
 * foto real do lanche. A troca de filtro reorganiza a grade com Flip.
 */
export default function Menu() {
  const root = useRef<HTMLElement>(null);
  const grid = useRef<HTMLUListElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const [cat, setCat] = useState<Category | "todos">("todos");

  const pick = (c: Category | "todos") => {
    if (c === cat) return;
    if (grid.current && !prefersReducedMotion()) {
      flipState.current = Flip.getState(grid.current.querySelectorAll(".card"));
    }
    setCat(c);
  };

  /* depois do re-render: anima do estado antigo para o novo */
  useEffect(() => {
    const state = flipState.current;
    if (!state || !grid.current) return;
    flipState.current = null;
    Flip.from(state, {
      targets: grid.current.querySelectorAll(".card"),
      duration: 0.8,
      ease: "brasa",
      absolute: true,
      scale: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.6, ease: "brasa" }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.85, duration: 0.35 }),
    });
  }, [cat]);

  /* entrada da grade + leve parallax das fotos dentro dos arcos */
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(".card", {
        y: 80,
        opacity: 0,
        duration: 1.1,
        ease: "brasa",
        stagger: { each: 0.07, grid: "auto", from: "start" },
        scrollTrigger: { trigger: ".menu__grid", start: "top 80%", once: true },
      });
      gsap.utils.toArray<HTMLElement>(".card__win img").forEach((img) => {
        gsap.fromTo(
          img,
          { yPercent: -6 },
          { yPercent: 6, ease: "none", scrollTrigger: { trigger: img, start: "top bottom", end: "bottom top", scrub: true } },
        );
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const list = cat === "todos" ? BURGERS : BURGERS.filter((b) => b.category === cat);

  return (
    <section ref={root} id="cardapio" className="menu" aria-labelledby="menu-title">
      <header className="menu__head">
        <div className="menu__title">
          <SplitHeading className="display" >
            <span id="menu-title">Cardápio</span>
          </SplitHeading>
          <em className="serif menu__serif">burgers</em>
        </div>
        <p className="menu__lead">
          Todos no pão brioche da casa, com carne moída no dia. Peça no balcão, no WhatsApp ou no iFood.
        </p>
      </header>

      <div className="tabs" role="tablist" aria-label="Filtrar cardápio">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={cat === c.id}
            className={`tabs__btn${cat === c.id ? " is-on" : ""}`}
            onClick={() => pick(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <ul ref={grid} className="menu__grid">
        {list.map((b) => (
          <li key={b.id} className={`card tone-${b.tone}`} data-flip-id={b.id}>
            <div className="card__win">
              <img
                src={b.img}
                alt={`${b.name}: ${b.desc}`}
                width={1000}
                height={1000}
                loading="lazy"
                style={b.pos ? { objectPosition: b.pos } : undefined}
              />
            </div>
            <div className="card__body">
              <h3 className="card__name">{b.name}</h3>
              <p className="card__desc">{b.desc}</p>
              <div className="card__foot">
                <span className="card__w">{b.weight}</span>
                <span className="card__price">{brl(b.price)}</span>
                <a
                  className="card__add"
                  href={`${SITE.whatsapp}%20${encodeURIComponent(b.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Pedir ${b.name}`}
                >
                  <PlusIcon width={18} height={18} />
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
