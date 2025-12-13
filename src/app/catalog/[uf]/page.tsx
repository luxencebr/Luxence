"use client";

import { useRef, useEffect, useState, useMemo, use } from "react";
import styles from "./page.module.css";

import FilterPopup from "@/components/FilterPopup/FilterPopup";
import ProductsCatalog from "@/components/ProductsCatalog/ProductsCatalog";
import Dropdown from "@/components/ui/Dropdown/Dropdown";
import LocalPopup from "@/components/LocalPopup/LocalPopup";

interface CatalogProps {
  params: Promise<{ uf: string }>;
}

function getUniqueGenders(producers: any[]) {
  const genders = new Set(
    producers
      .map((p) => p.profile?.gender)
      .filter((g): g is NonNullable<typeof g> => g !== undefined)
  );
  return Array.from(genders);
}

function getUniqueFilters(producers: any[]) {
  const filters: Record<string, Record<string, any>> = {
    Perfil: {},
    Aparência: {},
    Serviços: {},
    Preços: {},
  };

  const pathLabelMap: Record<string, string> = {};

  const nationalitySet = new Set<string>();
  producers.forEach((p) => {
    if (p.nationality) nationalitySet.add(p.nationality);
  });
  if (nationalitySet.size > 0) {
    filters["Perfil"]["profile.nationality"] = Array.from(nationalitySet);
    pathLabelMap["profile.nationality"] = "Nacionalidade";
  }

  const languageSet = new Set<string>();
  producers.forEach((p) => {
    const languages = p.profile?.languages || [];
    languages.forEach((lang: any) => {
      if (typeof lang === "string") languageSet.add(lang);
      else if (lang?.name) languageSet.add(lang.name);
    });
  });
  if (languageSet.size > 0) {
    filters["Perfil"]["profile.languages"] = Array.from(languageSet);
    pathLabelMap["profile.languages"] = "Línguas";
  }

  const scholaritySet = new Set<string>();
  producers.forEach((p) => {
    const scholarity = p.profile?.scholarity;
    if (scholarity) {
      if (typeof scholarity === "string") scholaritySet.add(scholarity);
      else if (scholarity?.level) scholaritySet.add(scholarity.level);
    }
  });
  if (scholaritySet.size > 0) {
    filters["Perfil"]["profile.scholarity"] = Array.from(scholaritySet);
    pathLabelMap["profile.scholarity"] = "Escolaridade";
  }

  const simpleAttributes = [
    "appearance.Etnia",
    "appearance.Cabelo",
    "appearance.Olhos",
  ];
  simpleAttributes.forEach((path) => {
    const values = new Set<string>();
    producers.forEach((p) => {
      const parts = path.split(".");
      let value: any = p;
      for (const part of parts) value = value?.[part];
      if (value != null) values.add(value);
    });
    if (values.size > 0) {
      const label = path.split(".").pop()!;
      filters["Aparência"][path] = Array.from(values);
      pathLabelMap[path] = label;
    }
  });

  const rangeAttributes = [
    "appearance.Altura",
    "appearance.Manequim",
    "appearance.Pés",
  ];
  rangeAttributes.forEach((path) => {
    const values: number[] = [];
    producers.forEach((p) => {
      const parts = path.split(".");
      let value: any = p;
      for (const part of parts) value = value?.[part];
      if (typeof value === "number") values.push(value);
    });
    if (values.length > 0) {
      const label = path.split(".").pop()!;
      filters["Aparência"][path] = {
        min: Math.min(...values),
        max: Math.max(...values),
      };
      pathLabelMap[path] = label;
    }
  });

  const servicePath: Record<string, string> = {
    Atende: "services.Atende",
    Oferece: "services.Oferece",
    Fetiches: "services.Fetiches",
  };

  producers.forEach((p) => {
    const serviceOptions = ["mans", "women", "couple", "group"];
    serviceOptions.forEach((s) => {
      if (p.services && p.services[s as keyof typeof p.services]) {
        if (!filters["Serviços"][servicePath.Atende])
          filters["Serviços"][servicePath.Atende] = [];
        if (!filters["Serviços"][servicePath.Atende].includes(s))
          filters["Serviços"][servicePath.Atende].push(s);
      }
    });

    if (p.services?.offered) {
      const offeredOptions = Object.entries(p.services.offered).filter(
        ([k, v]) => k !== "fetishes" && v
      );
      offeredOptions.forEach(([k]) => {
        if (!filters["Serviços"][servicePath.Oferece])
          filters["Serviços"][servicePath.Oferece] = [];
        if (!filters["Serviços"][servicePath.Oferece].includes(k))
          filters["Serviços"][servicePath.Oferece].push(k);
      });

      if (p.services.offered.fetishes) {
        Object.entries(p.services.offered.fetishes).forEach(([f, v]) => {
          if (v) {
            if (!filters["Serviços"][servicePath.Fetiches])
              filters["Serviços"][servicePath.Fetiches] = [];
            if (!filters["Serviços"][servicePath.Fetiches].includes(f))
              filters["Serviços"][servicePath.Fetiches].push(f);
          }
        });
      }
    }
  });

  pathLabelMap[servicePath.Atende] = "Atende";
  pathLabelMap[servicePath.Oferece] = "Oferece";
  pathLabelMap[servicePath.Fetiches] = "Fetiches";

  const pricePath: Record<string, string> = {
    Preço: "prices.price",
    Tempo: "prices.duration",
  };

  const priceValues: number[] = [];
  const priceLabels = new Set<string>();
  producers.forEach((p) => {
    if (p.prices) {
      p.prices.forEach((pr: any) => {
        if (typeof pr.price === "number") priceValues.push(pr.price);
        if (pr.duration) priceLabels.add(pr.duration);
      });
    }
  });

  if (priceValues.length > 0) {
    filters["Preços"][pricePath.Preço] = {
      min: Math.min(...priceValues),
      max: Math.max(...priceValues),
    };
    pathLabelMap[pricePath.Preço] = "Preço";
  }
  if (priceLabels.size > 0) {
    filters["Preços"][pricePath.Tempo] = Array.from(priceLabels);
    pathLabelMap[pricePath.Tempo] = "Tempo";
  }

  return { filters, pathLabelMap };
}

export default function Catalog({ params }: CatalogProps) {
  const { uf } = use(params);
  const normalizedUf = uf.toUpperCase();

  const [producers, setProducers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducers() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/catalog/${normalizedUf}`);
        if (!response.ok) {
          throw new Error("Erro ao buscar produtores");
        }
        const data = await response.json();
        setProducers(data);
      } catch (err) {
        console.error("[v0] Erro ao buscar produtores:", err);
        setError("Não foi possível carregar os produtores");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducers();
  }, [normalizedUf]);

  const desiredGenderOrder = ["female", "male", "femaletrans", "trans"];

  const genderFilters = useMemo(() => {
    const rawGenderFilters = getUniqueGenders(producers);
    return rawGenderFilters.sort(
      (a, b) => desiredGenderOrder.indexOf(a) - desiredGenderOrder.indexOf(b)
    );
  }, [producers]);

  const [selectedGender, setSelectedGender] = useState<string | null>("female");

  function genderDisplayName(gender: string) {
    switch (gender) {
      case "female":
        return "Mulheres";
      case "male":
        return "Homens";
      case "femaletrans":
      case "trans":
        return "Trans";
      default:
        return gender;
    }
  }

  const selectorRef = useRef<HTMLDivElement>(null);
  const [highlightStyle, setHighlightStyle] = useState({ width: 0, left: 0 });

  useEffect(() => {
    if (!selectorRef.current) return;
    const buttons = Array.from(
      selectorRef.current.querySelectorAll<HTMLButtonElement>("button")
    );
    const index = selectedGender ? genderFilters.indexOf(selectedGender) : -1;
    const btn = buttons[index];

    if (btn) {
      setHighlightStyle({
        width: btn.offsetWidth,
        left: btn.offsetLeft,
      });
    }
  }, [selectedGender, genderFilters]);

  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>(
    {}
  );

  const filteredProducers = useMemo(() => {
    let filtered = [...producers];

    if (selectedGender) {
      filtered = filtered.filter((p) => {
        const gender = p.profile?.gender?.toLowerCase();
        if (selectedGender === "trans") {
          return gender === "trans" || gender === "femaletrans";
        }
        return gender === selectedGender;
      });
    }

    Object.entries(selectedFilters).forEach(([path, value]) => {
      if (value == null || value.length === 0) return;

      filtered = filtered.filter((producer) => {
        if (path === "profile.nationality") {
          return value.includes(producer.nationality);
        }
        if (path === "profile.languages") {
          const languages = producer.profile?.languages || [];
          return languages.some((lang: any) => {
            if (typeof lang === "string") return value.includes(lang);
            return value.includes(lang?.name);
          });
        }
        if (path === "profile.scholarity") {
          const scholarity = producer.profile?.scholarity;
          if (typeof scholarity === "string") return value.includes(scholarity);
          return value.includes(scholarity?.level);
        }

        if (path.startsWith("appearance.")) {
          const keys = path.split(".");
          let fieldValue: any = producer;
          for (const k of keys) {
            fieldValue = fieldValue?.[k];
            if (fieldValue === undefined) return false;
          }

          if (typeof value === "object" && "min" in value && "max" in value) {
            return (
              typeof fieldValue === "number" &&
              fieldValue >= value.min &&
              fieldValue <= value.max
            );
          } else if (Array.isArray(value)) {
            return value.includes(fieldValue);
          } else {
            return fieldValue === value;
          }
        }

        if (path === "services.Atende") {
          return value.some(
            (option: string) =>
              producer.services?.[option as keyof typeof producer.services]
          );
        }
        if (path === "services.Oferece") {
          return value.every(
            (option: string) =>
              producer.services?.offered?.[
                option as keyof typeof producer.services.offered
              ]
          );
        }
        if (path === "services.Fetiches") {
          return value.every(
            (option: string) =>
              producer.services?.offered?.fetishes?.[
                option as keyof typeof producer.services.offered.fetishes
              ]
          );
        }

        if (path === "prices.price") {
          if (typeof value === "object" && "min" in value && "max" in value) {
            return producer.prices?.some(
              (pr: any) =>
                typeof pr.price === "number" &&
                pr.price >= value.min &&
                pr.price <= value.max
            );
          }
          return false;
        }
        if (path === "prices.duration") {
          return producer.prices?.some((pr: any) =>
            value.includes(pr.duration)
          );
        }

        return false;
      });
    });

    return filtered;
  }, [producers, selectedGender, selectedFilters]);

  function applyFilters(newFilters: Record<string, any>) {
    setSelectedFilters(newFilters);
  }

  function clearAllFilters() {
    setSelectedFilters({});
  }

  const [sortOption, setSortOption] = useState<
    "name" | "price" | "rating" | null
  >(null);

  function getSortLabel(option: typeof sortOption) {
    switch (option) {
      case "name":
        return "Nome";
      case "price":
        return "Preço";
      case "rating":
        return "Avaliação";
      default:
        return "Ordenar";
    }
  }

  const sortedProducers = useMemo(() => {
    const sorted = [...filteredProducers];

    switch (sortOption) {
      case "name":
        sorted.sort((a, b) =>
          (a.profile?.name || "").localeCompare(b.profile?.name || "")
        );
        break;

      case "price":
        sorted.sort(
          (a, b) => (a.prices?.[0]?.price || 0) - (b.prices?.[0]?.price || 0)
        );
        break;

      case "rating":
        sorted.sort((a, b) => {
          const avgA =
            a.reviews && a.reviews.length
              ? a.reviews.reduce(
                  (sum: number, r: any) => sum + (r.rating || 0),
                  0
                ) / a.reviews.length
              : null;
          const avgB =
            b.reviews && b.reviews.length
              ? b.reviews.reduce(
                  (sum: number, r: any) => sum + (r.rating || 0),
                  0
                ) / b.reviews.length
              : null;

          if (avgA !== null && avgB !== null) {
            return avgB - avgA;
          }

          if (avgA === null && avgB !== null) return 1;
          if (avgA !== null && avgB === null) return -1;

          return 0;
        });
        break;

      default:
        break;
    }

    return sorted;
  }, [filteredProducers, sortOption]);

  const { filters: availableFilters, pathLabelMap } = useMemo(() => {
    const baseList = selectedGender
      ? producers.filter((p) => {
          const gender = p.profile?.gender?.toLowerCase();
          if (selectedGender === "trans") {
            return gender === "trans" || gender === "femaletrans";
          }
          return gender === selectedGender;
        })
      : producers;

    return getUniqueFilters(baseList);
  }, [producers, selectedGender]);

  function getPopularFilterTags(
    producers: any[],
    pathLabelMap: Record<string, string>,
    limit = 10
  ) {
    const tagMap = new Map<string, any>();

    producers.forEach((p) => {
      // Nacionalidade
      if (p.nationality) {
        const key = `profile.nationality:${p.nationality}`;
        tagMap.set(key, {
          path: "profile.nationality",
          label: "Nacionalidade",
          value: p.nationality,
          count: (tagMap.get(key)?.count || 0) + 1,
        });
      }

      // Línguas
      p.profile?.languages?.forEach((lang: any) => {
        const value = typeof lang === "string" ? lang : lang?.name;
        if (!value) return;

        const key = `profile.languages:${value}`;
        tagMap.set(key, {
          path: "profile.languages",
          label: "Línguas",
          value,
          count: (tagMap.get(key)?.count || 0) + 1,
        });
      });

      // Aparência simples
      ["Etnia", "Cabelo", "Olhos"].forEach((attr) => {
        const value = p.appearance?.[attr];
        if (!value) return;

        const path = `appearance.${attr}`;
        const key = `${path}:${value}`;

        tagMap.set(key, {
          path,
          label: attr,
          value,
          count: (tagMap.get(key)?.count || 0) + 1,
        });
      });

      // Serviços - Atende
      ["mans", "women", "couple", "group"].forEach((opt) => {
        if (p.services?.[opt]) {
          const key = `services.Atende:${opt}`;
          tagMap.set(key, {
            path: "services.Atende",
            label: "Atende",
            value: opt,
            count: (tagMap.get(key)?.count || 0) + 1,
          });
        }
      });
    });

    return Array.from(tagMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  const popularTags = useMemo(() => {
    const baseList = selectedGender
      ? producers.filter((p) => {
          const gender = p.profile?.gender?.toLowerCase();
          if (selectedGender === "trans") {
            return gender === "trans" || gender === "femaletrans";
          }
          return gender === selectedGender;
        })
      : producers;

    return getPopularFilterTags(baseList, pathLabelMap, 8);
  }, [producers, selectedGender, pathLabelMap]);

  if (isLoading) {
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
      <div className={styles.layout}>
        <div className={styles.genderSelector} ref={selectorRef}>
          <div
            className={styles.highlight}
            style={{
              width: highlightStyle.width,
              transform: `translateX(${highlightStyle.left}px)`,
            }}
          />
          {genderFilters.map((gender) => {
            const isSelected = selectedGender === gender;
            return (
              <button
                key={gender}
                className={`${styles.genderButton} ${
                  isSelected ? styles.selected : ""
                }`}
                onClick={() => setSelectedGender(isSelected ? null : gender)}
              >
                {genderDisplayName(gender)}
              </button>
            );
          })}
        </div>
        <div className={styles.welcomeText}>
          <p>
            Encontre{" "}
            <span className={styles.gender}>
              {" "}
              {selectedGender ? genderDisplayName(selectedGender) : "todos"}
            </span>{" "}
            acompanhantes em <span className={styles.uf}>{uf}</span>
          </p>
        </div>
        <div className={styles.tags}>
          <h2>Populares: </h2>
          {popularTags.map((tag) => {
            const isActive = selectedFilters[tag.path]?.includes(tag.value);

            return (
              <button
                key={`${tag.path}-${tag.value}`}
                className={`${styles.tag} ${isActive ? styles.activeTag : ""}`}
                onClick={() => {
                  const currentValues = selectedFilters[tag.path] || [];

                  applyFilters({
                    ...selectedFilters,
                    [tag.path]: isActive
                      ? currentValues.filter((v: any) => v !== tag.value)
                      : [...currentValues, tag.value],
                  });
                }}
              >
                <span className={styles.tagLabel}>
                  {tag.label}: {tag.value}
                </span>
              </button>
            );
          })}
        </div>

        <div className={styles.productsOptions}>
          <div className={styles.left}>
            <FilterPopup
              filters={availableFilters}
              pathLabelMap={pathLabelMap}
              currentSelectedFilters={selectedFilters}
              onApplyFilters={applyFilters}
              onClearAllFilters={clearAllFilters}
              producers={producers}
            />
            <Dropdown
              trigger={<span>{getSortLabel(sortOption)}</span>}
              containerClassName=""
              triggerClassName={styles.orderTrigger}
              menuClassName={styles.orderMenu}
            >
              <button onClick={() => setSortOption("name")}>Nome</button>
              <button onClick={() => setSortOption("price")}>Preço</button>
              <button onClick={() => setSortOption("rating")}>Avaliação</button>
            </Dropdown>
          </div>
          <div className={styles.right}>
            <LocalPopup />
          </div>
        </div>
        <ProductsCatalog producers={sortedProducers} />
      </div>
    </div>
  );
}
