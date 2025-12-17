"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import styles from "./page.module.css";
import { GoKebabHorizontal } from "react-icons/go";

import type { Post } from "@/types/Posts";
import NewPostPopup from "@/components/NewPostPopup/NewPost";

export default function AboutPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("/api/about");

        if (!res.ok) {
          throw new Error(`Erro na API: ${res.status}`);
        }

        const data = await res.json();

        console.log("Dados recebidos da API:", data);

        if (data.posts && Array.isArray(data.posts)) {
          setPosts(data.posts);
        } else if (Array.isArray(data)) {
          // Fallback para formato antigo
          setPosts(data);
        } else {
          console.error("A API não retornou uma lista. Recebido:", data);
          setPosts([]);
        }
      } catch (err) {
        console.error("Erro ao buscar posts:", err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  if (loading)
    return (
      <div
        style={{
          height: "100vh",
          color: "var(--contrast-color)",
          display: "flex",
          flexFlow: "column nowrap",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        <img
          src="/ExenceLogo.svg"
          alt=""
          style={{
            height: "128px",
            aspectRatio: "1 / 1",
          }}
        />
        <p>Carregando postagens...</p>
      </div>
    );

  return (
    <main className={styles.container}>
      {isAdmin ? (
        <>
          <h1 className={styles.title}>Painel de Controle</h1>

          <NewPostPopup posts={posts || []} setPosts={setPosts} />

          <ul className={styles.postsList}>
            {posts.length != 0 ? (
              posts.map((post) => (
                <li key={post.id} className={styles.listItem}>
                  <Link
                    href={`/about/post/${post.id}`}
                    className={styles.itemLink}
                  >
                    <div className={styles.itemContent}>
                      <div className={styles.itemInfo}>
                        <h2 className={styles.itemTitle}>{post.title}</h2>
                        <small className={styles.itemDate}>
                          Publicado em{" "}
                          {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                        </small>
                      </div>
                    </div>

                    <button className={styles.optBtn}>
                      <GoKebabHorizontal />
                    </button>
                  </Link>
                </li>
              ))
            ) : (
              <div className={styles.noPosts}>
                <p> Ainda não foram feitos posts</p>
              </div>
            )}
          </ul>
        </>
      ) : (
        <>
          <h1 className={styles.title}>Sobre Nós</h1>

          <div className={styles.postsFlex}>
            {posts.length != 0 ? (
              posts.map((post) => (
                <article key={post.id} className={styles.post}>
                  <Link
                    href={`/about/post/${post.id}`}
                    className={styles.articleLink}
                  >
                    <h2>{post.title}</h2>
                    <p>{post.content}</p>
                    <small className={styles.date}>
                      Publicado em{" "}
                      {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                    </small>
                    <div className={styles.readMore}>Leia mais</div>
                  </Link>
                </article>
              ))
            ) : (
              <div className={styles.noPosts}>
                <p> Ainda não foram feitos posts</p>
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}
