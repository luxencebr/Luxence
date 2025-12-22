"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import styles from "./page.module.css";

import ProductsCatalog from "@/components/ProductsCatalog/ProductsCatalog";

import { Producer } from "@/types/Producer";

export function calculateAge(birthday: string | Date) {
  const birth = new Date(birthday);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

export function getMainImage(producer: Producer) {
  return producer.profile.images?.[0]?.url || "/placeholder.jpg";
}

export function getAverageRating(producer: Producer) {
  const reviews = producer.profile.reviews || [];
  if (!reviews.length) return null;

  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return total / reviews.length;
}

export function normalizeGender(gender: string) {
  return gender.toLowerCase();
}

type Gender = "female" | "male" | "trans";

function resolvePreferredGender(preferred?: Gender[] | null): Gender {
  if (preferred?.includes("female")) return "female";
  if (preferred?.includes("male")) return "male";
  return "trans";
}

type Signature = "DIAMOND" | "GOLD" | "SILVER" | "COPPER";

function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function orderBySignature(items: Producer[]): Producer[] {
  const priority: Signature[] = ["DIAMOND", "GOLD", "SILVER", "COPPER"];

  return priority.flatMap((level) =>
    shuffle(items.filter((item) => item.signature === level))
  );
}

interface CatalogProps {
  params: { uf: string };
}

export default function CatalogPage({ params }: CatalogProps) {
  const uf = params.uf.toUpperCase();

  const { data: session, status } = useSession();

  const [producers, setProducers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedGender, setSelectedGender] = useState<
    "female" | "male" | "trans" | null
  >("female");

  const selectorRef = useRef<HTMLDivElement>(null);
  const [highlightStyle, setHighlightStyle] = useState({
    width: 0,
    left: 0,
  });

  const hasInitializedGender = useRef(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (hasInitializedGender.current) return;

    const preferred = session.user?.preferredGenders as
      | ("female" | "male" | "trans")[]
      | undefined;

    const resolvedGender = resolvePreferredGender(preferred);

    setSelectedGender(resolvedGender);
    hasInitializedGender.current = true;
  }, [status, session]);

  useEffect(() => {
    if (!selectorRef.current || !selectedGender) return;

    const buttons = Array.from(
      selectorRef.current.querySelectorAll<HTMLButtonElement>("button")
    );

    const index = ["female", "male", "trans"].indexOf(selectedGender);
    const button = buttons[index];

    if (button) {
      setHighlightStyle({
        width: button.offsetWidth,
        left: button.offsetLeft,
      });
    }
  }, [selectedGender, loading]);

  // 🔹 Fetch simples
  useEffect(() => {
    async function fetchCatalog() {
      try {
        setLoading(true);
        const res = await fetch(`/api/catalog/${uf}`);
        if (!res.ok) throw new Error("Erro ao carregar catálogo");
        const data = await res.json();
        setProducers(data);
      } catch (err) {
        setError("Não foi possível carregar os produtores");
      } finally {
        setLoading(false);
      }
    }

    fetchCatalog();
  }, [uf]);

  // 🔹 Filtro simples por gênero (FRONT)
  const visibleProducers = useMemo(() => {
    const filtered = producers.filter((p) => {
      const gender = normalizeGender(p.user.gender);
      return gender === selectedGender;
    });

    return orderBySignature(filtered);
  }, [producers, selectedGender]);

  if (loading) {
    return (
      <div className={styles.catalogPage}>
        <div className={styles.layout}>
          <div className={styles.loadingState}>
            <img
              src="/ExenceLogo.svg"
              alt=""
              style={{
                height: "128px",
                aspectRatio: "1 / 1",
              }}
            />
            <p>Carregando produtores...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.catalogPage}>
        <div className={styles.layout}>
          <div className={styles.errorState}>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.catalogPage}>
      <header className={styles.header}>
        <h1>
          Acompanhantes em <strong>{uf}</strong>
        </h1>

        <div className={styles.genderSelector} ref={selectorRef}>
          <div
            className={styles.highlight}
            style={{
              width: highlightStyle.width,
              transform: `translateX(${highlightStyle.left}px)`,
            }}
          />

          {["female", "male", "trans"].map((gender) => {
            const isSelected = selectedGender === gender;

            return (
              <button
                key={gender}
                className={`${styles.genderButton} ${
                  isSelected ? styles.selected : ""
                }`}
                onClick={() => setSelectedGender(gender as any)}
              >
                {gender === "female" && "Mulheres"}
                {gender === "male" && "Homens"}
                {gender === "trans" && "Trans"}
              </button>
            );
          })}
        </div>
      </header>

      <ProductsCatalog
        producers={visibleProducers.map((p) => ({
          ...p,
          age: calculateAge(p.birthday),
        }))}
      />
    </div>
  );
}
