"use client";

import styles from "./ProductsCatalog.module.css";

import Product from "../Product/Product";

import type { Producer } from "@/types/Producer.ts";
import { useSiteLocale } from "@/lib/site-locale";
import { siteCopy } from "@/lib/site-copy";

interface ProductsCatalogProps {
  producers: Producer[];
}

function ProductsCatalog({ producers }: ProductsCatalogProps) {
  const { locale } = useSiteLocale();
  if (producers.length === 0) {
    return (
      <section className={styles.layout}>
        <p className={styles.noResults}>{siteCopy[locale].catalog[8]}</p>
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
