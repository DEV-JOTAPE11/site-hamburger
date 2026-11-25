"use client";

import { useEffect, useState } from "react";

import { BagIcon, CloseIcon, MenuIcon, WhatsIcon } from "@/components/Icons";
import Logo from "@/components/Logo";
import { NAV, SITE } from "@/data/site";

const LEFT = NAV.slice(0, 2);
const RIGHT = NAV.slice(2);

/**
 * Topo no desenho da referência (image copy.png): uma barra branca
 * arredondada com pílula de ação em cada ponta, links dos dois lados e o
 * selo da casa no centro. Ao rolar, ela vira vidro claro.
 */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", open);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  return (
    <header className={`top${scrolled ? " is-scrolled" : ""}${open ? " is-open" : ""}`}>
      <div className="top__bar">
        <div className="top__side">
          <a className="top__pill" href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">
            <WhatsIcon width={16} height={16} />
            <span>Pedir agora</span>
          </a>
          <nav className="top__nav" aria-label="Principal">
            {LEFT.map((n) => (
              <a key={n.href} href={n.href}>
                {n.label}
              </a>
            ))}
          </nav>
        </div>

        <a href="#inicio" className="top__logo" aria-label="Brasa Burger — início">
          <Logo />
        </a>

        <div className="top__side top__side--r">
          <nav className="top__nav" aria-label="Seções">
            {RIGHT.map((n) => (
              <a key={n.href} href={n.href}>
                {n.label}
              </a>
            ))}
          </nav>
          <a className="top__pill" href={SITE.ifood} target="_blank" rel="noopener noreferrer">
            <BagIcon width={16} height={16} />
            <span>Sacola</span>
          </a>
          <button
            type="button"
            className="top__burger"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      <div className="drawer" hidden={!open}>
        <nav aria-label="Menu">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} onClick={() => setOpen(false)}>
              {n.label}
            </a>
          ))}
        </nav>
        <a className="btn btn--deep" href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">
          Pedir pelo WhatsApp
        </a>
      </div>
    </header>
  );
}
