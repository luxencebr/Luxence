export interface AboutPost {
  id: number;
  title: string;
  content: string;
  keywords: string[];
  date: string;
}

export const aboutPosts: AboutPost[] = [
  {
    id: 1,
    title: "Quem Somos e Nosso Propósito",
    content: `
      Criamos esta plataforma para oferecer um espaço moderno, seguro e eficiente
      para acompanhantes profissionais que desejam divulgar seus serviços com
      autonomia e visibilidade. Nosso propósito é facilitar o encontro entre
      anunciantes e clientes de forma respeitosa, confiável e transparente.
    `,
    keywords: [
      "plataforma de acompanhantes",
      "anúncios profissionais",
      "segurança",
      "transparência",
      "confiança",
    ],
    date: "2025-10-20",
  },
  {
    id: 2,
    title: "Como Funciona",
    content: `
      Aqui, os(as) acompanhantes podem criar seus perfis, personalizar seus anúncios
      e escolher entre diferentes planos de destaque. Nossa tecnologia prioriza a
      privacidade, o desempenho e a boa experiência do usuário, tanto para quem
      anuncia quanto para quem busca um atendimento de qualidade.
    `,
    keywords: [
      "planos de anúncio",
      "privacidade",
      "tecnologia segura",
      "experiência do usuário",
      "autonomia do anunciante",
    ],
    date: "2025-10-22",
  },
  {
    id: 3,
    title: "Compromisso com Qualidade e Discrição",
    content: `
      Acreditamos que a confiança é essencial. Por isso, prezamos pela verificação
      dos perfis, moderação responsável e comunicação ética. Nosso objetivo é manter
      um ambiente digital agradável, onde anunciantes possam crescer e clientes
      encontrem serviços com segurança e discrição.
    `,
    keywords: [
      "qualidade",
      "discrição",
      "verificação de perfis",
      "moderação responsável",
      "ambiente seguro",
    ],
    date: "2025-10-24",
  },
];
