"use client";

import Link from "next/link";

import styles from "./Product.module.css";
import { GrLocation } from "react-icons/gr";
import { BiIdCard } from "react-icons/bi";
import { TbHomeCheck, TbHomeX } from "react-icons/tb";
import { FaHeart } from "react-icons/fa6";

import ValueDropdown from "../ValuesDropdown/ValuesDropdown";

import type { Producer } from "@/types/Producer";

interface ProductProps {
  producer: Producer;
  variant?: "row" | "highlight" | undefined;
}

function Product({ producer, variant }: ProductProps) {
  return (
    <li
      className={`${styles.product} 
        ${variant === "highlight" ? styles.highlight : ""} 
        ${variant === "row" ? styles.row : ""}`}
    >
      <Link href={`/product/${producer.id}`} className={styles.productLink}>
        <img
          className={styles.producerImage}
          src={producer.profile.images[0]}
          alt=""
        />

        <div className={styles.itemInfo}>
          <div className={styles.infoHeader}>
            <h3 className={styles.producerName}>{producer.profile.name}</h3>
            <span
              className={`${styles.productLoc} ${
                variant === undefined ? styles.hidden : ""
              }`}
            >
              {producer.locality.city}
            </span>
            <span
              className={`${styles.productSlogan} ${
                variant !== undefined ? styles.hidden : ""
              }`}
            >
              {producer.profile.slogan}
            </span>
          </div>

          <div
            className={`${styles.infoContent} ${
              variant !== undefined ? styles.hidden : ""
            }`}
          >
            <span className={styles.rating}>
              <span>
                <FaHeart />
              </span>
              {producer.reviews?.length} Avaliações
            </span>

            <ValueDropdown producer={producer} />

            <span className={styles.defaultInfo}>
              <span>
                <BiIdCard />
              </span>
              {producer.profile.age} anos
            </span>
            <span className={styles.defaultInfo}>
              {producer.locality.hasLocal ? (
                <>
                  <span>
                    <TbHomeCheck />
                  </span>
                  Possui local
                </>
              ) : (
                <>
                  <span>
                    <TbHomeX />
                  </span>
                  Não possui local
                </>
              )}
            </span>
            <span className={styles.defaultInfo}>
              <span>
                <GrLocation />
              </span>
              {producer.locality.city}, {producer.locality.neighborhood}
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}

export default Product;
