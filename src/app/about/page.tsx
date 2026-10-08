import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Sobre nós",
  description: "Conheça a Luxence e explore a plataforma, o catálogo de perfis e os artigos do blog.",
};

export default function AboutPage() {
  return (
    <main className={styles.container}>
      <section className={styles.intro}>
        <h1>Sobre a Luxence</h1>
        <p>
          A Luxence surgiu do encontro entre o luxo e o prazer. A plataforma
          reúne perfis que você pode conhecer e explorar no catálogo.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Explore no seu ritmo</h2>
        <p>
          No catálogo, você encontra perfis com informações, fotos e formas de
          contato disponibilizadas pelas próprias anunciantes. Use os filtros
          para navegar pelas opções e abrir o perfil que chamou sua atenção.
        </p>
        <Link href="/catalog">Explorar o catálogo</Link>
      </section>

      <section className={styles.section}>
        <h2>Conteúdo da Luxence</h2>
        <p>
          No blog, reunimos artigos e novidades publicados na plataforma. É um
          espaço para descobrir temas relacionados a experiências e bem-estar.
        </p>
        <Link href="/blog">Ler o blog</Link>
      </section>

      <section className={styles.section}>
        <h2>Precisa de ajuda?</h2>
        <p>Encontre os canais de contato na página de suporte.</p>
        <Link href="/suport">Acessar o suporte</Link>
      </section>
    </main>
  );
}
