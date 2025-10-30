"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./FilterPopup.module.css";
import { CiFilter } from "react-icons/ci";
import { IoIosClose } from "react-icons/io";

import Popup from "@/components/ui/Popup/Popup";
import type { Producer } from "@/types/Producer";

import { Range, getTrackBackground } from "react-range";

const ATENDE_MAP: Record<string, string> = {
  mans: "Homens",
  women: "Mulheres",
  couple: "Casal",
  group: "Grupo",
};

const OFERECE_MAP: Record<string, string> = {
  Companion: "Acompanhante",
  Trip: "Viagens",
  OralSex: "Sexo Oral",
  OralSexWithCondom: "Oral com Camisinha",
  Kiss: "Beijo na Boca",
  VaginalSex: "Sexo Vaginal",
  VaginalSexWithCondom: "Vaginal com Camisinha",
  Squirt: "Squirt",
};

const FETICHES_MAP: Record<string, string> = {
  Costume: "Fantasia",
  Striptease: "Striptease",
  Bondage: "Bondage",
  Chirophilia: "Chirophilia",
  Podolatria: "Podolatria",
  Voyer: "Voyeurismo",
};

interface FilterPopupProps {
  filters: Record<string, Record<string, any>>;
  pathLabelMap: Record<string, string>;
  currentSelectedFilters: Record<string, any>;
  onApplyFilters: (filters: Record<string, any>) => void;
  onClearAllFilters: () => void;
  producers?: Producer[];
}

export default function FilterPopup({
  filters,
  pathLabelMap,
  currentSelectedFilters,
  onApplyFilters,
  onClearAllFilters,
  producers = [],
}: FilterPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(currentSelectedFilters);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalFilters(currentSelectedFilters);
  }, [currentSelectedFilters, isOpen]);

  useEffect(() => {
    if (!isOpen || !contentRef.current) return;

    const sections = contentRef.current.querySelectorAll(
      `.${styles.filterSection}`
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = entry.target.id;
          if (entry.isIntersecting) {
            setActiveSection(sectionId);
          } else if (activeSection === sectionId && !entry.isIntersecting) {
          }
        });
      },
      {
        root: contentRef.current,
        rootMargin: "0px 0px -50% 0px",
        threshold: 0,
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [isOpen]);

  const toggleOption = (path: string, option: string) => {
    setLocalFilters((prev) => {
      const prevOptions = prev[path] || [];
      const alreadySelected = prevOptions.includes(option);

      return {
        ...prev,
        [path]: alreadySelected
          ? prevOptions.filter((o: string) => o !== option)
          : [...prevOptions, option],
      };
    });
  };

  const updateRange = (
    path: string,
    values: number[],
    minAvailable: number,
    maxAvailable: number
  ) => {
    const [newMin, newMax] = values;

    const finalMin = Math.max(newMin, minAvailable);
    const finalMax = Math.min(newMax, maxAvailable);

    setLocalFilters((prev) => ({
      ...prev,
      [path]: { min: finalMin, max: finalMax },
    }));
  };

  const activeFiltersCount = Object.values(localFilters).reduce(
    (sum, value) => {
      if (Array.isArray(value)) return sum + value.length;
      if (value?.min != null && value?.max != null) return sum + 1;
      return sum;
    },
    0
  );

  const renderFilter = (path: string, value: any) => {
    const displayLabel = pathLabelMap[path] || path;

    const minAvailable = value.min;
    const maxAvailable = value.max;

    const currentMin = localFilters[path]?.min ?? minAvailable;
    const currentMax = localFilters[path]?.max ?? maxAvailable;

    const getTranslatedOption = (option: string) => {
      if (path === "services.Atende") {
        return ATENDE_MAP[option] || option;
      }
      if (path === "services.Oferece") {
        return OFERECE_MAP[option] || option;
      }
      if (path === "services.Fetiches") {
        return FETICHES_MAP[option] || option;
      }
      return option;
    };

    if (Array.isArray(value)) {
      return (
        <div className={styles.filterGroup} key={path}>
          <h3 className={styles.filterLabel}>{displayLabel}</h3>
          <div className={styles.filterOptions}>
            {value.map((option: string) => (
              <label key={option} className={styles.filterOption}>
                <input
                  type="checkbox"
                  checked={localFilters[path]?.includes(option) || false}
                  onChange={() => toggleOption(path, option)}
                />
                {getTranslatedOption(option)}
              </label>
            ))}
          </div>
        </div>
      );
    } else if (value?.min != null && value?.max != null) {
      const values = [currentMin, currentMax];

      const STEP = path === "appearance.Altura" ? 0.01 : 1;

      return (
        <div className={styles.filterGroup} key={path}>
          <h3 className={styles.filterLabel}>
            {displayLabel}: {path === "prices.price" ? "R$" : ""}
            {currentMin} {path === "appearance.Altura" ? "m" : ""} -{" "}
            {path === "prices.price" ? "R$" : ""}
            {currentMax} {path === "appearance.Altura" ? "m" : ""}
          </h3>
          <div className={styles.rangeContainer}>
            <Range
              step={STEP}
              min={minAvailable}
              max={maxAvailable}
              values={values}
              onChange={(newValues) =>
                updateRange(path, newValues, minAvailable, maxAvailable)
              }
              renderTrack={({ props, children }) => (
                <div
                  onMouseDown={props.onMouseDown}
                  onTouchStart={props.onTouchStart}
                  className={styles.trackWrapper}
                >
                  <div
                    ref={props.ref}
                    className={styles.track}
                    style={{
                      background: getTrackBackground({
                        values,
                        colors: [
                          "var(--contrast-color)",
                          "var(--primary-color)",
                          "var(--contrast-color)",
                        ],
                        min: minAvailable,
                        max: maxAvailable,
                      }),
                    }}
                  >
                    {children}
                  </div>
                </div>
              )}
              renderThumb={({ props, index, isDragged }) => {
                const { key, ...rest } = props;

                return (
                  <div key={key} {...rest} className={styles.thumb}>
                    <div className={styles.thumbValue}>{values[index]}</div>
                  </div>
                );
              }}
            />
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Popup
      trigger={
        <>
          Filtros
          {activeFiltersCount > 0 && (
            <span className={styles.badge}>{activeFiltersCount}</span>
          )}
          <span>
            <CiFilter />
          </span>
        </>
      }
      triggerClass={styles.trigger}
      popupClass={styles.popup}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <>
        <div className={styles.header}>
          <h1>Filtros</h1>
          <button
            className={styles.closeButton}
            onClick={() => setIsOpen(false)}
            aria-label="Fechar filtros"
          >
            <IoIosClose />
          </button>
        </div>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <nav className={styles.topics}>
              {Object.keys(filters).map((section) => {
                const isActive = activeSection === section;

                return (
                  <button
                    key={section}
                    className={`${styles.topicLink} ${
                      isActive ? styles.topicLinkActive : ""
                    }`}
                    onClick={() => {
                      const el = contentRef.current?.querySelector<HTMLElement>(
                        `#${section}`
                      );

                      if (el && contentRef.current) {
                        setActiveSection(section);

                        contentRef.current.scrollTo({
                          top: el.offsetTop - contentRef.current.offsetTop - 10,
                          behavior: "smooth",
                        });
                      }
                    }}
                  >
                    {section}
                  </button>
                );
              })}{" "}
            </nav>
          </aside>

          <div className={styles.content} ref={contentRef}>
            {Object.entries(filters).map(([sectionLabel, filtersByPath]) => (
              <section
                key={sectionLabel}
                id={sectionLabel}
                className={styles.filterSection}
              >
                <h2 className={styles.sectionTitle}>{sectionLabel}</h2>
                {Object.entries(filtersByPath).map(([path, value]) =>
                  renderFilter(path, value)
                )}
              </section>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <button
            className={styles.clearButton}
            onClick={() => {
              setLocalFilters({});
              onClearAllFilters();
              setIsOpen(false);
            }}
            disabled={activeFiltersCount === 0}
          >
            Limpar Filtros
          </button>
          <button
            className={styles.applyButton}
            onClick={() => {
              onApplyFilters(localFilters);
              setIsOpen(false);
            }}
          >
            Aplicar Filtros
          </button>
        </div>
      </>
    </Popup>
  );
}
