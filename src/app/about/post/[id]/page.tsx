"use client";

import type React from "react";

import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import { GoUpload } from "react-icons/go";
import { IoCheckmark, IoClose } from "react-icons/io5";
import { HiOutlinePencil } from "react-icons/hi2";

import styles from "./page.module.css";
import type { Post } from "@/types/Posts";

// Esta página é dinâmica e não precisa de generateStaticParams
export const dynamic = 'force-dynamic';

export default function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [otherPosts, setOtherPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para upload de imagem (admin)
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para edição de título (admin)
  const [title, setTitle] = useState("");
  const [originalTitle, setOriginalTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Estados para edição de conteúdo (admin)
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [isSavingContent, setIsSavingContent] = useState(false);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

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
        setTitle(dataPost.title);
        setOriginalTitle(dataPost.title);
        setContent(dataPost.content);
        setOriginalContent(dataPost.content);

        // Busca todos os posts e filtra os outros
        const resAll = await fetch("/api/about");
        const dataAll = await resAll.json();
        const allPosts = dataAll.posts || [];
        setOtherPosts(
          allPosts.filter((p: Post) => p.id !== dataPost.id).slice(0, 3),
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [id]);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingContent) {
      contentTextareaRef.current?.focus();
    }
  }, [isEditingContent]);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setOriginalTitle(post.title);
      setContent(post.content);
      setOriginalContent(post.content);
    }
  }, [post]);

  // Funções para upload de imagem (admin)
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !post) return;

    // Reset input
    e.target.value = "";

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`/api/about/posts/${id}/image`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const updatedPost = await res.json();
        setPost(updatedPost);
      } else {
        const error = await res.json();
        alert(`Erro ao fazer upload: ${error.error}`);
      }
    } catch (err) {
      console.error("Erro ao fazer upload da imagem:", err);
      alert("Erro ao fazer upload da imagem");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!post?.imageUrl) return;

    setUploadingImage(true);
    try {
      const res = await fetch(`/api/about/posts/${id}/image`, {
        method: "DELETE",
      });

      if (res.ok) {
        const updatedPost = await res.json();
        setPost(updatedPost);
      } else {
        const error = await res.json();
        alert(`Erro ao remover imagem: ${error.error}`);
      }
    } catch (err) {
      console.error("Erro ao remover imagem:", err);
      alert("Erro ao remover imagem");
    } finally {
      setUploadingImage(false);
    }
  };

  // Funções para edição de título (admin)
  const handleEditTitle = () => {
    setOriginalTitle(title);
    setIsEditingTitle(true);
  };

  const handleCancelTitle = () => {
    setTitle(originalTitle);
    setIsEditingTitle(false);
  };

  const handleSaveTitle = async () => {
    if (!post || title.trim() === originalTitle.trim()) {
      setIsEditingTitle(false);
      return;
    }

    setIsSavingTitle(true);
    try {
      const res = await fetch(`/api/about/posts/${id}/title`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });

      if (res.ok) {
        const updatedPost = await res.json();
        setPost(updatedPost);
        setOriginalTitle(title.trim());
        setIsEditingTitle(false);
      } else {
        const error = await res.json();
        alert(`Erro ao salvar título: ${error.error}`);
        setTitle(originalTitle);
      }
    } catch (err) {
      console.error("Erro ao salvar título:", err);
      alert("Erro ao salvar título");
      setTitle(originalTitle);
    } finally {
      setIsSavingTitle(false);
    }
  };

  // Funções para edição de conteúdo (admin)
  const handleEditContent = () => {
    setOriginalContent(content);
    setIsEditingContent(true);
  };

  const handleCancelContent = () => {
    setContent(originalContent);
    setIsEditingContent(false);
  };

  const handleSaveContent = async () => {
    if (!post || content.trim() === originalContent.trim()) {
      setIsEditingContent(false);
      return;
    }

    setIsSavingContent(true);
    try {
      const res = await fetch(`/api/about/posts/${id}/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (res.ok) {
        const updatedPost = await res.json();
        setPost(updatedPost);
        setOriginalContent(content.trim());
        setIsEditingContent(false);
      } else {
        const error = await res.json();
        alert(`Erro ao salvar conteúdo: ${error.error}`);
        setContent(originalContent);
      }
    } catch (err) {
      console.error("Erro ao salvar conteúdo:", err);
      alert("Erro ao salvar conteúdo");
      setContent(originalContent);
    } finally {
      setIsSavingContent(false);
    }
  };

  // Determinar a classe CSS baseada na condição
  const getPostClass = () => {
    if (isAdmin) return styles.adminPost || styles.imagePost; // fallback para imagePost se adminPost não existir
    return post?.imageUrl ? styles.imagePost : styles.simplePost;
  };

  if (loading) {
    return (
      <main className={styles.postPage}>
        <div className={styles.layout}>
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
            <p>Carregando publicação...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className={styles.postPage}>
        <div className={styles.layout}>
          <div className={styles.errorState}>
            <p>Publicação não encontrada</p>
            <small>
              A publicação que você está procurando pode ter sido removida ou
              não existe.
            </small>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.postPage}>
      <div className={styles.layout}>
        <section className={getPostClass()}>
          {/* Post principal */}
          <div className={styles.post}>
            <div className={styles.postHeader}>
              <div className={`${styles.editable} ${styles.titleEditable}`}>
                {isEditingTitle ? (
                  <div className={styles.editableEdit}>
                    <input
                      ref={titleInputRef}
                      className={styles.editableInput}
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={isSavingTitle}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          !isSavingTitle && handleSaveTitle();
                        }
                        if (e.key === "Escape") {
                          e.preventDefault();
                          handleCancelTitle();
                        }
                      }}
                    />

                    {isSavingTitle ? (
                      <div className={styles.loader} />
                    ) : (
                      <div className={styles.editActions}>
                        <button
                          type="button"
                          className={styles.editableSave}
                          onClick={handleSaveTitle}
                          disabled={isSavingTitle}
                          title="Salvar"
                        >
                          <IoCheckmark />
                        </button>

                        <button
                          type="button"
                          className={styles.editableCancel}
                          onClick={handleCancelTitle}
                          title="Cancelar"
                        >
                          <IoClose />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <h1
                    className={`${styles.title} ${styles.editableValue}`}
                    onClick={isAdmin ? handleEditTitle : undefined}
                  >
                    {title}
                    {isAdmin && <HiOutlinePencil className={styles.editIcon} />}
                  </h1>
                )}
              </div>
              {/* Funcionalidade de likes desabilitada */}
              {/* <div className={styles.postLikes}>
                    <button className={styles.likeBtn} onClick={handleLike}>
                      {liked ? <FaHeart /> : <FaRegHeart />}
                    </button>
                    {post.likes || 0}
                  </div> */}
            </div>

            <div className={styles.postInfo}>
              {post.imageUrl ? (
                <div className={styles.postImage}>
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className={styles.image}
                  />
                  {isAdmin && (
                    <div className={styles.imageActions}>
                      <button
                        className={`${styles.removeImageBtn} ${
                          uploadingImage ? styles.loading : ""
                        }`}
                        onClick={handleRemoveImage}
                        disabled={uploadingImage}
                        aria-label="Remover imagem"
                      >
                        {uploadingImage ? (
                          <span className={styles.spinner} />
                        ) : (
                          <FaRegTrashCan />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                isAdmin && (
                  <div className={styles.imageUploadSection}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                      disabled={uploadingImage}
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className={styles.addImageBtn}
                    >
                      {uploadingImage ? (
                        <>
                          <span className={styles.spinner} />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <GoUpload />
                          Adicionar Imagem
                        </>
                      )}
                    </button>
                  </div>
                )
              )}

              <div
                className={`${styles.contentEditable} ${isAdmin ? styles.adminContent : ""}`}
              >
                {isEditingContent ? (
                  <div className={styles.contentEditableEdit}>
                    {isSavingContent ? (
                      <div className={styles.contentLoadingOverlay}>
                        <div className={styles.contentLoader} />
                        <span>Salvando...</span>
                      </div>
                    ) : (
                      <>
                        <textarea
                          ref={contentTextareaRef}
                          className={styles.contentEditableTextarea}
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          disabled={isSavingContent}
                          rows={10}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.ctrlKey) {
                              e.preventDefault();
                              !isSavingContent && handleSaveContent();
                            }
                            if (e.key === "Escape") {
                              e.preventDefault();
                              handleCancelContent();
                            }
                          }}
                        />

                        <div className={styles.contentEditActions}>
                          <button
                            type="button"
                            className={styles.contentEditableSave}
                            onClick={handleSaveContent}
                            disabled={isSavingContent}
                            title="Salvar (Ctrl+Enter)"
                          >
                            <IoCheckmark />
                          </button>

                          <button
                            type="button"
                            className={styles.contentEditableCancel}
                            onClick={handleCancelContent}
                            title="Cancelar (Esc)"
                          >
                            <IoClose />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div
                    className={`${styles.postContent} ${styles.contentEditableValue}`}
                    onClick={isAdmin ? handleEditContent : undefined}
                  >
                    {content.split(/\n{2,}/).map((paragraph, index) => (
                      <p key={index} className={styles.content}>
                        {paragraph.trim()}
                      </p>
                    ))}
                    {isAdmin && (
                      <HiOutlinePencil className={styles.contentEditIcon} />
                    )}
                  </div>
                )}
              </div>
            </div>

            <small className={styles.date}>
              Publicado em{" "}
              {new Date(post.createdAt).toLocaleDateString("pt-BR")}
            </small>
          </div>

          {/* Seção de comentários - funcionalidade desabilitada */}
          {/* <div className={styles.comunityBox}>
                <div className={styles.comunityHeader}>
                  <h1 className={styles.title}>Participe da Nossa Comunidade</h1>
                </div>
                <div className={styles.comunityContent}>
                  {post.comments && post.comments.length > 0 ? (
                    post.comments.map((comment) => (
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
                        <p className={styles.commentContent}>{comment.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className={styles.noComments}>Ainda não há comentários...</p>
                  )}
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
              </div> */}
        </section>

        {/* Outros posts */}
        <div className={styles.others}>
          <h2 className={styles.othersTitle}>Outras Publicações</h2>
          <div className={styles.othersList}>
            {otherPosts.map((p) => (
              <a
                key={p.id}
                href={`/about/post/${p.id}`}
                className={styles.otherCard}
              >
                {p.imageUrl ? (
                  <div className={styles.otherImage}>
                    <img
                      src={p.imageUrl}
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
                    {new Date(p.createdAt).toLocaleDateString("pt-BR")}
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
