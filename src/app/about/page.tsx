"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import styles from "./page.module.css";
import { FaRegTrashCan } from "react-icons/fa6";

import type { Post } from "@/types/Posts";
import NewPostPopup from "@/components/NewPostPopup/NewPost";

export default function AboutPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);

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

  const handleDeletePost = async (postId: number, e: React.MouseEvent) => {
    e.preventDefault(); // Previne navegação do Link
    e.stopPropagation(); // Previne propagação do evento

    if (
      !confirm(
        "Tem certeza que deseja deletar esta publicação? Esta ação não pode ser desfeita.",
      )
    ) {
      return;
    }

    setDeletingPostId(postId);
    try {
      const res = await fetch(`/api/about/posts/${postId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Remove o post da lista local
        setPosts(posts.filter((post) => post.id !== postId));
      } else {
        const error = await res.json();
        alert(`Erro ao deletar publicação: ${error.error}`);
      }
    } catch (err) {
      console.error("Erro ao deletar post:", err);
      alert("Erro ao deletar publicação");
    } finally {
      setDeletingPostId(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <img
            src="/LuxenceLogo.png"
            alt=""
            style={{
              height: "128px",
              aspectRatio: "1 / 1",
              objectFit: "cover",
            }}
          />
          <p>Carregando publicações...</p>
        </div>
      </div>
    );
  }

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

                    <button
                      className={`${styles.deleteBtn} ${deletingPostId === post.id ? styles.deleting : ""}`}
                      onClick={(e) => handleDeletePost(post.id, e)}
                      disabled={deletingPostId === post.id}
                      title="Deletar publicação"
                    >
                      {deletingPostId === post.id ? (
                        <span className={styles.spinner} />
                      ) : (
                        <FaRegTrashCan />
                      )}
                    </button>
                  </Link>
                </li>
              ))
            ) : (
              <div className={styles.noPosts}>
                <p> Ainda não foram feitas publicações</p>
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
                    {post.imageUrl && (
                      <div className={styles.postImage}>
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className={styles.postContent}>
                      <h2>{post.title}</h2>
                      <p>
                        {post.content.length > 150
                          ? `${post.content.substring(0, 150)}...`
                          : post.content}
                      </p>
                      <small className={styles.date}>
                        Publicado em{" "}
                        {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                      </small>
                      <div className={styles.readMore}>Leia mais</div>
                    </div>
                  </Link>
                </article>
              ))
            ) : (
              <div className={styles.noPosts}>
                <p> Ainda não foram feitas publicações</p>
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}
