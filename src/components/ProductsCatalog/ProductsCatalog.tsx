"use client";

import styles from "./ProductsCatalog.module.css";

import Product from "../Product/Product";

import type { Producer } from "@/types/Producer.ts";

interface ProductsCatalogProps {
  producers: Producer[];
}

function ProductsCatalog({ producers }: ProductsCatalogProps) {
  if (producers.length === 0) {
    return (
      <section className={styles.layout}>
        <p className={styles.noResults}>Nenhum resultado encontrado.</p>
      </section>
    );
  }

  return (
    <section className={styles.layout}>
      <ul className={styles.allProducersList}>
        {producers.map((producer: Producer) => (
          <Product key={producer.id} producer={producer} />
        ))}
      </ul>
    </section>
  );
}

export default ProductsCatalog;
