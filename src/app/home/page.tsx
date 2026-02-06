"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Producer } from "@/types/Producer";

import styles from "./page.module.css";

import ProductsRow from "@/components/ProductRow/ProductRow";
import Slider from "@/components/about/Slider/Slider";

export default function HomePage() {
  const { data: session } = useSession();
  const canEdit = session?.user?.role === "ADMIN";
  const [sliderImages, setSliderImages] = useState([]);

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
        const [producersRes, sliderRes] = await Promise.all([
          fetch("/api/home"),
          fetch("/api/home/slider"),
        ]);

        const data = await producersRes.json();
        const sliderData = await sliderRes.json();

        setSliderImages(sliderData);

        const newList = [...data].sort(
          (a, b) =>
            new Date(b.user.createdAt).getTime() -
            new Date(a.user.createdAt).getTime(),
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
    return (
      <main className={styles.homePage}>
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
            <p>Carregando produtores...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.homePage}>
        <div className={styles.layout}>
          <div className={styles.errorState}>
            <p>{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.homePage}>
      <div className={styles.layout}>
        <Slider initialImages={sliderImages} canEdit={canEdit} />
        <ProductsRow producers={newProducers} title="Novidades" />
        <ProductsRow producers={topProducers} title="Top Luxence" highlight />
      </div>
    </main>
  );
}
