"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import styles from "./page.module.css";

import FilterPopup from "@/components/FilterPopup/FilterPopup";
// import SortDropdown from "@/components/SortDropdown/SortDropdown";
// import DistancePopup from "@/components/DistancePopup/DistancePopup";
import ProductsCatalog from "@/components/ProductsCatalog/ProductsCatalog";

import { Producer } from "@/types/Producer";

function calculateAge(birthday: string | Date) {
  const birth = new Date(birthday);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

function normalizeGender(gender: string) {
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

import { ActiveFilters } from "@/components/FilterPopup/FilterPopup";

function applyFilters(producers: Producer[], filters: ActiveFilters) {
  return producers.filter((p) => {
    const profile = p.profile;
    if (!profile) return false;

    if (filters.ageRange) {
      const age = calculateAge(p.birthday);

      if (filters.ageRange.min !== undefined && age < filters.ageRange.min) {
        return false;
      }

      if (filters.ageRange.max !== undefined && age > filters.ageRange.max) {
        return false;
      }
    }

    if (filters.nationality?.length) {
      const nationalityKey = p.nationality.toLowerCase();
      const nationalityId = nationalityKey.length;

      if (!filters.nationality.includes(nationalityId)) {
        return false;
      }
    }

    if (filters.languages?.length) {
      const producerLanguages =
        p.profile.languages?.map((l) => l.name.toLowerCase().length) || [];

      const hasMatch = producerLanguages.some((id) =>
        filters.languages!.includes(id)
      );

      if (!hasMatch) return false;
    }

    // 🔹 Local
    if (filters.hasLocal !== undefined) {
      if (profile.hasLocal !== filters.hasLocal) return false;
    }

    // 🔹 Verificação
    if (filters.verified && !p.isVerified) return false;

    // 🔹 Serviços
    if (filters.services?.length) {
      const ids = profile.services
        .filter((s) => s.status === "yes")
        .map((s) => s.option.id);

      if (!filters.services.some((id) => ids.includes(id))) {
        return false;
      }
    }

    // 🔹 Fetiches
    if (filters.fetiches?.length) {
      const ids = profile.fetiches
        .filter((f) => f.status === "yes")
        .map((f) => f.option.id);

      if (!filters.fetiches.some((id) => ids.includes(id))) {
        return false;
      }
    }

    if (filters.durations?.length) {
      producers = producers.filter((p) =>
        p.profile?.prices?.some((price) =>
          filters.durations!.includes(price.option.id)
        )
      );
    }

    // 🔹 Preço
    if (filters.priceRange) {
      const prices = profile.prices.map((p) => p.value);
      if (
        (filters.priceRange.min &&
          Math.min(...prices) < filters.priceRange.min) ||
        (filters.priceRange.max && Math.max(...prices) > filters.priceRange.max)
      ) {
        return false;
      }
    }

    // 🔹 Pagamentos
    if (filters.payments?.length) {
      const ids = profile.payments.map((p) => p.option.id);
      if (!filters.payments.some((id) => ids.includes(id))) return false;
    }

    return true;
  });
}

export default function CatalogPage() {
  const params = useParams<{ uf: string }>();
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

  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});

  useEffect(() => {
    if (status !== "authenticated") return;
    if (hasInitializedGender.current) return;

    const preferred = session.user?.preferences?.map(
      (p) => p.toLowerCase() as Gender
    );

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

  const producersByGender = useMemo(() => {
    return producers.filter((p) => {
      return normalizeGender(p.user.gender) === selectedGender;
    });
  }, [producers, selectedGender]);

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
    const filtered = applyFilters(producersByGender, activeFilters);
    return orderBySignature(filtered);
  }, [producersByGender, activeFilters]);

  if (loading) {
    return (
      <div className={styles.catalogPage}>
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
      <div className={styles.layout}>
        <header className={styles.header}>
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

          <h1 className={styles.welcomeText}>
            Encontre acompanhantes{" "}
            <strong className={styles.gender}>
              {selectedGender === "female" && "Mulheres"}
              {selectedGender === "male" && "Homens"}
              {selectedGender === "trans" && "Trans"}
            </strong>{" "}
            em <strong>{uf}</strong>
          </h1>

          <div className={styles.catalogOptions}>
            <div className={styles.left}>
              <FilterPopup
                producers={producersByGender}
                onApply={setActiveFilters}
              />
              {/* <SortDropdown /> */}
            </div>
            <div className={styles.right}>{/* <DistancePopup /> */}</div>
          </div>
        </header>

        <ProductsCatalog
          producers={visibleProducers.map((p) => ({
            ...p,
            age: calculateAge(p.birthday),
          }))}
        />
      </div>
    </div>
  );
}
