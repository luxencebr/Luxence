"use client";

import styles from "./page.module.css";

import allProducers from "@/data/producers";
import sliderData from "@/data/sliderData";

import Slider from "@/components/Slider/Slider";
import ProductsRow from "@/components/ProductRow/ProductRow";

export default function HomePage() {
  const topProducers = allProducers.slice(0, 10);
  const newProducers = [...allProducers].sort((a, b) =>
    b.metadata.createdAt.localeCompare(a.metadata.createdAt)
  );

  return (
    <>
      <Slider slides={sliderData} className={styles.homeSlider} />
      <ProductsRow producers={newProducers} title="Novidades" />
      <ProductsRow producers={topProducers} title="Top Exence" highlight />
    </>
  );
}
