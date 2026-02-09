"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Producer } from "@/types/Producer";

import styles from "./page.module.css";

import ProductsRow from "@/components/ProductRow/ProductRow";
import Slider from "@/components/about/Slider/Slider";

interface HomeData {
  new: Producer[];
  topViews: Producer[];
  topReviews: Producer[];
  nearby: Producer[];
}

export default function HomePage() {
  const { data: session } = useSession();
  const canEdit = session?.user?.role === "ADMIN";
  const [sliderImages, setSliderImages] = useState([]);

  const [homeData, setHomeData] = useState<HomeData>({
    new: [],
    topViews: [],
    topReviews: [],
    nearby: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calcula média ponderada das reviews
  function getWeightedAverage(producer: Producer) {
    const reviews = producer.profile.reviews;
    const approvedReviews = reviews.filter((r) => r.isApproved);
    const count = approvedReviews.length;

    if (count === 0) return 0;

    const sum = approvedReviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = sum / count;

    const k = 10;

    return (avg * count) / (count + k);
  }

  // Função para ordenar com plano e aleatoriedade
  function sortWithSignatureAndRandom<T extends Producer>(
    items: T[],
    compareFn: (a: T, b: T) => number
  ): T[] {
    const signaturePriority: Record<string, number> = {
      DIAMOND: 0,
      GOLD: 1,
      SILVER: 2,
      COPPER: 3,
    };

    return [...items].sort((a, b) => {
      // 1. Primeiro critério: função de comparação fornecida
      const primaryComparison = compareFn(a, b);
      if (primaryComparison !== 0) return primaryComparison;

      // 2. Segundo critério: plano (signature)
      const signatureComparison =
        signaturePriority[a.signature] - signaturePriority[b.signature];
      if (signatureComparison !== 0) return signatureComparison;

      // 3. Terceiro critério: aleatório (para desempate)
      return Math.random() - 0.5;
    });
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

        // Aplicar ordenação com plano e aleatoriedade em todas as rows
        
        // Novidades: já vem ordenado por data, aplicar desempate
        const newSorted = sortWithSignatureAndRandom(
          data.new,
          (a, b) => {
            return new Date(b.user.createdAt).getTime() - new Date(a.user.createdAt).getTime();
          }
        );

        // Top Views: já vem ordenado por views, aplicar desempate
        const topViewsSorted = sortWithSignatureAndRandom(
          data.topViews,
          (a, b) => {
            return (b.profile?.views || 0) - (a.profile?.views || 0);
          }
        );

        // Top Reviews: ordenar por média ponderada > plano > aleatoriedade
        const topReviewsSorted = sortWithSignatureAndRandom(
          data.topReviews,
          (a, b) => {
            const wA = getWeightedAverage(a);
            const wB = getWeightedAverage(b);
            return wB - wA;
          }
        );

        // Perto de Você: ordenar por plano > aleatoriedade (sem critério primário)
        const nearbySorted = sortWithSignatureAndRandom(
          data.nearby,
          () => 0 // Sem critério primário, vai direto para plano > aleatoriedade
        );

        setHomeData({
          new: newSorted,
          topViews: topViewsSorted,
          topReviews: topReviewsSorted,
          nearby: nearbySorted,
        });
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
        
        <ProductsRow 
          producers={homeData.new} 
          title="Novidades" 
          maxItems={29}
          sortParam="time"
        />
        
        <ProductsRow 
          producers={homeData.topViews} 
          title="Top Views" 
          highlight 
          maxItems={10}
          sortParam="views"
        />
        
        <ProductsRow 
          producers={homeData.topReviews} 
          title="Top Reviews" 
          maxItems={29}
          sortParam="rating"
        />
        
        {homeData.nearby.length > 0 && (
          <ProductsRow 
            producers={homeData.nearby} 
            title="Perto de Você" 
            maxItems={29}
            sortParam="default"
          />
        )}
      </div>
    </main>
  );
}
