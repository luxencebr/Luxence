"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./SortDropdown.module.css";
import { IoSwapVertical } from "react-icons/io5";
import { FiCheck } from "react-icons/fi";

export type SortOption = "default" | "name" | "time" | "views" | "rating";
export type SortDirection = "asc" | "desc";

interface SortDropdownProps {
  onSortChange?: (sort: SortOption, direction: SortDirection) => void;
  initialSort?: SortOption;
  initialDirection?: SortDirection;
}

const sortOptions = [
  { value: "default" as const, label: "Padrão" },
  { value: "name" as const, label: "Nome (A-Z)" },
  { value: "time" as const, label: "Mais Recentes" },
  { value: "views" as const, label: "Mais Visualizados" },
  { value: "rating" as const, label: "Melhor Avaliados" },
];

const STORAGE_KEY = "catalog_sort";

export default function SortDropdown({
  onSortChange,
  initialSort = "default",
  initialDirection = "desc",
}: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState<SortOption>(initialSort);
  const [sortDirection, setSortDirection] =
    useState<SortDirection>(initialDirection);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  // Carregar do sessionStorage ao montar
  useEffect(() => {
    if (isInitialized.current) return;

    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { sort, direction } = JSON.parse(stored);
        setSelectedSort(sort);
        setSortDirection(direction);
        onSortChange?.(sort, direction);
      } else {
        onSortChange?.(initialSort, initialDirection);
      }
    } catch (err) {
      console.error("Erro ao ler ordenação do storage", err);
      onSortChange?.(initialSort, initialDirection);
    }

    isInitialized.current = true;
  }, []);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSortSelect = (sort: SortOption) => {
    let newDirection: SortDirection = "desc";

    // Se clicar na mesma opção, inverte a direção
    if (sort === selectedSort) {
      newDirection = sortDirection === "desc" ? "asc" : "desc";
      setSortDirection(newDirection);
    } else {
      setSelectedSort(sort);
      setSortDirection(newDirection);
    }

    setIsOpen(false);

    // Salvar no sessionStorage
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ sort, direction: newDirection }),
      );
    } catch (err) {
      console.error("Erro ao salvar ordenação", err);
    }

    onSortChange?.(sort, newDirection);
  };

  const getLabel = () => {
    const option = sortOptions.find((opt) => opt.value === selectedSort);
    if (!option) return "Padrão";

    let label = option.label;

    // Adicionar indicador de direção para opções que fazem sentido
    if (selectedSort !== "default") {
      if (selectedSort === "name") {
        label = sortDirection === "desc" ? "Nome (A-Z)" : "Nome (Z-A)";
      } else if (selectedSort === "time") {
        label = sortDirection === "desc" ? "Mais Recentes" : "Mais Antigos";
      } else if (selectedSort === "views") {
        label =
          sortDirection === "desc" ? "Mais Visualizados" : "Menos Visualizados";
      } else if (selectedSort === "rating") {
        label =
          sortDirection === "desc" ? "Melhor Avaliados" : "Pior Avaliados";
      }
    }

    return label;
  };

  return (
    <div className={styles.sortDropdown} ref={dropdownRef}>
      <button
        className={styles.sortButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Ordenar"
      >
        <IoSwapVertical />
        <span>{getLabel()}</span>
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          {sortOptions.map((option) => (
            <button
              key={option.value}
              className={`${styles.dropdownItem} ${
                selectedSort === option.value ? styles.selected : ""
              }`}
              onClick={() => handleSortSelect(option.value)}
            >
              <span>{option.label}</span>
              {selectedSort === option.value && (
                <FiCheck className={styles.checkIcon} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
