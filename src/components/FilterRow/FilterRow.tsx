"use client";

import { Children, useEffect, useRef, useState } from "react";
import styles from "./FilterRow.module.css";

import { FaMars, FaVenus, FaTransgender } from "react-icons/fa6";

const genderIcons = {
  male: <FaMars />,
  female: <FaVenus />,
  femaletrans: <FaTransgender />,
};

interface FilterOption {
  category: string;
  options: string[];
}

interface FilterRowProps {
  filters: FilterOption[];
  selectedFilters: Record<string, string[]>;
  onToggleFilter: (category: string, option: string) => void;

  genderFilters?: string[];
  selectedGender?: string | null;
  onSelectGender?: (gender: string | null) => void;

  userPreferredGender?: string | null;
}

function FilterRow({
  filters,
  selectedFilters,
  onToggleFilter,
  genderFilters = [],
  selectedGender,
  onSelectGender,
  userPreferredGender = null,
}: FilterRowProps) {
  const [highlightStyle, setHighlightStyle] = useState({
    width: 0,
    left: 0,
    opacity: 0,
  });

  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onSelectGender) return;

    if (
      !selectedGender &&
      userPreferredGender &&
      genderFilters.includes(userPreferredGender)
    ) {
      onSelectGender(userPreferredGender);
    }
  }, [userPreferredGender, selectedGender, onSelectGender, genderFilters]);

  useEffect(() => {
    if (!selectedGender || !containerRef.current) {
      setHighlightStyle({ width: 0, left: 0, opacity: 0 });
      return;
    }

    const selectedButton = buttonRefs.current[selectedGender];

    if (selectedButton) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const buttonRect = selectedButton.getBoundingClientRect();

      setHighlightStyle({
        width: buttonRect.width,
        left: buttonRect.left - containerRect.left,
        opacity: 1,
      });
    }
  }, [selectedGender, genderFilters]);

  const showGenderButtons = genderFilters.length > 1;

  return (
    <div className={styles.filterRow}>
      <div className={styles.layout}>
        {showGenderButtons && (
          <div ref={containerRef} className={styles.genderOptions}>
            <span
              className={styles.highlight}
              style={{
                width: highlightStyle.width,
                transform: `translateX(${highlightStyle.left}px)`,
                opacity: highlightStyle.opacity,
              }}
            />

            {genderFilters.map((gender) => (
              <button
                key={gender}
                ref={(el: HTMLButtonElement | null) => {
                  buttonRefs.current[gender] = el;
                }}
                className={`${styles.genderButton} ${
                  selectedGender === gender ? styles.active : ""
                }`}
                onClick={() =>
                  onSelectGender?.(selectedGender === gender ? null : gender)
                }
              >
                {genderIcons[gender as keyof typeof genderIcons]}{" "}
                {gender === "female"
                  ? "Mulheres"
                  : gender === "male"
                  ? "Homens"
                  : "Trans"}
              </button>
            ))}
          </div>
        )}

        <div className={styles.filterOptions}>
          {filters.map((filterGroup) => (
            <div key={filterGroup.category} className={styles.filterGroup}>
              <button className={styles.dropdownButton}>
                {filterGroup.category}
              </button>

              <ul className={styles.dropdownList}>
                {filterGroup.options.map((option) => {
                  const checked =
                    selectedFilters[filterGroup.category]?.includes(option) ||
                    false;

                  return (
                    <li key={option} className={styles.dropdownOption}>
                      <label>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            onToggleFilter(filterGroup.category, option)
                          }
                        />
                        {option}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FilterRow;
