"use client";

import styles from "./ProductShowcase.module.css";

import type { Producer } from "@/types/Producer";
import Slider from "@/components/Slider/Slider";
import ProductInfo from "@/components/ProductInfo/ProductInfo";

interface ProductShowcaseProps {
  producer: Producer;
  canEdit: boolean;
}

export default function ProductShowcase({
  producer,
  canEdit,
}: ProductShowcaseProps) {
  const images = producer.profile.images;

  return (
    <section className={styles.productShowcase}>
      <Slider
        profileId={producer.profile.id}
        initialImages={images}
        canEdit={canEdit}
      />
      <ProductInfo producer={producer} canEdit={canEdit} />
    </section>
  );
}
