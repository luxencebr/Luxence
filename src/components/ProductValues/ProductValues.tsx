"use client";

import styles from "./ProductValues.module.css";
import type { Producer } from "@/types/Producer";

interface ProductValuesProps {
  producer: Producer;
}

function ProductValues({ producer }: ProductValuesProps) {
  return (
    <section id="values" className={styles.productValues}>
      <div className={styles.layout}>
        <h2>Tabela de Valores</h2>
        <div className={styles.valuesTable}>
          <div className={styles.tableHeader}>
            <span className={styles.priceOption}>Serviço</span>
            <span className={styles.priceValue}>Valor</span>
          </div>

          {Array.isArray(producer.profile.prices) &&
          producer.profile.prices.length > 0 ? (
            producer.profile.prices.map((price) => (
              <div key={price.id} className={styles.tableRow}>
                <span className={styles.priceOption}>{price.option.label}</span>
                <span className={styles.priceValue}>R$ {price.value}</span>
              </div>
            ))
          ) : (
            <span className={styles.languageTag}>Não informado</span>
          )}
        </div>
      </div>
    </section>
  );
}

export default ProductValues;
