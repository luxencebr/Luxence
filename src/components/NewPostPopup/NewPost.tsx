"use client";

import type React from "react";

import { useState, useRef } from "react";
import type { Post } from "@/types/Posts";

import styles from "./NewPost.module.css";
import { FaPlus } from "react-icons/fa6";
import { IoIosClose } from "react-icons/io";
import { GoUpload } from "react-icons/go";

import Popup from "@/components/ui/Popup/Popup";
import { useSiteLocale } from "@/lib/site-locale";
import { uiText } from "@/lib/ui-text";

interface NewPostFormProps {
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
}

export default function NewPostForm({ setPosts, posts }: NewPostFormProps) {
  const { locale } = useSiteLocale();
  const t = (value: string) => uiText(locale, value);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const formData = new FormData(form);
    if (file) formData.append("image", file);

    try {
      const res = await fetch("/api/about/posts", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Erro ao criar publicação");
      }

      const createdPost: Post = result;
      console.log("Publicação criada:", createdPost);

      setPosts([createdPost, ...(Array.isArray(posts) ? posts : [])]);
      setIsOpen(false);

      form.reset();
      handleRemoveFile();
    } catch (err) {
      console.error("Erro ao criar publicação:", err);
      alert(
        `${t("Não foi possível criar a publicação")}: ${err instanceof Error ? t(err.message) : t("Erro desconhecido")}`,
      );
    }
  };

  return (
    <Popup
      trigger={
        <>
          <span>
            <FaPlus />
          </span>
          {t("Adicionar")}
        </>
      }
      triggerClass={styles.trigger}
      popupClass={styles.popup}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <div className={styles.popupHeader}>
        <span>{t("Nova Publicação")}</span>{" "}
        <button className={styles.closeButton} onClick={() => setIsOpen(false)}>
          <IoIosClose />
        </button>
      </div>
      <form className={styles.newPostForm} onSubmit={handleSubmit}>
        <div className={styles.content}>
          <div className={styles.column}>
            <label htmlFor="title" className={styles.inputLabel}>
              {t("Título")}
              <input
                className={styles.titleInput}
                id="title"
                name="title"
                placeholder={t("Título")}
                required
              />
            </label>

            <input
              type="file"
              id="image"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            {preview ? (
              <div className={styles.imagePreview}>
                <img src={preview || "/placeholder.svg"} alt={t("Prévia da imagem")} />
                <button
                  className={styles.removeBtn}
                  type="button"
                  onClick={handleRemoveFile}
                >
                  <IoIosClose />
                </button>
              </div>
            ) : (
              <label htmlFor="image" className={styles.imageInput}>
                <span>
                  <GoUpload />
                </span>{" "}
                {t("Adicionar imagem")}
              </label>
            )}
          </div>

          <label htmlFor="content" className={styles.inputLabel}>
            {t("Conteúdo")}
            <textarea
              id="content"
              className={styles.contentInput}
              name="content"
              placeholder={t("Conteúdo")}
              required
            />
          </label>
        </div>

        <button className={styles.submitBtn} type="submit">
          {t("Publicar")}
        </button>
      </form>
    </Popup>
  );
}
