import type { Metadata } from "next";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: "Sobre nós",
  description: "Conheça a Luxence e explore a plataforma, o catálogo de perfis e os artigos do blog.",
};

export default function AboutPage() {
  return <AboutContent />;
}
