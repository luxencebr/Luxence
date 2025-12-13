"use client";

import { useEffect, useState } from "react";
import styles from "./LocalPupup.module.css";
import { IoIosClose } from "react-icons/io";
import { BsRadar } from "react-icons/bs";

import Popup from "../ui/Popup/Popup";

export default function LocalPopup() {
  const [isOpen, setIsOpen] = useState(false);

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

        if (typeof parsed.lat === "number" && typeof parsed.lng === "number") {
          setCoords({ lat: parsed.lat, lng: parsed.lng });
          setRadius(parsed.radius ?? 10);
          setHasLocation(true);
        }
      } catch {
        localStorage.removeItem("user_distance_filter");
      }
    }
  }, []);

  function requestLocation() {
    if (!navigator.geolocation) {
      setError("Geolocalização não suportada.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        const locationData = {
          lat: latitude,
          lng: longitude,
          radius,
        };

        localStorage.setItem(
          "user_distance_filter",
          JSON.stringify(locationData)
        );

        setCoords({ lat: latitude, lng: longitude });
        setHasLocation(true);
        setError(null);
      },
      () => {
        setError(
          "Para filtrar anunciantes pela distância precisamos da sua localização para o calculo."
        );
        setHasLocation(false);
      }
    );
  }

  return (
    <Popup
      trigger={
        <>
          Distância
          <span>
            <BsRadar />
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
          <h1>Distância</h1>
          <button
            className={styles.closeButton}
            onClick={() => setIsOpen(false)}
            aria-label="Fechar filtros"
          >
            <IoIosClose />
          </button>
        </div>

        <div className={styles.layout}>Em Breve</div>

        {/* <div className={styles.layout}>
          {!hasLocation && (
            <div className={styles.locationRequest}>
              <p>Para isso precisamos da sua localização.</p>

              <button
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
              <p className={styles.subtitle}>Mostrar perfis em um raio de:</p>

              <div className={styles.radiusOptions}>
                {[5, 10, 25, 50].map((value) => (
                  <button
                    key={value}
                    className={
                      radius === value
                        ? styles.radiusActive
                        : styles.radiusButton
                    }
                    onClick={() => {
                      setRadius(value);

                      if (coords) {
                        localStorage.setItem(
                          "user_distance_filter",
                          JSON.stringify({
                            lat: coords.lat,
                            lng: coords.lng,
                            radius: value,
                          })
                        );
                      }
                    }}
                  >
                    {value} km
                  </button>
                ))}
              </div>
            </div>
          )}
        </div> */}
      </>
    </Popup>
  );
}
