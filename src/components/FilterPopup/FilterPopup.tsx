import { useMemo, useState } from "react";
import { Range } from "react-range";

import { Producer } from "@/types/Producer";
import Popup from "../ui/Popup/Popup";
import styles from "./FilterPopup.module.css";

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

  hasLocal?: boolean;
  verified?: boolean;
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

  let minPrice = Infinity;
  let maxPrice = 0;

  let minAge = Infinity;
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
      minPrice = Math.min(minPrice, price.value);
      maxPrice = Math.max(maxPrice, price.value);

      durations.set(price.option.id, price.option);
    });
  });

  return {
    ageRange: minAge !== Infinity ? { min: minAge, max: maxAge } : null,
    nationalities: Array.from(nationalities.values()),
    services: Array.from(services.values()),
    fetiches: Array.from(fetiches.values()),
    audiences: Array.from(audiences.values()),
    languages: Array.from(languages.values()),
    locations: Array.from(locations.values()),
    payments: Array.from(payments.values()),
    durations: Array.from(durations.values()),
    priceRange: minPrice !== Infinity ? { min: minPrice, max: maxPrice } : null,
  };
}

interface FilterPopupProps {
  producers: Producer[];
  onApply: (filters: ActiveFilters) => void;
}

export default function FilterPopup({ producers, onApply }: FilterPopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  const options = useMemo(() => extractFilterOptions(producers), [producers]);

  const [filters, setFilters] = useState<ActiveFilters>({});

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

  function CheckboxList({
    title,
    options,
    filterKey,
  }: {
    title: string;
    options: { id: number; label: string }[];
    filterKey: keyof ActiveFilters;
  }) {
    return (
      <section className={styles.section}>
        <h4>{title}</h4>

        <div className={styles.options}>
          {options.map((opt) => (
            <label key={opt.id} className={styles.checkbox}>
              <input
                type="checkbox"
                checked={
                  (filters[filterKey] as number[] | undefined)?.includes(
                    opt.id
                  ) || false
                }
                onChange={() => toggleArrayFilter(filterKey, opt.id)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </section>
    );
  }

  function AgeRange() {
    if (!options.ageRange) return null;

    const { min, max } = options.ageRange;

    const [values, setValues] = useState<[number, number]>([
      filters.ageRange?.min ?? min,
      filters.ageRange?.max ?? max,
    ]);

    const [inputMin, setInputMin] = useState(String(values[0]));
    const [inputMax, setInputMax] = useState(String(values[1]));

    function commitMin() {
      const v = Number(inputMin);

      if (isNaN(v)) {
        setInputMin(String(values[0]));
        return;
      }

      const clamped = Math.min(Math.max(v, min), values[1]);
      setValues([clamped, values[1]]);
      setInputMin(String(clamped));
    }

    function commitMax() {
      const v = Number(inputMax);

      if (isNaN(v)) {
        setInputMax(String(values[1]));
        return;
      }

      const clamped = Math.max(Math.min(v, max), values[0]);
      setValues([values[0], clamped]);
      setInputMax(String(clamped));
    }

    return (
      <section className={styles.section}>
        <h4>Idade</h4>

        <div
          className={styles.range}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <input
            type="number"
            value={inputMin}
            onChange={(e) => setInputMin(e.target.value)}
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
            value={inputMax}
            onChange={(e) => setInputMax(e.target.value)}
            onBlur={commitMax}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitMax();
                e.currentTarget.blur();
              }
            }}
          />

          <Range
            step={1}
            min={min}
            max={max}
            values={values}
            onChange={(vals) => {
              setValues(vals as [number, number]);
              setInputMin(String(vals[0]));
              setInputMax(String(vals[1]));
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
                  backgroundColor: "#ccc",
                }}
              >
                {children}
              </div>
            )}
            renderThumb={({ props }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: "24px",
                  width: "24px",
                  borderRadius: "50%",
                  backgroundColor: "#999",
                }}
              />
            )}
          />
        </div>
      </section>
    );
  }

  function PriceRange() {
    if (!options.priceRange) return null;

    const { min, max } = options.priceRange;

    const [values, setValues] = useState<[number, number]>([
      filters.priceRange?.min ?? min,
      filters.priceRange?.max ?? max,
    ]);
    const [inputMin, setInputMin] = useState(String(values[0]));
    const [inputMax, setInputMax] = useState(String(values[1]));

    function commitMin() {
      const v = Number(inputMin);

      if (isNaN(v)) {
        setInputMin(String(values[0]));
        return;
      }

      const clamped = Math.min(Math.max(v, min), values[1]);
      setValues([clamped, values[1]]);
      setInputMin(String(clamped));
    }

    function commitMax() {
      const v = Number(inputMax);

      if (isNaN(v)) {
        setInputMax(String(values[1]));
        return;
      }

      const clamped = Math.max(Math.min(v, max), values[0]);
      setValues([values[0], clamped]);
      setInputMax(String(clamped));
    }

    return (
      <section className={styles.section}>
        <h4>Preço</h4>

        <div
          className={styles.range}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <input
            type="number"
            value={inputMin}
            onChange={(e) => setInputMin(e.target.value)}
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
            value={inputMax}
            onChange={(e) => setInputMax(e.target.value)}
            onBlur={commitMax}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitMax();
                e.currentTarget.blur();
              }
            }}
          />

          <Range
            step={50}
            min={min}
            max={max}
            values={values}
            onChange={(vals) => {
              setValues(vals as [number, number]);
              setInputMin(String(vals[0]));
              setInputMax(String(vals[1]));
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
                  backgroundColor: "#ccc",
                }}
              >
                {children}
              </div>
            )}
            renderThumb={({ props }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: "24px",
                  width: "24px",
                  borderRadius: "50%",
                  backgroundColor: "#999",
                }}
              />
            )}
          />
        </div>
      </section>
    );
  }

  return (
    <Popup
      trigger={<>Filtros</>}
      triggerClass={styles.trigger}
      popupClass={styles.popup}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <div className={styles.content}>
        <h3>Filtros</h3>

        <AgeRange />

        <CheckboxList
          title="Nacionalidade"
          options={options.nationalities}
          filterKey="nationality"
        />

        <CheckboxList
          title="Audiência"
          options={options.audiences}
          filterKey="audience"
        />

        <CheckboxList
          title="Idiomas"
          options={options.languages}
          filterKey="languages"
        />

        <CheckboxList
          title="Serviços"
          options={options.services}
          filterKey="services"
        />

        <CheckboxList
          title="Fetiches"
          options={options.fetiches}
          filterKey="fetiches"
        />

        <CheckboxList
          title="Duração"
          options={options.durations}
          filterKey="durations"
        />

        <PriceRange />

        <CheckboxList
          title="Pagamentos"
          options={options.payments}
          filterKey="payments"
        />

        <div className={styles.footer}>
          <button
            className={styles.clear}
            onClick={() => {
              setFilters({});
              onApply(filters);
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
        </div>
      </div>
    </Popup>
  );
}
