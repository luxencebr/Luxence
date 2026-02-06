"use client";

import type React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import styles from "./Slider.module.css";
import { HiOutlinePencil } from "react-icons/hi2";
import { GoUpload } from "react-icons/go";
import {
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoClose,
} from "react-icons/io5";
import { FaPlus, FaRegTrashCan } from "react-icons/fa6";

/* ================= TYPES ================= */

interface ImageItem {
  id: string;
  url: string;
  originalUrl?: string;
  name: string;
  cropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
    zoom: number;
  };
}

interface SliderProps {
  initialImages?: ImageItem[];
  canEdit?: boolean;
}

/* ================= COMPONENT ================= */

export default function Slider({
  initialImages,
  canEdit = false,
}: SliderProps) {
  const [images, setImages] = useState<ImageItem[]>(() => initialImages ?? []);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);

  const [cropMode, setCropMode] = useState<"create" | "edit">("create");
  const [editingImageId, setEditingImageId] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = images.length;
  const isAdmin = canEdit;
  const hasImages = totalSlides > 0;
  const showEmptyInput = isAdmin && !hasImages;
  const showSlider = hasImages;

  /* ================= SYNC ================= */

  useEffect(() => {
    setImages(initialImages ?? []);
    setCurrentSlide(0);
  }, [initialImages]);

  /* ================= AUTOPLAY ================= */

  const goToNextSlide = useCallback(() => {
    if (totalSlides <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const goToPrevSlide = useCallback(() => {
    if (totalSlides <= 1) return;
    setCurrentSlide((prev) => (prev - 1 < 0 ? totalSlides - 1 : prev - 1));
  }, [totalSlides]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isAdmin || totalSlides <= 1 || isDragging) return;

    intervalRef.current = setInterval(goToNextSlide, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [goToNextSlide, totalSlides, isDragging, isAdmin]);

  /* ================= TOUCH ================= */

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAdmin) return;

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

  const openCrop = (src: string) => {
    setImageSrc(src);
    setIsCropOpen(true);
  };

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setCropMode("create");
    setEditingImageId(null);
    setOriginalFile(file);

    const reader = new FileReader();
    reader.onload = () => openCrop(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleEditImage = (index: number) => {
    const image = images[index];
    if (!image) return;

    setCropMode("edit");
    setEditingImageId(image.id);
    setOriginalFile(null);

    openCrop(image.originalUrl || image.url);

    if (image.cropData) {
      setZoom(image.cropData.zoom);
      setCroppedAreaPixels(image.cropData);
    }
  };

  const handleDeleteImage = async (index: number) => {
    const image = images[index];
    if (!image) return;

    setIsDeleting(index);

    try {
      await fetch(`/api/home/slider/${image.id}`, {
        method: "DELETE",
      });

      setImages((prev) => prev.filter((_, i) => i !== index));
      setCurrentSlide((prev) => Math.max(0, prev - 1));
    } finally {
      setIsDeleting(null);
    }
  };

  /* ================= GUARDS ================= */

  if (!isAdmin && !hasImages) return null;

  /* ================= RENDER ================= */

  return (
    <>
      {showEmptyInput && (
        <section className={styles.slider}>
          <label className={styles.imagesInput}>
            <GoUpload />
            <span>Adicionar imagens</span>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.heic,.heif"
              onChange={handleAddImage}
              hidden
            />
          </label>
        </section>
      )}

      {showSlider && (
        <section className={styles.slider}>
          <div
            className={styles.sliderContainer}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {isAdmin && (
              <div className={styles.sliderActions}>
                <button
                  className={styles.editCurrentBtn}
                  onClick={() => handleEditImage(currentSlide)}
                >
                  <HiOutlinePencil />
                </button>

                <button
                  className={`${styles.removeCurrentBtn} ${
                    isDeleting === currentSlide ? styles.loading : ""
                  }`}
                  onClick={() => handleDeleteImage(currentSlide)}
                >
                  {isDeleting === currentSlide ? (
                    <span className={styles.spinner} />
                  ) : (
                    <FaRegTrashCan />
                  )}
                </button>
              </div>
            )}

            <div
              className={styles.slideImages}
              style={{
                transform: `translateX(calc(-${
                  currentSlide * 100
                }% + ${dragOffset}px))`,
              }}
            >
              {images.map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt={img.name}
                  className={styles.slideImage}
                  draggable={false}
                />
              ))}
            </div>

            {totalSlides > 1 && (
              <div className={styles.controls}>
                <button onClick={goToPrevSlide}>
                  <IoChevronBackOutline />
                </button>
                <button onClick={goToNextSlide}>
                  <IoChevronForwardOutline />
                </button>
              </div>
            )}

            <div className={styles.indicators}>
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.dot} ${
                    index === currentSlide ? styles.activeDot : ""
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}

              {isAdmin && (
                <label className={styles.addBtn}>
                  <FaPlus />
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.heic,.heif"
                    onChange={handleAddImage}
                    hidden
                  />
                </label>
              )}
            </div>
          </div>
        </section>
      )}

      {isCropOpen && imageSrc && (
        <div className={styles.backdrop}>
          <div className={styles.cropModal}>
            <div className={styles.cropHeader}>
              Cortar Imagem
              <button onClick={() => setIsCropOpen(false)}>
                <IoClose />
              </button>
            </div>

            <div className={styles.cropContainer}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={21 / 9}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
              />
            </div>

            <div className={styles.cropActions}>
              <button onClick={() => setIsCropOpen(false)}>Cancelar</button>

              <button
                className={styles.saveBtn}
                onClick={async () => {
                  if (!croppedAreaPixels) return;

                  setIsUploading(true);

                  try {
                    let res: Response;

                    if (cropMode === "create") {
                      if (!originalFile) throw new Error("Arquivo ausente");

                      const formData = new FormData();
                      formData.append("file", originalFile);
                      formData.append(
                        "crop",
                        JSON.stringify(croppedAreaPixels),
                      );
                      formData.append("zoom", String(zoom));
                      formData.append("aspect", "21/9");

                      res = await fetch("/api/home/slider", {
                        method: "POST",
                        body: formData,
                      });
                    } else {
                      if (!editingImageId)
                        throw new Error("Imagem não identificada");

                      res = await fetch(`/api/home/slider/${editingImageId}`, {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          cropData: croppedAreaPixels,
                          zoom,
                        }),
                      });
                    }

                    if (!res.ok) {
                      const errorData = await res.json();
                      throw new Error(
                        errorData.error || "Erro ao salvar imagem",
                      );
                    }

                    const updatedImage: ImageItem = await res.json();

                    setImages((prev) => {
                      if (cropMode === "create") {
                        setCurrentSlide(prev.length);
                        return [...prev, updatedImage];
                      }

                      const imageWithTimestamp = {
                        ...updatedImage,
                        url: `${updatedImage.url}?t=${Date.now()}`,
                      };

                      return prev.map((img) =>
                        img.id === updatedImage.id ? imageWithTimestamp : img,
                      );
                    });

                    setIsCropOpen(false);
                    setImageSrc(null);
                    setOriginalFile(null);
                    setEditingImageId(null);
                    setCropMode("create");
                    setCrop({ x: 0, y: 0 });
                    setZoom(1);
                    setCroppedAreaPixels(null);
                  } catch (err) {
                    console.error(err);
                  } finally {
                    setIsUploading(false);
                  }
                }}
              >
                {isUploading ? <span className={styles.spinner} /> : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
