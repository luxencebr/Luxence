export interface Post {
  id: string;
  title: string;
  image?: string;
  content: string;
  date: string;

  likes?: number;

  comments?: Comment[];
}

export interface Comment {
  id: string;
  user: string;
  content: string;
  likes?: number;
  date?: string;
}

export const posts: Post[] = [
  {
    id: "1",
    image: "/about/strawberry.png",
    title: "Nossa História",
    content: `
A Luxence nasceu do encontro entre o desejo e a sofisticação. Mais do que uma agência, somos uma experiência exclusiva de luxo e prazer, desenhada para quem entende que o verdadeiro poder está nos detalhes, no silêncio, no toque.

Cada encontro é uma obra de arte; cada acompanhante, a personificação da elegância. Mulheres que dominam a arte da sedução com naturalidade e classe, capazes de transformar momentos em memórias inesquecíveis.

Discrição absoluta e atendimento sob medida para quem valoriza o prazer elevado em sua forma mais sublime.

Luxence: onde o desejo encontra o requinte.
`,
    date: "2025-12-18",
    comments: [],
  },
];
