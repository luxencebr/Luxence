"use client";

import type React from "react";

import { useEffect, useRef, useState, useMemo } from "react";
import type { ReactNode } from "react";

import styles from "./DropDown.module.css";
import { IoIosArrowDown } from "react-icons/io";

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
  triggerClassName?: string;
  menuClassName?: string;
  containerClassName?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  options?: string[];
  onSelect?: (value: string) => void;
  selectedValue?: string;
}

function Dropdown({
  trigger,
  children,
  triggerClassName = "",
  menuClassName = "",
  containerClassName = "",
  searchable = false,
  searchPlaceholder = "Buscar...",
  options = [],
  onSelect,
  selectedValue = "",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const closeMenu = () => {
    setOpen(false);
    setSearchTerm("");
  };

  const filteredOptions = useMemo(() => {
    if (!searchable || !options.length) return [];
    if (!searchTerm.trim()) return options;

    const normalizedSearch = searchTerm
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    return options.filter((option) => {
      const normalizedOption = option
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      return normalizedOption.startsWith(normalizedSearch);
    });
  }, [options, searchTerm, searchable]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  });

  useEffect(() => {
    const handleScroll = () => closeMenu();
    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (open && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, searchable]);

  const handleOptionClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "BUTTON") {
      closeMenu();
    }
  };

  const handleSelectOption = (value: string) => {
    onSelect?.(value);
    closeMenu();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!open) {
      setOpen(true);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      closeMenu();
    } else if (e.key === "Enter" && filteredOptions.length === 1) {
      handleSelectOption(filteredOptions[0]);
    }
  };

  const displayValue = useMemo(() => {
    if (open) return searchTerm;
    return selectedValue || "";
  }, [open, searchTerm, selectedValue]);

  const inputPlaceholder = useMemo(() => {
    if (selectedValue) return selectedValue;
    return searchPlaceholder;
  }, [selectedValue, searchPlaceholder]);

  return (
    <div
      className={`${styles.dropdown} ${containerClassName}`}
      ref={dropdownRef}
    >
      {searchable ? (
        <div
          className={`${styles.trigger} ${styles.searchableTrigger} ${triggerClassName}`}
          onClick={() => setOpen(true)}
        >
          <input
            ref={inputRef}
            type="text"
            value={displayValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            placeholder={inputPlaceholder}
            className={styles.triggerInput}
            onFocus={() => setOpen(true)}
            autoComplete="new-password"
            autoCorrect="off"
            spellCheck={false}
          />
          <IoIosArrowDown
            className={`${styles.arrow} ${open ? styles.arrowOpen : ""}`}
          />
        </div>
      ) : (
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
          className={`${styles.trigger} ${triggerClassName}`}
        >
          {trigger}
          <IoIosArrowDown
            className={`${styles.arrow} ${open ? styles.arrowOpen : ""}`}
          />
        </div>
      )}

      <div
        className={`${styles.menu} ${open ? styles.open : ""} ${menuClassName}`}
        onClick={handleOptionClick}
      >
        <div className={styles.layout}>
          {searchable && options.length > 0 ? (
            filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelectOption(option)}
                  className={`${styles.option} ${option === selectedValue ? styles.optionSelected : ""}`}
                >
                  {option}
                </button>
              ))
            ) : (
              <div className={styles.noResults}>
                Nenhum resultado encontrado
              </div>
            )
          ) : typeof children === "function" ? (
            (children as (close: () => void) => ReactNode)(closeMenu)
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}

export default Dropdown;
