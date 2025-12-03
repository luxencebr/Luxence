import Link from "next/link";

import styles from "./page.module.css";

import { posts } from "@/data/posts";

export default function AboutPage() {
  const aboutPosts = [...posts].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Sobre Nós</h1>

      <div className={styles.postsFlex}>
        {aboutPosts.map((post) => (
          <article key={post.id} className={styles.post}>
            <Link
              href={`/about/post/${post.id}`}
              className={styles.articleLink}
            >
              {post.image && (
                <div className={styles.postImage}>
                  <img
                    src={post.image}
                    alt={post.title
                      .toLowerCase()
                      .replace(/ /g, "-")
                      .replace(/[^\w-]+/g, "")}
                    className={styles.image}
                  />
                </div>
              )}
              <h2>{post.title}</h2>
              <p>{post.content}</p>
              <small className={styles.date}>
                Publicado em {new Date(post.date).toLocaleDateString("pt-BR")}
              </small>
              <div className={styles.readMore}>Leia mais</div>
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
