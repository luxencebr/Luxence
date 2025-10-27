"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";

import styles from "./ProductsRow.module.css";

import { IoAddOutline } from "react-icons/io5";

import type { Producer } from "../../types/Producer";
import CatalogItem from "@/components/Product/Product";
import RowControls from "@/components/ui/HorizontalControls/HorizontalControls";

const ViewMoreItem = () => (
  <a className={styles.viewMoreItem} href="/ver-mais">
    <IoAddOutline />
  </a>
);

interface ProductRowProps {
  producers: Producer[];
  title: string;
  maxItems?: number;
  highlight?: boolean;
}

function ProductRow({
  producers,
  title,
  maxItems,
  highlight = false,
}: ProductRowProps) {
  const scrollContainerRef = useRef<HTMLUListElement>(null);

  const [itemsPerPage, setItemsPerPage] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    const updateItemsPerPage = () => {
      if (!scrollContainerRef.current) return;

      const containerWidth = scrollContainerRef.current.offsetWidth;
      const item = scrollContainerRef.current.querySelector("li");
      if (!item) return;

      const itemWidth = (item as HTMLElement).offsetWidth;
      const gap = parseFloat(
        getComputedStyle(scrollContainerRef.current).gap || "16"
      );

      const perPage = Math.floor((containerWidth + gap) / (itemWidth + gap));
      setItemsPerPage(perPage);
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  maxItems = maxItems ?? (highlight ? 10 : 29);

  const producersToShow =
    producers.length > maxItems ? producers.slice(0, maxItems) : producers;
  const hasMore = producers.length > maxItems;

  const totalItems = producersToShow.length + (hasMore ? 1 : 0);
  const totalPages =
    itemsPerPage > 0 ? Math.ceil(totalItems / itemsPerPage) : 0;

  const scrollToPage = useCallback(
    (page: number) => {
      if (!scrollContainerRef.current) return;

      const container = scrollContainerRef.current;
      const item = container.children[0] as HTMLElement;
      if (!item) return;

      const itemWidth = item.offsetWidth;
      const gap = parseFloat(getComputedStyle(container).gap || "16");

      const scrollAmount = page * (itemWidth + gap) * itemsPerPage;

      container.scrollTo({
        left: scrollAmount,
        behavior: "smooth",
      });
    },
    [itemsPerPage]
  );

  const prevPage = () => setPageIndex((prev) => Math.max(prev - 1, 0));
  const nextPage = () =>
    setPageIndex((prev) => Math.min(prev + 1, totalPages - 1));

  useEffect(() => {
    if (itemsPerPage > 0) {
      scrollToPage(pageIndex);
    }
  }, [pageIndex, itemsPerPage, scrollToPage]);

  return (
    <section
      className={`${styles.ProducersCatalog} ${
        highlight ? styles.highlightCatalog : ""
      }`}
    >
      <div className={styles.rowHeader}>
        <span className={styles.catalogTitle}>{title}</span>
        <Link href="/catalog" className={styles.headerButton}>
          Veja Mais
        </Link>
      </div>

      <ul className={styles.catalogList} ref={scrollContainerRef}>
        {producersToShow.map((producer) => (
          <CatalogItem
            key={producer.id}
            producer={producer}
            variant={highlight ? "highlight" : "row"}
          />
        ))}

        {hasMore && (
          <li className={styles.catalogItem}>
            <ViewMoreItem />
          </li>
        )}
      </ul>

      <RowControls
        pageIndex={pageIndex}
        totalPages={totalPages}
        prevPage={prevPage}
        nextPage={nextPage}
      />
    </section>
  );
}

export default ProductRow;
