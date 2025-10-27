"use client";

import styles from "./ProductServices.module.css";
import { FaCheck, FaXmark } from "react-icons/fa6";

import type { Producer } from "../../types/Producer";

const formatServiceName = (name: string): string => {
  const serviceMap: { [key: string]: string } = {
    Companion: "Acompanhante",
    Trip: "Viagem",
    Kiss: "Beijo",
    Masturbation: "Masturbação",
    OralSex: "Sexo Oral",
    AnalSex: "Sexo Anal",
    VaginalSex: "Sexo Vaginal",
    OralSexWithCondom: "Sexo Oral com Preservativo",
    AnalSexWithCondom: "Sexo Anal com Preservativo",
    VaginalSexWithCondom: "Sexo Vaginal com Preservativo",
    DoublePenetration: "Penetração Dupla",
    TriplePenetration: "Penetração Tripla",
    Squirt: "Squirt",
  };

  return serviceMap[name] || name;
};

interface ProductServicesProps {
  producer: Producer;
}

function ProductServices({ producer }: ProductServicesProps) {
  const servicesEntries = Object.entries(producer.services.offered) as [
    keyof Producer["services"],
    boolean
  ][];

  const offeredServices = servicesEntries
    .filter(
      ([key, value]) =>
        String(key) !== "fetishes" &&
        typeof value === "boolean" &&
        value === true
    )
    .map(([key]) => formatServiceName(key));

  const notOfferedServices = servicesEntries
    .filter(
      ([key, value]) =>
        String(key) !== "fetishes" &&
        typeof value === "boolean" &&
        value === false
    )
    .map(([key]) => formatServiceName(key));

  return (
    <section className={styles.productServices}>
      <div className={styles.layout}>
        <div className={`${styles.column} ${styles.servicesY}`}>
          <h2>Faço</h2>
          <ul className={styles.servicesList}>
            {offeredServices.map((serviceName) => (
              <li key={serviceName}>
                <span className={styles.green}>
                  <FaCheck />
                </span>
                {serviceName}
              </li>
            ))}
          </ul>
        </div>

        <div className={`${styles.column} ${styles.servicesN}`}>
          <h2>Não faço</h2>
          <ul className={styles.servicesList}>
            {notOfferedServices.map((serviceName) => (
              <li key={serviceName}>
                <span className={styles.red}>
                  <FaXmark />
                </span>
                {serviceName}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default ProductServices;
