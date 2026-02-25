"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import styles from "./page.module.css";

import FilterPopup, { extractFilterOptions } from "@/components/FilterPopup/FilterPopup";
import SortDropdown, { SortOption, SortDirection } from "@/components/SortDropdown/SortDropdown";
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

function normalizeGender(gender?: string | null): Gender | null {
  if (!gender) return null;

  const value = gender.toLowerCase();
  if (value === "female" || value === "male" || value === "trans") {
    return value;
  }

  return null;
}

type Gender = "female" | "male" | "trans";

function resolvePreferredGender(preferred?: Gender[] | null): Gender {
  if (preferred?.includes("female")) return "female";
  if (preferred?.includes("male")) return "male";
  return "trans";
}

function resolveInitialGender(session: any): Gender {
  if (!session?.user) return "female";

  // 👉 Caso seja anunciante
  if (session.user.role === "ADVERTISER") {
    const gender = normalizeGender(session.user.gender);
    return gender ?? "female"; // fallback seguro
  }

  // 👉 Caso seja usuário comum
  const preferred = session.user.preferences?.map(
    (p: string) => p.toLowerCase() as Gender
  );

  return resolvePreferredGender(preferred);
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

// Nova função: ordena por critério, depois por plano, depois aleatoriamente
function sortWithSignatureAndRandom<T extends Producer>(
  items: T[],
  compareFn: (a: T, b: T) => number
): T[] {
  const signaturePriority: Record<Signature, number> = {
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

import { ActiveFilters } from "@/components/FilterPopup/FilterPopup";

function applyFilters(producers: Producer[], filters: ActiveFilters, options: ReturnType<typeof extractFilterOptions>) {
  return producers.filter((p) => {
    const profile = p.profile;
    if (!profile) return false;

    // 🔹 Idade
    if (filters.ageRange && options.ageRange) {
      const age = calculateAge(p.birthday);
      
      const minAge = filters.ageRange.min ?? options.ageRange.min;
      const maxAge = filters.ageRange.max ?? options.ageRange.max;

      if (age < minAge || age > maxAge) {
        return false;
      }
    }

    // 🔹 Nacionalidade
    if (filters.nationality?.length) {
      const nationalityKey = p.nationality?.toLowerCase();
      
      if (!nationalityKey || !filters.nationality.includes(nationalityKey)) {
        return false;
      }
    }

    // 🔹 Idiomas
    if (filters.languages?.length) {
      const producerLanguages =
        p.profile.languages?.map((l) => l.name.toLowerCase()) || [];

      const hasMatch = producerLanguages.some((lang) =>
        filters.languages!.includes(lang)
      );

      if (!hasMatch) return false;
    }

    // 🔹 Aparência
    if (filters.appearance) {
      const appearances = profile.appearance || [];

      for (const [key, selectedValues] of Object.entries(filters.appearance)) {
        if (!selectedValues || selectedValues.length === 0) continue;

        const hasMatch = appearances.some((a) => {
          if (a.option.name !== key) return false;

          // booleanos (sim / não)
          if (typeof a.valueBoolean === "boolean") {
            const value = a.valueBoolean ? "sim" : "não";
            return (selectedValues as string[]).includes(value);
          }

          // strings
          if (a.valueString) {
            return (selectedValues as string[]).includes(a.valueString);
          }

          return false;
        });

        if (!hasMatch) {
          return false;
        }
      }
    }

    // 🔹 Dote
    if (filters.doteRange && options.doteRange) {
      const doteAppearance = profile.appearance?.find(
        (a) => a.option.name === "dote"
      );

      if (!doteAppearance || typeof doteAppearance.valueNumber !== "number" || doteAppearance.valueNumber <= 0) {
        return false;
      }

      const minDote = filters.doteRange.min ?? options.doteRange.min;
      const maxDote = filters.doteRange.max ?? options.doteRange.max;

      if (doteAppearance.valueNumber < minDote || doteAppearance.valueNumber > maxDote) {
        return false;
      }
    }

    // 🔹 Audiência
    if (filters.audience?.length) {
      const ids = profile.audience?.map((a) => a.option.id) || [];

      if (!filters.audience.some((id) => ids.includes(id))) {
        return false;
      }
    }

    // 🔹 Serviços
    if (filters.services?.length) {
      const ids = profile.services
        ?.filter((s) => s.status === "yes")
        .map((s) => s.option.id) || [];

      if (!filters.services.some((id) => ids.includes(id))) {
        return false;
      }
    }

    // 🔹 Fetiches
    if (filters.fetiches?.length) {
      const ids = profile.fetiches
        ?.filter((f) => f.status === "yes")
        .map((f) => f.option.id) || [];

      if (!filters.fetiches.some((id) => ids.includes(id))) {
        return false;
      }
    }

    // 🔹 Localização
    if (filters.locations?.length) {
      const ids = profile.locations?.map((l) => l.option.id) || [];

      if (!filters.locations.some((id) => ids.includes(id))) {
        return false;
      }
    }

    // 🔹 Duração
    if (filters.durations?.length) {
      const hasDuration = profile.prices?.some((price) =>
        filters.durations!.includes(price.option.id)
      );

      if (!hasDuration) return false;
    }

    // 🔹 Preço
    if (filters.priceRange && options.priceRange) {
      const prices = profile.prices?.map((p) => p.value).filter((v) => v > 0) || [];
      
      // Se não há preços válidos, não passa no filtro
      if (prices.length === 0) {
        return false;
      }
      
      const minPrice = filters.priceRange.min ?? options.priceRange.min;
      const maxPrice = filters.priceRange.max ?? options.priceRange.max;
      
      // Verifica se há overlap entre o range do produtor e o range selecionado
      const hasOverlap = prices.some(price => price >= minPrice && price <= maxPrice);
      
      if (!hasOverlap) {
        return false;
      }
    }

    // 🔹 Pagamentos
    if (filters.payments?.length) {
      const ids = profile.payments?.map((p) => p.option.id) || [];
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

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
  const [filterOptions, setFilterOptions] = useState<ReturnType<typeof extractFilterOptions> | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    if (status !== "authenticated") return;
    if (hasInitializedGender.current) return;

    const gender = resolveInitialGender(session);

    setSelectedGender(gender);
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
    if (!selectedGender) return [];

    return producers.filter((p) => {
      const gender = normalizeGender(p.user?.gender);
      return gender === selectedGender;
    });
  }, [producers, selectedGender]);

  // Extract filter options from current gender producers
  useEffect(() => {
    if (producersByGender.length > 0) {
      const options = extractFilterOptions(producersByGender);
      setFilterOptions(options);
    }
  }, [producersByGender]);

  // 🔹 Fetch com paginação
  useEffect(() => {
    async function fetchCatalog() {
      try {
        setLoading(true);
        const res = await fetch(`/api/catalog/${uf}?page=1&limit=15`);
        if (!res.ok) throw new Error("Erro ao carregar catálogo");
        const data = await res.json();
        setProducers(data.producers);
        setHasMore(data.pagination.hasMore);
        setPage(1);
      } catch (err) {
        setError("Não foi possível carregar os produtores");
      } finally {
        setLoading(false);
      }
    }

    fetchCatalog();
  }, [uf]);

  // 🔹 Carregar mais produtores
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const res = await fetch(`/api/catalog/${uf}?page=${nextPage}&limit=15`);
      if (!res.ok) throw new Error("Erro ao carregar mais produtores");
      const data = await res.json();
      
      setProducers(prev => [...prev, ...data.producers]);
      setHasMore(data.pagination.hasMore);
      setPage(nextPage);
    } catch (err) {
      console.error("Erro ao carregar mais produtores:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [uf, page, loadingMore, hasMore]);

  // 🔹 Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (loading || loadingMore || !hasMore) return;

      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Carregar mais quando estiver a 300px do final
      if (scrollTop + windowHeight >= documentHeight - 300) {
        loadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, loadingMore, hasMore, loadMore]);

  // 🔹 Filtro simples por gênero (FRONT)
  const visibleProducers = useMemo(() => {
    if (!filterOptions) return orderBySignature(producersByGender);
    
    const filtered = applyFilters(producersByGender, activeFilters, filterOptions);
    
    // Aplicar ordenação
    let sorted: Producer[];
    
    switch (sortBy) {
      case "default":
        // Ordenação padrão: apenas por plano (signature) + aleatoriedade
        sorted = orderBySignature(filtered);
        break;
      
      case "name":
        sorted = sortWithSignatureAndRandom(filtered, (a, b) => {
          const comparison = a.name.localeCompare(b.name);
          return sortDirection === "desc" ? comparison : -comparison;
        });
        break;
      
      case "time":
        sorted = sortWithSignatureAndRandom(filtered, (a, b) => {
          const comparison = new Date(b.user.createdAt).getTime() - new Date(a.user.createdAt).getTime();
          return sortDirection === "desc" ? comparison : -comparison;
        });
        break;
      
      case "views":
        sorted = sortWithSignatureAndRandom(filtered, (a, b) => {
          const comparison = (b.profile?.views || 0) - (a.profile?.views || 0);
          return sortDirection === "desc" ? comparison : -comparison;
        });
        break;
      
      case "rating":
        sorted = sortWithSignatureAndRandom(filtered, (a, b) => {
          const getAvgRating = (producer: Producer) => {
            const reviews = producer.profile?.reviews || [];
            const approvedReviews = reviews.filter((r) => r.isApproved);
            if (approvedReviews.length === 0) return 0;
            const sum = approvedReviews.reduce((acc, r) => acc + r.rating, 0);
            return sum / approvedReviews.length;
          };
          
          const comparison = getAvgRating(b) - getAvgRating(a);
          return sortDirection === "desc" ? comparison : -comparison;
        });
        break;
      
      default:
        sorted = orderBySignature(filtered);
    }
    
    return sorted;
  }, [producersByGender, activeFilters, filterOptions, sortBy, sortDirection]);

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
              <SortDropdown 
                onSortChange={(sort, direction) => {
                  setSortBy(sort);
                  setSortDirection(direction);
                }} 
              />
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

        {loadingMore && (
          <div className={styles.loadingMore}>
            <div className={styles.spinner}></div>
            <p>Carregando mais produtores...</p>
          </div>
        )}

        {!hasMore && visibleProducers.length > 0 && (
          <div className={styles.endMessage}>
            <p>Você chegou ao final da lista.</p>
          </div>
        )}
      </div>
    </div>
  );
}
