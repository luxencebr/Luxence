"use client";

import { useEffect, useState } from "react";
import { Producer } from "@/types/Producer";

import styles from "./page.module.css";

import Slider from "@/components/Slider/Slider";
import ProductsRow from "@/components/ProductRow/ProductRow";

export default function HomePage() {
  const [sliderData, setSliderData] = useState<any[]>([]);
  const [newProducers, setNewProducers] = useState<Producer[]>([]);
  const [topProducers, setTopProducers] = useState<Producer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // calcula média das reviews
  function getWeightedAverage(producer: Producer) {
    const reviews = producer.profile.reviews;
    const count = reviews.length;

    if (count === 0) return 0;

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = sum / count;

    const k = 10;

    return (avg * count) / (count + k);
  }

  useEffect(() => {
    async function loadHomeData() {
      setIsLoading(true);

      try {
        const res = await fetch("/api/home");
        const data = await res.json();

        const newList = [...data].sort(
          (a, b) =>
            new Date(b.user.createdAt).getTime() -
            new Date(a.user.createdAt).getTime()
        );

        const topList = [...data].sort((a, b) => {
          const wA = getWeightedAverage(a);
          const wB = getWeightedAverage(b);

          if (wB !== wA) return wB - wA;

          return Math.random() - 0.5;
        });

        setNewProducers(newList);
        setTopProducers(topList);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar os dados");
      } finally {
        setIsLoading(false);
      }
    }

    loadHomeData();
  }, []);

  if (isLoading) {
    return <p className={styles.loading}>Carregando...</p>;
  }

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  return (
    <>
      <Slider slides={sliderData} className={styles.homeSlider} />
      <ProductsRow producers={newProducers} title="Novidades" />
      <ProductsRow producers={topProducers} title="Top Exence" highlight />
    </>
  );
}
