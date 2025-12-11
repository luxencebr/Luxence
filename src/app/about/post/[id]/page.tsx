"use client";

import type React from "react";

import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { IoSend } from "react-icons/io5";
import { FaRegHeart, FaHeart } from "react-icons/fa6";

import styles from "./page.module.css";
import type { Post, Comment } from "@/types/Posts";

export default function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [otherPosts, setOtherPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState("");

  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true);

        // Busca o post específico
        const resPost = await fetch(`/api/about/posts/${id}`);
        if (!resPost.ok) throw new Error("Post não encontrado");
        const dataPost: Post = await resPost.json();
        setPost(dataPost);

        // Busca todos os posts e filtra os outros
        const resAll = await fetch("/api/about/posts");
        const allPosts: Post[] = await resAll.json();
        setOtherPosts(allPosts.filter((p) => p.id !== dataPost.id).slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [id]);

  const handleLike = async () => {
    if (!post || liked) return;

    try {
      const res = await fetch(`/api/about/posts/${id}/like`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setPost({ ...post, likes: data.likes });
        setLiked(true);
      }
    } catch (err) {
      console.error("Erro ao curtir:", err);
    }
  };

  const handleComment = async () => {
    if (!post || !commentText.trim() || !session?.user) return;

    try {
      const res = await fetch(`/api/about/posts/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          comment: commentText,
        }),
      });

      if (res.ok) {
        const newComment: Comment = await res.json();
        setPost({
          ...post,
          comments: [newComment, ...(post.comments || [])],
        });
        setCommentText("");
      }
    } catch (err) {
      console.error("Erro ao comentar:", err);
    }
  };

  if (loading) return <p>Carregando post...</p>;
  if (!post) return <p>Post não encontrado</p>;

  return (
    <>
      {isAdmin ? (
        <main className={styles.postPage}>
          <div className={styles.layout}>
            {/* Post principal */}
            <div className={styles.post}>
              <div className={styles.postInfo}>
                <div className={styles.postHeader}>
                  <h1 className={styles.title}>{post.title}</h1>
                  <div className={styles.postLikes}>
                    <button className={styles.likeBtn} onClick={handleLike}>
                      {liked ? <FaHeart /> : <FaRegHeart />}
                    </button>
                    {post.likes || 0}
                  </div>
                </div>

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

                <div className={styles.postContent}>
                  {post.content.split(/\n{2,}/).map((paragraph, index) => (
                    <p key={index} className={styles.content}>
                      {paragraph.trim()}
                    </p>
                  ))}
                </div>

                <small className={styles.date}>
                  Publicado em{" "}
                  {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                </small>
              </div>

              {/* Seção de comentários */}
              <div className={styles.comunityBox}>
                <div className={styles.comunityHeader}>
                  <h2>Participe da Nossa Comunidade</h2>
                </div>
                <div className={styles.comunityContent}>
                  {post.comments?.map((comment) => (
                    <div key={comment.id} className={styles.comment}>
                      <div className={styles.commentHeader}>
                        <p className={styles.commentUser}>
                          Usuário {comment.userId}
                        </p>
                        <div className={styles.commentLikes}>
                          {comment.likes || 0}
                          <button className={styles.likeBtn}>
                            <FaRegHeart />
                          </button>
                        </div>
                      </div>
                      <p className={styles.commentContent}>{comment.content}</p>
                    </div>
                  ))}
                </div>
                <div className={styles.comunityInput}>
                  <textarea
                    placeholder="Deixe seu comentário..."
                    className={styles.commentInput}
                    rows={1}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onInput={(e: React.FormEvent<HTMLTextAreaElement>) => {
                      const target = e.currentTarget;
                      target.style.height = "auto";
                      target.style.height = `${target.scrollHeight}px`;
                    }}
                  />
                  <button className={styles.sendBtn} onClick={handleComment}>
                    <IoSend />
                  </button>
                </div>
              </div>
            </div>

            {/* Outros posts */}
            <div className={styles.others}>
              <h2 className={styles.othersTitle}>Outros Posts</h2>
              <div className={styles.othersList}>
                {otherPosts.map((p) => (
                  <a
                    key={p.id}
                    href={`/about/post/${p.id}`}
                    className={styles.otherCard}
                  >
                    {p.image ? (
                      <div className={styles.otherImage}>
                        <img
                          src={post.image?.[0].url ?? "/placeholder.svg"}
                          alt={post.title
                            .toLowerCase()
                            .replace(/ /g, "-")
                            .replace(/[^\w-]+/g, "")}
                          className={styles.image}
                        />
                      </div>
                    ) : (
                      <p className={styles.otherContent}>{p.content}</p>
                    )}
                    <div className={styles.otherInfo}>
                      <h3 className={styles.otherTitle}>{p.title}</h3>
                      <small className={styles.otherDate}>
                        {new Date(p.createdAt).toLocaleDateString("pt-BR")}
                      </small>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </main>
      ) : (
        <main></main>
      )}
    </>
  );
}
