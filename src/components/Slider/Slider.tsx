"use client";

import type React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import styles from "./Slider.module.css";

import { GoUpload } from "react-icons/go";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { FaXmark, FaPlus } from "react-icons/fa6";

/* ================= TYPES ================= */

interface ImageItem {
  id: string;
  url: string;
  name: string;
}

interface SliderProps {
  profileId: number;
  initialImages?: ImageItem[];
  canEdit?: boolean;
}

/* ================= COMPONENT ================= */

export default function HighlightSlider({
  profileId,
  initialImages,
  canEdit = false,
}: SliderProps) {
  /* ================= STATE ================= */

  const [images, setImages] = useState<ImageItem[]>(() => initialImages ?? []);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const totalSlides = images.length;
  const slideInterval = 5000;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /* ================= SYNC PROPS ================= */

  useEffect(() => {
    setImages(initialImages ?? []);
    setCurrentSlide(0);
  }, [initialImages]);

  /* ================= AUTOPLAY ================= */

  const goToNextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const goToPrevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 < 0 ? totalSlides - 1 : prev - 1));
  }, [totalSlides]);

  useEffect(() => {
    if (isDragging || totalSlides <= 1) return;

    intervalRef.current = setInterval(goToNextSlide, slideInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [goToNextSlide, isDragging, totalSlides]);

  /* ================= TOUCH ================= */

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    setDragOffset(e.touches[0].clientX - touchStartX);
  };

  const handleTouchEnd = () => {
    if (Math.abs(dragOffset) > 50) {
      dragOffset < 0 ? goToNextSlide() : goToPrevSlide();
    }

    setTouchStartX(null);
    setDragOffset(0);
    setIsDragging(false);
  };

  /* ================= UPLOAD ================= */

  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("profileId", String(profileId));

    try {
      const res = await fetch("/api/profile/images", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Erro no upload");

      const data: ImageItem = await res.json();

      setImages((prev) => {
        setCurrentSlide(prev.length);
        return [...prev, data];
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  /* ================= DELETE ================= */

  const handleDeleteImage = async (index: number) => {
    const image = images[index];
    if (!image) return;

    setIsDeleting(index);

    try {
      await fetch(`/api/profile/images/${image.id}`, {
        method: "DELETE",
      });

      setImages((prev) => prev.filter((_, i) => i !== index));
      setCurrentSlide((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(null);
    }
  };

  /* ================= RENDER ================= */

  if (images.length === 0) {
    if (canEdit) {
      return (
        <section className={styles.slider}>
          <div className={styles.emptyState}>
            <label
              htmlFor="addImageInput"
              className={`${styles.imagesInput} ${
                isUploading ? styles.loading : ""
              }`}
            >
              <i>
                <GoUpload />
              </i>
              <span>Adicione imagens ao seu perfil</span>
              <small>E alcance mais usuários</small>

              {isUploading && <span className={styles.spinner} />}
            </label>

            <input
              id="addImageInput"
              type="file"
              accept="image/*"
              onChange={handleAddImage}
              hidden
            />
          </div>
        </section>
      );
    }

    return (
      <section className={styles.slider}>
        <div className={styles.noImages}>
          <span>Sem imagens disponíveis</span>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.slider}>
      <div
        className={styles.sliderContainer}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slides */}
        <div
          className={styles.slideImages}
          style={{
            transform: `translateX(calc(-${
              currentSlide * 100
            }% + ${dragOffset}px))`,
            transition: isDragging ? "none" : "transform 0.3s ease",
          }}
        >
          {images.map((img, index) => (
            <img
              key={`${img.id}-${index}`}
              src={img.url}
              alt={img.name}
              className={styles.slideImage}
              draggable={false}
            />
          ))}
        </div>

        {/* Controls */}
        {totalSlides > 1 && (
          <div className={styles.controls}>
            <button onClick={goToPrevSlide} aria-label="Imagem anterior">
              <IoChevronBackOutline />
            </button>
            <button onClick={goToNextSlide} aria-label="Próxima imagem">
              <IoChevronForwardOutline />
            </button>
          </div>
        )}

        {/* Indicators */}
        <div className={styles.indicators}>
          {images.map((img, index) => (
            <div
              className={styles.thumbnailWrapper}
              key={`${img.id}-thumb-${index}`}
            >
              <img
                src={img.url}
                alt={img.name}
                className={`${styles.thumbnail} ${
                  index === currentSlide ? styles.active : ""
                }`}
                onClick={() => setCurrentSlide(index)}
              />

              {canEdit && (
                <button
                  className={`${styles.removeBtn} ${
                    isDeleting === index ? styles.loading : ""
                  }`}
                  onClick={() => handleDeleteImage(index)}
                  disabled={isDeleting === index}
                  aria-label="Remover imagem"
                >
                  {isDeleting === index ? (
                    <span className={styles.spinnerMini} />
                  ) : (
                    <FaXmark />
                  )}
                </button>
              )}
            </div>
          ))}

          {canEdit && (
            <>
              <input
                id="addImageInput"
                type="file"
                accept="image/*"
                onChange={handleAddImage}
                hidden
              />

              <label
                htmlFor="addImageInput"
                className={`${styles.addBtn} ${
                  isUploading ? styles.loading : ""
                }`}
                aria-label="Adicionar imagem"
              >
                {isUploading ? <span className={styles.spinner} /> : <FaPlus />}
              </label>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
