export type Category = "classicos" | "especiais" | "frango";

export interface Burger {
  id: string;
  name: string;
  desc: string;
  weight: string;
  price: number;
  img: string;
  category: Category;
  /** enquadramento da foto dentro do arco (object-position) */
  pos?: string;
  /** cor do cartão — sempre da paleta quente da casa */
  tone: "orange" | "mustard" | "burnt" | "ink" | "sand" | "ember";
}

export const CATEGORIES: { id: Category | "todos"; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "classicos", label: "Clássicos" },
  { id: "especiais", label: "Especiais" },
  { id: "frango", label: "Frango" },
];

export const BURGERS: Burger[] = [
  {
    id: "classico",
    name: "Clássico",
    desc: "Blend 160g, cheddar, alface, tomate e cebola roxa no brioche.",
    weight: "160g",
    price: 32,
    img: "/img/classico.webp",
    category: "classicos",
    tone: "orange",
  },
  {
    id: "bacon-duplo",
    name: "Bacon Duplo",
    desc: "Dois smash, bacon defumado crocante e cheddar inglês.",
    weight: "2× 90g",
    price: 42,
    img: "/img/bacon-duplo.webp",
    category: "especiais",
    tone: "burnt",
  },
  {
    id: "triplo",
    name: "Triplo Brasa",
    desc: "Três carnes, três fatias de cheddar e a maionese da casa.",
    weight: "3× 90g",
    price: 54,
    img: "/img/triplo.webp",
    category: "especiais",
    tone: "ink",
  },
  {
    id: "crispy",
    name: "Crispy",
    desc: "Sobrecoxa empanada no panko, picles e maionese de alho.",
    weight: "180g",
    price: 36,
    img: "/img/crispy.webp",
    category: "frango",
    tone: "mustard",
  },
  {
    id: "trufado",
    name: "Trufado",
    desc: "Blend 180g, bacon, maionese trufada e queijo cremoso.",
    weight: "180g",
    price: 46,
    img: "/img/trufado.webp",
    category: "especiais",
    tone: "sand",
  },
  {
    id: "smash",
    name: "Smash Simples",
    desc: "O essencial: carne prensada na chapa, cheddar e picles.",
    weight: "90g",
    price: 28,
    img: "/img/smash.webp",
    pos: "50% 85%",
    category: "classicos",
    tone: "ember",
  },
  {
    id: "costela",
    name: "Costela BBQ",
    desc: "Blend de costela, barbecue de rapadura e cebola caramelizada.",
    weight: "200g",
    price: 48,
    img: "/img/costela.webp",
    category: "especiais",
    tone: "orange",
  },
  {
    id: "salad",
    name: "Salad",
    desc: "Blend 160g, queijo prato, folhas, tomate e mostarda e mel.",
    weight: "160g",
    price: 34,
    img: "/img/salad.webp",
    category: "classicos",
    tone: "mustard",
  },
];

export interface Side {
  id: string;
  name: string;
  desc: string;
  price: number;
  img: string;
  tone: Burger["tone"];
}

export const SIDES: Side[] = [
  { id: "fritas", name: "Fritas da casa", desc: "Corte rústico, sal de páprica.", price: 16, img: "/img/fritas.webp", tone: "mustard" },
  { id: "onion", name: "Onion rings", desc: "Empanados na cerveja, crocantes.", price: 19, img: "/img/onion.webp", tone: "ink" },
  { id: "molhos", name: "Trio de molhos", desc: "Ketchup defumado, alho e chimichurri.", price: 9, img: "/img/molhos.webp", tone: "sand" },
  { id: "shake-choco", name: "Shake de Oreo", desc: "Sorvete de creme, Oreo e calda.", price: 24, img: "/img/shake-choco.webp", tone: "burnt" },
  { id: "shake", name: "Shake de Doce de Leite", desc: "Cremoso, com calda por toda a taça.", price: 24, img: "/img/shake.webp", tone: "orange" },
  { id: "refri", name: "Refri gelado", desc: "Lata 350ml no copo com gelo.", price: 8, img: "/img/refri.webp", tone: "ember" },
];

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
