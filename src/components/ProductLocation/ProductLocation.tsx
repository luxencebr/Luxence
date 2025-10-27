"use client";

import styles from "./ProductLocation.module.css";
import { HiLocationMarker } from "react-icons/hi";
import { FaLocationArrow } from "react-icons/fa6";
import { TbHomeCheck } from "react-icons/tb";

import type { Producer } from "../../types/Producer";

interface ProductLocationProps {
  producer: Producer;
}

function ProductLocation({ producer }: ProductLocationProps) {
  return (
    <section id="location" className={styles.productLocation}>
      <div className={styles.layout}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span>
              <HiLocationMarker />
            </span>
            Localidades
          </h2>
        </div>
        <div className={styles.content}>
          {producer.locality.hasLocal && (
            <div className={`${styles.column} ${styles.conditional}`}>
              <div className={styles.line}>
                <h3 className={styles.columnTitle}>
                  <span>
                    <TbHomeCheck />
                  </span>
                  Minha Localidade
                </h3>
                <p className={styles.address}>
                  {producer.locality.local.neighborhood},{" "}
                  {producer.locality.local.city} -{" "}
                  {producer.locality.local.state}
                </p>
              </div>
              <div className={styles.line}>
                <h3 className={styles.columnTitle}>Comodidades do Local</h3>
                <p>
                  {(() => {
                    const amenitiesList = Object.entries(
                      producer.locality.local.amenities
                    )
                      .filter(([_, value]) => value)
                      .map(([key]) => {
                        switch (key) {
                          case "wifi":
                            return "Wi-Fi";
                          case "airconditioning":
                            return "Ar-condicionado";
                          case "shower":
                            return "Chuveiro";
                          case "condom":
                            return "Preservativo";
                          case "parking":
                            return "Estacionamento";
                          default:
                            return null;
                        }
                      })
                      .filter(Boolean);

                    if (amenitiesList.length === 0)
                      return "Nenhuma comodidade informada.";

                    if (amenitiesList.length === 1) return amenitiesList[0];

                    return (
                      amenitiesList.slice(0, -1).join(", ") +
                      " e " +
                      amenitiesList[amenitiesList.length - 1]
                    );
                  })()}
                </p>
              </div>
            </div>
          )}
          <div className={styles.column}>
            <div className={styles.line}>
              <h3 className={styles.columnTitle}>
                <span>
                  <FaLocationArrow />
                </span>
                Minha Localização
              </h3>

              <p className={styles.address}>
                {producer.locality.neighborhood} - {producer.locality.city},{" "}
                {producer.locality.state}
              </p>
            </div>
            <div className={styles.line}>
              <h3 className={styles.columnTitle}>Locais que Atendo</h3>

              <p className={styles.address}>
                {(() => {
                  const locationsList = Object.entries(
                    producer.locality.locations
                  )
                    .filter(([_, value]) => value)
                    .map(([key]) => {
                      switch (key) {
                        case "athome":
                          return "A Domicilio";
                        case "hotels":
                          return "Hotéis";
                        case "motels":
                          return "Motéis";
                        case "events":
                          return "Eventos";
                        default:
                          return null;
                      }
                    })
                    .filter(Boolean);

                  if (locationsList.length === 0)
                    return "Nenhuma comodidade informada.";

                  if (locationsList.length === 1) return locationsList[0];

                  return (
                    locationsList.slice(0, -1).join(", ") +
                    " e " +
                    locationsList[locationsList.length - 1]
                  );
                })()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductLocation;
