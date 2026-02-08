"use client";

import { useMemo, useState, useEffect } from "react";
import { Range } from "react-range";

import type { Producer } from "@/types/Producer";
import Popup from "../ui/Popup/Popup";
import styles from "./FilterPopup.module.css";
import { CiFilter } from "react-icons/ci";
import { IoCloseOutline } from "react-icons/io5";

const APPEARANCE_VALUE_LABELS: Record<string, Record<string, string>> = {
  ethnicity: {
    oriental: "Oriental",
    branco: "Branco",
    moreno: "Morena",
    preto: "Preto",
  },
  hair_color: {
    branco: "Branco",
    castanho: "Castanho",
    colorido: "Colorido",
    loiro: "Loiro",
    preto: "Preto",
    ruivo: "Ruivo",
  },
  eye_color: {
    azul: "Azul",
    castanho: "Castanho",
    mel: "Mel",
    preto: "Preto",
    verde: "Verde",
  },
  body_type: {
    madura: "Madura",
    magra: "Magra",
    mignon: "Mignon",
    ninfeta: "Ninfeta",
    plus_size: "Plus Size",
  },
  breast_size: {
    pequeno: "Pequeno",
    médio: "Médio",
    grande: "Grande",
  },
  butt_size: {
    pequeno: "Pequeno",
    médio: "Médio",
    grande: "Grande",
  },
  pubis: {
    depilado: "Depilado",
    aparado: "Aparado",
    natural: "Natural",
  },
};

export interface ActiveFilters {
  ageRange?: {
    min?: number;
    max?: number;
  };

  nationality?: number[];
  durations?: number[];
  priceRange?: {
    min?: number;
    max?: number;
  };
  payments?: number[];

  audience?: number[];
  languages?: number[];
  services?: number[];
  fetiches?: number[];
  locations?: number[];

  appearance?: {
    ethnicity?: string[];
    hair_color?: string[];
    eye_color?: string[];
    body_type?: string[];
    breast_size?: string[];
    butt_size?: string[];
    pubis?: string[];
    tatuagens?: ("sim" | "não")[];
    piercings?: ("sim" | "não")[];
    silicone_busto?: ("sim" | "não")[];
    silicone_quadril?: ("sim" | "não")[];
  };
}

function getAge(birthday: Date) {
  const today = new Date();
  const birth = new Date(birthday);

  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

export function extractFilterOptions(producers: Producer[]) {
  const services = new Map<number, any>();
  const fetiches = new Map<number, any>();
  const audiences = new Map<number, any>();
  const locations = new Map<number, any>();
  const payments = new Map<number, any>();
  const durations = new Map<number, any>();
  const nationalities = new Map<
    number,
    { id: number; label: string; value: string }
  >();
  const languages = new Map<
    number,
    { id: number; label: string; value: string }
  >();

  const appearanceOptions = {
    ethnicity: new Set<string>(),
    hair_color: new Set<string>(),
    eye_color: new Set<string>(),
    body_type: new Set<string>(),
    breast_size: new Set<string>(),
    butt_size: new Set<string>(),
    pubis: new Set<string>(),
    tatuagens: new Set<string>(),
    piercings: new Set<string>(),
    silicone_busto: new Set<string>(),
    silicone_quadril: new Set<string>(),
  };

  let minPrice = Number.POSITIVE_INFINITY;
  let maxPrice = 0;

  let minAge = Number.POSITIVE_INFINITY;
  let maxAge = 0;

  producers.forEach((p) => {
    const profile = p.profile;
    if (!profile) return;

    if (p.birthday) {
      const age = getAge(p.birthday);
      minAge = Math.min(minAge, age);
      maxAge = Math.max(maxAge, age);
    }

    if (p.nationality) {
      const key = p.nationality.toLowerCase();

      if (!nationalities.has(key.length)) {
        nationalities.set(key.length, {
          id: key.length, // id estável (simples)
          label: p.nationality, // exibido
          value: key, // valor real
        });
      }
    }

    profile.languages?.forEach((lang) => {
      if (!lang.name) return;

      const key = lang.name.toLowerCase();
      const id = key.length;

      if (!languages.has(id)) {
        languages.set(id, {
          id,
          label: lang.name,
          value: key,
        });
      }
    });

    profile.appearance?.forEach((a) => {
      const key = a.option.name as keyof typeof appearanceOptions;
      const target = appearanceOptions[key];

      if (!target) return;

      if (typeof a.valueBoolean === "boolean") {
        target.add(a.valueBoolean ? "sim" : "não");
      }

      if (a.valueString) {
        target.add(a.valueString);
      }
    });

    profile.services?.forEach((s) => {
      if (s.status === "yes") {
        services.set(s.option.id, s.option);
      }
    });

    profile.fetiches?.forEach((f) => {
      if (f.status === "yes") {
        fetiches.set(f.option.id, f.option);
      }
    });

    profile.audience?.forEach((a) => audiences.set(a.option.id, a.option));

    profile.locations?.forEach((l) => locations.set(l.option.id, l.option));

    profile.payments?.forEach((p) => payments.set(p.option.id, p.option));

    profile.prices?.forEach((price) => {
      if (price.value > 0) {
        minPrice = Math.min(minPrice, price.value);
        maxPrice = Math.max(maxPrice, price.value);
      }

      durations.set(price.option.id, price.option);
    });
  });

  return {
    ageRange:
      minAge !== Number.POSITIVE_INFINITY ? { min: minAge, max: maxAge } : null,
    nationalities: Array.from(nationalities.values()),
    services: Array.from(services.values()),
    fetiches: Array.from(fetiches.values()),
    audiences: Array.from(audiences.values()),
    languages: Array.from(languages.values()),
    locations: Array.from(locations.values()),
    appearance: {
      ethnicity: Array.from(appearanceOptions.ethnicity),
      hair_color: Array.from(appearanceOptions.hair_color),
      eye_color: Array.from(appearanceOptions.eye_color),
      body_type: Array.from(appearanceOptions.body_type),
      breast_size: Array.from(appearanceOptions.breast_size),
      butt_size: Array.from(appearanceOptions.butt_size),
      pubis: Array.from(appearanceOptions.pubis),
      tatuagens: Array.from(appearanceOptions.tatuagens),
      piercings: Array.from(appearanceOptions.piercings),
      silicone_busto: Array.from(appearanceOptions.silicone_busto),
      silicone_quadril: Array.from(appearanceOptions.silicone_quadril),
    },
    payments: Array.from(payments.values()),
    durations: Array.from(durations.values()),
    priceRange:
      minPrice !== Number.POSITIVE_INFINITY
        ? { min: minPrice, max: maxPrice }
        : null,
  };
}

interface FilterPopupProps {
  producers: Producer[];
  onApply: (filters: ActiveFilters) => void;
}

export default function FilterPopup({ producers, onApply }: FilterPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<ActiveFilters>({});
  const options = useMemo(() => extractFilterOptions(producers), [producers]);

  const [ageValues, setAgeValues] = useState<[number, number]>([0, 0]);
  const [priceValues, setPriceValues] = useState<[number, number]>([0, 0]);
  const [inputMinAge, setInputMinAge] = useState("");
  const [inputMaxAge, setInputMaxAge] = useState("");
  const [inputMinPrice, setInputMinPrice] = useState("");
  const [inputMaxPrice, setInputMaxPrice] = useState("");

  useEffect(() => {
    if (options.ageRange) {
      const { min, max } = options.ageRange;

      setAgeValues([min, max]);
      setInputMinAge(String(min));
      setInputMaxAge(String(max));
    }
  }, [options.ageRange]);

  useEffect(() => {
    if (options.priceRange) {
      const { min, max } = options.priceRange;

      setPriceValues([min, max]);
      setInputMinPrice(String(min));
      setInputMaxPrice(String(max));
    }
  }, [options.priceRange]);

  function toggleAppearanceOption(
    key: keyof NonNullable<ActiveFilters["appearance"]>,
    value: string
  ) {
    setFilters((prev) => {
      const current = (
        Array.isArray(prev.appearance?.[key]) ? prev.appearance?.[key] : []
      ) as string[];

      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];

      return {
        ...prev,
        appearance: {
          ...prev.appearance,
          [key]: updated,
        },
      };
    });
  }

  function toggleArrayFilter(key: keyof ActiveFilters, id: number) {
    setFilters((prev) => {
      const current = (prev[key] as number[]) || [];
      const exists = current.includes(id);

      return {
        ...prev,
        [key]: exists ? current.filter((v) => v !== id) : [...current, id],
      };
    });
  }

  function getAppearanceLabel(key: string, value: string): string {
    // Valores booleanos
    if (value === "sim") return "Sim";
    if (value === "não") return "Não";

    // Valores com mapa de labels
    const labelMap = APPEARANCE_VALUE_LABELS[key];
    if (labelMap && labelMap[value]) {
      return labelMap[value];
    }

    // Fallback: capitalizar primeira letra
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function CheckboxList<T extends string | number>({
    title,
    options,
    selected,
    onToggle,
  }: {
    title: string;
    options: { value: T; label: string }[];
    selected: T[];
    onToggle: (value: T) => void;
  }) {
    if (!options.length) return null;

    return (
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h4>{title}</h4>
        </div>

        <div className={styles.options}>
          {options.map((opt) => (
            <label key={opt.value} className={styles.checkbox}>
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => onToggle(opt.value)}
              />

              <span className={styles.checkmark} />
              <span className={styles.label}>{opt.label}</span>
            </label>
          ))}
        </div>
      </section>
    );
  }

  function AgeRange() {
    if (!options.ageRange) return null;

    const { min, max } = options.ageRange;

    function commitMin() {
      const v = Number(inputMinAge);

      if (isNaN(v)) {
        setInputMinAge(String(ageValues[0]));
        return;
      }

      const clamped = Math.min(Math.max(v, min), ageValues[1]);
      setAgeValues([clamped, ageValues[1]]);
      setInputMinAge(String(clamped));
      
      setFilters((prev) => ({
        ...prev,
        ageRange: {
          min: clamped,
          max: ageValues[1],
        },
      }));
    }

    function commitMax() {
      const v = Number(inputMaxAge);

      if (isNaN(v)) {
        setInputMaxAge(String(ageValues[1]));
        return;
      }

      const clamped = Math.max(Math.min(v, max), ageValues[0]);
      setAgeValues([ageValues[0], clamped]);
      setInputMaxAge(String(clamped));
      
      setFilters((prev) => ({
        ...prev,
        ageRange: {
          min: ageValues[0],
          max: clamped,
        },
      }));
    }

    if (min != max) {
      return (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h4>Idade (Anos)</h4>
          </div>
          <div className={styles.range}>
            <div className={styles.inputs}>
              <input
                type="number"
                value={inputMinAge}
                onChange={(e) => setInputMinAge(e.target.value)}
                onBlur={commitMin}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitMin();
                    e.currentTarget.blur();
                  }
                }}
              />

              <input
                type="number"
                value={inputMaxAge}
                onChange={(e) => setInputMaxAge(e.target.value)}
                onBlur={commitMax}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitMax();
                    e.currentTarget.blur();
                  }
                }}
              />
            </div>

            <Range
              step={1}
              min={min}
              max={max}
              values={[
                Math.max(ageValues[0], min),
                Math.min(ageValues[1], max),
              ]}
              onChange={(vals) => {
                setAgeValues(vals as [number, number]);
                setInputMinAge(String(vals[0]));
                setInputMaxAge(String(vals[1]));
              }}
              onFinalChange={(vals) => {
                setFilters((prev) => ({
                  ...prev,
                  ageRange: {
                    min: vals[0],
                    max: vals[1],
                  },
                }));
              }}
              renderTrack={({ props, children }) => (
                <div
                  {...props}
                  style={{
                    ...props.style,
                    height: "6px",
                    width: "100%",
                    backgroundColor: "var(--contrast-color)",
                    borderRadius: "3px",
                  }}
                >
                  {children}
                </div>
              )}
              renderThumb={({ props }) => {
                const { key, ...rest } = props;

                return (
                  <div
                    key={key}
                    {...rest}
                    style={{
                      ...rest.style,
                      height: "20px",
                      width: "20px",
                      borderRadius: "50%",
                      backgroundColor: "var(--primary-color)",
                      cursor: "grab",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                    }}
                    onMouseDown={(e) => {
                      if (rest.style) {
                        (e.currentTarget.style as any).cursor = "grabbing";
                      }
                    }}
                    onMouseUp={(e) => {
                      if (rest.style) {
                        (e.currentTarget.style as any).cursor = "grab";
                      }
                    }}
                  />
                );
              }}
            />
          </div>
        </section>
      );
    }
  }

  function PriceRange() {
    if (!options.priceRange) return null;

    const { min, max } = options.priceRange;

    function commitMin() {
      const v = Number(inputMinPrice);

      if (isNaN(v)) {
        setInputMinPrice(String(priceValues[0]));
        return;
      }

      const clamped = Math.min(Math.max(v, min), priceValues[1]);
      setPriceValues([clamped, priceValues[1]]);
      setInputMinPrice(String(clamped));
      
      setFilters((prev) => ({
        ...prev,
        priceRange: {
          min: clamped,
          max: priceValues[1],
        },
      }));
    }

    function commitMax() {
      const v = Number(inputMaxPrice);

      if (isNaN(v)) {
        setInputMaxPrice(String(priceValues[1]));
        return;
      }

      const clamped = Math.max(Math.min(v, max), priceValues[0]);
      setPriceValues([priceValues[0], clamped]);
      setInputMaxPrice(String(clamped));
      
      setFilters((prev) => ({
        ...prev,
        priceRange: {
          min: priceValues[0],
          max: clamped,
        },
      }));
    }

    if (min != max) {
      return (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h4>Preço (R$)</h4>
          </div>
          <div className={styles.range}>
            <div className={styles.inputs}>
              <input
                type="number"
                value={inputMinPrice}
                onChange={(e) => setInputMinPrice(e.target.value)}
                onBlur={commitMin}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitMin();
                    e.currentTarget.blur();
                  }
                }}
              />

              <input
                type="number"
                value={inputMaxPrice}
                onChange={(e) => setInputMaxPrice(e.target.value)}
                onBlur={commitMax}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitMax();
                    e.currentTarget.blur();
                  }
                }}
              />
            </div>
            <Range
              step={50}
              min={min}
              max={max}
              values={[
                Math.max(priceValues[0], min),
                Math.min(priceValues[1], max),
              ]}
              onChange={(vals) => {
                setPriceValues(vals as [number, number]);
                setInputMinPrice(String(vals[0]));
                setInputMaxPrice(String(vals[1]));
              }}
              onFinalChange={(vals) => {
                setFilters((prev) => ({
                  ...prev,
                  priceRange: {
                    min: vals[0],
                    max: vals[1],
                  },
                }));
              }}
              renderTrack={({ props, children }) => (
                <div
                  {...props}
                  style={{
                    ...props.style,
                    height: "6px",
                    width: "100%",
                    backgroundColor: "var(--contrast-color)",
                    borderRadius: "3px",
                  }}
                >
                  {children}
                </div>
              )}
              renderThumb={({ props }) => {
                const { key, ...rest } = props;

                return (
                  <div
                    key={key}
                    {...rest}
                    style={{
                      ...rest.style,
                      height: "20px",
                      width: "20px",
                      borderRadius: "50%",
                      backgroundColor: "var(--primary-color)",
                      cursor: "grab",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                    }}
                    onMouseDown={(e) => {
                      if (rest.style) {
                        (e.currentTarget.style as any).cursor = "grabbing";
                      }
                    }}
                    onMouseUp={(e) => {
                      if (rest.style) {
                        (e.currentTarget.style as any).cursor = "grab";
                      }
                    }}
                  />
                );
              }}
            />
          </div>
        </section>
      );
    }
  }

  const APPEARANCE_KEYS = [
    "ethnicity",
    "hair_color",
    "eye_color",
    "body_type",
    "breast_size",
    "butt_size",
    "pubis",
    "tatuagens",
    "piercings",
    "silicone_busto",
    "silicone_quadril",
  ] as const;

  type AppearanceKey = (typeof APPEARANCE_KEYS)[number];

  const APPEARANCE_LABELS: Record<AppearanceKey, string> = {
    ethnicity: "Etnia",
    hair_color: "Cor do cabelo",
    eye_color: "Cor dos olhos",
    body_type: "Tipo de corpo",
    breast_size: "Tamanho do Busto",
    butt_size: "Tamanho do Quadril",
    pubis: "Pubis",
    tatuagens: "Tatuagens",
    piercings: "Piercings",
    silicone_busto: "Silicone no Busto",
    silicone_quadril: "Silicone no Quadril",
  };

  return (
    <Popup
      trigger={
        <>
          <span>
            <CiFilter />
          </span>
          Filtros
          {Object.values(filters).some((v) =>
            Array.isArray(v) ? v.length > 0 : Boolean(v)
          ) && (
            <span className={styles.counter}>
              {
                Object.values(filters).filter((v) =>
                  Array.isArray(v) ? v.length > 0 : Boolean(v)
                ).length
              }
            </span>
          )}
        </>
      }
      triggerClass={styles.trigger}
      popupClass={styles.popup}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <header className={styles.header}>
        <h3>Filtros</h3>

        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className={styles.close}
        >
          <IoCloseOutline />
        </button>
      </header>

      <div className={styles.content}>
        <AgeRange />

        <CheckboxList
          title="Nacionalidade"
          options={options.nationalities.map((n) => ({
            value: n.id,
            label: n.label,
          }))}
          selected={filters.nationality || []}
          onToggle={(id) => toggleArrayFilter("nationality", id)}
        />

        {APPEARANCE_KEYS.map((key) => (
          <CheckboxList
            key={key}
            title={APPEARANCE_LABELS[key]}
            options={options.appearance[key].map((value) => ({
              value,
              label: getAppearanceLabel(key, value),
            }))}
            selected={filters.appearance?.[key] || []}
            onToggle={(value) => toggleAppearanceOption(key, value)}
          />
        ))}

        <CheckboxList
          title="Audiência"
          options={options.audiences.map((a) => ({
            value: a.id,
            label: a.label,
          }))}
          selected={filters.audience || []}
          onToggle={(id) => toggleArrayFilter("audience", id)}
        />

        <CheckboxList
          title="Idiomas"
          options={options.languages.map((l) => ({
            value: l.id,
            label: l.label,
          }))}
          selected={filters.languages || []}
          onToggle={(id) => toggleArrayFilter("languages", id)}
        />

        <CheckboxList
          title="Serviços"
          options={options.services.map((s) => ({
            value: s.id,
            label: s.label,
          }))}
          selected={filters.services || []}
          onToggle={(id) => toggleArrayFilter("services", id)}
        />

        <CheckboxList
          title="Fetiches"
          options={options.fetiches.map((f) => ({
            value: f.id,
            label: f.label,
          }))}
          selected={filters.fetiches || []}
          onToggle={(id) => toggleArrayFilter("fetiches", id)}
        />

        <CheckboxList
          title="Localização"
          options={options.locations.map((l) => ({
            value: l.id,
            label: l.label,
          }))}
          selected={filters.locations || []}
          onToggle={(id) => toggleArrayFilter("locations", id)}
        />

        <CheckboxList
          title="Duração"
          options={options.durations.map((d) => ({
            value: d.id,
            label: d.label,
          }))}
          selected={filters.durations || []}
          onToggle={(id) => toggleArrayFilter("durations", id)}
        />

        <PriceRange />

        <CheckboxList
          title="Pagamentos"
          options={options.payments.map((p) => ({
            value: p.id,
            label: p.label,
          }))}
          selected={filters.payments || []}
          onToggle={(id) => toggleArrayFilter("payments", id)}
        />
      </div>

      <footer className={styles.footer}>
        <button
          className={styles.clear}
          onClick={() => {
            const cleared = {};
            setFilters(cleared);
            onApply(cleared);
            setIsOpen(false);
          }}
        >
          Limpar
        </button>

        <button
          className={styles.apply}
          onClick={() => {
            onApply(filters);
            setIsOpen(false);
          }}
        >
          Aplicar filtros
        </button>
      </footer>
    </Popup>
  );
}
