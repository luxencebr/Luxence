"use client";

import { useRef, useEffect, useState, useMemo, use } from "react";
import styles from "./page.module.css";
import { IoFilterOutline } from "react-icons/io5";

import FilterPopup from "@/components/FilterPopup/FilterPopup";
import ProductsCatalog from "@/components/ProductsCatalog/ProductsCatalog";

import type { Producer } from "@/types/Producer";
import allProducers from "@/data/producers";
import Dropdown from "@/components/ui/Dropdown/Dropdown";

interface CatalogProps {
  params: Promise<{ uf: string }>;
}

function getUniqueGenders(producers: Producer[]) {
  const genders = new Set(
    producers
      .map((p) => p.profile.gender)
      .filter((g): g is NonNullable<typeof g> => g !== undefined)
  );
  return Array.from(genders);
}

function getUniqueFilters(producers: Producer[]) {
  const filters: Record<string, Record<string, any>> = {
    Perfil: {},
    Aparência: {},
    Serviços: {},
    Preços: {},
  };

  const pathLabelMap: Record<string, string> = {};

  const nationalitySet = new Set<string>();
  producers.forEach((p) => {
    if (p.profile.nationality) nationalitySet.add(p.profile.nationality);
  });
  if (nationalitySet.size > 0) {
    filters["Perfil"]["profile.nationality"] = Array.from(nationalitySet);
    pathLabelMap["profile.nationality"] = "Nacionalidade";
  }

  const languageSet = new Set<string>();
  producers.forEach((p) => {
    p.profile.languages?.forEach((lang) => languageSet.add(lang.name));
  });
  if (languageSet.size > 0) {
    filters["Perfil"]["profile.languages"] = Array.from(languageSet);
    pathLabelMap["profile.languages"] = "Línguas";
  }

  const scholaritySet = new Set<string>();
  producers.forEach((p) => {
    if (p.profile.scholarity?.level)
      scholaritySet.add(p.profile.scholarity.level);
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
      if (p.services && p.services[s as keyof Producer["services"]]) {
        if (!filters["Serviços"][servicePath.Atende])
          filters["Serviços"][servicePath.Atende] = [];
        if (!filters["Serviços"][servicePath.Atende].includes(s))
          filters["Serviços"][servicePath.Atende].push(s);
      }
    });

    if (p.services.offered) {
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

  // Chaves de Preço
  const pricePath: Record<string, string> = {
    Preço: "prices.price",
    Tempo: "prices.duration",
  };

  const priceValues: number[] = [];
  const priceLabels = new Set<string>();
  producers.forEach((p) => {
    if (p.prices) {
      p.prices.forEach((pr) => {
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

  const producersByUf = useMemo(
    () => allProducers.filter((p) => p.locality.state === normalizedUf),
    [normalizedUf]
  );

  const desiredGenderOrder = ["female", "male", "femaletrans"];

  const genderFilters = useMemo(() => {
    const rawGenderFilters = getUniqueGenders(producersByUf);
    return rawGenderFilters.sort(
      (a, b) => desiredGenderOrder.indexOf(a) - desiredGenderOrder.indexOf(b)
    );
  }, [producersByUf]);

  const [selectedGender, setSelectedGender] = useState<
    "male" | "female" | "femaletrans" | null
  >("female");

  function genderDisplayName(gender: string) {
    switch (gender) {
      case "female":
        return "Mulheres";
      case "male":
        return "Homens";
      case "femaletrans":
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
    let filtered = [...producersByUf];

    if (selectedGender) {
      filtered = filtered.filter((p) => p.profile.gender === selectedGender);
    }

    Object.entries(selectedFilters).forEach(([path, value]) => {
      if (value == null || value.length === 0) return;

      filtered = filtered.filter((producer) => {
        if (path === "profile.nationality") {
          return value.includes(producer.profile.nationality);
        }
        if (path === "profile.languages") {
          return producer.profile.languages?.some((lang) =>
            value.includes(lang.name)
          );
        }
        if (path === "profile.scholarity") {
          return value.includes(producer.profile.scholarity?.level);
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
              producer.services?.[option as keyof Producer["services"]]
          );
        }
        if (path === "services.Oferece") {
          return value.every(
            (option: string) =>
              producer.services.offered?.[
                option as keyof Producer["services"]["offered"]
              ]
          );
        }
        if (path === "services.Fetiches") {
          return value.every(
            (option: string) =>
              producer.services.offered?.fetishes?.[
                option as keyof Producer["services"]["offered"]["fetishes"]
              ]
          );
        }

        if (path === "prices.price") {
          if (typeof value === "object" && "min" in value && "max" in value) {
            return producer.prices?.some(
              (pr) =>
                typeof pr.price === "number" &&
                pr.price >= value.min &&
                pr.price <= value.max
            );
          }
          return false;
        }
        if (path === "prices.duration") {
          return producer.prices?.some((pr) => value.includes(pr.duration));
        }

        return false;
      });
    });

    return filtered;
  }, [producersByUf, selectedGender, selectedFilters]);

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
        sorted.sort((a, b) => a.profile.name.localeCompare(b.profile.name));
        break;

      case "price":
        sorted.sort(
          (a, b) => (a.prices?.[1]?.price || 0) - (b.prices?.[1]?.price || 0)
        );
        break;

      case "rating":
        sorted.sort((a, b) => {
          const avgA =
            a.reviews && a.reviews.length
              ? a.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
                a.reviews.length
              : null;
          const avgB =
            b.reviews && b.reviews.length
              ? b.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
                b.reviews.length
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
      ? producersByUf.filter((p) => p.profile.gender === selectedGender)
      : producersByUf;

    return getUniqueFilters(baseList);
  }, [producersByUf, selectedGender]);

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
        <div className={styles.productsOptions}>
          <FilterPopup
            filters={availableFilters}
            pathLabelMap={pathLabelMap}
            currentSelectedFilters={selectedFilters}
            onApplyFilters={applyFilters}
            onClearAllFilters={clearAllFilters}
            producers={producersByUf}
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
        <ProductsCatalog producers={sortedProducers} />
      </div>
    </div>
  );
}
