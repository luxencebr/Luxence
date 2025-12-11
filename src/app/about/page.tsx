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

        // 1. Verifica se a resposta HTTP foi OK
        if (!res.ok) {
          throw new Error(`Erro na API: ${res.status}`);
        }

        const data = await res.json();

        // 2. Log para debug (aparecerá no console do navegador, F12)
        console.log("Dados recebidos da API:", data);

        // 3. Verificação de segurança: É um array?
        if (Array.isArray(data)) {
          setPosts(data);
        } else {
          console.error("A API não retornou uma lista. Recebido:", data);
          setPosts([]); // Garante que continue sendo um array vazio em caso de erro
        }
      } catch (err) {
        console.error("Erro ao buscar posts:", err);
        setPosts([]); // Fallback para array vazio
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  if (loading) return <p>Carregando posts...</p>;

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
                      {post.image && (
                        <div className={styles.itemImage}>
                          <img
                            src={post.image?.[0].url ?? "/placeholder.svg"}
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
                    {post.image && (
                      <div className={styles.postImage}>
                        <img
                          src={post.image?.[0].url ?? "/placeholder.svg"}
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
