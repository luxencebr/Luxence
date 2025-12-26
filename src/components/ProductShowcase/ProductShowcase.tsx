"use client";

import type React from "react";

import { useState } from "react";
import styles from "./ProductShowcase.module.css";
import { GoUpload } from "react-icons/go";

import type { Producer } from "@/types/Producer";
import Slider from "@/components/Slider/Slider";
import ProductInfo from "@/components/ProductInfo/ProductInfo";

interface ProductShowcaseProps {
  producer: Producer;
  canEdit: boolean;
}

interface ImageItem {
  id?: number;
  url: string;
  name: string;
  isNew?: boolean;
  file?: File;
}

export default function ProductShowcase({
  producer,
  canEdit,
}: ProductShowcaseProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const [images, setImages] = useState<ImageItem[]>(
    Array.isArray(producer.profile.images)
      ? producer.profile.images.map((img, index) => ({
          id: index,
          url: img.url,
          name: img.name,
        }))
      : []
  );

  const slides = images.map((img, index) => ({
    id: index,
    src: img.url,
    alt: `${img.name} - imagem ${index + 1}`,
  }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("profileId", String(producer.profile.id));

    try {
      const res = await fetch("/api/profile/showcase/image", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setImages([...images, { id: data.id, url: data.url, name: data.name }]);
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteImage = async (index: number) => {
    setIsDeleting(index);

    const imageToDelete = images[index];

    try {
      await fetch("/api/profile/showcase/image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: producer.profile.id,
          imageIndex: index,
          imageName: imageToDelete.name,
        }),
      });

      setImages(images.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Erro ao deletar imagem:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <section className={styles.productShowcase}>
      <div className={styles.sliderContainer}>
        {slides.length > 0 ? (
          <Slider
            slides={slides}
            className={`${styles.slider} productSlider`}
            canEdit={canEdit}
            onDeleteImage={handleDeleteImage}
            onAddImage={handleImageUpload}
            isUploading={isUploading}
            isDeleting={isDeleting}
          />
        ) : canEdit ? (
          <label className={styles.imagesInput}>
            <i>
              <GoUpload />
            </i>
            Adicione Imagens ao seu Perfil <span>E alcance mais usuários</span>
            <input
              type="file"
              accept="image/*"
              className={styles.hidden}
              onChange={handleImageUpload}
            />
          </label>
        ) : (
          <div className={styles.noImages}>
            <span>Sem imagens disponíveis</span>
          </div>
        )}
      </div>

      <ProductInfo producer={producer} canEdit={canEdit} />
    </section>
  );
}
