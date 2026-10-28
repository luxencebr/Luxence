"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./LocalPupup.module.css";
import { BsRadar } from "react-icons/bs";

export type DistanceSelection = { lat: number; lng: number; radius: number };

export default function LocalPopup({ onFilterChange }: { onFilterChange: (filter: DistanceSelection | null) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [hasLocation, setHasLocation] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [radius, setRadius] = useState(10);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user_distance_filter");

    if (stored) {
      try {
        const parsed = JSON.parse(stored);

        if (typeof parsed.lat === "number" && typeof parsed.lng === "number" &&
            parsed.lat >= -90 && parsed.lat <= 90 && parsed.lng >= -180 && parsed.lng <= 180 &&
            [5, 10, 25, 50].includes(parsed.radius)) {
          setCoords({ lat: parsed.lat, lng: parsed.lng });
          setRadius(parsed.radius);
          setHasLocation(true);
          onFilterChange(parsed);
        } else {
          localStorage.removeItem("user_distance_filter");
        }
      } catch {
        localStorage.removeItem("user_distance_filter");
      }
    }
  }, [onFilterChange]);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function requestLocation() {
    if (!navigator.geolocation) {
      setError("Geolocalização não suportada.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const lat = Math.round(latitude * 1000) / 1000;
        const lng = Math.round(longitude * 1000) / 1000;

        const locationData = {
          lat,
          lng,
          radius,
        };

        localStorage.setItem(
          "user_distance_filter",
          JSON.stringify(locationData)
        );

        setCoords({ lat, lng });
        setHasLocation(true);
        setError(null);
        onFilterChange(locationData);
        setIsOpen(false);
        triggerRef.current?.focus();
      },
      () => {
        setError(
          "Para filtrar anunciantes pela distância precisamos da sua localização para o calculo."
        );
        setHasLocation(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  function clearLocation() {
    localStorage.removeItem("user_distance_filter");
    setCoords(null);
    setHasLocation(false);
    setError(null);
    onFilterChange(null);
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((open) => !open)}
      >
        {hasLocation ? `Até ${radius} km` : "Distância"}
        <BsRadar aria-hidden="true" />
      </button>

      {isOpen && (
        <div className={styles.dropdown} id={menuId}>
          {!hasLocation && (
            <div className={styles.locationRequest}>
              <p>Permita sua localização para ver perfis próximos.</p>

              <button
                type="button"
                className={styles.primaryButton}
                onClick={requestLocation}
              >
                Usar minha localização
              </button>

              {error && <span className={styles.error}>{error}</span>}
            </div>
          )}

          {hasLocation && coords && (
            <div className={styles.filters}>
              <p className={styles.subtitle}>Mostrar perfis até:</p>

              <div className={styles.radiusOptions}>
                {[5, 10, 25, 50].map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={radius === value}
                    className={
                      radius === value
                        ? styles.radiusActive
                        : styles.radiusButton
                    }
                    onClick={() => {
                      setRadius(value);

                      if (coords) {
                        const selection = { ...coords, radius: value };
                        localStorage.setItem("user_distance_filter", JSON.stringify(selection));
                        onFilterChange(selection);
                      }
                      setIsOpen(false);
                      triggerRef.current?.focus();
                    }}
                  >
                    {value} km
                  </button>
                ))}
              </div>
              <button type="button" className={styles.clearButton} onClick={clearLocation}>Desativar filtro</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
