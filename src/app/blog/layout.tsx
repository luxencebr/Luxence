import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Leia os artigos da Luxence sobre massagem, bem-estar e experiências publicados na plataforma.",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
