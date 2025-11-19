"use client";

import styles from "./ProductLocation.module.css";
import { HiLocationMarker } from "react-icons/hi";
import { FaLocationArrow } from "react-icons/fa6";
import { TbHomeCheck } from "react-icons/tb";

import type { Producer } from "@/types/Producer";

interface ProductLocationProps {
  producer: Producer;
}

function ProductLocation({ producer }: ProductLocationProps) {
  const local = producer.profile.local;
  const userLocality = producer.profile.producer?.user?.locality;

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
          {local && (
            <div className={`${styles.column} ${styles.conditional}`}>
              <div className={styles.line}>
                <h3 className={styles.columnTitle}>
                  <span>
                    <TbHomeCheck />
                  </span>
                  Minha Localidade
                </h3>
                <p className={styles.address}>
                  {local.neighborhood}, {local.city} - {local.state}
                </p>
              </div>
              <div className={styles.line}>
                <h3 className={styles.columnTitle}>Comodidades do Local</h3>
                <p>
                  {(() => {
                    const amenitiesList = local.amenities
                      .map((amenity) => amenity.amenity.label)
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
                {userLocality?.zone} - {userLocality?.city},{" "}
                {userLocality?.state}
              </p>
            </div>
            <div className={styles.line}>
              <h3 className={styles.columnTitle}>Locais que Atendo</h3>

              <p className={styles.address}>
                {(() => {
                  const locationsList = producer.profile.locations?.length
                    ? producer.profile.locations
                        .map((loc) => loc.location.label)
                        .filter(Boolean)
                    : ["Não Informado"];

                  if (locationsList.length === 0)
                    return "Nenhuma localidade informada.";

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
