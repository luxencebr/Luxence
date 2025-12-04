"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

import styles from "./page.module.css";
import { GoKebabHorizontal } from "react-icons/go";
import { FaPlus } from "react-icons/fa6";

import { posts } from "@/data/posts";

export default function AboutPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const aboutPosts = [...posts].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <>
      {isAdmin ? (
        <main className={styles.container}>
          <h1 className={styles.title}>Painel de Controle</h1>
          <button className={styles.newPost}>
            <span>
              <FaPlus />
            </span>
            Novo Post
          </button>
          <ul className={styles.postsList}>
            {aboutPosts.map((post) => (
              <li key={post.id} className={styles.listItem}>
                <Link
                  href={`/about/post/${post.id}`}
                  className={styles.itemLink}
                >
                  <div className={styles.itemContent}>
                    {post.image && (
                      <div className={styles.itemImage}>
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
                    <div className={styles.itemInfo}>
                      <h2 className={styles.itemTitle}>{post.title}</h2>
                      <small className={styles.itemDate}>
                        Publicado em{" "}
                        {new Date(post.date).toLocaleDateString("pt-BR")}
                      </small>
                    </div>
                  </div>

                  <button className={styles.optBtn}>
                    <GoKebabHorizontal />
                  </button>
                </Link>
              </li>
            ))}
          </ul>
        </main>
      ) : (
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
                    Publicado em{" "}
                    {new Date(post.date).toLocaleDateString("pt-BR")}
                  </small>
                  <div className={styles.readMore}>Leia mais</div>
                </Link>
              </article>
            ))}
          </div>
        </main>
      )}
    </>
  );
}
