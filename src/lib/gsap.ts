"use client";

import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/**
 * Ponto único de registro do GSAP. Importe daqui em vez de "gsap" direto,
 * para garantir que os plugins estejam registrados antes do primeiro uso.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, Flip, CustomEase);
  // A barra de endereço do celular muda o innerHeight ao rolar: sem isso
  // todo pin recalcularia no meio do gesto.
  ScrollTrigger.config({ ignoreMobileResize: true });
  CustomEase.create("brasa", "0.16, 1, 0.3, 1");
  CustomEase.create("brasaInOut", "0.76, 0, 0.24, 1");
}

export { gsap, ScrollTrigger, SplitText, Flip, CustomEase };
