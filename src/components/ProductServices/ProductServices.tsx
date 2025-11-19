"use client";

import styles from "./ProductServices.module.css";
import { FaCheck, FaXmark } from "react-icons/fa6";

import type { Producer } from "@/types/Producer";

interface ProductServicesProps {
  producer: Producer;
}

function ProductServices({ producer }: ProductServicesProps) {
  const serviceIds =
    Array.isArray(producer.profile.services) &&
    producer.profile.services.length > 0
      ? producer.profile.services.map((s) => s.service.id)
      : "Não Informado";

  return (
    <section className={styles.productServices}>
      <div className={styles.layout}>
        <div className={`${styles.column} ${styles.servicesY}`}>
          <h2>Faço</h2>
          <ul className={styles.servicesList}>
            {Array.isArray(producer.profile.services) &&
            producer.profile.services.length > 0 ? (
              producer.profile.services.map((service) => (
                <li key={service.id}>
                  <span className={styles.green}>
                    <FaCheck />
                  </span>
                  {service.service.label}
                </li>
              ))
            ) : (
              <span className={styles.languageTag}>Não informado</span>
            )}
          </ul>
        </div>

        <div className={`${styles.column} ${styles.servicesN}`}>
          <h2>Não faço</h2>
          <ul className={styles.servicesList}>
            {/* e filtrar quais não estão em profile.services */}
            {/* Por enquanto, mostrar mensagem se não houver alternativa */}
            <li>
              <span className={styles.red}>
                <FaXmark />
              </span>
              Nenhum serviço listado como não oferecido
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default ProductServices;
