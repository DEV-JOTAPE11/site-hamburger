/** Identidade e contato — a Brasa é uma hamburgueria fictícia. */
export const SITE = {
  name: "Brasa Burger",
  short: "Brasa",
  tagline: "Smash na chapa, na hora",
  url: "https://www.brasaburger.com.br",
  phoneDisplay: "(11) 9 4000-2026",
  whatsapp: "https://wa.me/5511940002026?text=Oi%2C%20Brasa!%20Quero%20fazer%20um%20pedido.",
  instagram: "https://www.instagram.com/",
  instagramHandle: "@brasaburger",
  ifood: "https://www.ifood.com.br/",
  address: {
    street: "Rua dos Pinheiros, 820",
    neighborhood: "Pinheiros",
    city: "São Paulo",
    state: "SP",
  },
  hours: [
    { days: "Terça a quinta", time: "18h às 23h" },
    { days: "Sexta e sábado", time: "18h à 0h30" },
    { days: "Domingo", time: "12h às 22h" },
  ],
  geo: { lat: -23.5636, lng: -46.6822 },
  maps: "https://www.google.com/maps/search/?api=1&query=Rua+dos+Pinheiros+820+Sao+Paulo",
} as const;

export const NAV = [
  { href: "#cardapio", label: "Cardápio" },
  { href: "#combos", label: "Combos" },
  { href: "#casa", label: "A casa" },
  { href: "#visite", label: "Visite" },
] as const;
