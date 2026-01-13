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
  profileId: number;
  initialImages?: ImageItem[];
  canEdit?: boolean;
}

/* ================= COMPONENT ================= */

export default function Slider({
  profileId,
  initialImages,
  canEdit = false,
}: SliderProps) {
  /* ================= STATE ================= */

  const [images, setImages] = useState<ImageItem[]>(() => initialImages ?? []);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);

  type CropMode = "create" | "edit";

  const [cropMode, setCropMode] = useState<CropMode>("create");
  const [editingImageId, setEditingImageId] = useState<string | null>(null);

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

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input to allow re-selecting the same file
    e.target.value = "";

    setCropMode("create");
    setEditingImageId(null);
    setOriginalFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setIsCropOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleEditImage = (index: number) => {
    const image = images[index];
    if (!image) return;

    setCropMode("edit");
    setEditingImageId(image.id);

    setOriginalFile(null);

    // Usar originalUrl se existir, senão usar url (imagens antigas)
    const imageToEdit = image.originalUrl || image.url;
    setImageSrc(imageToEdit);
    setIsCropOpen(true);

    // Se tiver cropData, restaurar. Senão, iniciar com valores padrão (imagem completa)
    if (image.cropData) {
      setCrop({ x: image.cropData.x, y: image.cropData.y });
      setZoom(image.cropData.zoom);
      setCroppedAreaPixels({
        x: image.cropData.x,
        y: image.cropData.y,
        width: image.cropData.width,
        height: image.cropData.height,
      });
    } else {
      // Resetar para valores padrão
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    }
  };

  /* ================= DELETE ================= */

  const handleDeleteImage = async (index: number) => {
    const image = images[index];
    if (!image) return;

    setIsDeleting(index);

    try {
      const res = await fetch(`/api/profile/images/${image.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Erro ao deletar imagem");

      setImages((prev) => prev.filter((_, i) => i !== index));
      setCurrentSlide((prev) => Math.max(0, prev - 1));
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
        <>
          <section className={styles.slider}>
            <div className={styles.emptyState}>
              <label
                htmlFor="addImageInput"
                className={`${styles.imagesInput} ${
                  isUploading ? styles.loading : ""
                }`}
              >
                {isUploading ? (
                  <span className={styles.spinner} />
                ) : (
                  <>
                    <i>
                      <GoUpload />
                    </i>
                    <span>Adicione imagens ao seu perfil</span>
                    <small>E alcance mais usuários</small>
                  </>
                )}
              </label>

              <input
                id="addImageInput"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.heic,.heif"
                onChange={handleAddImage}
                hidden
              />
            </div>
          </section>

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
                    aspect={4 / 3}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
                  />

                  <div className={styles.safeArea} />
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
                            JSON.stringify(croppedAreaPixels)
                          );
                          formData.append("zoom", String(zoom));
                          formData.append("aspect", "4/3");
                          formData.append("profileId", String(profileId));

                          res = await fetch("/api/profile/images", {
                            method: "POST",
                            body: formData,
                          });
                        } else {
                          if (!editingImageId)
                            throw new Error("Imagem não identificada");

                          res = await fetch(
                            `/api/profile/images/${editingImageId}`,
                            {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                cropData: croppedAreaPixels,
                                zoom: zoom,
                              }),
                            }
                          );
                        }

                        if (!res.ok) throw new Error("Erro ao salvar");

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
                            img.id === updatedImage.id
                              ? imageWithTimestamp
                              : img
                          );
                        });

                        setIsCropOpen(false);
                        setImageSrc(null);
                        setOriginalFile(null);
                        setEditingImageId(null);
                        setCropMode("create");
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setIsUploading(false);
                      }
                    }}
                  >
                    {isUploading ? (
                      <span className={styles.spinner} />
                    ) : (
                      "Salvar"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      );
    }

    return (
      <section className={styles.slider}>
        <div className={styles.noImages}>
          <span>Perfil sem imagens...</span>
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
        {canEdit && images[currentSlide] && (
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
              disabled={isDeleting === currentSlide}
              aria-label="Remover imagem atual"
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
            transition: isDragging ? "none" : "transform 0.3s ease",
          }}
        >
          {images.map((img, index) => (
            <img
              key={`${img.id}-${index}`}
              src={img.url || "/placeholder.svg"}
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
                src={img.url || "/placeholder.svg"}
                alt={img.name}
                className={`${styles.thumbnail} ${
                  index === currentSlide ? styles.active : ""
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            </div>
          ))}

          {canEdit && (
            <>
              <input
                id="addImageInput"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.heic,.heif"
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
