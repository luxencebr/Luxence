"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import styles from "./Slider.module.css";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { FaXmark, FaPlus } from "react-icons/fa6";

export interface Slide {
  id: number | string;
  src: string;
  alt: string;
}

interface HighlightSliderProps {
  slides: Slide[];
  className?: string;
  canEdit?: boolean;
  onDeleteImage?: (index: number) => void;
  onAddImage?: (e: React.ChangeEvent<HTMLInputElement>) => void;

  isUploading?: boolean;
  isDeleting?: number | null;
}

function HighlightSlider({
  slides,
  className,
  canEdit = false,
  onDeleteImage,
  onAddImage,
  isUploading = false,
  isDeleting = null,
}: HighlightSliderProps) {
  const isProductPage = className?.includes("productSlider");

  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = slides.length;
  const slideInterval = 5000;

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const goToNextSlide = useCallback(() => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % totalSlides);
  }, [totalSlides]);

  const goToPrevSlide = useCallback(() => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (!isProductPage) {
    useEffect(() => {
      if (isDragging) return;
      const interval = setInterval(goToNextSlide, slideInterval);
      return () => clearInterval(interval);
    }, [goToNextSlide, isDragging]);
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const currentX = e.touches[0].clientX;
    setDragOffset(currentX - touchStartX);
  };

  const handleTouchEnd = () => {
    if (Math.abs(dragOffset) > 50) {
      if (dragOffset < 0) goToNextSlide();
      else goToPrevSlide();
    }
    setTouchStartX(null);
    setDragOffset(0);
    setIsDragging(false);
  };

  return (
    <section className={`${styles.slider} ${className || ""}`}>
      <div
        className={styles.sliderContainer}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={styles.slideImages}
          style={{
            transform: `translateX(calc(-${
              currentSlide * 100
            }% + ${dragOffset}px))`,
            transition: isDragging ? "none" : "transform 0.3s ease",
          }}
        >
          {slides.map((slide) => (
            <img
              key={slide.id}
              src={slide.src}
              alt={slide.alt}
              className={styles.slideImage}
            />
          ))}
        </div>

        <div className={styles.controls}>
          <button onClick={goToPrevSlide}>
            <IoChevronBackOutline />
          </button>
          <button onClick={goToNextSlide}>
            <IoChevronForwardOutline />
          </button>
        </div>

        <div className={styles.indicators}>
          {slides.map((slide, index) =>
            isProductPage ? (
              <div className={styles.thumbnailWrapper} key={index}>
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className={`${styles.thumbnail} ${
                    index === currentSlide ? styles.active : ""
                  }`}
                  onClick={() => goToSlide(index)}
                />
                {canEdit && (
                  <button
                    className={`${styles.removeBtn} ${
                      isDeleting === index ? styles.loading : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteImage?.(index);
                    }}
                    disabled={isDeleting === index}
                    title="Remover imagem"
                  >
                    {isDeleting === index ? (
                      <span className={styles.spinnerMini}></span>
                    ) : (
                      <FaXmark />
                    )}
                  </button>
                )}
              </div>
            ) : (
              <input
                key={index}
                type="radio"
                name="slider-indicator"
                checked={index === currentSlide}
                onChange={() => goToSlide(index)}
              />
            )
          )}
          {canEdit && (
            <>
              <input
                id="addImageInput"
                type="file"
                accept="image/*"
                onChange={onAddImage}
                className={styles.hiddenInput}
                style={{ display: "none" }}
              />

              <label
                htmlFor="addImageInput"
                className={`${styles.addBtn} ${
                  isUploading ? styles.loading : ""
                }`}
              >
                {isUploading ? (
                  <span className={styles.spinner}></span>
                ) : (
                  <FaPlus />
                )}
              </label>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default HighlightSlider;
