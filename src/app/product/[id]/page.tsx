"use client";

import * as React from "react";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

import type { Producer } from "@/types/Producer";

import ProductShowcase from "@/components/ProductShowcase/ProductShowcase";
import ProductAbout from "@/components/ProductAbout/ProductAbout";
import ProductServices from "@/components/ProductServices/ProductServices";
import ProductFetiches from "@/components/ProductFetiches/ProductFetiches";
import ProductValues from "@/components/ProductValues/ProductValues";
import ProductLocation from "@/components/ProductLocation/ProductLocation";
import ProductReviews from "@/components/ProductReviews/ProductReviews";

import styles from "./page.module.css";
import ProductAudience from "@/components/ProductAudience/ProductAudience";
import ProductAppearance from "@/components/ProductAppearance/ProductAppearance";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const { data: session } = useSession();

  const { id } = React.use(params);
  const [producer, setProducer] = React.useState<Producer | null>(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const fetchProducer = async () => {
      try {
        const response = await fetch(`/api/producers/${id}`);
        if (!response.ok) throw new Error("Perfil não encontrado");
        const data = await response.json();
        setProducer(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducer();
  }, [id]);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const targetId = hash.substring(1);
    const element = document.getElementById(targetId);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, []);

  if (loading || !producer) {
    return (
      <div className={styles.loadingContainer}>
        <img
          src="/LuxenceLogo.png"
          alt=""
          style={{
            height: "128px",
            aspectRatio: "1 / 1",
            objectFit: "cover",
          }}
        />
        {loading && <p>Carregando Perfil</p>}
        {!loading && !producer && <p>Produto não encontrado</p>}
      </div>
    );
  }

  const canEdit = Number(session?.user?.producerId) === producer.id;

  return (
    <div className={styles.productPage}>
      <div className={styles.layout}>
        <ProductShowcase producer={producer} canEdit={canEdit} />
        <ProductAbout producer={producer} canEdit={canEdit} />
        <ProductAppearance producer={producer} canEdit={canEdit} />
        <ProductAudience producer={producer} canEdit={canEdit} />
        <ProductServices producer={producer} canEdit={canEdit} />
        <ProductFetiches producer={producer} canEdit={canEdit} />
        <ProductValues producer={producer} canEdit={canEdit} />
        <ProductLocation producer={producer} canEdit={canEdit} />
        <ProductReviews producer={producer} />
      </div>
    </div>
  );
}
