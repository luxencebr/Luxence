import Link from "next/link";

import styles from "./page.module.css";

import { aboutPosts } from "@/data/blog";

export default function AboutPage() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Sobre Nós</h1>

      <div className={styles.postsFlex}>
        {aboutPosts.map((post) => (
          <article key={post.id} className={styles.post}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
            <small className={styles.date}>
              Publicado em {new Date(post.date).toLocaleDateString("pt-BR")}
            </small>
            <Link href="" className={styles.articleLink}>
              Leia mais
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
