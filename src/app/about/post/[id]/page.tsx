"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { posts } from "@/data/posts";
import styles from "./page.module.css";
import { IoSend } from "react-icons/io5";
import { FaRegHeart, FaHeart } from "react-icons/fa6";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default function PostPage({ params }: PostPageProps) {
  const { id } = use(params);
  const postId = id;
  const post = posts.find((p) => p.id === postId);

  if (!post) return notFound();

  return (
    <main className={styles.postPage}>
      <div className={styles.layout}>
        <div className={styles.post}>
          <div className={styles.postInfo}>
            <div className={styles.postHeader}>
              <h1 className={styles.title}>{post.title}</h1>

              <div className={styles.postLikes}>
                <button className={styles.likeBtn}>
                  <FaRegHeart />
                </button>
                {post.likes}
              </div>
            </div>
            {post.image ? (
              <div className={styles.postImage}>
                <img
                  src={post.image}
                  alt={post.title}
                  className={styles.image}
                />
              </div>
            ) : (
              <div className={styles.postContent}>
                {post.content.split(/\n{2,}/).map((paragraph, index) => (
                  <p key={index} className={styles.content}>
                    {paragraph.trim()}
                  </p>
                ))}
              </div>
            )}

            <small className={styles.date}>
              Publicado em {new Date(post.date).toLocaleDateString("pt-BR")}
            </small>
          </div>

          {post.image ? (
            <div className={styles.postContent}>
              {post.content.split(/\n{2,}/).map((paragraph, index) => (
                <p key={index} className={styles.content}>
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            <div className={styles.comunityBox}>
              <div className={styles.comunityHeader}>
                <h2>Participe da Nossa Comunidade</h2>
              </div>
              <div className={styles.comunityContent}>
                {post.comments?.map((comment, index) => (
                  <div key={index} className={styles.comment}>
                    <div className={styles.commentHeader}>
                      <p className={styles.commentUser}>{comment.user}</p>
                      <div className={styles.commentLikes}>
                        {comment.likes}
                        <button className={styles.likeBtn}>
                          <FaRegHeart />
                        </button>
                      </div>
                    </div>
                    <p className={styles.commentContent}>"{comment.content}"</p>
                  </div>
                ))}
              </div>
              <div className={styles.comunityInput}>
                <textarea
                  placeholder="Deixe seu comentário..."
                  className={styles.commentInput}
                  rows={1}
                  onInput={(e: React.FormEvent<HTMLTextAreaElement>) => {
                    const target = e.currentTarget;
                    target.style.height = "auto";
                    target.style.height = `${target.scrollHeight}px`;
                  }}
                />
                <button className={styles.sendBtn}>
                  <IoSend />
                </button>
              </div>
            </div>
          )}
        </div>

        {post.image && (
          <div className={styles.comunityBox}>
            <div className={styles.comunityHeader}>
              <h2>Participe da Nossa Comunidade</h2>
            </div>
            <div className={styles.comunityContent}>
              {post.comments?.map((comment, index) => (
                <div key={index} className={styles.comment}>
                  <div className={styles.commentHeader}>
                    <p className={styles.commentUser}>{comment.user}</p>
                    <div className={styles.commentLikes}>
                      <button className={styles.likeBtn}>
                        <FaRegHeart />
                      </button>
                      {comment.likes}
                    </div>
                  </div>
                  <p className={styles.commentContent}>"{comment.content}"</p>
                </div>
              ))}
            </div>
            <div className={styles.comunityInput}>
              <textarea
                placeholder="Deixe seu comentário..."
                className={styles.commentInput}
                rows={1}
                onInput={(e: React.FormEvent<HTMLTextAreaElement>) => {
                  const target = e.currentTarget;
                  target.style.height = "auto";
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
              <button className={styles.sendBtn}>
                <IoSend />
              </button>
            </div>
          </div>
        )}

        <div className={styles.others}>
          <h2 className={styles.othersTitle}>Outros Posts</h2>

          <div className={styles.othersList}>
            {posts
              .filter((p) => p.id !== postId) // exclui o post atual
              .slice(0, 3) // mostra apenas 3
              .map((p) => (
                <a
                  key={p.id}
                  href={`/post/${p.id}`}
                  className={styles.otherCard}
                >
                  {p.image ? (
                    <div className={styles.otherImage}>
                      <img
                        src={p.image}
                        alt={p.title}
                        className={styles.image}
                      />
                    </div>
                  ) : (
                    <p className={styles.otherContent}>{p.content}</p>
                  )}

                  <div className={styles.otherInfo}>
                    <h3 className={styles.otherTitle}>{p.title}</h3>
                    <small className={styles.otherDate}>
                      {new Date(p.date).toLocaleDateString("pt-BR")}
                    </small>
                  </div>
                </a>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
}
